package com.donaton.donation.service;

import com.donaton.donation.client.LogisticsClient;
import com.donaton.donation.client.NeedsClient;
import com.donaton.donation.dto.NeedDTO;
import com.donaton.donation.exception.BadRequestException;
import com.donaton.donation.exception.ResourceNotFoundException;
import com.donaton.donation.model.DonationModel;
import com.donaton.donation.repository.DonationRepositoryPattern;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonationService {

    private final DonationRepositoryPattern repository;
    private final NeedsClient needsClient;
    private final LogisticsClient logisticsClient;

    public DonationService(
            DonationRepositoryPattern repository,
            NeedsClient needsClient,
            LogisticsClient logisticsClient
    ) {
        this.repository = repository;
        this.needsClient = needsClient;
        this.logisticsClient = logisticsClient;
    }

        public DonationModel crear(DonationModel donation, String email, String role) {
                if (donation.getCantidad() == null || donation.getCantidad() <= 0) {
                        throw new BadRequestException("Cantidad inválida");
                }
                if (donation.getTipo() == null || donation.getTipo().isBlank()) {
                        throw new BadRequestException("Tipo inválido");
                }

                if (role == null || role.isBlank()) {
                        role = "USER";
                }

                
                if ("USER".equalsIgnoreCase(role.trim()) && (donation.getNeedId() == null || donation.getNeedId().isBlank())) {
                        throw new BadRequestException("Debe seleccionar una necesidad para donar");
                }

                NeedDTO need = null;
                if (donation.getNeedId() != null && !donation.getNeedId().isBlank()) {
                        need = needsClient.getNeedById(donation.getNeedId(), email, role);
                        validateNeedMatchesDonation(donation, need);

                        
                        String derivedAddress = (need.getAddress() == null || need.getAddress().isBlank())
                                ? need.getCenterName()
                                : need.getAddress();
                        donation.setDireccion(derivedAddress);
                }

                if (email != null && !email.isBlank()) {
                        donation.setDonorEmail(email.trim());
                }

                DonationModel saved = repository.save(donation);

                if (need != null) {
                        try {
                                needsClient.receiveDonation(donation.getNeedId(), donation.getCantidad(), email, role);
                        } catch (RuntimeException ex) {
                                repository.delete(saved);
                                throw ex;
                        }
                }

                if (donation.getNeedId() != null && !donation.getNeedId().isBlank()) {
                        try {
                                logisticsClient.crearEnvio(saved.getId(), email, role);
                        } catch (RuntimeException ex) {
                                if (need != null) {
                                        try {
                                                needsClient.rollbackReceive(donation.getNeedId(), donation.getCantidad());
                                        } catch (RuntimeException ignored) {
                                                
                                        }
                                }
                                repository.delete(saved);
                                throw new BadRequestException("No se pudo registrar el envío en acopio: " + ex.getMessage());
                        }
                }

                return saved;
        }

    public List<DonationModel> listar() {
        return repository.findAll();
    }

    public DonationModel buscarPorId(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Donación no encontrada"
                        )
                );
    }

    public DonationModel actualizar(Long id, DonationModel donation) {
        DonationModel existente = buscarPorId(id);
        existente.setDescripcion(donation.getDescripcion());
        existente.setCantidad(donation.getCantidad());
        existente.setTipo(donation.getTipo());
        existente.setDireccion(donation.getDireccion());
        if (donation.getNeedId() != null) {
            existente.setNeedId(donation.getNeedId());
        }
        return repository.save(existente);
    }

    public void eliminar(Long id) {
                DonationModel existente = buscarPorId(id);
                repository.delete(existente);
    }

        private void validateNeedMatchesDonation(DonationModel donation, NeedDTO need) {
                if (need == null) {
                        throw new BadRequestException("Necesidad inválida");
                }

                String needCategory = need.getCategory() == null ? "" : need.getCategory().trim();
                if (!needCategory.equalsIgnoreCase(donation.getTipo().trim())) {
                        throw new BadRequestException("El tipo de donación no coincide con la necesidad");
                }

                double required = need.getQuantityRequired() == null ? 0.0 : need.getQuantityRequired();
                double received = need.getQuantityReceived() == null ? 0.0 : need.getQuantityReceived();
                double remaining = required - received;
                if (donation.getCantidad() > remaining) {
                        throw new BadRequestException("La cantidad supera lo requerido por la necesidad");
                }
        }
}
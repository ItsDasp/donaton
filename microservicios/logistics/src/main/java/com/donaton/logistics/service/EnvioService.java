package com.donaton.logistics.service;

import com.donaton.logistics.client.DonationClient;
import com.donaton.logistics.client.NeedsClient;
import com.donaton.logistics.dto.DonationDTO;
import com.donaton.logistics.dto.NeedDTO;
import com.donaton.logistics.exception.BadRequestException;
import com.donaton.logistics.exception.ForbiddenException;
import com.donaton.logistics.model.EnvioEstado;
import com.donaton.logistics.model.LogisticsEnvio;
import com.donaton.logistics.repository.EnvioRepositoryPattern;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

@Service
public class EnvioService {

    private static final Logger log = LoggerFactory.getLogger(EnvioService.class);

    private final EnvioRepositoryPattern repository;
    private final DonationClient donationClient;
    private final NeedsClient needsClient;
    private final int acopioDeadlineDays;

    public EnvioService(
            EnvioRepositoryPattern repository,
            DonationClient donationClient,
            NeedsClient needsClient,
            @Value("${logistics.acopio.deadline-days:3}") int acopioDeadlineDays
    ) {
        this.repository = repository;
        this.donationClient = donationClient;
        this.needsClient = needsClient;
        this.acopioDeadlineDays = acopioDeadlineDays;
    }

    @Transactional
    public LogisticsEnvio crearEnvio(Long donacionId, String email, String role) {
        try {
            if (donacionId == null) {
                throw new BadRequestException("donacionId es obligatorio");
            }

            if (repository.findByDonacionId(donacionId).isPresent()) {
                throw new BadRequestException("Ya existe un envío para esta donación");
            }

            DonationDTO donation = donationClient.getDonationById(donacionId, email, role);
            if (donation == null) {
                throw new BadRequestException(
                        "No se pudo obtener la donación desde donation-service");
            }

            String needId = donation.getNeedId();
            if (needId == null || needId.isBlank()) {
                throw new BadRequestException("La donación debe estar vinculada a una necesidad");
            }

            NeedDTO need = needsClient.getNeedById(needId, email, role);
            if (need == null) {
                throw new BadRequestException("Necesidad no encontrada");
            }

            String destino = resolveDestino(donation, need);
            String centerId = need.getCenterId() == null || need.getCenterId().isBlank()
                    ? "sin-centro"
                    : need.getCenterId().trim();
            String centerName = need.getCenterName() == null || need.getCenterName().isBlank()
                    ? "Centro de acopio"
                    : need.getCenterName().trim();
            Instant now = Instant.now();

            LogisticsEnvio envio = LogisticsEnvio.builder()
                    .donacionId(donacionId)
                    .needId(needId.trim())
                    .direccion(destino)
                    .acopioCenterId(centerId)
                    .acopioCenterName(centerName)
                    .estado(EnvioEstado.PENDIENTE_ACOPIO)
                    .createdAt(now)
                    .acopioDeadline(now.plus(acopioDeadlineDays, ChronoUnit.DAYS))
                    .cantidadDonada(donation.getCantidad())
                    .build();

            return repository.save(envio);
        } catch (RuntimeException exception) {
            log.error("Error al procesar la creación de envío para donacionId={}",
                    donacionId, exception);
            throw exception;
        }
    }

    public List<LogisticsEnvio> listar(String acopioCenterId) {
        if (acopioCenterId != null && !acopioCenterId.isBlank()) {
            return repository.findByAcopioCenterId(acopioCenterId);
        }
        return repository.findAll();
    }

    @Transactional
    public LogisticsEnvio actualizarEstado(Long id, String nuevoEstado, String email, String role) {
        LogisticsEnvio envio = repository.findById(id)
                .orElseThrow(() -> new BadRequestException("Envío no encontrado"));

        String normalized = normalizeEstado(nuevoEstado);
        validateTransition(envio.getEstado(), normalized);
        validatePermission(envio, normalized, email, role);

        envio.setEstado(normalized);
        return repository.save(envio);
    }

    @Transactional
    public int marcarInexistentesVencidos() {
        Instant now = Instant.now();
        List<LogisticsEnvio> vencidos = repository.findByEstadoAndAcopioDeadlineBefore(
                EnvioEstado.PENDIENTE_ACOPIO, now
        );

        int count = 0;
        for (LogisticsEnvio envio : vencidos) {
            envio.setEstado(EnvioEstado.INEXISTENTE);
            repository.save(envio);

            if (envio.getNeedId() != null && envio.getCantidadDonada() != null && envio.getCantidadDonada() > 0) {
                try {
                    needsClient.rollbackReceive(envio.getNeedId(), envio.getCantidadDonada());
                } catch (RuntimeException ignored) {
                    
                }
            }
            count++;
        }
        return count;
    }

    private void validateTransition(String actual, String nuevo) {
        if (EnvioEstado.INEXISTENTE.equals(actual) || EnvioEstado.ENTREGADO.equals(actual)) {
            throw new BadRequestException("El envío ya está cerrado");
        }

        switch (actual) {
            case EnvioEstado.PENDIENTE_ACOPIO -> {
                if (!EnvioEstado.RECIBIDA.equals(nuevo) && !EnvioEstado.INEXISTENTE.equals(nuevo)) {
                    throw new BadRequestException("Desde pendiente_acopio solo puede pasar a recibida");
                }
            }
            case EnvioEstado.RECIBIDA -> {
                if (!EnvioEstado.EN_CAMINO.equals(nuevo)) {
                    throw new BadRequestException("Desde recibida solo puede pasar a en_camino");
                }
            }
            case EnvioEstado.EN_CAMINO -> {
                if (!EnvioEstado.ENTREGADO.equals(nuevo)) {
                    throw new BadRequestException("Desde en_camino solo puede pasar a entregado");
                }
            }
            default -> throw new BadRequestException("Estado actual inválido");
        }
    }

    private void validatePermission(LogisticsEnvio envio, String nuevoEstado, String email, String role) {
        String r = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);

        if (EnvioEstado.INEXISTENTE.equals(nuevoEstado)) {
            if (!"ADMIN".equals(r)) {
                throw new ForbiddenException("Solo un administrador puede marcar inexistente manualmente");
            }
            return;
        }

        if (EnvioEstado.ENTREGADO.equals(nuevoEstado)) {
            if ("ADMIN".equals(r)) {
                return;
            }
            NeedDTO need = needsClient.getNeedById(envio.getNeedId(), email, role);
            String manager = need == null || need.getCreatedByEmail() == null
                    ? ""
                    : need.getCreatedByEmail().trim().toLowerCase(Locale.ROOT);
            String userEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
            if (!userEmail.equals(manager)) {
                throw new ForbiddenException("Solo un administrador o el responsable de la necesidad puede marcar entregado");
            }
            return;
        }

        if (EnvioEstado.RECIBIDA.equals(nuevoEstado) || EnvioEstado.EN_CAMINO.equals(nuevoEstado)) {
            if ("ADMIN".equals(r) || "ONG".equals(r)) {
                return;
            }
            throw new ForbiddenException("Solo personal de acopio (ADMIN/ONG) puede actualizar este estado");
        }
    }

    private String normalizeEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            throw new BadRequestException("Estado inválido");
        }
        return estado.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveDestino(DonationDTO donation, NeedDTO need) {
        if (donation.getDireccion() != null && !donation.getDireccion().isBlank()) {
            return donation.getDireccion().trim();
        }
        if (need.getAddress() != null && !need.getAddress().isBlank()) {
            return need.getAddress().trim();
        }
        return need.getCenterName() == null ? "Destino sin dirección" : need.getCenterName().trim();
    }
}

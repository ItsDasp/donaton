package com.donaton.donation.repository;

import com.donaton.donation.model.DonationModel;

import java.util.List;
import java.util.Optional;

public class DonationRepositoryAdapter implements DonationRepositoryPattern {
    private final DonationRepository jpaRepository;

    public DonationRepositoryAdapter(DonationRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public DonationModel save(DonationModel entity) {
        return jpaRepository.save(entity);
    }

    @Override
    public Optional<DonationModel> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<DonationModel> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void delete(DonationModel entity) {
        jpaRepository.delete(entity);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }

    @Override
    public List<DonationModel> findByDonorEmail(String donorEmail) {
        return jpaRepository.findByDonorEmail(donorEmail);
    }

    @Override
    public List<DonationModel> findByNeedId(String needId) {
        return jpaRepository.findByNeedId(needId);
    }

    @Override
    public List<DonationModel> findByDonorEmailAndNeedId(String donorEmail, String needId) {
        return jpaRepository.findByDonorEmailAndNeedId(donorEmail, needId);
    }

    @Override
    public List<DonationModel> findByTipo(String tipo) {
        return jpaRepository.findByTipo(tipo);
    }

    @Override
    public long countByDonorEmail(String donorEmail) {
        return jpaRepository.countByDonorEmail(donorEmail);
    }

    @Override
    public boolean existsByNeedId(String needId) {
        return jpaRepository.existsByNeedId(needId);
    }

    @Override
    public Double sumCantidadByTipo(String tipo) {
        return jpaRepository.sumCantidadByTipo(tipo);
    }

    @Override
    public List<DonationModel> findByNeedIdAndDonorEmailCustom(String needId, String donorEmail) {
        return jpaRepository.findByNeedIdAndDonorEmailCustom(needId, donorEmail);
    }
}

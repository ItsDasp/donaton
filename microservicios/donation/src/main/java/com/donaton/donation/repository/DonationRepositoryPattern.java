package com.donaton.donation.repository;

import com.donaton.donation.model.DonationModel;

import java.util.List;
import java.util.Optional;

public interface DonationRepositoryPattern {
    DonationModel save(DonationModel entity);
    Optional<DonationModel> findById(Long id);
    List<DonationModel> findAll();
    void deleteById(Long id);
    void delete(DonationModel entity);
    long count();
    List<DonationModel> findByDonorEmail(String donorEmail);
    List<DonationModel> findByNeedId(String needId);
    List<DonationModel> findByDonorEmailAndNeedId(String donorEmail, String needId);
    List<DonationModel> findByTipo(String tipo);
    long countByDonorEmail(String donorEmail);
    boolean existsByNeedId(String needId);
    Double sumCantidadByTipo(String tipo);
    List<DonationModel> findByNeedIdAndDonorEmailCustom(String needId, String donorEmail);
}

package com.donaton.donation.repository;

import com.donaton.donation.model.DonationModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface DonationRepository extends JpaRepository<DonationModel, Long> {

    
    List<DonationModel> findByDonorEmail(String donorEmail);

   
    List<DonationModel> findByNeedId(String needId);

   
    Optional<DonationModel> findById(Long id);

    List<DonationModel> findByDonorEmailAndNeedId(String donorEmail, String needId);

    
    List<DonationModel> findByTipo(String tipo);

    
    long countByDonorEmail(String donorEmail);

   
    boolean existsByNeedId(String needId);

    
    @Query("SELECT COALESCE(SUM(d.cantidad), 0) FROM DonationModel d WHERE d.tipo = :tipo")
    Double sumCantidadByTipo(@Param("tipo") String tipo);

    
    @Query("SELECT d FROM DonationModel d WHERE d.needId = :needId AND d.donorEmail = :donorEmail")
    List<DonationModel> findByNeedIdAndDonorEmailCustom(
            @Param("needId") String needId,
            @Param("donorEmail") String donorEmail
    );
}
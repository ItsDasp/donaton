package com.donaton.needs.repository;

import com.donaton.needs.model.NeedEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface NeedRepository extends JpaRepository<NeedEntity, String> {

  
    List<NeedEntity> findByStatus(String status);

  
    List<NeedEntity> findByCategoryAndStatus(String category, String status);

   
    List<NeedEntity> findByCategory(String category);

    
    Optional<NeedEntity> findByCode(String code);

   
    List<NeedEntity> findByRegion(String region);

   
    List<NeedEntity> findByCenterId(String centerId);

    @Query("SELECT n FROM NeedEntity n WHERE n.priority = 'ALTA' AND n.status = 'activa' ORDER BY n.id")
    List<NeedEntity> findHighPriorityActiveNeeds();

    
    @Query("SELECT CASE WHEN n.quantityRequired = 0 THEN 0 " +
           "ELSE ROUND((n.quantityReceived / n.quantityRequired) * 100, 2) END " +
           "FROM NeedEntity n WHERE n.id = :needId")
    Double getCompletionPercentage(@Param("needId") String needId);

    
    long countByCategory(String category);

   
    long countByStatus(String status);

    
    @Query("SELECT (n.quantityRequired - n.quantityReceived) FROM NeedEntity n WHERE n.id = :needId")
    Double getQuantityDeficit(@Param("needId") String needId);

    
    List<NeedEntity> findByRegionAndStatus(String region, String status);

    
    boolean existsByCode(String code);
}

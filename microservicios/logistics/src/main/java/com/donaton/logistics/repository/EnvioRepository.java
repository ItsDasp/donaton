package com.donaton.logistics.repository;

import com.donaton.logistics.model.LogisticsEnvio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;


@Repository
public interface EnvioRepository extends JpaRepository<LogisticsEnvio, Long> {

 
    Optional<LogisticsEnvio> findByDonacionId(Long donacionId);

  
    List<LogisticsEnvio> findByAcopioCenterId(String acopioCenterId);

 
    List<LogisticsEnvio> findByEstadoAndAcopioDeadlineBefore(String estado, Instant deadline);

   
    List<LogisticsEnvio> findByEstado(String estado);

    
    List<LogisticsEnvio> findByNeedId(String needId);

    
    @Query("SELECT COUNT(e) FROM LogisticsEnvio e WHERE e.acopioCenterId = :centerId AND e.estado = :estado")
    long countByAcopioCenterIdAndEstado(
            @Param("centerId") String acopioCenterId,
            @Param("estado") String estado
    );

    @Query("SELECT COALESCE(SUM(e.cantidadDonada), 0) FROM LogisticsEnvio e WHERE e.needId = :needId")
    Double sumCantidadByNeedId(@Param("needId") String needId);

   
    @Query("SELECT e FROM LogisticsEnvio e WHERE e.createdAt BETWEEN :start AND :end ORDER BY e.createdAt DESC")
    List<LogisticsEnvio> findByDateRange(
            @Param("start") Instant startDate,
            @Param("end") Instant endDate
    );

    
    boolean existsByDonacionId(Long donacionId);

   
    long countByEstado(String estado);
}

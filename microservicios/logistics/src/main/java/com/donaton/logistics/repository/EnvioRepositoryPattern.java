package com.donaton.logistics.repository;

import com.donaton.logistics.model.LogisticsEnvio;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface EnvioRepositoryPattern {
    LogisticsEnvio save(LogisticsEnvio entity);
    Optional<LogisticsEnvio> findById(Long id);
    List<LogisticsEnvio> findAll();
    void deleteById(Long id);
    long count();
    Optional<LogisticsEnvio> findByDonacionId(Long donacionId);
    List<LogisticsEnvio> findByAcopioCenterId(String acopioCenterId);
    List<LogisticsEnvio> findByEstadoAndAcopioDeadlineBefore(String estado, Instant deadline);
    List<LogisticsEnvio> findByEstado(String estado);
    List<LogisticsEnvio> findByNeedId(String needId);
    long countByAcopioCenterIdAndEstado(String acopioCenterId, String estado);
    Double sumCantidadByNeedId(String needId);
    List<LogisticsEnvio> findByDateRange(Instant startDate, Instant endDate);
    boolean existsByDonacionId(Long donacionId);
    long countByEstado(String estado);
}

package com.donaton.logistics.repository;

import com.donaton.logistics.model.LogisticsEnvio;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class EnvioRepositoryAdapter implements EnvioRepositoryPattern {
    private final EnvioRepository jpaRepository;

    public EnvioRepositoryAdapter(EnvioRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public LogisticsEnvio save(LogisticsEnvio entity) {
        return jpaRepository.save(entity);
    }

    @Override
    public Optional<LogisticsEnvio> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<LogisticsEnvio> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }

    @Override
    public Optional<LogisticsEnvio> findByDonacionId(Long donacionId) {
        return jpaRepository.findByDonacionId(donacionId);
    }

    @Override
    public List<LogisticsEnvio> findByAcopioCenterId(String acopioCenterId) {
        return jpaRepository.findByAcopioCenterId(acopioCenterId);
    }

    @Override
    public List<LogisticsEnvio> findByEstadoAndAcopioDeadlineBefore(String estado, Instant deadline) {
        return jpaRepository.findByEstadoAndAcopioDeadlineBefore(estado, deadline);
    }

    @Override
    public List<LogisticsEnvio> findByEstado(String estado) {
        return jpaRepository.findByEstado(estado);
    }

    @Override
    public List<LogisticsEnvio> findByNeedId(String needId) {
        return jpaRepository.findByNeedId(needId);
    }

    @Override
    public long countByAcopioCenterIdAndEstado(String acopioCenterId, String estado) {
        return jpaRepository.countByAcopioCenterIdAndEstado(acopioCenterId, estado);
    }

    @Override
    public Double sumCantidadByNeedId(String needId) {
        return jpaRepository.sumCantidadByNeedId(needId);
    }

    @Override
    public List<LogisticsEnvio> findByDateRange(Instant startDate, Instant endDate) {
        return jpaRepository.findByDateRange(startDate, endDate);
    }

    @Override
    public boolean existsByDonacionId(Long donacionId) {
        return jpaRepository.existsByDonacionId(donacionId);
    }

    @Override
    public long countByEstado(String estado) {
        return jpaRepository.countByEstado(estado);
    }
}

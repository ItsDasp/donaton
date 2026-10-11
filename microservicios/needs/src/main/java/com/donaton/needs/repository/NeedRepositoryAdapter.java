package com.donaton.needs.repository;

import com.donaton.needs.model.NeedEntity;

import java.util.List;
import java.util.Optional;

public class NeedRepositoryAdapter implements NeedRepositoryPattern {
    private final NeedRepository jpaRepository;

    public NeedRepositoryAdapter(NeedRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public NeedEntity save(NeedEntity entity) {
        return jpaRepository.save(entity);
    }

    @Override
    public Optional<NeedEntity> findById(String id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<NeedEntity> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }

    @Override
    public List<NeedEntity> findByStatus(String status) {
        return jpaRepository.findByStatus(status);
    }

    @Override
    public List<NeedEntity> findByCategoryAndStatus(String category, String status) {
        return jpaRepository.findByCategoryAndStatus(category, status);
    }

    @Override
    public List<NeedEntity> findByCategory(String category) {
        return jpaRepository.findByCategory(category);
    }

    @Override
    public Optional<NeedEntity> findByCode(String code) {
        return jpaRepository.findByCode(code);
    }

    @Override
    public List<NeedEntity> findByRegion(String region) {
        return jpaRepository.findByRegion(region);
    }

    @Override
    public List<NeedEntity> findByCenterId(String centerId) {
        return jpaRepository.findByCenterId(centerId);
    }

    @Override
    public List<NeedEntity> findHighPriorityActiveNeeds() {
        return jpaRepository.findHighPriorityActiveNeeds();
    }

    @Override
    public Double getCompletionPercentage(String needId) {
        return jpaRepository.getCompletionPercentage(needId);
    }

    @Override
    public long countByCategory(String category) {
        return jpaRepository.countByCategory(category);
    }

    @Override
    public long countByStatus(String status) {
        return jpaRepository.countByStatus(status);
    }

    @Override
    public Double getQuantityDeficit(String needId) {
        return jpaRepository.getQuantityDeficit(needId);
    }

    @Override
    public List<NeedEntity> findByRegionAndStatus(String region, String status) {
        return jpaRepository.findByRegionAndStatus(region, status);
    }

    @Override
    public boolean existsByCode(String code) {
        return jpaRepository.existsByCode(code);
    }
}

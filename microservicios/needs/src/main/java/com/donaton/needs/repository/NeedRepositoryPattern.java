package com.donaton.needs.repository;

import com.donaton.needs.model.NeedEntity;

import java.util.List;
import java.util.Optional;

public interface NeedRepositoryPattern {
    NeedEntity save(NeedEntity entity);
    Optional<NeedEntity> findById(String id);
    List<NeedEntity> findAll();
    void deleteById(String id);
    long count();
    List<NeedEntity> findByStatus(String status);
    List<NeedEntity> findByCategoryAndStatus(String category, String status);
    List<NeedEntity> findByCategory(String category);
    Optional<NeedEntity> findByCode(String code);
    List<NeedEntity> findByRegion(String region);
    List<NeedEntity> findByCenterId(String centerId);
    List<NeedEntity> findHighPriorityActiveNeeds();
    Double getCompletionPercentage(String needId);
    long countByCategory(String category);
    long countByStatus(String status);
    Double getQuantityDeficit(String needId);
    List<NeedEntity> findByRegionAndStatus(String region, String status);
    boolean existsByCode(String code);
}

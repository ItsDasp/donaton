package com.donaton.needs.service;

import com.donaton.needs.model.NeedEntity;
import com.donaton.needs.repository.NeedRepositoryPattern;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NeedService {

    private final NeedRepositoryPattern repository;

    public NeedService(NeedRepositoryPattern repository) {
        this.repository = repository;
    }

    public List<NeedEntity> list(String category, String status) {
        if (category != null && !category.isBlank() && status != null && !status.isBlank()) {
            return repository.findByCategoryAndStatus(category, status);
        }
        if (category != null && !category.isBlank()) {
            return repository.findByCategory(category);
        }
        if (status != null && !status.isBlank()) {
            return repository.findByStatus(status);
        }
        return repository.findAll();
    }

    public NeedEntity getById(String id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Need not found"));
    }

    public NeedEntity create(NeedEntity need, String createdByEmail) {
        if (need.getAddress() == null || need.getAddress().isBlank()) {
            throw new IllegalArgumentException("Address is required");
        }
        if (createdByEmail != null && !createdByEmail.isBlank()) {
            need.setCreatedByEmail(createdByEmail.trim());
        }
        
        if (need.getQuantityReceived() == null) need.setQuantityReceived(0.0);
        if (need.getMatchedDonations() == null) need.setMatchedDonations(0);
        return repository.save(need);
    }

    public NeedEntity update(String id, NeedEntity update) {
        NeedEntity existing = getById(id);

        if (update.getAddress() == null || update.getAddress().isBlank()) {
            throw new IllegalArgumentException("Address is required");
        }

        existing.setCategory(update.getCategory());
        existing.setProductName(update.getProductName());
        existing.setQuantityRequired(update.getQuantityRequired());
        existing.setUnit(update.getUnit());
        existing.setPriority(update.getPriority());
        existing.setStatus(update.getStatus());
        existing.setRegion(update.getRegion());
        existing.setCenterId(update.getCenterId());
        existing.setCenterName(update.getCenterName());
        existing.setAddress(update.getAddress());
        existing.setDescription(update.getDescription());
        existing.setDeadline(update.getDeadline());
        existing.setVerifiedBy(update.getVerifiedBy());

        
        return repository.save(existing);
    }

    public NeedEntity receive(String id, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }

        NeedEntity need = getById(id);
        double newReceived = (need.getQuantityReceived() == null ? 0.0 : need.getQuantityReceived()) + amount;
        need.setQuantityReceived(newReceived);
        need.setMatchedDonations((need.getMatchedDonations() == null ? 0 : need.getMatchedDonations()) + 1);

        if (need.getQuantityRequired() != null && newReceived >= need.getQuantityRequired()) {
            need.setStatus("satisfecha");
        }

        return repository.save(need);
    }

    public NeedEntity rollbackReceive(String id, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }

        NeedEntity need = getById(id);
        double current = need.getQuantityReceived() == null ? 0.0 : need.getQuantityReceived();
        double updated = Math.max(0.0, current - amount);
        need.setQuantityReceived(updated);

        int matched = need.getMatchedDonations() == null ? 0 : need.getMatchedDonations();
        need.setMatchedDonations(Math.max(0, matched - 1));

        if ("satisfecha".equalsIgnoreCase(need.getStatus()) && need.getQuantityRequired() != null
                && updated < need.getQuantityRequired()) {
            need.setStatus("en_proceso");
        }

        return repository.save(need);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}

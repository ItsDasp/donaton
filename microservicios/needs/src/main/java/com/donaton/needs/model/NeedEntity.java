package com.donaton.needs.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "needs")
@Getter
@Setter
@NoArgsConstructor
public class NeedEntity {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Double quantityRequired;

    @Column(nullable = false)
    private Double quantityReceived;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private String priority;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private String centerId;

    @Column(nullable = false)
    private String centerName;

    @Column(length = 1000)
    private String address;

    @Column(length = 2000)
    private String description;

    private String deadline;

    @Column(nullable = false)
    private String createdAt;

    @Column(nullable = false)
    private String updatedAt;

    private String verifiedBy;

    private String createdByEmail;

    @Column(nullable = false)
    private Integer matchedDonations;

    @PrePersist
    public void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (code == null || code.isBlank()) {
            code = "NEC-" + (1000 + (int) (Math.random() * 9000));
        }

        if (quantityReceived == null) quantityReceived = 0.0;
        if (matchedDonations == null) matchedDonations = 0;

        String now = Instant.now().toString();
        if (createdAt == null || createdAt.isBlank()) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now().toString();
        if (quantityReceived == null) quantityReceived = 0.0;
        if (matchedDonations == null) matchedDonations = 0;
    }
}

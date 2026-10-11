package com.donaton.needs.dto;

import com.donaton.needs.model.NeedEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NeedResponseDTO {

    private String id;
    private String code;
    private String category;
    private String productName;
    private Double quantityRequired;
    private Double quantityReceived;
    private String unit;
    private String priority;
    private String status;
    private String region;
    private String centerId;
    private String centerName;
    private String address;
    private String description;
    private String deadline;
    private String createdAt;
    private String updatedAt;
    private String verifiedBy;
    private String createdByEmail;
    private Integer matchedDonations;

    public static NeedResponseDTO fromEntity(NeedEntity entity) {
        if (entity == null) {
            return null;
        }
        return NeedResponseDTO.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .category(entity.getCategory())
                .productName(entity.getProductName())
                .quantityRequired(entity.getQuantityRequired())
                .quantityReceived(entity.getQuantityReceived())
                .unit(entity.getUnit())
                .priority(entity.getPriority())
                .status(entity.getStatus())
                .region(entity.getRegion())
                .centerId(entity.getCenterId())
                .centerName(entity.getCenterName())
                .address(entity.getAddress())
                .description(entity.getDescription())
                .deadline(entity.getDeadline())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .verifiedBy(entity.getVerifiedBy())
                .createdByEmail(entity.getCreatedByEmail())
                .matchedDonations(entity.getMatchedDonations())
                .build();
    }
}

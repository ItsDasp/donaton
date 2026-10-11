package com.bff.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NeedsResponse {

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
}

package com.donaton.donation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NeedDTO {

    private String id;
    private String category;
    private String status;
    private Double quantityRequired;
    private Double quantityReceived;
    private String centerId;
    private String centerName;
    private String address;
    private String createdByEmail;
}

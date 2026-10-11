package com.donaton.logistics.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NeedDTO {

    private String id;
    private String centerId;
    private String centerName;
    private String address;
    private String createdByEmail;
}

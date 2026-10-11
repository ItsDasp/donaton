package com.bff.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DonationResponse {

    private Long id;
    private String descripcion;
    private Double cantidad;
    private String tipo;
    private String direccion;
    private String needId;
    private String donorEmail;
    private String unit;
    private Long logisticsId; 
}

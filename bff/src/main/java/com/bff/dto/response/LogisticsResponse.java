package com.bff.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class LogisticsResponse {

    private Long id;
    private Long donacionId;
    private String needId;
    private String direccion;
    private String acopioCenterId;
    private String acopioCenterName;
    private String estado;
    private Instant createdAt;
    private Instant acopioDeadline;
    private Double cantidadDonada;
}

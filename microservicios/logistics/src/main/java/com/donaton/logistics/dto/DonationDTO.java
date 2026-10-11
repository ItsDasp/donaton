package com.donaton.logistics.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DonationDTO {

    @NotNull(message = "El id de donación es obligatorio")
    @Positive(message = "El id de donación debe ser positivo")
    private Long id;

    private String needId;
    private String direccion;
    private Double cantidad;
    private String descripcion;
    private String donorEmail;
}

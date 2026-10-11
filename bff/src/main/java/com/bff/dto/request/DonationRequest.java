package com.bff.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DonationRequest {

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 500)
    private String descripcion;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    private Double cantidad;

    @NotBlank(message = "El tipo es obligatorio")
    @Size(max = 100)
    private String tipo;

    @Size(max = 500)
    private String direccion;

    @Size(max = 64)
    private String needId;

    @Size(max = 50)
    private String unit;
}

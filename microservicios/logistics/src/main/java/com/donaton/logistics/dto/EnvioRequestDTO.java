package com.donaton.logistics.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EnvioRequestDTO {

    @NotNull(message = "El id de donación es obligatorio")
    @Positive(message = "El id de donación debe ser positivo")
    private Long donacionId;

}

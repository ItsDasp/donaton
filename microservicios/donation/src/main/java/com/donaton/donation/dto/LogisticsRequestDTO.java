package com.donaton.donation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogisticsRequestDTO {

    @NotNull(message = "El id de donación es obligatorio")
    @Positive(message = "El id de donación debe ser positivo")
    private Long donacionId;
}

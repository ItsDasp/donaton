package com.donaton.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshTokenDTO {

    @NotBlank(message = "El refresh token es obligatorio")
    private String refreshToken;
}

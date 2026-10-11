package com.donaton.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TokenResponseDTO {
    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final long accessExpiresIn;
    private final long refreshExpiresIn;
}
package com.donaton.auth.dto;

public record UserSummaryDTO(
        Long id,
        String name,
        String email,
        String phone,
        String role
) {}

package com.donaton.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RoleUpdateRequestDTO(
        @NotBlank(message = "El rol es obligatorio")
        @Pattern(regexp = "USER|ADMIN|ONG", message = "El rol debe ser USER, ADMIN u ONG")
        String role
) {
}

package com.donaton.auth.dto;

import com.donaton.auth.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserRequestDTO {

    @Size(max = 120)
    private String name;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Credenciales inválidas")
    private String email;

    @Size(max = 30)
    private String phone;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 100)
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private Role role;
}

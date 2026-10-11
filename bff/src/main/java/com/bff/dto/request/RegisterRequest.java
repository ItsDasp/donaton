package com.bff.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

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
}

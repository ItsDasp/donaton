package com.donaton.needs.dto;

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
public class NeedRequestDTO {

    @Size(max = 64)
    private String id;

    @Size(max = 32)
    private String code;

    @NotBlank(message = "La categoría es obligatoria")
    @Size(max = 100)
    private String category;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 200)
    private String productName;

    @NotNull(message = "La cantidad requerida es obligatoria")
    @Positive(message = "La cantidad requerida debe ser mayor a cero")
    private Double quantityRequired;

    private Double quantityReceived;

    @NotBlank(message = "La unidad es obligatoria")
    @Size(max = 50)
    private String unit;

    @NotBlank(message = "La prioridad es obligatoria")
    @Size(max = 20)
    private String priority;

    @NotBlank(message = "El estado es obligatorio")
    @Size(max = 30)
    private String status;

    @NotBlank(message = "La región es obligatoria")
    @Size(max = 100)
    private String region;

    @NotBlank(message = "El id del centro es obligatorio")
    @Size(max = 64)
    private String centerId;

    @NotBlank(message = "El nombre del centro es obligatorio")
    @Size(max = 200)
    private String centerName;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 1000)
    private String address;

    @Size(max = 2000)
    private String description;

    @Size(max = 50)
    private String deadline;

    @Size(max = 200)
    private String verifiedBy;

    private Integer matchedDonations;
}

package com.donaton.donation.dto;

import com.donaton.donation.model.DonationModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationResponseDTO {

    private Long id;
    private String descripcion;
    private Double cantidad;
    private String tipo;
    private String direccion;
    private String needId;
    private String donorEmail;
    private String unit;

    public static DonationResponseDTO fromModel(DonationModel model) {
        if (model == null) {
            return null;
        }
        return DonationResponseDTO.builder()
                .id(model.getId())
                .descripcion(model.getDescripcion())
                .cantidad(model.getCantidad())
                .tipo(model.getTipo())
                .direccion(model.getDireccion())
                .needId(model.getNeedId())
                .donorEmail(model.getDonorEmail())
                .unit("unidad")
                .build();
    }
}

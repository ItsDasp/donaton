package com.donaton.logistics.dto;

import com.donaton.logistics.model.LogisticsEnvio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvioResponseDTO {

    private Long id;
    private Long donacionId;
    private String needId;
    private String direccion;
    private String acopioCenterId;
    private String acopioCenterName;
    private String estado;
    private Instant createdAt;
    private Instant acopioDeadline;
    private Double cantidadDonada;

    public static EnvioResponseDTO fromEntity(LogisticsEnvio envio) {
        if (envio == null) {
            return null;
        }
        return EnvioResponseDTO.builder()
                .id(envio.getId())
                .donacionId(envio.getDonacionId())
                .needId(envio.getNeedId())
                .direccion(envio.getDireccion())
                .acopioCenterId(envio.getAcopioCenterId())
                .acopioCenterName(envio.getAcopioCenterName())
                .estado(envio.getEstado())
                .createdAt(envio.getCreatedAt())
                .acopioDeadline(envio.getAcopioDeadline())
                .cantidadDonada(envio.getCantidadDonada())
                .build();
    }
}

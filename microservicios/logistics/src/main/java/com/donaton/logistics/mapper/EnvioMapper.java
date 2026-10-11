package com.donaton.logistics.mapper;

import com.donaton.logistics.dto.EnvioResponseDTO;
import com.donaton.logistics.model.LogisticsEnvio;

public final class EnvioMapper {

    private EnvioMapper() {
    }

    public static EnvioResponseDTO toResponse(LogisticsEnvio envio) {
        return EnvioResponseDTO.fromEntity(envio);
    }
}

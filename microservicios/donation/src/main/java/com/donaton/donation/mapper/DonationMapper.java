package com.donaton.donation.mapper;

import com.donaton.donation.dto.DonationRequestDTO;
import com.donaton.donation.dto.DonationResponseDTO;
import com.donaton.donation.model.DonationModel;

public final class DonationMapper {

    private DonationMapper() {
    }

    public static DonationModel toModel(DonationRequestDTO dto) {
        DonationModel model = new DonationModel();
        model.setDescripcion(dto.getDescripcion());
        model.setCantidad(dto.getCantidad());
        model.setTipo(dto.getTipo());
        model.setDireccion(dto.getDireccion());
        model.setNeedId(dto.getNeedId());
        return model;
    }

    public static void updateModel(DonationModel target, DonationRequestDTO dto) {
        target.setDescripcion(dto.getDescripcion());
        target.setCantidad(dto.getCantidad());
        target.setTipo(dto.getTipo());
        target.setDireccion(dto.getDireccion());
        if (dto.getNeedId() != null) {
            target.setNeedId(dto.getNeedId());
        }
    }

    public static DonationResponseDTO toResponse(DonationModel model) {
        return DonationResponseDTO.fromModel(model);
    }
}

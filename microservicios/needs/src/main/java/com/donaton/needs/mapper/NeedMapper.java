package com.donaton.needs.mapper;

import com.donaton.needs.dto.NeedRequestDTO;
import com.donaton.needs.dto.NeedResponseDTO;
import com.donaton.needs.model.NeedEntity;

public final class NeedMapper {

    private NeedMapper() {
    }

    public static NeedEntity toEntity(NeedRequestDTO dto) {
        NeedEntity entity = new NeedEntity();
        entity.setId(dto.getId());
        entity.setCode(dto.getCode());
        entity.setCategory(dto.getCategory());
        entity.setProductName(dto.getProductName());
        entity.setQuantityRequired(dto.getQuantityRequired());
        entity.setQuantityReceived(dto.getQuantityReceived());
        entity.setUnit(dto.getUnit());
        entity.setPriority(dto.getPriority());
        entity.setStatus(dto.getStatus());
        entity.setRegion(dto.getRegion());
        entity.setCenterId(dto.getCenterId());
        entity.setCenterName(dto.getCenterName());
        entity.setAddress(dto.getAddress());
        entity.setDescription(dto.getDescription());
        entity.setDeadline(dto.getDeadline());
        entity.setVerifiedBy(dto.getVerifiedBy());
        entity.setMatchedDonations(dto.getMatchedDonations());
        return entity;
    }

    public static NeedResponseDTO toResponse(NeedEntity entity) {
        return NeedResponseDTO.fromEntity(entity);
    }
}

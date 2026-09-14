package com.bff.dto.response;

public record SessionHistoryResponse(
    Long id,
    String device,
    String browser,
    String location,
    String lastActive,
    Boolean current
) {}

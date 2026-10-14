package com.donaton.logistics.dto;

public record DlqReprocessResponse(
        String status,
        int reprocessedCount,
        String message) {
}

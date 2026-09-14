package com.donaton.auth.dto;

import java.time.LocalDateTime;

public record SessionHistoryDTO(
    Long id,
    String device,
    String browser,
    String location,
    String lastActive,
    Boolean current
) {
    public static SessionHistoryDTO fromEntity(com.donaton.auth.model.SessionHistory session) {
        String lastActiveStr = formatLastActive(session.getLastActive());
        return new SessionHistoryDTO(
            session.getId(),
            session.getDevice(),
            session.getBrowser(),
            session.getLocation(),
            lastActiveStr,
            session.getCurrent()
        );
    }

    private static String formatLastActive(LocalDateTime dateTime) {
        if (dateTime == null) return "Desconocido";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        
        if (minutes < 1) return "Ahora mismo";
        if (minutes < 60) return "Hace " + minutes + " minutos";
        if (minutes < 1440) return "Hace " + (minutes / 60) + " horas";
        return "Hace " + (minutes / 1440) + " días";
    }
}

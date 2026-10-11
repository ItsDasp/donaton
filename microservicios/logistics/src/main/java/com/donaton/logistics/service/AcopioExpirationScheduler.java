package com.donaton.logistics.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AcopioExpirationScheduler {

    private static final Logger log = LoggerFactory.getLogger(AcopioExpirationScheduler.class);

    private final EnvioService envioService;

    public AcopioExpirationScheduler(EnvioService envioService) {
        this.envioService = envioService;
    }

    @Scheduled(fixedRateString = "${logistics.acopio.expire-check-ms:3600000}")
    public void expirePendingAtAcopio() {
        int updated = envioService.marcarInexistentesVencidos();
        if (updated > 0) {
            log.info("Marcados {} envíos como inexistente por plazo de acopio vencido", updated);
        }
    }
}

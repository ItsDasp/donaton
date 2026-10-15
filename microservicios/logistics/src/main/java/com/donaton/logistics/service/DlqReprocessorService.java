package com.donaton.logistics.service;

import com.donaton.logistics.config.RabbitMQProperties;
import com.donaton.logistics.dto.DlqReprocessResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("!test")
public class DlqReprocessorService {

    private static final Logger log =
            LoggerFactory.getLogger(DlqReprocessorService.class);

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQProperties properties;

    public DlqReprocessorService(
            RabbitTemplate rabbitTemplate,
            RabbitMQProperties properties) {
        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
    }

    public DlqReprocessResponse reprocessDlqMessages(int limit) {
        if (limit < 1) {
            throw new IllegalArgumentException("El límite debe ser mayor que cero");
        }

        var dlq = properties.getLogisticsEventsDlq();
        var events = properties.getLogisticsEvents();
        int reprocessedCount = 0;

        for (int i = 0; i < limit; i++) {
            Message message = rabbitTemplate.receive(dlq.getName());
            if (message == null) {
                break;
            }

            rabbitTemplate.send(
                    properties.getExchanges().getLogistics(),
                    events.getRoutingKey(),
                    message
            );
            reprocessedCount++;
        }

        log.info(
                "Mensajes reprocesados desde DLQ: count={}, queue={}, exchange={}, routingKey={}",
                reprocessedCount,
                dlq.getName(),
                properties.getExchanges().getLogistics(),
                events.getRoutingKey()
        );

        return new DlqReprocessResponse(
                "SUCCESS",
                reprocessedCount,
                "Se re-procesaron %d mensajes de la DLQ hacia la cola principal."
                        .formatted(reprocessedCount)
        );
    }
}

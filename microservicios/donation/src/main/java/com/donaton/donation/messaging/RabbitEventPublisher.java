package com.donaton.donation.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class RabbitEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;
    private final String exchangeName;

    public RabbitEventPublisher(
            RabbitTemplate rabbitTemplate,
            @Value("${rabbitmq.events.exchange}") String exchangeName) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchangeName = exchangeName;
    }

    public void publish(String eventType, Map<String, Object> data) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", eventType);
        event.put("occurredAt", Instant.now().toString());
        event.put("data", data);
        try {
            rabbitTemplate.convertAndSend(exchangeName, eventType, event);
        } catch (RuntimeException exception) {
            log.warn("No se pudo publicar el evento RabbitMQ {}", eventType, exception);
        }
    }
}

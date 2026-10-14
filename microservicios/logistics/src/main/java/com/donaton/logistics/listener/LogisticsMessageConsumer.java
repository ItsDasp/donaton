package com.donaton.logistics.listener;

import com.donaton.logistics.dto.LogisticsDTO;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LogisticsMessageConsumer {

    private static final Logger log = LoggerFactory.getLogger(LogisticsMessageConsumer.class);

    @RabbitListener(
        queues = "${rabbitmq.logistics-events.name}",
        containerFactory = "rabbitListenerContainerFactory"
    )
    public void consume(
            LogisticsDTO dto,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long tag) throws IOException {
        
        try {
            process(dto);
            channel.basicAck(tag, false);
            log.info("Mensaje de logística procesado correctamente. id={}, deliveryTag={}", dto.getId(), tag);
        } catch (Exception ex) {
            channel.basicNack(tag, false, false);
            log.error("Mensaje de logística rechazado y enviado a la DLQ. id={}, deliveryTag={}", 
                      dto == null ? null : dto.getId(), tag, ex);
        }
    }

    private void process(LogisticsDTO dto) {
        if (dto == null || dto.getId() == null) {
            throw new IllegalArgumentException("El id del mensaje de logística es obligatorio");
        }
    }
}
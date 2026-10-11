package com.donaton.logistics.listener;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LogisticsMessageConsumer {

    @RabbitListener(queues = "${rabbitmq.logistics-events.name}")
    public void consume(Message message, Channel channel) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        try {
            process(message);
            channel.basicAck(deliveryTag, false);
        } catch (IllegalArgumentException | AmqpRejectAndDontRequeueException ex) {
            // Payload inválido o error no recuperable: se publica en la DLQ.
            channel.basicNack(deliveryTag, false, false);
        } catch (Exception ex) {
            // Error transitorio: se reintenta mediante requeue para no perder el mensaje.
            channel.basicNack(deliveryTag, false, true);
        }
    }

    private void process(Message message) {
        if (message.getBody().length == 0) {
            throw new IllegalArgumentException("El mensaje de logística no puede estar vacío");
        }
    }
}

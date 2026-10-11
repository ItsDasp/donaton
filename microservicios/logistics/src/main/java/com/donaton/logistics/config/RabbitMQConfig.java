package com.donaton.logistics.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class RabbitMQConfig {

    private final RabbitMQProperties properties;

    public RabbitMQConfig(RabbitMQProperties properties) {
        this.properties = properties;
    }

    @Bean
    public TopicExchange logisticsExchange() {
        return new TopicExchange(properties.getExchanges().getLogistics());
    }

    @Bean
    public TopicExchange deadLetterExchange() {
        return new TopicExchange(properties.getExchanges().getDeadLetter());
    }

    @Bean
    public Queue logisticsEventsDlq() {
        return new Queue(properties.getLogisticsEventsDlq().getName(), true);
    }

    @Bean
    public Queue logisticsEventsQueue() {
        var queue = properties.getLogisticsEvents();
        return new Queue(queue.getName(), true, false, false, Map.of(
                "x-dead-letter-exchange", properties.getExchanges().getDeadLetter(),
                "x-dead-letter-routing-key", properties.getLogisticsEventsDlq().getRoutingKey()
        ));
    }

    @Bean
    public Binding logisticsEventsDlqBinding(Queue logisticsEventsDlq, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(logisticsEventsDlq)
                .to(deadLetterExchange)
                .with(properties.getLogisticsEventsDlq().getRoutingKey());
    }

    @Bean
    public Binding logisticsEventsBinding(Queue logisticsEventsQueue, TopicExchange logisticsExchange) {
        return BindingBuilder.bind(logisticsEventsQueue)
                .to(logisticsExchange)
                .with(properties.getLogisticsEvents().getRoutingKey());
    }
}

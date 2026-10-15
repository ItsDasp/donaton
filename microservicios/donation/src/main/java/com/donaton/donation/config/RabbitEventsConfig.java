package com.donaton.donation.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.CommandLineRunner;

@Configuration(proxyBeanMethods = false)
public class RabbitEventsConfig {

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        admin.setAutoStartup(true);
        admin.afterPropertiesSet();
        return admin;
    }

    @Bean
    public TopicExchange domainEventsExchange(
            @Value("${rabbitmq.events.exchange}") String exchangeName) {
        return new TopicExchange(exchangeName, true, false);
    }

    @Bean
    public MessageConverter rabbitMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public CommandLineRunner initializeRabbitTopology(
            RabbitAdmin rabbitAdmin,
            TopicExchange domainEventsExchange) {
        return args -> rabbitAdmin.declareExchange(domainEventsExchange);
    }
}

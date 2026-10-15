package com.donaton.logistics.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.Map;

@Configuration(proxyBeanMethods = false)
@EnableRabbit
public class RabbitMQConfig {

    private final RabbitMQProperties properties;

    public RabbitMQConfig(RabbitMQProperties properties) {
        this.properties = properties;
    }
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RabbitMQConfig.class);

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("=================================================");
        log.info(">>> RABBITMQ CONFIGURATION CARGADA EXPLICITAMENTE");
        log.info("=================================================");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean(name = "rabbitListenerContainerFactory")
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        var factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        factory.setDefaultRequeueRejected(false);
        factory.setAutoStartup(true);
        factory.setMessageConverter(jsonMessageConverter);
        return factory;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) throws Exception {
        var admin = new RabbitAdmin(connectionFactory);
        admin.setAutoStartup(true);
        admin.afterPropertiesSet();
        return admin;
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
    public Binding logisticsEventsDlqBinding(
            @Qualifier("logisticsEventsDlq") Queue logisticsEventsDlq,
            @Qualifier("deadLetterExchange") TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(logisticsEventsDlq)
                .to(deadLetterExchange)
                .with(properties.getLogisticsEventsDlq().getRoutingKey());
    }

    @Bean
    public Binding logisticsEventsBinding(
            @Qualifier("logisticsEventsQueue") Queue logisticsEventsQueue,
            @Qualifier("logisticsExchange") TopicExchange logisticsExchange) {
        return BindingBuilder.bind(logisticsEventsQueue)
                .to(logisticsExchange)
                .with(properties.getLogisticsEvents().getRoutingKey());
    }
}

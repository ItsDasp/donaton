package com.donaton.logistics.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@ConfigurationProperties(prefix = "rabbitmq")
@Validated
public class RabbitMQProperties {

    @Valid
    private ExchangeProperties exchanges = new ExchangeProperties();
    @Valid
    private QueueProperties logisticsEvents = new QueueProperties();
    @Valid
    private QueueProperties logisticsEventsDlq = new QueueProperties();

    public ExchangeProperties getExchanges() {
        return exchanges;
    }

    public void setExchanges(ExchangeProperties exchanges) {
        this.exchanges = exchanges;
    }

    public QueueProperties getLogisticsEvents() {
        return logisticsEvents;
    }

    public void setLogisticsEvents(QueueProperties logisticsEvents) {
        this.logisticsEvents = logisticsEvents;
    }

    public QueueProperties getLogisticsEventsDlq() {
        return logisticsEventsDlq;
    }

    public void setLogisticsEventsDlq(QueueProperties logisticsEventsDlq) {
        this.logisticsEventsDlq = logisticsEventsDlq;
    }

    public static class ExchangeProperties {
        @NotBlank
        private String logistics;
        @NotBlank
        private String deadLetter;

        public String getLogistics() {
            return logistics;
        }

        public void setLogistics(String logistics) {
            this.logistics = logistics;
        }

        public String getDeadLetter() {
            return deadLetter;
        }

        public void setDeadLetter(String deadLetter) {
            this.deadLetter = deadLetter;
        }
    }

    public static class QueueProperties {
        @NotBlank
        private String name;
        @NotBlank
        private String routingKey;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRoutingKey() {
            return routingKey;
        }

        public void setRoutingKey(String routingKey) {
            this.routingKey = routingKey;
        }
    }
}

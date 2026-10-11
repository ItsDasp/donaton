package com.donaton.logistics.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rabbitmq")
public class RabbitMQProperties {

    private ExchangeProperties exchanges = new ExchangeProperties();
    private QueueProperties logisticsEvents = new QueueProperties();
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
        private String logistics;
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
        private String name;
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

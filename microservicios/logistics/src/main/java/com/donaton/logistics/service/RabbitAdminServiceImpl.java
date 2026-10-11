package com.donaton.logistics.service;

import com.donaton.logistics.config.RabbitMQProperties;
import com.donaton.logistics.dto.CreateQueueRequestDto;
import com.donaton.logistics.dto.QueueInfoDto;
import com.donaton.logistics.exception.QueueNotFoundException;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.Queue;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RabbitAdminServiceImpl implements RabbitAdminService {

    private final AmqpAdmin amqpAdmin;
    private final RabbitMQProperties properties;
    private final Set<String> managedQueues = ConcurrentHashMap.newKeySet();

    public RabbitAdminServiceImpl(AmqpAdmin amqpAdmin, RabbitMQProperties properties) {
        this.amqpAdmin = amqpAdmin;
        this.properties = properties;
        managedQueues.add(properties.getLogisticsEvents().getName());
        managedQueues.add(properties.getLogisticsEventsDlq().getName());
    }

    @Override
    public QueueInfoDto createQueue(CreateQueueRequestDto request) {
        var queue = new Queue(request.getQueueName(), request.isDurable(),
                request.isExclusive(), request.isAutoDelete());
        var declaredName = amqpAdmin.declareQueue(queue);
        managedQueues.add(declaredName);
        return queueInfo(declaredName);
    }

    @Override
    public List<QueueInfoDto> listQueues() {
        return new LinkedHashSet<>(managedQueues).stream().map(this::queueInfo).toList();
    }

    @Override
    public void deleteQueue(String queueName) {
        var properties = amqpAdmin.getQueueProperties(queueName);
        if (properties == null) {
            throw new QueueNotFoundException(queueName);
        }
        amqpAdmin.deleteQueue(queueName);
        managedQueues.remove(queueName);
    }

    private QueueInfoDto queueInfo(String queueName) {
        var queueProperties = amqpAdmin.getQueueProperties(queueName);
        if (queueProperties == null) {
            return new QueueInfoDto(queueName, false, null, null);
        }
        return new QueueInfoDto(queueName, true,
                ((Number) queueProperties.get("QUEUE_MESSAGE_COUNT")).longValue(),
                ((Number) queueProperties.get("QUEUE_CONSUMER_COUNT")).longValue());
    }
}

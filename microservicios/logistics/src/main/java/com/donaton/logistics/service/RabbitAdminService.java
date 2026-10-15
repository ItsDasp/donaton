package com.donaton.logistics.service;

import com.donaton.logistics.dto.CreateQueueRequestDto;
import com.donaton.logistics.dto.QueueInfoDto;

import java.util.List;

public interface RabbitAdminService {

    QueueInfoDto createQueue(CreateQueueRequestDto request);

    List<QueueInfoDto> listQueues();

    void deleteQueue(String queueName);
}

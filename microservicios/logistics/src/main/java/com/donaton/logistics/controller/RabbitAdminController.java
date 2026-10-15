package com.donaton.logistics.controller;

import com.donaton.logistics.dto.CreateQueueRequestDto;
import com.donaton.logistics.dto.QueueInfoDto;
import com.donaton.logistics.service.RabbitAdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/queues")
public class RabbitAdminController {

    private final RabbitAdminService rabbitAdminService;

    public RabbitAdminController(RabbitAdminService rabbitAdminService) {
        this.rabbitAdminService = rabbitAdminService;
    }

    @PostMapping
    public QueueInfoDto createQueue(@Valid @RequestBody CreateQueueRequestDto request) {
        return rabbitAdminService.createQueue(request);
    }

    @GetMapping
    public List<QueueInfoDto> listQueues() {
        return rabbitAdminService.listQueues();
    }

    @DeleteMapping("/{queueName}")
    public void deleteQueue(@PathVariable
                            @Size(max = 255)
                            @Pattern(regexp = "^[a-zA-Z0-9._-]+$") String queueName) {
        rabbitAdminService.deleteQueue(queueName);
    }
}

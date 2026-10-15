package com.donaton.logistics.dto;

public record QueueInfoDto(String name, boolean exists, Long messageCount, Long consumerCount) {
}

package com.donaton.auth.dto;

public record SessionRegistrationRequest(
    String device,
    String browser,
    String location,
    String ipAddress
) {}

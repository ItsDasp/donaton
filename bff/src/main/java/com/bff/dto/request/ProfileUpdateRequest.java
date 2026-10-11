package com.bff.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ProfileUpdateRequest {
    @NotBlank(message = "Name is required")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

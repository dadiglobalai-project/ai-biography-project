package com.AI.biography.onboarding.dto;

import jakarta.validation.constraints.NotBlank;

public class ServiceTypeRequest {

    @NotBlank
    private String serviceType;

    public ServiceTypeRequest() {
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }
}
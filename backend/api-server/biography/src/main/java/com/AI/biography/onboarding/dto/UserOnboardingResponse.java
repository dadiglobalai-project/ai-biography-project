package com.AI.biography.onboarding.dto;

public class UserOnboardingResponse {

    private String message;
    private String serviceType;
    private String onboardingStatus;

    public UserOnboardingResponse(String message, String serviceType, String onboardingStatus) {
        this.message = message;
        this.serviceType = serviceType;
        this.onboardingStatus = onboardingStatus;
    }

    public String getMessage() {
        return message;
    }

    public String getServiceType() {
        return serviceType;
    }

    public String getOnboardingStatus() {
        return onboardingStatus;
    }
}
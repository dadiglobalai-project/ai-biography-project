package com.AI.biography.onboarding;

import com.AI.biography.onboarding.dto.ServiceTypeRequest;
import com.AI.biography.onboarding.dto.UserOnboardingResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class OnboardingService {

    private final UserOnboardingRepository userOnboardingRepository;

    public OnboardingService(UserOnboardingRepository userOnboardingRepository) {
        this.userOnboardingRepository = userOnboardingRepository;
    }

    public UserOnboardingResponse saveServiceType(
            String userId,
            ServiceTypeRequest request
    ) {

        UserOnboarding onboarding = userOnboardingRepository
                .findByUserId(userId)
                .orElseGet(() -> {
                    UserOnboarding newOnboarding = new UserOnboarding();
                    newOnboarding.setOnboardingId(UUID.randomUUID().toString());
                    newOnboarding.setUserId(userId);
                    newOnboarding.setCreatedAt(LocalDateTime.now());
                    return newOnboarding;
                });

        onboarding.setServiceType(request.getServiceType());
        onboarding.setOnboardingStatus("COMPLETED");
        onboarding.setUpdatedAt(LocalDateTime.now());

        userOnboardingRepository.save(onboarding);

        return new UserOnboardingResponse(
                "Service type saved successfully",
                onboarding.getServiceType(),
                onboarding.getOnboardingStatus()
        );
    }
}
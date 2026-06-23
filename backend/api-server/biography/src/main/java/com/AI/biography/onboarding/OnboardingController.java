package com.AI.biography.onboarding;

import com.AI.biography.onboarding.dto.ServiceTypeRequest;
import com.AI.biography.onboarding.dto.UserOnboardingResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "*")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/service-type")
    public UserOnboardingResponse saveServiceType(
            @Valid @RequestBody ServiceTypeRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = (String) httpRequest.getAttribute("userId");

        return onboardingService.saveServiceType(userId, request);
    }
}
package com.AI.biography.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserOnboardingRepository extends JpaRepository<UserOnboarding, String> {

    Optional<UserOnboarding> findByUserId(String userId);

    boolean existsByUserId(String userId);
}
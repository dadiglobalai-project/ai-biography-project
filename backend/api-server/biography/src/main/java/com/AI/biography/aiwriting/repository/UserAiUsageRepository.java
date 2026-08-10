package com.AI.biography.aiwriting.repository;

import com.AI.biography.aiwriting.entity.UserAiUsage;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface UserAiUsageRepository extends JpaRepository<UserAiUsage, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserAiUsage> findWithLockByUserId(String userId);
}

package com.AI.biography.membership.repository;

import com.AI.biography.membership.entity.Membership;
import com.AI.biography.membership.enums.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, String> {
    List<Membership> findByUserUserIdOrderByCreatedAtDesc(String userId);

    Optional<Membership> findFirstByUserUserIdAndStatusOrderByCreatedAtDesc(
            String userId,
            MembershipStatus status
    );

    boolean existsByUserUserIdAndStatus(String userId, MembershipStatus status);
}

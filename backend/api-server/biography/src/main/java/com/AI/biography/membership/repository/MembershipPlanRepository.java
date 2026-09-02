package com.AI.biography.membership.repository;

import com.AI.biography.membership.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, String> {
    List<MembershipPlan> findByActiveTrue();
}

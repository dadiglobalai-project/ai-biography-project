package com.AI.biography.membership.service;

import com.AI.biography.membership.dto.response.CurrentMembershipResponse;
import com.AI.biography.membership.dto.response.MembershipPlanResponse;
import com.AI.biography.membership.dto.response.MembershipPlansResponse;
import com.AI.biography.membership.entity.Membership;
import com.AI.biography.membership.entity.MembershipPlan;
import com.AI.biography.membership.enums.MembershipStatus;
import com.AI.biography.membership.repository.MembershipPlanRepository;
import com.AI.biography.membership.repository.MembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MembershipService {
    private final MembershipRepository membershipRepository;
    private final MembershipPlanRepository planRepository;
    private final MembershipAuthorizationService authorizationService;

    public MembershipService(MembershipRepository membershipRepository,
                             MembershipPlanRepository planRepository,
                             MembershipAuthorizationService authorizationService) {
        this.membershipRepository = membershipRepository;
        this.planRepository = planRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public Optional<CurrentMembershipResponse> getCurrentMembership() {
        return getCurrentMembershipForUser(authorizationService.currentUserId());
    }

    Optional<CurrentMembershipResponse> getCurrentMembershipForUser(String userId) {
        LocalDateTime now = LocalDateTime.now();
        return membershipRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(membership -> membership.getStatus() == MembershipStatus.ACTIVE)
                .filter(membership -> membership.getExpiresAt() != null && membership.getExpiresAt().isAfter(now))
                .findFirst()
                .map(this::mapCurrentMembership);
    }

    @Transactional(readOnly = true)
    public MembershipPlansResponse getActivePlans() {
        return new MembershipPlansResponse(planRepository.findByActiveTrue()
                .stream()
                .map(this::mapPlan)
                .toList());
    }

    void activateMembership(Membership membership, LocalDateTime startAt) {
        MembershipPlan plan = membership.getPlan();
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setStartAt(startAt);
        membership.setExpiresAt(startAt.plusMonths(plan.getDurationMonths()));
        membership.setUpdatedAt(LocalDateTime.now());
    }

    void cancelMembership(Membership membership) {
        membership.setStatus(MembershipStatus.CANCELLED);
        membership.setUpdatedAt(LocalDateTime.now());
    }

    public boolean hasCurrentActiveMembership(String userId) {
        LocalDateTime now = LocalDateTime.now();
        return membershipRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .anyMatch(membership -> membership.getStatus() == MembershipStatus.ACTIVE
                        && membership.getExpiresAt() != null
                        && membership.getExpiresAt().isAfter(now));
    }

    private CurrentMembershipResponse mapCurrentMembership(Membership membership) {
        CurrentMembershipResponse response = new CurrentMembershipResponse();
        response.membershipId = membership.getMembershipId();
        response.planId = membership.getPlan().getPlanId();
        response.planName = membership.getPlan().getName();
        response.status = membership.getStatus();
        response.startAt = membership.getStartAt();
        response.expiresAt = membership.getExpiresAt();
        response.autoRenew = membership.getAutoRenew();
        response.active = true;
        return response;
    }

    private MembershipPlanResponse mapPlan(MembershipPlan plan) {
        MembershipPlanResponse response = new MembershipPlanResponse();
        response.planId = plan.getPlanId();
        response.name = plan.getName();
        response.standardPrice = plan.getStandardPrice();
        response.currency = plan.getCurrency();
        response.durationMonths = plan.getDurationMonths();
        response.refundWindowDays = plan.getRefundWindowDays();
        response.active = plan.getActive();
        return response;
    }
}

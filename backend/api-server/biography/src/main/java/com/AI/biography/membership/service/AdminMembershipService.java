package com.AI.biography.membership.service;

import com.AI.biography.membership.dto.response.CurrentMembershipResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AdminMembershipService {
    private final MembershipAuthorizationService authorizationService;
    private final MembershipService membershipService;

    public AdminMembershipService(MembershipAuthorizationService authorizationService,
                                  MembershipService membershipService) {
        this.authorizationService = authorizationService;
        this.membershipService = membershipService;
    }

    @Transactional(readOnly = true)
    public Optional<CurrentMembershipResponse> getUserMembership(String userId) {
        authorizationService.requireAdmin();
        return membershipService.getCurrentMembershipForUser(userId);
    }
}

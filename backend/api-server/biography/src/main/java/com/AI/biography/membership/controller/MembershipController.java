package com.AI.biography.membership.controller;

import com.AI.biography.membership.dto.response.CurrentMembershipResponse;
import com.AI.biography.membership.dto.response.MembershipPlansResponse;
import com.AI.biography.membership.service.MembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/membership")
@CrossOrigin(origins = "*")
public class MembershipController {
    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping("/current")
    public ResponseEntity<CurrentMembershipResponse> getCurrentMembership() {
        return membershipService.getCurrentMembership()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/plans")
    public MembershipPlansResponse getActivePlans() {
        return membershipService.getActivePlans();
    }
}

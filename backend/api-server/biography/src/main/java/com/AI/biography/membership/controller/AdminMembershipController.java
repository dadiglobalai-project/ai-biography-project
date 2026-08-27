package com.AI.biography.membership.controller;

import com.AI.biography.membership.dto.response.CurrentMembershipResponse;
import com.AI.biography.membership.service.AdminMembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminMembershipController {
    private final AdminMembershipService adminMembershipService;

    public AdminMembershipController(AdminMembershipService adminMembershipService) {
        this.adminMembershipService = adminMembershipService;
    }

    @GetMapping("/{userId}/membership")
    public ResponseEntity<CurrentMembershipResponse> getUserMembership(@PathVariable String userId) {
        return adminMembershipService.getUserMembership(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}

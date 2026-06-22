package com.AI.biography.auth;

import java.time.Instant;

public record JwtClaims(
        String userId,
        String email,
        String fullName,
        String status,
        Instant expiresAt
) {
}

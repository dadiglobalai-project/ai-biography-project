package com.AI.biography.membership.exception;

public class MembershipUnauthorizedException extends RuntimeException {
    public MembershipUnauthorizedException(String message) {
        super(message);
    }
}

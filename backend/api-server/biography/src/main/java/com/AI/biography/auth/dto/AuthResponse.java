package com.AI.biography.auth.dto;

public class AuthResponse {

    private boolean success;
    private String message;
    private AuthUser user;

    public AuthResponse(String message) {
        this(false, message, null);
    }

    public AuthResponse(boolean success, String message, AuthUser user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }

    public static AuthResponse success(String message, AuthUser user) {
        return new AuthResponse(true, message, user);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public AuthUser getUser() {
        return user;
    }
}

package com.AI.biography.auth.dto;

public class AuthUser {

    private final String userId;
    private final String email;
    private final String fullName;
    private final String status;

    public AuthUser(String userId, String email, String fullName, String status) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.status = status;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getStatus() {
        return status;
    }
}

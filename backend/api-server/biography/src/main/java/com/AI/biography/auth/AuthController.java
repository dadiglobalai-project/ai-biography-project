package com.AI.biography.auth;

import com.AI.biography.auth.dto.AuthResponse;
import com.AI.biography.auth.dto.LoginRequest;
import com.AI.biography.auth.dto.RegistrationRequest;
import com.AI.biography.auth.dto.ForgotPasswordRequest;
import com.AI.biography.auth.dto.ResetPasswordRequest;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(
            @Valid @RequestBody RegistrationRequest request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public AuthResponse forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public AuthResponse resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        return authService.resetPassword(request);
    }
}
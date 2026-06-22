package com.AI.biography.auth;

import com.AI.biography.auth.dto.AuthResponse;
import com.AI.biography.auth.dto.AuthUser;
import com.AI.biography.auth.dto.LoginRequest;
import com.AI.biography.auth.dto.RegistrationRequest;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://localhost:5173"},
        allowCredentials = "true"
)
public class AuthController {

    private static final String AUTH_COOKIE_NAME = "xinghuoji_auth";

    private final AuthService authService;
    private final JwtService jwtService;
    private final boolean cookieSecure;
    private final String cookieSameSite;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            @Value("${app.auth.cookie-secure}") boolean cookieSecure,
            @Value("${app.auth.cookie-same-site}") String cookieSameSite) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegistrationRequest request) {

        AuthUser user = authService.register(request);
        return authenticated(AuthResponse.success("Registration successful", user), user);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthUser user = authService.login(request);
        return authenticated(AuthResponse.success("Login successful", user), user);
    }

    @GetMapping("/me")
    public AuthResponse currentUser(
            @CookieValue(name = AUTH_COOKIE_NAME, required = false) String token) {

        JwtClaims claims = jwtService.verify(token);
        AuthUser user = authService.getUserById(claims.userId());
        return AuthResponse.success("Authenticated", user);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(AuthResponse.success("Signed out", null));
    }

    private ResponseEntity<AuthResponse> authenticated(AuthResponse response, AuthUser user) {
        String token = jwtService.createToken(user);
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(Duration.ofSeconds(jwtService.getExpirationSeconds()))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }


}

package com.AI.biography.auth;

import com.AI.biography.auth.dto.AuthResponse;
import com.AI.biography.auth.dto.LoginRequest;
import com.AI.biography.auth.dto.RegistrationRequest;
import com.AI.biography.user.User;
import com.AI.biography.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegistrationRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("Email already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setEmail(request.getEmail());
        user.setPasswordHash(hashedPassword);
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return new AuthResponse("Registration successful");
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return new AuthResponse("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse("Invalid email or password");
        }

        return new AuthResponse("Login successful");
    }
}
package com.AI.biography.auth;

import com.AI.biography.auth.dto.AuthUser;
import com.AI.biography.auth.dto.LoginRequest;
import com.AI.biography.auth.dto.RegistrationRequest;
import com.AI.biography.user.User;
import com.AI.biography.user.UserProfile;
import com.AI.biography.user.UserProfileRepository;
import com.AI.biography.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional
    public AuthUser register(RegistrationRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw badRequest("Passwords do not match");
        }

        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw badRequest("Email already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        saveProfile(user, request.getFullName());

        return toAuthUser(user, request.getFullName());
    }

    @Transactional(readOnly = true)
    public AuthUser login(LoginRequest request) {

        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> unauthorized("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw unauthorized("Invalid email or password");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
        }

        return toAuthUser(user, null);
    }

    @Transactional(readOnly = true)
    public AuthUser getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> unauthorized("Authentication required"));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
        }

        return toAuthUser(user, null);
    }

    private void saveProfile(User user, String fullName) {
        String trimmedName = fullName == null ? "" : fullName.trim().replaceAll("\\s+", " ");
        String[] nameParts = trimmedName.split(" ", 2);

        UserProfile profile = new UserProfile();
        profile.setProfileId(UUID.randomUUID().toString());
        profile.setUser(user);
        profile.setFirstName(nameParts.length > 0 ? nameParts[0] : "");
        profile.setLastName(nameParts.length > 1 ? nameParts[1] : "");

        userProfileRepository.save(profile);
    }

    private AuthUser toAuthUser(User user, String preferredFullName) {
        String fullName = preferredFullName == null ? "" : preferredFullName.trim();
        if (fullName.isBlank()) {
            fullName = userProfileRepository.findByUserUserId(user.getUserId())
                    .map(UserProfile::getFullName)
                    .filter(name -> !name.isBlank())
                    .orElse("Archival Successor");
        }

        return new AuthUser(user.getUserId(), user.getEmail(), fullName, user.getStatus());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException badRequest(String reason) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
    }

    private ResponseStatusException unauthorized(String reason) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, reason);
    }
}

package com.AI.biography.auth;

import com.AI.biography.auth.dto.AuthResponse;
import com.AI.biography.auth.dto.ForgotPasswordRequest;
import com.AI.biography.auth.dto.LoginRequest;
import com.AI.biography.auth.dto.RegistrationRequest;
import com.AI.biography.auth.dto.ResetPasswordRequest;
import com.AI.biography.user.User;
import com.AI.biography.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.AI.biography.user.UserProfile;
import com.AI.biography.user.UserProfileRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final UserProfileRepository userProfileRepository;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            BCryptPasswordEncoder passwordEncoder,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService,
            UserProfileRepository userProfileRepository) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.userProfileRepository = userProfileRepository;
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


        String fullName = request.getFullName().trim();
        String[] nameParts = fullName.split(" ", 2);

        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        UserProfile profile = new UserProfile();
        profile.setProfileId(UUID.randomUUID().toString());
        profile.setUserId(user.getUserId());
        profile.setFirstName(firstName);
        profile.setLastName(lastName);
        profile.setProfilePhoto(null);
        profile.setBio(null);

        userRepository.save(user);
        userProfileRepository.save(profile);

        
        String token = jwtService.generateToken(user);

        return new AuthResponse("Registration successful", token);
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

        String token = jwtService.generateToken(user);

        return new AuthResponse("Login successful", token);
    }

    public AuthResponse forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return new AuthResponse("If the email exists, a reset link will be sent");
        }

        String resetTokenValue = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setTokenId(UUID.randomUUID().toString());
        resetToken.setUserId(user.getUserId());
        resetToken.setResetToken(resetTokenValue);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        resetToken.setUsed(false);
        resetToken.setCreatedAt(LocalDateTime.now());

        passwordResetTokenRepository.save(resetToken);

        String firstName = userProfileRepository.findByUserId(user.getUserId())
        .map(UserProfile::getFirstName)
        .orElse("User");

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                firstName,
                resetTokenValue
        );

        return new AuthResponse("If the email exists, a reset link will be sent");
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse("Passwords do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByResetToken(request.getToken())
                .orElse(null);

        if (resetToken == null) {
            return new AuthResponse("Invalid reset token");
        }

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            return new AuthResponse("Reset token has already been used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new AuthResponse("Reset token has expired");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElse(null);

        if (user == null) {
            return new AuthResponse("User not found");
        }

        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(hashedPassword);

        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return new AuthResponse("Password reset successful");
    }
}
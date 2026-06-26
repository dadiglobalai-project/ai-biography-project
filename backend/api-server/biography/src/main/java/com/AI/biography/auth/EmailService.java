package com.AI.biography.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(
            String recipient,
            String firstName,
            String token) {

        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        String body = """
Hello %s,

We received a request to reset your password.

Click the link below to reset your password:

%s

If you did not request this, you can safely ignore this email.

This link will expire in 30 minutes.

Regards,
Dadi Biography Team
""".formatted(firstName, resetUrl);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject("Reset Your Password");
        message.setText(body);

        mailSender.send(message);
    }
}
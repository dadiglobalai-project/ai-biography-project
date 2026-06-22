package com.AI.biography.auth;

import com.AI.biography.auth.dto.AuthUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final long expirationSeconds;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.auth.jwt-secret}") String jwtSecret,
            @Value("${app.auth.jwt-expiration-seconds}") long expirationSeconds) {
        this.objectMapper = objectMapper;
        this.secret = jwtSecret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationSeconds;
    }

    public String createToken(AuthUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expirationSeconds);

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.getUserId());
        payload.put("email", user.getEmail());
        payload.put("name", user.getFullName());
        payload.put("status", user.getStatus());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", expiresAt.getEpochSecond());

        String encodedHeader = encodeJson(header);
        String encodedPayload = encodeJson(payload);
        String signature = sign(encodedHeader + "." + encodedPayload);

        return encodedHeader + "." + encodedPayload + "." + signature;
    }

    public JwtClaims verify(String token) {
        if (token == null || token.isBlank()) {
            throw unauthorized("Authentication required");
        }

        String[] tokenParts = token.split("\\.");
        if (tokenParts.length != 3) {
            throw unauthorized("Invalid authentication token");
        }

        String signedContent = tokenParts[0] + "." + tokenParts[1];
        String expectedSignature = sign(signedContent);
        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.US_ASCII),
                tokenParts[2].getBytes(StandardCharsets.US_ASCII))) {
            throw unauthorized("Invalid authentication token");
        }

        Map<String, Object> header = decodeJson(tokenParts[0]);
        if (!"HS256".equals(asString(header.get("alg")))) {
            throw unauthorized("Unsupported authentication token");
        }

        Map<String, Object> payload = decodeJson(tokenParts[1]);
        long expiresAt = asLong(payload.get("exp"));
        if (Instant.now().getEpochSecond() >= expiresAt) {
            throw unauthorized("Session expired");
        }

        String userId = asString(payload.get("sub"));
        String email = asString(payload.get("email"));
        if (userId.isBlank() || email.isBlank()) {
            throw unauthorized("Invalid authentication token");
        }

        return new JwtClaims(
                userId,
                email,
                asString(payload.get("name")),
                asString(payload.get("status")),
                Instant.ofEpochSecond(expiresAt)
        );
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    private String encodeJson(Map<String, Object> values) {
        try {
            return base64UrlEncode(objectMapper.writeValueAsBytes(values));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to create authentication token", ex);
        }
    }

    private Map<String, Object> decodeJson(String encodedJson) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(encodedJson);
            return objectMapper.readValue(decoded, MAP_TYPE);
        } catch (Exception ex) {
            throw unauthorized("Invalid authentication token");
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            return base64UrlEncode(mac.doFinal(value.getBytes(StandardCharsets.US_ASCII)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign authentication token", ex);
        }
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String asString(Object value) {
        return value == null ? "" : value.toString();
    }

    private long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }

        try {
            return Long.parseLong(asString(value));
        } catch (NumberFormatException ex) {
            throw unauthorized("Invalid authentication token");
        }
    }

    private ResponseStatusException unauthorized(String reason) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, reason);
    }
}

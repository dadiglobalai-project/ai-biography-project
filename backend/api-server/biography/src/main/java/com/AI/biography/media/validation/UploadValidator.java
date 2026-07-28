package com.AI.biography.media.validation;

import com.AI.biography.section.exception.BadRequestException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Set;

@Component
public class UploadValidator {
    private static final Set<String> SUPPORTED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final Map<String, String> DETECTED_TO_ALLOWED_MIME_TYPE = Map.of(
            "JPEG", "image/jpeg",
            "PNG", "image/png",
            "WEBP", "image/webp"
    );

    private final UploadValidationProperties properties;

    public UploadValidator(UploadValidationProperties properties) {
        this.properties = properties;
    }

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file must not be empty");
        }

        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new BadRequestException("Uploaded file exceeds the maximum allowed size");
        }

        String declaredContentType = normalizeContentType(file.getContentType());
        if (!SUPPORTED_MIME_TYPES.contains(declaredContentType)) {
            throw new BadRequestException("Unsupported file type. Supported types are image/jpeg, image/png, and image/webp");
        }

        String detectedContentType = detectContentType(file);
        if (!declaredContentType.equals(detectedContentType)) {
            throw new BadRequestException("Uploaded file content does not match the declared MIME type");
        }
    }

    private String detectContentType(MultipartFile file) {
        byte[] header = new byte[12];
        int bytesRead;

        try (InputStream inputStream = file.getInputStream()) {
            bytesRead = inputStream.read(header);
        } catch (IOException e) {
            throw new BadRequestException("Unable to read uploaded file");
        }

        String detectedType = detectFromHeader(header, bytesRead);
        if (detectedType == null) {
            throw new BadRequestException("Unsupported file content. Supported types are image/jpeg, image/png, and image/webp");
        }
        return detectedType;
    }

    private String detectFromHeader(byte[] header, int bytesRead) {
        if (bytesRead >= 3
                && unsigned(header[0]) == 0xFF
                && unsigned(header[1]) == 0xD8
                && unsigned(header[2]) == 0xFF) {
            return DETECTED_TO_ALLOWED_MIME_TYPE.get("JPEG");
        }

        if (bytesRead >= 8
                && unsigned(header[0]) == 0x89
                && header[1] == 0x50
                && header[2] == 0x4E
                && header[3] == 0x47
                && header[4] == 0x0D
                && header[5] == 0x0A
                && header[6] == 0x1A
                && header[7] == 0x0A) {
            return DETECTED_TO_ALLOWED_MIME_TYPE.get("PNG");
        }

        if (bytesRead >= 12
                && header[0] == 0x52
                && header[1] == 0x49
                && header[2] == 0x46
                && header[3] == 0x46
                && header[8] == 0x57
                && header[9] == 0x45
                && header[10] == 0x42
                && header[11] == 0x50) {
            return DETECTED_TO_ALLOWED_MIME_TYPE.get("WEBP");
        }

        return null;
    }

    private int unsigned(byte value) {
        return value & 0xFF;
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null) {
            return "";
        }
        int parametersIndex = contentType.indexOf(';');
        String type = parametersIndex >= 0 ? contentType.substring(0, parametersIndex) : contentType;
        return type.trim().toLowerCase();
    }
}

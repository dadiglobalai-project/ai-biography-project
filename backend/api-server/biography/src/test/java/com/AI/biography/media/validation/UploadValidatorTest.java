package com.AI.biography.media.validation;

import com.AI.biography.section.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UploadValidatorTest {
    private UploadValidator validator;

    @BeforeEach
    void setUp() {
        UploadValidationProperties properties = new UploadValidationProperties();
        properties.setMaxFileSizeBytes(16);
        validator = new UploadValidator(properties);
    }

    @Test
    void acceptsValidJpeg() {
        MockMultipartFile file = file("photo.jpg", "image/jpeg", bytes(0xFF, 0xD8, 0xFF, 0xE0));

        assertThatCode(() -> validator.validate(file)).doesNotThrowAnyException();
    }

    @Test
    void acceptsValidPng() {
        MockMultipartFile file = file("photo.png", "image/png", bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A));

        assertThatCode(() -> validator.validate(file)).doesNotThrowAnyException();
    }

    @Test
    void acceptsValidWebp() {
        MockMultipartFile file = file("photo.webp", "image/webp", bytes(
                0x52, 0x49, 0x46, 0x46,
                0x01, 0x00, 0x00, 0x00,
                0x57, 0x45, 0x42, 0x50
        ));

        assertThatCode(() -> validator.validate(file)).doesNotThrowAnyException();
    }

    @Test
    void rejectsEmptyUpload() {
        MockMultipartFile file = file("empty.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Uploaded file must not be empty");
    }

    @Test
    void rejectsUnsupportedMimeType() {
        MockMultipartFile file = file("document.pdf", "application/pdf", bytes(0x25, 0x50, 0x44, 0x46));

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Unsupported file type");
    }

    @Test
    void rejectsOversizedUpload() {
        MockMultipartFile file = file("large.png", "image/png", bytes(
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
                0x09
        ));

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Uploaded file exceeds the maximum allowed size");
    }

    @Test
    void rejectsDeclaredTypeThatDoesNotMatchDetectedContent() {
        MockMultipartFile file = file("fake.jpg", "image/jpeg", bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A));

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Uploaded file content does not match the declared MIME type");
    }

    private MockMultipartFile file(String name, String contentType, byte[] content) {
        return new MockMultipartFile("file", name, contentType, content);
    }

    private byte[] bytes(int... values) {
        byte[] bytes = new byte[values.length];
        for (int i = 0; i < values.length; i++) {
            bytes[i] = (byte) values[i];
        }
        return bytes;
    }
}

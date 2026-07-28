package com.AI.biography.media.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalStorageServiceTest {
    Path tempDir;

    @BeforeEach
    void setUp() {
        tempDir = Path.of("target", "storage-test", UUID.randomUUID().toString());
    }

    @Test
    void storeWritesFileWithUniqueStorageKeyAndPublicUrl() throws Exception {
        LocalStorageService service = service();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "family-photo.png",
                "image/png",
                "image-bytes".getBytes()
        );

        StoredFile stored = service.store(file, "websites/website-1");

        assertThat(stored.storageKey()).startsWith("websites/website-1/");
        assertThat(stored.storageKey()).endsWith(".png");
        assertThat(stored.storageKey()).doesNotContain("family-photo");
        assertThat(stored.publicUrl()).isEqualTo("/media/" + stored.storageKey());
        assertThat(Files.readString(tempDir.resolve(stored.storageKey()))).isEqualTo("image-bytes");
    }

    @Test
    void storeGeneratesDifferentKeysForSameOriginalFilename() {
        LocalStorageService service = service();
        MockMultipartFile first = new MockMultipartFile("file", "photo.jpg", "image/jpeg", "first".getBytes());
        MockMultipartFile second = new MockMultipartFile("file", "photo.jpg", "image/jpeg", "second".getBytes());

        StoredFile firstStored = service.store(first, "website-1");
        StoredFile secondStored = service.store(second, "website-1");

        assertThat(firstStored.storageKey()).isNotEqualTo(secondStored.storageKey());
    }

    @Test
    void deleteRemovesStoredFile() {
        LocalStorageService service = service();
        MockMultipartFile file = new MockMultipartFile("file", "voice.mp3", "audio/mpeg", "audio".getBytes());
        StoredFile stored = service.store(file, "website-1");

        service.delete(stored.storageKey());

        assertThat(tempDir.resolve(stored.storageKey())).doesNotExist();
    }

    @Test
    void deleteRejectsStorageKeyOutsideRootDirectory() {
        LocalStorageService service = service();

        assertThatThrownBy(() -> service.delete("../outside.txt"))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("outside the storage directory");
    }

    private LocalStorageService service() {
        LocalStorageProperties properties = new LocalStorageProperties();
        properties.setRootDirectory(tempDir.toString());
        properties.setPublicBaseUrl("/media");
        return new LocalStorageService(properties);
    }
}

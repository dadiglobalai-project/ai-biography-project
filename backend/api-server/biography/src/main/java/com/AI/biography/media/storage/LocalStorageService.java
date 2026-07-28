package com.AI.biography.media.storage;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LocalStorageService implements StorageService {
    private final Path rootDirectory;
    private final String publicBaseUrl;

    public LocalStorageService(LocalStorageProperties properties) {
        this.rootDirectory = Path.of(properties.getRootDirectory()).toAbsolutePath().normalize();
        this.publicBaseUrl = trimTrailingSlash(properties.getPublicBaseUrl());
    }

    @Override
    public StoredFile store(MultipartFile file) {
        return store(file, "");
    }

    @Override
    public StoredFile store(MultipartFile file, String namespace) {
        if (file == null || file.isEmpty()) {
            throw new StorageException("Cannot store an empty file");
        }

        String storageKey = buildStorageKey(namespace, file.getOriginalFilename());
        Path destination = resolveStorageKey(storageKey);

        try {
            Files.createDirectories(destination.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination);
            }
        } catch (IOException e) {
            throw new StorageException("Failed to store file", e);
        }

        return new StoredFile(storageKey, publicUrl(storageKey));
    }

    @Override
    public void delete(String storageKey) {
        Path target = resolveStorageKey(storageKey);
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new StorageException("Failed to delete file", e);
        }
    }

    private String buildStorageKey(String namespace, String originalFilename) {
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID() + cleanExtension(extension);
        String cleanNamespace = cleanNamespace(namespace);
        if (cleanNamespace.isBlank()) {
            return uniqueFilename;
        }
        return cleanNamespace + "/" + uniqueFilename;
    }

    private Path resolveStorageKey(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new StorageException("Storage key is required");
        }

        Path resolved = rootDirectory.resolve(storageKey).normalize();
        if (!resolved.startsWith(rootDirectory)) {
            throw new StorageException("Storage key resolves outside the storage directory");
        }
        return resolved;
    }

    private String cleanNamespace(String namespace) {
        if (namespace == null || namespace.isBlank()) {
            return "";
        }

        return Arrays.stream(namespace.split("[/\\\\]+"))
                .map(String::trim)
                .filter(part -> !part.isBlank())
                .map(part -> part.replaceAll("[^A-Za-z0-9._-]", "-"))
                .filter(part -> !part.equals(".") && !part.equals(".."))
                .collect(Collectors.joining("/"));
    }

    private String cleanExtension(String extension) {
        if (extension == null || extension.isBlank()) {
            return "";
        }
        String clean = extension.replaceAll("[^A-Za-z0-9]", "").toLowerCase();
        return clean.isBlank() ? "" : "." + clean;
    }

    private String publicUrl(String storageKey) {
        return publicBaseUrl + "/" + storageKey;
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.replaceAll("/+$", "");
    }
}

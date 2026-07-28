package com.AI.biography.media.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    StoredFile store(MultipartFile file);

    StoredFile store(MultipartFile file, String namespace);

    void delete(String storageKey);
}

package com.AI.biography.media.storage;

import org.springframework.web.multipart.MultipartFile;

public interface MediaStorageService {
    StoredMedia upload(String storageKey, MultipartFile file);

    void delete(String storageKey);

    String createAccessUrl(String storageKey);
}

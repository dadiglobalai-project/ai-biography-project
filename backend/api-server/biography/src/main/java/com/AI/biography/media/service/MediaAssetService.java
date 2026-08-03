package com.AI.biography.media.service;

import com.AI.biography.media.MediaUsageType;
import com.AI.biography.media.dto.MediaAssetResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaAssetService {
    MediaAssetResponse uploadMedia(String userId, String websiteId, MultipartFile file, MediaUsageType usageType);

    List<MediaAssetResponse> listMedia(String userId, String websiteId);

    String createAccessUrl(String userId, String websiteId, String mediaAssetId);

    void deleteMedia(String userId, String websiteId, String mediaAssetId);
}

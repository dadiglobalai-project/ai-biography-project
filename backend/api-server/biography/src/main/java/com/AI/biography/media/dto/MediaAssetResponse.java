package com.AI.biography.media.dto;

import com.AI.biography.media.MediaUsageType;

import java.time.LocalDateTime;

public class MediaAssetResponse {
    public String mediaAssetId;
    public String websiteId;
    public MediaUsageType usageType;
    public String originalFilename;
    public String mimeType;
    public Long fileSize;
    public Integer width;
    public Integer height;
    public String bucketName;
    public String storageKey;
    public String accessUrl;
    public LocalDateTime createdAt;
}

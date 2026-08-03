package com.AI.biography.media.dto;

public class MediaAccessUrlResponse {
    public String mediaAssetId;
    public String accessUrl;

    public MediaAccessUrlResponse(String mediaAssetId, String accessUrl) {
        this.mediaAssetId = mediaAssetId;
        this.accessUrl = accessUrl;
    }
}

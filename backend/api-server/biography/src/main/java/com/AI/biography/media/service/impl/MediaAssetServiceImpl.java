package com.AI.biography.media.service.impl;

import com.AI.biography.media.MediaUsageType;
import com.AI.biography.media.dto.MediaAssetResponse;
import com.AI.biography.media.service.MediaAssetService;
import com.AI.biography.media.storage.MediaStorageService;
import com.AI.biography.media.storage.StorageException;
import com.AI.biography.media.storage.StoredMedia;
import com.AI.biography.media.validation.UploadValidator;
import com.AI.biography.section.entity.WebsiteMediaAsset;
import com.AI.biography.section.enums.MediaType;
import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.section.repository.WebsiteMediaAssetRepository;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class MediaAssetServiceImpl implements MediaAssetService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MediaAssetServiceImpl.class);
    private static final String STORAGE_PROVIDER = "SUPABASE";

    private final BiographyWebsiteRepository websiteRepository;
    private final WebsiteMediaAssetRepository mediaRepository;
    private final UploadValidator uploadValidator;
    private final MediaStorageService storageService;

    public MediaAssetServiceImpl(BiographyWebsiteRepository websiteRepository,
                                 WebsiteMediaAssetRepository mediaRepository,
                                 UploadValidator uploadValidator,
                                 MediaStorageService storageService) {
        this.websiteRepository = websiteRepository;
        this.mediaRepository = mediaRepository;
        this.uploadValidator = uploadValidator;
        this.storageService = storageService;
    }

    @Override
    @Transactional
    public MediaAssetResponse uploadMedia(String userId, String websiteId, MultipartFile file, MediaUsageType usageType) {
        BiographyWebsite website = requireOwnedWebsite(userId, websiteId);
        uploadValidator.validate(file);

        String mimeType = normalizedMimeType(file);
        String storageKey = storageKey(websiteId, usageType, extensionFor(mimeType));
        LOGGER.info("Uploading media websiteId={} userId={} storageKey={} fileSize={}",
                websiteId, userId, storageKey, file.getSize());

        StoredMedia stored = storageService.upload(storageKey, file);
        WebsiteMediaAsset saved;
        try {
            saved = mediaRepository.save(asset(website, userId, file, usageType, mimeType, stored));
        } catch (RuntimeException e) {
            cleanupAfterMetadataFailure(storageKey);
            throw e;
        }

        LOGGER.info("Media upload complete websiteId={} userId={} storageKey={} mediaAssetId={} fileSize={}",
                websiteId, userId, storageKey, saved.getMediaAssetId(), saved.getFileSizeBytes());
        return toResponse(saved, storageService.createAccessUrl(saved.getStorageKey()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaAssetResponse> listMedia(String userId, String websiteId) {
        requireOwnedWebsite(userId, websiteId);
        return mediaRepository.findByWebsiteWebsiteIdAndWebsiteUserIdOrderByCreatedAtDesc(websiteId, userId)
                .stream()
                .map(asset -> toResponse(asset, null))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public String createAccessUrl(String userId, String websiteId, String mediaAssetId) {
        WebsiteMediaAsset asset = requireOwnedMedia(userId, websiteId, mediaAssetId);
        return storageService.createAccessUrl(asset.getStorageKey());
    }

    @Override
    @Transactional
    public void deleteMedia(String userId, String websiteId, String mediaAssetId) {
        WebsiteMediaAsset asset = requireOwnedMedia(userId, websiteId, mediaAssetId);
        if (mediaRepository.countSectionReferences(mediaAssetId) > 0) {
            throw new BadRequestException("Media asset is still referenced by a biography section");
        }

        LOGGER.info("Deleting media websiteId={} userId={} storageKey={} mediaAssetId={}",
                websiteId, userId, asset.getStorageKey(), mediaAssetId);
        storageService.delete(asset.getStorageKey());
        mediaRepository.delete(asset);
    }

    private BiographyWebsite requireOwnedWebsite(String userId, String websiteId) {
        return websiteRepository.findByWebsiteIdAndUserId(websiteId, userId)
                .orElseThrow(() -> new NotFoundException("Website not found"));
    }

    private WebsiteMediaAsset requireOwnedMedia(String userId, String websiteId, String mediaAssetId) {
        requireOwnedWebsite(userId, websiteId);
        return mediaRepository.findByMediaAssetIdAndWebsiteWebsiteIdAndWebsiteUserId(mediaAssetId, websiteId, userId)
                .orElseThrow(() -> new NotFoundException("Media asset not found"));
    }

    private WebsiteMediaAsset asset(BiographyWebsite website,
                                    String userId,
                                    MultipartFile file,
                                    MediaUsageType usageType,
                                    String mimeType,
                                    StoredMedia stored) {
        ImageDimensions dimensions = dimensions(file);
        LocalDateTime now = LocalDateTime.now();

        WebsiteMediaAsset asset = new WebsiteMediaAsset();
        asset.setMediaAssetId(UUID.randomUUID().toString());
        asset.setWebsite(website);
        asset.setMediaType(MediaType.IMAGE);
        asset.setOriginalFileName(safeOriginalFilename(file));
        asset.setStorageProvider(STORAGE_PROVIDER);
        asset.setBucketName(stored.bucketName());
        asset.setStorageKey(stored.storageKey());
        asset.setUploadedByUserId(userId);
        asset.setUsageType(usageType);
        asset.setMimeType(mimeType);
        asset.setFileSizeBytes(file.getSize());
        asset.setWidthPx(dimensions.width());
        asset.setHeightPx(dimensions.height());
        asset.setCreatedAt(now);
        asset.setUpdatedAt(now);
        return asset;
    }

    private void cleanupAfterMetadataFailure(String storageKey) {
        try {
            storageService.delete(storageKey);
            LOGGER.info("Cleaned up uploaded media after metadata persistence failure storageKey={}", storageKey);
        } catch (StorageException cleanupError) {
            LOGGER.warn("Failed to clean up uploaded media after metadata persistence failure storageKey={}", storageKey, cleanupError);
        }
    }

    private String storageKey(String websiteId, MediaUsageType usageType, String extension) {
        String usageDirectory = usageType.name().toLowerCase(Locale.ROOT).replace('_', '-');
        return "websites/%s/%s/%s.%s".formatted(websiteId, usageDirectory, UUID.randomUUID(), extension);
    }

    private String extensionFor(String mimeType) {
        return switch (mimeType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> throw new BadRequestException("Unsupported file type");
        };
    }

    private String normalizedMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) {
            return "";
        }
        int parametersIndex = contentType.indexOf(';');
        String type = parametersIndex >= 0 ? contentType.substring(0, parametersIndex) : contentType;
        return type.trim().toLowerCase(Locale.ROOT);
    }

    private String safeOriginalFilename(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            return null;
        }
        return StringUtils.getFilename(originalFilename);
    }

    private ImageDimensions dimensions(MultipartFile file) {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                return new ImageDimensions(null, null);
            }
            return new ImageDimensions(image.getWidth(), image.getHeight());
        } catch (IOException e) {
            return new ImageDimensions(null, null);
        }
    }

    private MediaAssetResponse toResponse(WebsiteMediaAsset asset, String accessUrl) {
        MediaAssetResponse response = new MediaAssetResponse();
        response.mediaAssetId = asset.getMediaAssetId();
        response.websiteId = asset.getWebsite().getWebsiteId();
        response.usageType = asset.getUsageType();
        response.originalFilename = asset.getOriginalFileName();
        response.mimeType = asset.getMimeType();
        response.fileSize = asset.getFileSizeBytes();
        response.width = asset.getWidthPx();
        response.height = asset.getHeightPx();
        response.bucketName = asset.getBucketName();
        response.storageKey = asset.getStorageKey();
        response.accessUrl = accessUrl;
        response.createdAt = asset.getCreatedAt();
        return response;
    }

    private record ImageDimensions(Integer width, Integer height) {
    }
}

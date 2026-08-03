package com.AI.biography.media.controller;

import com.AI.biography.media.MediaUsageType;
import com.AI.biography.media.dto.MediaAccessUrlResponse;
import com.AI.biography.media.dto.MediaAssetResponse;
import com.AI.biography.media.exception.UnauthorizedException;
import com.AI.biography.media.service.MediaAssetService;
import com.AI.biography.section.exception.BadRequestException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/websites/{websiteId}/media")
@CrossOrigin(origins = "*")
public class MediaAssetController {
    private final MediaAssetService mediaAssetService;

    public MediaAssetController(MediaAssetService mediaAssetService) {
        this.mediaAssetService = mediaAssetService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaAssetResponse> uploadMedia(@PathVariable String websiteId,
                                                          @RequestPart("file") MultipartFile file,
                                                          @RequestParam MediaUsageType usageType,
                                                          HttpServletRequest httpRequest) {
        if (usageType == null) {
            throw new BadRequestException("usageType is required");
        }
        MediaAssetResponse response = mediaAssetService.uploadMedia(userId(httpRequest), websiteId, file, usageType);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<MediaAssetResponse> listMedia(@PathVariable String websiteId, HttpServletRequest httpRequest) {
        return mediaAssetService.listMedia(userId(httpRequest), websiteId);
    }

    @GetMapping("/{mediaAssetId}/access-url")
    public MediaAccessUrlResponse createAccessUrl(@PathVariable String websiteId,
                                                  @PathVariable String mediaAssetId,
                                                  HttpServletRequest httpRequest) {
        return new MediaAccessUrlResponse(
                mediaAssetId,
                mediaAssetService.createAccessUrl(userId(httpRequest), websiteId, mediaAssetId)
        );
    }

    @DeleteMapping("/{mediaAssetId}")
    public ResponseEntity<Void> deleteMedia(@PathVariable String websiteId,
                                            @PathVariable String mediaAssetId,
                                            HttpServletRequest httpRequest) {
        mediaAssetService.deleteMedia(userId(httpRequest), websiteId, mediaAssetId);
        return ResponseEntity.noContent().build();
    }

    private String userId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (!(userId instanceof String value) || value.isBlank()) {
            throw new UnauthorizedException("Authentication is required");
        }
        return value;
    }
}

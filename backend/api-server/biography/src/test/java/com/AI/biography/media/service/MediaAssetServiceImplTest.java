package com.AI.biography.media.service;

import com.AI.biography.media.MediaUsageType;
import com.AI.biography.media.storage.MediaStorageService;
import com.AI.biography.media.storage.StorageException;
import com.AI.biography.media.storage.StoredMedia;
import com.AI.biography.media.validation.UploadValidationProperties;
import com.AI.biography.media.validation.UploadValidator;
import com.AI.biography.section.entity.WebsiteMediaAsset;
import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.section.repository.WebsiteMediaAssetRepository;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import com.AI.biography.media.service.impl.MediaAssetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaAssetServiceImplTest {
    private static final String USER_ID = "user-1";
    private static final String WEBSITE_ID = "website-1";

    @Mock
    private BiographyWebsiteRepository websiteRepository;

    @Mock
    private WebsiteMediaAssetRepository mediaRepository;

    @Mock
    private MediaStorageService storageService;

    private MediaAssetServiceImpl service;

    @BeforeEach
    void setUp() {
        UploadValidationProperties properties = new UploadValidationProperties();
        properties.setMaxFileSizeBytes(1024);
        service = new MediaAssetServiceImpl(
                websiteRepository,
                mediaRepository,
                new UploadValidator(properties),
                storageService
        );
    }

    @Test
    void uploadMediaStoresFileAndSavesMetadata() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website()));
        when(storageService.upload(any(), any())).thenAnswer(invocation ->
                new StoredMedia("biography-images", invocation.getArgument(0)));
        when(storageService.createAccessUrl(any())).thenReturn("https://signed.example.com/image");
        when(mediaRepository.save(any(WebsiteMediaAsset.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.uploadMedia(USER_ID, WEBSITE_ID, pngFile(), MediaUsageType.GALLERY);

        assertThat(response.mediaAssetId).isNotBlank();
        assertThat(response.websiteId).isEqualTo(WEBSITE_ID);
        assertThat(response.usageType).isEqualTo(MediaUsageType.GALLERY);
        assertThat(response.mimeType).isEqualTo("image/png");
        assertThat(response.bucketName).isEqualTo("biography-images");
        assertThat(response.storageKey).startsWith("websites/website-1/gallery/");
        assertThat(response.storageKey).endsWith(".png");
        assertThat(response.accessUrl).isEqualTo("https://signed.example.com/image");

        ArgumentCaptor<WebsiteMediaAsset> captor = ArgumentCaptor.forClass(WebsiteMediaAsset.class);
        verify(mediaRepository).save(captor.capture());
        WebsiteMediaAsset saved = captor.getValue();
        assertThat(saved.getStorageProvider()).isEqualTo("SUPABASE");
        assertThat(saved.getUploadedByUserId()).isEqualTo(USER_ID);
        assertThat(saved.getOriginalFileName()).isEqualTo("photo.png");
        assertThat(saved.getStorageKey()).doesNotContain("photo");
    }

    @Test
    void uploadMediaRejectsMissingWebsiteBeforeStorageUpload() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.uploadMedia(USER_ID, WEBSITE_ID, pngFile(), MediaUsageType.GALLERY))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Website not found");

        verifyNoInteractions(storageService);
        verifyNoInteractions(mediaRepository);
    }

    @Test
    void uploadMediaRejectsEmptyFileBeforeStorageUpload() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website()));
        MockMultipartFile file = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> service.uploadMedia(USER_ID, WEBSITE_ID, file, MediaUsageType.GALLERY))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Uploaded file must not be empty");

        verifyNoInteractions(storageService);
        verifyNoInteractions(mediaRepository);
    }

    @Test
    void uploadMediaRejectsUnsupportedMimeTypeBeforeStorageUpload() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website()));
        MockMultipartFile file = new MockMultipartFile("file", "payload.svg", "image/svg+xml", "<svg/>".getBytes());

        assertThatThrownBy(() -> service.uploadMedia(USER_ID, WEBSITE_ID, file, MediaUsageType.GALLERY))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Unsupported file type");

        verifyNoInteractions(storageService);
        verifyNoInteractions(mediaRepository);
    }

    @Test
    void uploadMediaRejectsOversizedFileBeforeStorageUpload() {
        UploadValidationProperties properties = new UploadValidationProperties();
        properties.setMaxFileSizeBytes(4);
        service = new MediaAssetServiceImpl(websiteRepository, mediaRepository, new UploadValidator(properties), storageService);
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website()));

        assertThatThrownBy(() -> service.uploadMedia(USER_ID, WEBSITE_ID, pngFile(), MediaUsageType.GALLERY))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Uploaded file exceeds the maximum allowed size");

        verifyNoInteractions(storageService);
        verifyNoInteractions(mediaRepository);
    }

    @Test
    void uploadMediaDoesNotSaveMetadataWhenStorageFails() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website()));
        when(storageService.upload(any(), any())).thenThrow(new StorageException("Failed to upload media to storage"));

        assertThatThrownBy(() -> service.uploadMedia(USER_ID, WEBSITE_ID, pngFile(), MediaUsageType.GALLERY))
                .isInstanceOf(StorageException.class)
                .hasMessage("Failed to upload media to storage");

        verify(mediaRepository, never()).save(any());
    }

    @Test
    void uploadMediaDeletesStorageObjectWhenMetadataSaveFails() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website()));
        when(storageService.upload(any(), any())).thenAnswer(invocation ->
                new StoredMedia("biography-images", invocation.getArgument(0)));
        when(mediaRepository.save(any())).thenThrow(new RuntimeException("database unavailable"));

        assertThatThrownBy(() -> service.uploadMedia(USER_ID, WEBSITE_ID, pngFile(), MediaUsageType.GALLERY))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("database unavailable");

        ArgumentCaptor<String> storageKey = ArgumentCaptor.forClass(String.class);
        verify(storageService).delete(storageKey.capture());
        assertThat(storageKey.getValue()).startsWith("websites/website-1/gallery/");
    }

    @Test
    void createAccessUrlRejectsMediaFromAnotherWebsite() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website()));
        when(mediaRepository.findByMediaAssetIdAndWebsiteWebsiteIdAndWebsiteUserId("media-1", WEBSITE_ID, USER_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createAccessUrl(USER_ID, WEBSITE_ID, "media-1"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Media asset not found");

        verifyNoInteractions(storageService);
    }

    @Test
    void deleteMediaRejectsReferencedAssets() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website()));
        when(mediaRepository.findByMediaAssetIdAndWebsiteWebsiteIdAndWebsiteUserId("media-1", WEBSITE_ID, USER_ID))
                .thenReturn(Optional.of(asset("media-1")));
        when(mediaRepository.countSectionReferences("media-1")).thenReturn(1L);

        assertThatThrownBy(() -> service.deleteMedia(USER_ID, WEBSITE_ID, "media-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Media asset is still referenced by a biography section");

        verifyNoInteractions(storageService);
        verify(mediaRepository, never()).delete(any());
    }

    private BiographyWebsite website() {
        BiographyWebsite website = new BiographyWebsite();
        website.setWebsiteId(WEBSITE_ID);
        website.setUserId(USER_ID);
        return website;
    }

    private WebsiteMediaAsset asset(String mediaAssetId) {
        WebsiteMediaAsset asset = new WebsiteMediaAsset();
        asset.setMediaAssetId(mediaAssetId);
        asset.setWebsite(website());
        asset.setStorageKey("websites/website-1/gallery/" + mediaAssetId + ".png");
        return asset;
    }

    private MockMultipartFile pngFile() {
        return new MockMultipartFile(
                "file",
                "photo.png",
                "image/png",
                new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
        );
    }
}

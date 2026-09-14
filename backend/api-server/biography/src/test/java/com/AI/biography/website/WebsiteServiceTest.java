package com.AI.biography.website;

import com.AI.biography.template.TemplateRepository;
import com.AI.biography.website.dto.UpdateThumbnailRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebsiteServiceTest {
    private static final String USER_ID = "user-1";
    private static final String OTHER_USER_ID = "user-2";
    private static final String WEBSITE_ID = "website-1";
    private static final String THUMBNAIL_URL = "https://cdn.example.com/thumbnails/website-1.webp";

    @Mock
    private BiographyWebsiteRepository biographyWebsiteRepository;

    @Mock
    private TemplateRepository templateRepository;

    @InjectMocks
    private WebsiteService websiteService;

    @Test
    void updateThumbnailForOwnedWebsitePersistsAndReturnsThumbnailFields() {
        BiographyWebsite website = website();
        UpdateThumbnailRequest request = thumbnailRequest("  " + THUMBNAIL_URL + "  ");
        when(biographyWebsiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID))
                .thenReturn(Optional.of(website));

        var response = websiteService.updateThumbnail(USER_ID, WEBSITE_ID, request);

        assertThat(response.getWebsiteId()).isEqualTo(WEBSITE_ID);
        assertThat(response.getThumbnailUrl()).isEqualTo(THUMBNAIL_URL);
        assertThat(response.getThumbnailGeneratedAt()).isNotNull();
        assertThat(website.getThumbnailUrl()).isEqualTo(THUMBNAIL_URL);
        assertThat(website.getThumbnailGeneratedAt()).isNotNull();
        assertThat(website.getUpdatedAt()).isNotNull();
        verify(biographyWebsiteRepository).findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID);
    }

    @Test
    void listAndDetailResponsesIncludeThumbnailUrl() {
        BiographyWebsite website = website();
        website.setThumbnailUrl(THUMBNAIL_URL);

        when(biographyWebsiteRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                .thenReturn(List.of(website));
        when(biographyWebsiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID))
                .thenReturn(Optional.of(website));

        assertThat(websiteService.getUserWebsites(USER_ID).get(0).getThumbnailUrl())
                .isEqualTo(THUMBNAIL_URL);
        assertThat(websiteService.getWebsiteById(USER_ID, WEBSITE_ID).getThumbnailUrl())
                .isEqualTo(THUMBNAIL_URL);
    }

    @Test
    void updateThumbnailRejectsMissingWebsite() {
        when(biographyWebsiteRepository.findByWebsiteIdAndUserId("missing", USER_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> websiteService.updateThumbnail(USER_ID, "missing", thumbnailRequest(THUMBNAIL_URL)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Website not found");
    }

    @Test
    void updateThumbnailRejectsAnotherUsersWebsite() {
        when(biographyWebsiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, OTHER_USER_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> websiteService.updateThumbnail(OTHER_USER_ID, WEBSITE_ID, thumbnailRequest(THUMBNAIL_URL)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Website not found");
    }

    @Test
    void deleteWebsiteDeletesOwnedWebsite() {
        BiographyWebsite website = website();
        when(biographyWebsiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID))
                .thenReturn(Optional.of(website));

        websiteService.deleteWebsite(USER_ID, WEBSITE_ID);

        verify(biographyWebsiteRepository).findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID);
        verify(biographyWebsiteRepository).delete(website);
    }

    @Test
    void deleteWebsiteRejectsAnotherUsersWebsiteAsNotFound() {
        when(biographyWebsiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, OTHER_USER_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> websiteService.deleteWebsite(OTHER_USER_ID, WEBSITE_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Website not found");

        verify(biographyWebsiteRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void updateThumbnailRequestRejectsBlankNullAndTooLongUrls() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        assertThat(validator.validate(thumbnailRequest(""))).isNotEmpty();
        assertThat(validator.validate(thumbnailRequest(null))).isNotEmpty();
        assertThat(validator.validate(thumbnailRequest("a".repeat(501)))).isNotEmpty();
        assertThat(validator.validate(thumbnailRequest(THUMBNAIL_URL))).isEmpty();
    }

    private UpdateThumbnailRequest thumbnailRequest(String thumbnailUrl) {
        UpdateThumbnailRequest request = new UpdateThumbnailRequest();
        request.setThumbnailUrl(thumbnailUrl);
        return request;
    }

    private BiographyWebsite website() {
        BiographyWebsite website = new BiographyWebsite();
        website.setWebsiteId(WEBSITE_ID);
        website.setUserId(USER_ID);
        website.setTitle("Jew's Life Journey");
        website.setTemplateId("template-1");
        website.setSubjectType("SELF");
        website.setStatus("DRAFT");
        return website;
    }
}

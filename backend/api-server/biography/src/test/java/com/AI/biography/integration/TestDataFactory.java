package com.AI.biography.integration;

import com.AI.biography.section.dto.request.*;
import com.AI.biography.section.entity.WebsiteMediaAsset;
import com.AI.biography.section.enums.GalleryMediaType;
import com.AI.biography.section.enums.MediaType;
import com.AI.biography.section.enums.SocialPlatform;
import com.AI.biography.template.Template;
import com.AI.biography.user.User;
import com.AI.biography.website.BiographyWebsite;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

final class TestDataFactory {
    private TestDataFactory() {
    }

    static User user() {
        User user = new User();
        user.setUserId(uuid());
        user.setEmail("test-" + user.getUserId() + "@example.com");
        user.setPasswordHash("hash");
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    static Template template() {
        Template template = new Template();
        template.setTemplateId(uuid());
        template.setName("Test Template");
        template.setSlug("test-" + UUID.randomUUID());
        template.setLayoutKey("classic");
        template.setPremium(false);
        template.setStatus("ACTIVE");
        template.setCreatedAt(LocalDateTime.now());
        template.setUpdatedAt(LocalDateTime.now());
        return template;
    }

    static BiographyWebsite website(User user, Template template) {
        BiographyWebsite website = new BiographyWebsite();
        website.setWebsiteId(uuid());
        website.setUserId(user.getUserId());
        website.setTemplateId(template.getTemplateId());
        website.setTitle("Ada Biography");
        website.setSubdomain("bio-" + UUID.randomUUID());
        website.setSubjectType("SELF");
        website.setStatus("DRAFT");
        website.setCreatedAt(LocalDateTime.now());
        website.setUpdatedAt(LocalDateTime.now());
        return website;
    }

    static WebsiteMediaAsset media(BiographyWebsite website) {
        WebsiteMediaAsset media = new WebsiteMediaAsset();
        media.setMediaAssetId(uuid());
        media.setWebsite(website);
        media.setMediaType(MediaType.IMAGE);
        media.setOriginalFileName("portrait.jpg");
        media.setStorageKey("tests/" + media.getMediaAssetId() + ".jpg");
        media.setPublicUrl("https://cdn.example.com/" + media.getMediaAssetId() + ".jpg");
        media.setMimeType("image/jpeg");
        media.setFileSizeBytes(1024L);
        media.setWidthPx(800);
        media.setHeightPx(600);
        media.setCreatedAt(LocalDateTime.now());
        media.setUpdatedAt(LocalDateTime.now());
        return media;
    }

    static HeroSectionRequest hero(String mediaId) {
        HeroSectionRequest request = new HeroSectionRequest();
        request.fullName = "Ada Lovelace";
        request.designation = "Mathematician";
        request.tagline = "Poetical science";
        request.shortDescription = "First computer programmer.";
        request.profileImageId = mediaId;
        request.sortOrder = 2;
        request.isVisible = true;
        return request;
    }

    static ChronicleSectionRequest chronicle() {
        ChronicleSectionRequest request = new ChronicleSectionRequest();
        request.sectionLabel = "Chronicle";
        request.sectionTitle = "Values";
        request.sectionDescription = "Beliefs that shaped the work.";
        request.beliefs = new ChronicleSectionRequest.BeliefsRequest();
        request.beliefs.cardLabel = "Beliefs";
        request.beliefs.items = List.of(belief(null, "Curiosity", 2), belief(null, "Rigor", 1));
        request.sortOrder = 3;
        request.isVisible = true;
        return request;
    }

    static ChronicleSectionRequest.BeliefItemRequest belief(String id, String title, int sortOrder) {
        ChronicleSectionRequest.BeliefItemRequest item = new ChronicleSectionRequest.BeliefItemRequest();
        item.id = id;
        item.icon = "star";
        item.title = title;
        item.description = title + " matters";
        item.sortOrder = sortOrder;
        return item;
    }

    static PursuitSectionRequest pursuits(String mediaId) {
        PursuitSectionRequest request = new PursuitSectionRequest();
        request.sectionLabel = "Pursuits";
        request.items = List.of(pursuit(null, "Computing", mediaId, 1), pursuit(null, "Writing", null, 2));
        request.sortOrder = 4;
        request.isVisible = true;
        return request;
    }

    static PursuitSectionRequest.PursuitItemRequest pursuit(String id, String title, String imageId, int sortOrder) {
        PursuitSectionRequest.PursuitItemRequest item = new PursuitSectionRequest.PursuitItemRequest();
        item.id = id;
        item.title = title;
        item.description = title + " description";
        item.imageId = imageId;
        item.icon = "book";
        item.sortOrder = sortOrder;
        return item;
    }

    static TimelineSectionRequest timeline(String mediaId) {
        TimelineSectionRequest request = new TimelineSectionRequest();
        request.sectionLabel = "Journey";
        request.sectionTitle = "Life Journey";
        request.sectionDescription = "Milestones";
        request.timelineEvents = List.of(event(null, "First note", mediaId, 1));
        request.sortOrder = 5;
        request.isVisible = true;
        return request;
    }

    static TimelineSectionRequest.TimelineEventRequest event(String id, String title, String imageId, int sortOrder) {
        TimelineSectionRequest.TimelineEventRequest event = new TimelineSectionRequest.TimelineEventRequest();
        event.id = id;
        event.timePeriod = "1843";
        event.title = title;
        event.location = "London";
        event.imageId = imageId;
        event.imageAltText = title;
        event.sortOrder = sortOrder;
        event.highlights = List.of(highlight(null, "Published notes", 1), highlight(null, "Inspired engines", 2));
        return event;
    }

    static TimelineSectionRequest.TimelineHighlightRequest highlight(String id, String text, int sortOrder) {
        TimelineSectionRequest.TimelineHighlightRequest highlight = new TimelineSectionRequest.TimelineHighlightRequest();
        highlight.id = id;
        highlight.highlightText = text;
        highlight.sortOrder = sortOrder;
        return highlight;
    }

    static GallerySectionRequest gallery(String mediaId) {
        GallerySectionRequest request = new GallerySectionRequest();
        request.sectionLabel = "Gallery";
        request.sectionTitle = "Archive";
        request.sectionDescription = "Selected records";
        request.items = List.of(galleryItem(null, "Portrait", mediaId, 1), galleryItem(null, "Manuscript", null, 2));
        request.sortOrder = 6;
        request.isVisible = true;
        return request;
    }

    static GallerySectionRequest.GalleryItemRequest galleryItem(String id, String title, String mediaId, int sortOrder) {
        GallerySectionRequest.GalleryItemRequest item = new GallerySectionRequest.GalleryItemRequest();
        item.id = id;
        item.mediaAssetId = mediaId;
        item.thumbnailAssetId = mediaId;
        item.mediaType = GalleryMediaType.IMAGE;
        item.category = "archive";
        item.recordLabel = "record";
        item.displayYear = "1843";
        item.title = title;
        item.description = title + " description";
        item.altText = title;
        item.sortOrder = sortOrder;
        return item;
    }

    static ContactSectionRequest contact() {
        ContactSectionRequest request = new ContactSectionRequest();
        request.sectionLabel = "Contact";
        request.sectionTitle = "Reach Out";
        request.sectionDescription = "Send a note.";
        request.contactInfo = new ContactSectionRequest.ContactInfoRequest();
        request.contactInfo.label = "Email";
        request.contactInfo.email = "ada@example.com";
        request.formSettings = new ContactSectionRequest.ContactFormSettingsRequest();
        request.formSettings.title = "Message Ada";
        request.formSettings.submitButtonText = "Send";
        request.socialLinks = List.of(social(null, SocialPlatform.LINKEDIN, 1), social(null, SocialPlatform.WEBSITE, 2));
        request.sortOrder = 7;
        request.isVisible = true;
        return request;
    }

    static ContactSectionRequest.SocialLinkRequest social(String id, SocialPlatform platform, int sortOrder) {
        ContactSectionRequest.SocialLinkRequest link = new ContactSectionRequest.SocialLinkRequest();
        link.id = id;
        link.platform = platform;
        link.displayName = platform.name();
        link.profileUrl = "https://example.com/" + platform.name().toLowerCase();
        link.icon = platform.name().toLowerCase();
        link.sortOrder = sortOrder;
        return link;
    }

    static PublicContactMessageRequest contactMessage() {
        PublicContactMessageRequest request = new PublicContactMessageRequest();
        request.senderName = "Grace Hopper";
        request.senderEmail = "grace@example.com";
        request.subject = "Hello";
        request.message = "A thoughtful note.";
        return request;
    }

    static String uuid() {
        return UUID.randomUUID().toString();
    }
}

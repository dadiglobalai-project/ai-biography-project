package com.AI.biography.section.mapper;

import com.AI.biography.section.dto.response.*;
import com.AI.biography.section.dto.response.SectionContentResponses.*;
import com.AI.biography.section.entity.*;
import org.springframework.stereotype.Component;

@Component
public class BiographySectionMapper {
    public SectionResponse toSectionResponse(BiographySection section) {
        SectionResponse response = new SectionResponse();
        response.sectionId = section.getSectionId();
        response.sectionType = section.getSectionType();
        response.sectionKey = section.getSectionKey();
        response.sortOrder = section.getSortOrder();
        response.isVisible = section.getVisible();
        response.content = toContent(section);
        return response;
    }

    public ContactMessageResponse toContactMessageResponse(ContactMessage message) {
        ContactMessageResponse response = new ContactMessageResponse();
        response.contactMessageId = message.getContactMessageId();
        response.websiteId = message.getWebsite().getWebsiteId();
        response.senderName = message.getSenderName();
        response.senderEmail = message.getSenderEmail();
        response.subject = message.getSubject();
        response.message = message.getMessage();
        response.status = message.getStatus();
        response.submittedAt = message.getSubmittedAt();
        response.readAt = message.getReadAt();
        response.repliedAt = message.getRepliedAt();
        return response;
    }

    public PublicContactMessageResponse toPublicContactMessageResponse(ContactMessage message) {
        PublicContactMessageResponse response = new PublicContactMessageResponse();
        response.contactMessageId = message.getContactMessageId();
        response.status = message.getStatus();
        response.submittedAt = message.getSubmittedAt();
        return response;
    }

    private Object toContent(BiographySection section) {
        return switch (section.getSectionType()) {
            case HERO -> hero(section.getHeroSection());
            case CHRONICLE_VALUES -> chronicle(section.getChronicleSection());
            case SPECIALIZED_PURSUITS -> pursuit(section.getPursuitSection());
            case LIFE_JOURNEY -> timeline(section.getTimelineSection());
            case MEDIA_GALLERY -> gallery(section.getGallerySection());
            case CONTACT -> contact(section.getContactSection());
        };
    }

    private HeroContent hero(HeroSection hero) {
        if (hero == null) {
            return null;
        }
        HeroContent content = new HeroContent();
        content.fullName = hero.getFullName();
        content.designation = hero.getDesignation();
        content.tagline = hero.getTagline();
        content.shortDescription = hero.getShortDescription();
        content.profileImageId = hero.getProfileImage() == null ? null : hero.getProfileImage().getMediaAssetId();
        content.backgroundImageId = hero.getBackgroundImage() == null ? null : hero.getBackgroundImage().getMediaAssetId();
        return content;
    }

    private ChronicleContent chronicle(ChronicleSection chronicle) {
        if (chronicle == null) {
            return null;
        }
        ChronicleContent content = new ChronicleContent();
        content.sectionLabel = chronicle.getSectionLabel();
        content.sectionTitle = chronicle.getSectionTitle();
        content.sectionDescription = chronicle.getSectionDescription();
        content.journal.cardLabel = chronicle.getJournalCardLabel();
        content.journal.storyTitle = chronicle.getJournalStoryTitle();
        content.journal.storyContent = chronicle.getJournalStoryContent();
        content.journal.quote = chronicle.getJournalQuote();
        content.beliefs.cardLabel = chronicle.getBeliefsCardLabel();
        chronicle.getBeliefItems().forEach(item -> {
            BeliefItemContent dto = new BeliefItemContent();
            dto.id = item.getBeliefItemId();
            dto.icon = item.getIcon();
            dto.title = item.getTitle();
            dto.description = item.getDescription();
            dto.sortOrder = item.getSortOrder();
            content.beliefs.items.add(dto);
        });
        return content;
    }

    private PursuitContent pursuit(PursuitSection pursuit) {
        if (pursuit == null) {
            return null;
        }
        PursuitContent content = new PursuitContent();
        content.sectionLabel = pursuit.getSectionLabel();
        pursuit.getPursuitItems().forEach(item -> {
            PursuitItemContent dto = new PursuitItemContent();
            dto.id = item.getPursuitItemId();
            dto.imageId = item.getImage() == null ? null : item.getImage().getMediaAssetId();
            dto.icon = item.getIcon();
            dto.title = item.getTitle();
            dto.description = item.getDescription();
            dto.sortOrder = item.getSortOrder();
            content.items.add(dto);
        });
        return content;
    }

    private TimelineContent timeline(TimelineSection timeline) {
        if (timeline == null) {
            return null;
        }
        TimelineContent content = new TimelineContent();
        content.sectionLabel = timeline.getSectionLabel();
        content.sectionTitle = timeline.getSectionTitle();
        content.sectionDescription = timeline.getSectionDescription();
        timeline.getTimelineEvents().forEach(event -> {
            TimelineEventContent eventDto = new TimelineEventContent();
            eventDto.id = event.getTimelineEventId();
            eventDto.timePeriod = event.getTimePeriod();
            eventDto.title = event.getTitle();
            eventDto.location = event.getLocation();
            eventDto.quote = event.getQuote();
            eventDto.imageId = event.getImage() == null ? null : event.getImage().getMediaAssetId();
            eventDto.imageAltText = event.getImageAltText();
            eventDto.imageCaption = event.getImageCaption();
            eventDto.sortOrder = event.getSortOrder();
            event.getHighlights().forEach(highlight -> {
                TimelineHighlightContent highlightDto = new TimelineHighlightContent();
                highlightDto.id = highlight.getTimelineHighlightId();
                highlightDto.highlightText = highlight.getHighlightText();
                highlightDto.sortOrder = highlight.getSortOrder();
                eventDto.highlights.add(highlightDto);
            });
            content.timelineEvents.add(eventDto);
        });
        return content;
    }

    private GalleryContent gallery(GallerySection gallery) {
        if (gallery == null) {
            return null;
        }
        GalleryContent content = new GalleryContent();
        content.sectionLabel = gallery.getSectionLabel();
        content.sectionTitle = gallery.getSectionTitle();
        content.sectionDescription = gallery.getSectionDescription();
        gallery.getItems().forEach(item -> {
            GalleryItemContent dto = new GalleryItemContent();
            dto.id = item.getGalleryItemId();
            dto.mediaAssetId = item.getMediaAsset() == null ? null : item.getMediaAsset().getMediaAssetId();
            dto.thumbnailAssetId = item.getThumbnailAsset() == null ? null : item.getThumbnailAsset().getMediaAssetId();
            dto.mediaType = item.getMediaType();
            dto.category = item.getCategory();
            dto.recordLabel = item.getRecordLabel();
            dto.displayYear = item.getDisplayYear();
            dto.title = item.getTitle();
            dto.description = item.getDescription();
            dto.altText = item.getAltText();
            dto.sortOrder = item.getSortOrder();
            content.items.add(dto);
        });
        return content;
    }

    private ContactContent contact(ContactSection contact) {
        if (contact == null) {
            return null;
        }
        ContactContent content = new ContactContent();
        content.sectionLabel = contact.getSectionLabel();
        content.sectionTitle = contact.getSectionTitle();
        content.sectionDescription = contact.getSectionDescription();
        content.contactInfo.label = contact.getContactLabel();
        content.contactInfo.email = contact.getContactEmail();
        contact.getSocialLinks().forEach(link -> {
            SocialLinkContent dto = new SocialLinkContent();
            dto.id = link.getSocialLinkId();
            dto.platform = link.getPlatform();
            dto.displayName = link.getDisplayName();
            dto.profileUrl = link.getProfileUrl();
            dto.icon = link.getIcon();
            dto.sortOrder = link.getSortOrder();
            content.socialLinks.add(dto);
        });
        if (contact.getFormSettings() != null) {
            content.formSettings.title = contact.getFormSettings().getTitle();
            content.formSettings.namePlaceholder = contact.getFormSettings().getNamePlaceholder();
            content.formSettings.emailPlaceholder = contact.getFormSettings().getEmailPlaceholder();
            content.formSettings.subjectPlaceholder = contact.getFormSettings().getSubjectPlaceholder();
            content.formSettings.messagePlaceholder = contact.getFormSettings().getMessagePlaceholder();
            content.formSettings.submitButtonText = contact.getFormSettings().getSubmitButtonText();
            content.formSettings.successMessage = contact.getFormSettings().getSuccessMessage();
            content.formSettings.errorMessage = contact.getFormSettings().getErrorMessage();
        }
        return content;
    }
}

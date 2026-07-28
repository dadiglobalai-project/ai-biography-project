package com.AI.biography.section.dto.response;

import com.AI.biography.section.enums.GalleryMediaType;
import com.AI.biography.section.enums.SocialPlatform;
import java.util.ArrayList;
import java.util.List;

public class SectionContentResponses {
    public static class HeroContent {
        public String fullName;
        public String designation;
        public String tagline;
        public String shortDescription;
        public String profileImageId;
        public String backgroundImageId;
    }

    public static class ChronicleContent {
        public String sectionLabel;
        public String sectionTitle;
        public String sectionDescription;
        public JournalContent journal = new JournalContent();
        public BeliefsContent beliefs = new BeliefsContent();
    }

    public static class JournalContent {
        public String cardLabel;
        public String storyTitle;
        public String storyContent;
        public String quote;
    }

    public static class BeliefsContent {
        public String cardLabel;
        public List<BeliefItemContent> items = new ArrayList<>();
    }

    public static class BeliefItemContent {
        public String id;
        public String icon;
        public String title;
        public String description;
        public Integer sortOrder;
    }

    public static class PursuitContent {
        public String sectionLabel;
        public List<PursuitItemContent> items = new ArrayList<>();
    }

    public static class PursuitItemContent {
        public String id;
        public String imageId;
        public String icon;
        public String title;
        public String description;
        public Integer sortOrder;
    }

    public static class TimelineContent {
        public String sectionLabel;
        public String sectionTitle;
        public String sectionDescription;
        public List<TimelineEventContent> timelineEvents = new ArrayList<>();
    }

    public static class TimelineEventContent {
        public String id;
        public String timePeriod;
        public String title;
        public String location;
        public String quote;
        public String imageId;
        public String imageAltText;
        public String imageCaption;
        public Integer sortOrder;
        public List<TimelineHighlightContent> highlights = new ArrayList<>();
    }

    public static class TimelineHighlightContent {
        public String id;
        public String highlightText;
        public Integer sortOrder;
    }

    public static class GalleryContent {
        public String sectionLabel;
        public String sectionTitle;
        public String sectionDescription;
        public List<GalleryItemContent> items = new ArrayList<>();
    }

    public static class GalleryItemContent {
        public String id;
        public String mediaAssetId;
        public String thumbnailAssetId;
        public GalleryMediaType mediaType;
        public String category;
        public String recordLabel;
        public String displayYear;
        public String title;
        public String description;
        public String altText;
        public Integer sortOrder;
    }

    public static class ContactContent {
        public String sectionLabel;
        public String sectionTitle;
        public String sectionDescription;
        public ContactInfoContent contactInfo = new ContactInfoContent();
        public List<SocialLinkContent> socialLinks = new ArrayList<>();
        public ContactFormSettingsContent formSettings = new ContactFormSettingsContent();
    }

    public static class ContactInfoContent {
        public String label;
        public String email;
    }

    public static class SocialLinkContent {
        public String id;
        public SocialPlatform platform;
        public String displayName;
        public String profileUrl;
        public String icon;
        public Integer sortOrder;
    }

    public static class ContactFormSettingsContent {
        public String title;
        public String namePlaceholder;
        public String emailPlaceholder;
        public String subjectPlaceholder;
        public String messagePlaceholder;
        public String submitButtonText;
        public String successMessage;
        public String errorMessage;
    }
}

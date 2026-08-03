package com.AI.biography.service;

import com.AI.biography.section.dto.request.*;
import com.AI.biography.section.dto.response.SectionContentResponses;
import com.AI.biography.section.entity.*;
import com.AI.biography.section.enums.GalleryMediaType;
import com.AI.biography.section.enums.MediaType;
import com.AI.biography.section.enums.SectionType;
import com.AI.biography.section.enums.SocialPlatform;
import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.section.mapper.BiographySectionMapper;
import com.AI.biography.section.repository.BiographySectionRepository;
import com.AI.biography.section.repository.WebsiteMediaAssetRepository;
import com.AI.biography.section.service.impl.BiographySectionServiceImpl;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BiographySectionServiceImplTest {
    private static final String USER_ID = "user-1";
    private static final String WEBSITE_ID = "website-1";
    private static final String SECTION_ID = "section-1";

    @Mock
    private BiographyWebsiteRepository websiteRepository;

    @Mock
    private BiographySectionRepository sectionRepository;

    @Mock
    private WebsiteMediaAssetRepository mediaAssetRepository;

    @Spy
    private BiographySectionMapper mapper = new BiographySectionMapper();

    @InjectMocks
    private BiographySectionServiceImpl service;

    @Test
    void createHeroSavesSectionWithMediaAndSortOrder() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.existsByWebsiteWebsiteIdAndSectionType(WEBSITE_ID, SectionType.HERO)).thenReturn(false);
        when(mediaAssetRepository.findByMediaAssetIdAndWebsiteWebsiteId("media-1", WEBSITE_ID))
                .thenReturn(Optional.of(media("media-1", WEBSITE_ID)));
        when(sectionRepository.save(any(BiographySection.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HeroSectionRequest request = heroRequest();
        request.profileImageId = "media-1";

        var response = service.createHero(USER_ID, WEBSITE_ID, request);

        assertThat(response.sectionType).isEqualTo(SectionType.HERO);
        assertThat(response.sectionKey).isEqualTo("hero");
        assertThat(response.sortOrder).isEqualTo(1);
        SectionContentResponses.HeroContent content = (SectionContentResponses.HeroContent) response.content;
        assertThat(content.profileImageId).isEqualTo("media-1");

        ArgumentCaptor<BiographySection> captor = ArgumentCaptor.forClass(BiographySection.class);
        verify(sectionRepository).save(captor.capture());
        assertThat(captor.getValue().getHeroSection().getFullName()).isEqualTo("Ada Lovelace");
    }

    @Test
    void updateHeroRejectsWrongSectionType() {
        BiographySection section = section(SectionType.CONTACT);
        section.setContactSection(new ContactSection());
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));

        assertThatThrownBy(() -> service.updateHero(USER_ID, WEBSITE_ID, SECTION_ID, heroRequest()))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Invalid section type");
    }

    @Test
    void updateHeroRejectsMediaFromWrongWebsite() {
        BiographySection section = heroSection();
        HeroSectionRequest request = heroRequest();
        request.profileImageId = "other-media";
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));
        when(mediaAssetRepository.findByMediaAssetIdAndWebsiteWebsiteId("other-media", WEBSITE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateHero(USER_ID, WEBSITE_ID, SECTION_ID, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Media asset does not belong to this website");
    }

    @Test
    void getAndDeleteUseWebsiteScopedSectionLookup() {
        BiographySection section = heroSection();
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));

        assertThat(service.getSection(USER_ID, WEBSITE_ID, SECTION_ID).sectionId).isEqualTo(SECTION_ID);

        service.deleteSection(USER_ID, WEBSITE_ID, SECTION_ID);

        verify(sectionRepository).delete(section);
    }

    @Test
    void missingWebsiteAndWrongWebsiteOwnershipReturnNotFound() {
        when(websiteRepository.findByWebsiteIdAndUserId("missing", USER_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getSections(USER_ID, "missing"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Website not found");

        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getSection(USER_ID, WEBSITE_ID, SECTION_ID))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Section not found");
    }

    @Test
    void nonOwnerCannotAccessSections() {
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, "other-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getSections("other-user", WEBSITE_ID))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Website not found");

        verifyNoInteractions(sectionRepository);
    }

    @Test
    void updateSettingsPreservesRequestedSortOrderAndVisibility() {
        BiographySection section = heroSection();
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));

        SectionSettingsRequest request = new SectionSettingsRequest();
        request.sortOrder = 7;
        request.isVisible = false;

        var response = service.updateSettings(USER_ID, WEBSITE_ID, SECTION_ID, request);

        assertThat(response.sortOrder).isEqualTo(7);
        assertThat(response.isVisible).isFalse();
    }

    @Test
    void updateChronicleCreatesUpdatesAndRemovesBeliefs() {
        BiographySection section = chronicleSectionWithBeliefs();
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));

        ChronicleSectionRequest request = chronicleRequest();
        request.beliefs.items.get(0).id = "belief-1";
        request.beliefs.items.get(0).title = "Updated belief";
        request.beliefs.items.add(beliefRequest(null, "New belief", 3));

        var response = service.updateChronicle(USER_ID, WEBSITE_ID, SECTION_ID, request);

        SectionContentResponses.ChronicleContent content = (SectionContentResponses.ChronicleContent) response.content;
        assertThat(content.beliefs.items).hasSize(2);
        assertThat(content.beliefs.items).extracting(item -> item.title)
                .containsExactly("Updated belief", "New belief");
        assertThat(content.beliefs.items).extracting(item -> item.sortOrder)
                .containsExactly(1, 3);
    }

    @Test
    void updatePursuitsCreatesUpdatesRemovesItemsAndValidatesMediaOwnership() {
        BiographySection section = pursuitSectionWithItems();
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));
        when(mediaAssetRepository.findByMediaAssetIdAndWebsiteWebsiteId("media-1", WEBSITE_ID))
                .thenReturn(Optional.of(media("media-1", WEBSITE_ID)));

        PursuitSectionRequest request = pursuitRequest();
        request.items.get(0).id = "pursuit-1";
        request.items.get(0).imageId = "media-1";
        request.items.get(0).title = "Updated pursuit";
        request.items.add(pursuitItemRequest(null, null, "New pursuit", 5));

        var response = service.updatePursuits(USER_ID, WEBSITE_ID, SECTION_ID, request);

        SectionContentResponses.PursuitContent content = (SectionContentResponses.PursuitContent) response.content;
        assertThat(content.items).hasSize(2);
        assertThat(content.items).extracting(item -> item.title)
                .containsExactly("Updated pursuit", "New pursuit");
        assertThat(content.items.get(0).imageId).isEqualTo("media-1");
        assertThat(content.items).extracting(item -> item.sortOrder)
                .containsExactly(1, 5);
    }

    @Test
    void updateTimelineCreatesUpdatesRemovesEventsAndHighlights() {
        BiographySection section = timelineSectionWithEvents();
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));

        TimelineSectionRequest request = timelineRequest();
        request.timelineEvents.get(0).id = "event-1";
        request.timelineEvents.get(0).title = "Updated event";
        request.timelineEvents.get(0).highlights.get(0).id = "highlight-1";
        request.timelineEvents.get(0).highlights.get(0).highlightText = "Updated highlight";
        request.timelineEvents.get(0).highlights.add(highlightRequest(null, "New highlight", 4));

        var response = service.updateTimeline(USER_ID, WEBSITE_ID, SECTION_ID, request);

        SectionContentResponses.TimelineContent content = (SectionContentResponses.TimelineContent) response.content;
        assertThat(content.timelineEvents).hasSize(1);
        assertThat(content.timelineEvents.get(0).title).isEqualTo("Updated event");
        assertThat(content.timelineEvents.get(0).sortOrder).isEqualTo(1);
        assertThat(content.timelineEvents.get(0).highlights).hasSize(2);
        assertThat(content.timelineEvents.get(0).highlights).extracting(highlight -> highlight.highlightText)
                .containsExactly("Updated highlight", "New highlight");
    }

    @Test
    void updateGalleryCreatesUpdatesRemovesItemsAndValidatesMediaOwnership() {
        BiographySection section = gallerySectionWithItems();
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));
        when(mediaAssetRepository.findByMediaAssetIdAndWebsiteWebsiteId("media-1", WEBSITE_ID))
                .thenReturn(Optional.of(media("media-1", WEBSITE_ID)));

        GallerySectionRequest request = galleryRequest();
        request.items.get(0).id = "gallery-1";
        request.items.get(0).title = "Updated gallery item";
        request.items.get(0).mediaAssetId = "media-1";

        var response = service.updateGallery(USER_ID, WEBSITE_ID, SECTION_ID, request);

        SectionContentResponses.GalleryContent content = (SectionContentResponses.GalleryContent) response.content;
        assertThat(content.items).hasSize(1);
        assertThat(content.items.get(0).title).isEqualTo("Updated gallery item");
        assertThat(content.items.get(0).mediaAssetId).isEqualTo("media-1");
        assertThat(content.items.get(0).sortOrder).isEqualTo(1);
    }

    @Test
    void updateContactCreatesUpdatesRemovesSocialLinksAndFormSettings() {
        BiographySection section = contactSectionWithLinks();
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));

        ContactSectionRequest request = contactRequest();
        request.socialLinks.get(0).id = "social-1";
        request.socialLinks.get(0).displayName = "Updated Instagram";
        request.socialLinks.add(socialRequest(null, SocialPlatform.LINKEDIN, "LinkedIn", 4));

        var response = service.updateContact(USER_ID, WEBSITE_ID, SECTION_ID, request);

        SectionContentResponses.ContactContent content = (SectionContentResponses.ContactContent) response.content;
        assertThat(content.socialLinks).hasSize(2);
        assertThat(content.socialLinks).extracting(link -> link.displayName)
                .containsExactly("Updated Instagram", "LinkedIn");
        assertThat(content.socialLinks).extracting(link -> link.sortOrder)
                .containsExactly(1, 4);
        assertThat(content.formSettings.title).isEqualTo("Send a note");
    }

    private BiographyWebsite website(String websiteId) {
        BiographyWebsite website = new BiographyWebsite();
        website.setWebsiteId(websiteId);
        website.setUserId(USER_ID);
        return website;
    }

    private WebsiteMediaAsset media(String mediaId, String websiteId) {
        WebsiteMediaAsset media = new WebsiteMediaAsset();
        media.setMediaAssetId(mediaId);
        media.setWebsite(website(websiteId));
        media.setMediaType(MediaType.IMAGE);
        return media;
    }

    private BiographySection section(SectionType sectionType) {
        BiographySection section = new BiographySection();
        section.setSectionId(SECTION_ID);
        section.setWebsite(website(WEBSITE_ID));
        section.setSectionType(sectionType);
        section.setSectionKey(sectionType.name().toLowerCase());
        section.setSortOrder(1);
        section.setVisible(true);
        return section;
    }

    private BiographySection heroSection() {
        BiographySection section = section(SectionType.HERO);
        HeroSection hero = new HeroSection();
        hero.setSection(section);
        hero.setFullName("Ada Lovelace");
        section.setHeroSection(hero);
        return section;
    }

    private HeroSectionRequest heroRequest() {
        HeroSectionRequest request = new HeroSectionRequest();
        request.fullName = "Ada Lovelace";
        request.designation = "Mathematician";
        request.sortOrder = 1;
        request.isVisible = true;
        return request;
    }

    private BiographySection chronicleSectionWithBeliefs() {
        BiographySection section = section(SectionType.CHRONICLE_VALUES);
        ChronicleSection chronicle = new ChronicleSection();
        chronicle.setSection(section);
        chronicle.setSectionTitle("Values");
        chronicle.getBeliefItems().add(belief("belief-1", chronicle, "Belief one", 1));
        chronicle.getBeliefItems().add(belief("belief-2", chronicle, "Removed belief", 2));
        section.setChronicleSection(chronicle);
        return section;
    }

    private ChronicleSectionRequest chronicleRequest() {
        ChronicleSectionRequest request = new ChronicleSectionRequest();
        request.sectionTitle = "Values";
        request.sortOrder = 2;
        request.isVisible = true;
        request.beliefs = new ChronicleSectionRequest.BeliefsRequest();
        request.beliefs.cardLabel = "Beliefs";
        request.beliefs.items.add(beliefRequest(null, "Belief", 1));
        return request;
    }

    private BeliefItem belief(String id, ChronicleSection chronicle, String title, int sortOrder) {
        BeliefItem item = new BeliefItem();
        item.setBeliefItemId(id);
        item.setChronicleSection(chronicle);
        item.setTitle(title);
        item.setSortOrder(sortOrder);
        return item;
    }

    private ChronicleSectionRequest.BeliefItemRequest beliefRequest(String id, String title, int sortOrder) {
        ChronicleSectionRequest.BeliefItemRequest request = new ChronicleSectionRequest.BeliefItemRequest();
        request.id = id;
        request.title = title;
        request.sortOrder = sortOrder;
        return request;
    }

    private BiographySection pursuitSectionWithItems() {
        BiographySection section = section(SectionType.SPECIALIZED_PURSUITS);
        PursuitSection pursuit = new PursuitSection();
        pursuit.setSection(section);
        pursuit.getPursuitItems().add(pursuitItem("pursuit-1", pursuit, "Pursuit one", 1));
        pursuit.getPursuitItems().add(pursuitItem("pursuit-2", pursuit, "Removed pursuit", 2));
        section.setPursuitSection(pursuit);
        return section;
    }

    private PursuitSectionRequest pursuitRequest() {
        PursuitSectionRequest request = new PursuitSectionRequest();
        request.sortOrder = 3;
        request.isVisible = true;
        request.items.add(pursuitItemRequest(null, null, "Pursuit", 1));
        return request;
    }

    private PursuitItem pursuitItem(String id, PursuitSection pursuit, String title, int sortOrder) {
        PursuitItem item = new PursuitItem();
        item.setPursuitItemId(id);
        item.setPursuitSection(pursuit);
        item.setTitle(title);
        item.setSortOrder(sortOrder);
        return item;
    }

    private PursuitSectionRequest.PursuitItemRequest pursuitItemRequest(String id, String imageId, String title, int sortOrder) {
        PursuitSectionRequest.PursuitItemRequest request = new PursuitSectionRequest.PursuitItemRequest();
        request.id = id;
        request.imageId = imageId;
        request.title = title;
        request.sortOrder = sortOrder;
        return request;
    }

    private BiographySection timelineSectionWithEvents() {
        BiographySection section = section(SectionType.LIFE_JOURNEY);
        TimelineSection timeline = new TimelineSection();
        timeline.setSection(section);
        timeline.setSectionTitle("Journey");
        TimelineEvent event = timelineEvent("event-1", timeline, "Event one", 1);
        event.getHighlights().add(highlight("highlight-1", event, "Highlight one", 1));
        event.getHighlights().add(highlight("highlight-2", event, "Removed highlight", 2));
        timeline.getTimelineEvents().add(event);
        timeline.getTimelineEvents().add(timelineEvent("event-2", timeline, "Removed event", 2));
        section.setTimelineSection(timeline);
        return section;
    }

    private TimelineSectionRequest timelineRequest() {
        TimelineSectionRequest request = new TimelineSectionRequest();
        request.sectionTitle = "Journey";
        request.sortOrder = 4;
        request.isVisible = true;
        TimelineSectionRequest.TimelineEventRequest event = new TimelineSectionRequest.TimelineEventRequest();
        event.title = "Event";
        event.sortOrder = 1;
        event.highlights.add(highlightRequest(null, "Highlight", 1));
        request.timelineEvents.add(event);
        return request;
    }

    private TimelineEvent timelineEvent(String id, TimelineSection timeline, String title, int sortOrder) {
        TimelineEvent event = new TimelineEvent();
        event.setTimelineEventId(id);
        event.setTimelineSection(timeline);
        event.setTitle(title);
        event.setSortOrder(sortOrder);
        return event;
    }

    private TimelineHighlight highlight(String id, TimelineEvent event, String text, int sortOrder) {
        TimelineHighlight highlight = new TimelineHighlight();
        highlight.setTimelineHighlightId(id);
        highlight.setTimelineEvent(event);
        highlight.setHighlightText(text);
        highlight.setSortOrder(sortOrder);
        return highlight;
    }

    private TimelineSectionRequest.TimelineHighlightRequest highlightRequest(String id, String text, int sortOrder) {
        TimelineSectionRequest.TimelineHighlightRequest request = new TimelineSectionRequest.TimelineHighlightRequest();
        request.id = id;
        request.highlightText = text;
        request.sortOrder = sortOrder;
        return request;
    }

    private BiographySection gallerySectionWithItems() {
        BiographySection section = section(SectionType.MEDIA_GALLERY);
        GallerySection gallery = new GallerySection();
        gallery.setSection(section);
        gallery.setSectionTitle("Gallery");
        gallery.getItems().add(galleryItem("gallery-1", gallery, "Gallery item", 1));
        gallery.getItems().add(galleryItem("gallery-2", gallery, "Removed gallery", 2));
        section.setGallerySection(gallery);
        return section;
    }

    private GallerySectionRequest galleryRequest() {
        GallerySectionRequest request = new GallerySectionRequest();
        request.sectionTitle = "Gallery";
        request.sortOrder = 5;
        request.isVisible = true;
        GallerySectionRequest.GalleryItemRequest item = new GallerySectionRequest.GalleryItemRequest();
        item.title = "Gallery item";
        item.mediaType = GalleryMediaType.IMAGE;
        item.sortOrder = 1;
        request.items.add(item);
        return request;
    }

    private GalleryItem galleryItem(String id, GallerySection gallery, String title, int sortOrder) {
        GalleryItem item = new GalleryItem();
        item.setGalleryItemId(id);
        item.setGallerySection(gallery);
        item.setTitle(title);
        item.setMediaType(GalleryMediaType.IMAGE);
        item.setSortOrder(sortOrder);
        return item;
    }

    private BiographySection contactSectionWithLinks() {
        BiographySection section = section(SectionType.CONTACT);
        ContactSection contact = new ContactSection();
        contact.setSection(section);
        contact.setSectionTitle("Contact");
        contact.getSocialLinks().add(social("social-1", contact, SocialPlatform.INSTAGRAM, "Instagram", 1));
        contact.getSocialLinks().add(social("social-2", contact, SocialPlatform.X, "Removed X", 2));
        section.setContactSection(contact);
        return section;
    }

    private ContactSectionRequest contactRequest() {
        ContactSectionRequest request = new ContactSectionRequest();
        request.sectionTitle = "Contact";
        request.sortOrder = 6;
        request.isVisible = true;
        request.socialLinks.add(socialRequest(null, SocialPlatform.INSTAGRAM, "Instagram", 1));
        request.formSettings = new ContactSectionRequest.ContactFormSettingsRequest();
        request.formSettings.title = "Send a note";
        return request;
    }

    private SocialLink social(String id, ContactSection contact, SocialPlatform platform, String displayName, int sortOrder) {
        SocialLink link = new SocialLink();
        link.setSocialLinkId(id);
        link.setContactSection(contact);
        link.setPlatform(platform);
        link.setDisplayName(displayName);
        link.setSortOrder(sortOrder);
        return link;
    }

    private ContactSectionRequest.SocialLinkRequest socialRequest(String id, SocialPlatform platform, String displayName, int sortOrder) {
        ContactSectionRequest.SocialLinkRequest request = new ContactSectionRequest.SocialLinkRequest();
        request.id = id;
        request.platform = platform;
        request.displayName = displayName;
        request.sortOrder = sortOrder;
        return request;
    }
}

package com.AI.biography.section.service.impl;

import com.AI.biography.section.dto.request.*;
import com.AI.biography.section.dto.response.SectionResponse;
import com.AI.biography.section.dto.response.SectionsResponse;
import com.AI.biography.section.entity.*;
import com.AI.biography.section.enums.GalleryMediaType;
import com.AI.biography.section.enums.SectionType;
import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.section.mapper.BiographySectionMapper;
import com.AI.biography.section.repository.BiographySectionRepository;
import com.AI.biography.section.repository.WebsiteMediaAssetRepository;
import com.AI.biography.section.service.BiographySectionService;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
public class BiographySectionServiceImpl implements BiographySectionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(BiographySectionServiceImpl.class);
    private final BiographyWebsiteRepository websiteRepository;
    private final BiographySectionRepository sectionRepository;
    private final WebsiteMediaAssetRepository mediaAssetRepository;
    private final BiographySectionMapper mapper;

    public BiographySectionServiceImpl(BiographyWebsiteRepository websiteRepository,
                                       BiographySectionRepository sectionRepository,
                                       WebsiteMediaAssetRepository mediaAssetRepository,
                                       BiographySectionMapper mapper) {
        this.websiteRepository = websiteRepository;
        this.sectionRepository = sectionRepository;
        this.mediaAssetRepository = mediaAssetRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public SectionsResponse getSections(String userId, String websiteId) {
        requireOwnedWebsite(userId, websiteId);
        SectionsResponse response = new SectionsResponse();
        response.websiteId = websiteId;
        response.sections = sectionRepository.findByWebsiteWebsiteIdOrderBySortOrderAsc(websiteId)
                .stream()
                .map(mapper::toSectionResponse)
                .toList();
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public SectionResponse getSection(String userId, String websiteId, String sectionId) {
        return mapper.toSectionResponse(requireSection(userId, websiteId, sectionId));
    }

    @Override
    @Transactional
    public SectionResponse updateSettings(String userId, String websiteId, String sectionId, SectionSettingsRequest request) {
        BiographySection section = requireSection(userId, websiteId, sectionId);
        section.setVisible(request.isVisible);
        section.setSortOrder(request.sortOrder);
        touch(section);
        return mapper.toSectionResponse(section);
    }

    @Override
    @Transactional
    public void deleteSection(String userId, String websiteId, String sectionId) {
        BiographySection section = requireSection(userId, websiteId, sectionId);
        sectionRepository.delete(section);
    }

    @Override
    @Transactional
    public SectionResponse createHero(String userId, String websiteId, HeroSectionRequest request) {
        BiographySection section = newSection(userId, websiteId, SectionType.HERO, "hero", request.sortOrder, request.isVisible);
        HeroSection hero = new HeroSection();
        hero.setSection(section);
        applyHero(hero, request, websiteId);
        section.setHeroSection(hero);
        return mapper.toSectionResponse(sectionRepository.save(section));
    }

    @Override
    @Transactional
    public SectionResponse updateHero(String userId, String websiteId, String sectionId, HeroSectionRequest request) {
        BiographySection section = requireTypedSection(userId, websiteId, sectionId, SectionType.HERO);
        applySettings(section, request.sortOrder, request.isVisible);
        applyHero(section.getHeroSection(), request, websiteId);
        return mapper.toSectionResponse(section);
    }

    @Override
    @Transactional
    public SectionResponse createChronicle(String userId, String websiteId, ChronicleSectionRequest request) {
        BiographySection section = newSection(userId, websiteId, SectionType.CHRONICLE_VALUES, "chronicle", request.sortOrder, request.isVisible);
        ChronicleSection chronicle = new ChronicleSection();
        chronicle.setSection(section);
        applyChronicle(chronicle, request);
        section.setChronicleSection(chronicle);
        return mapper.toSectionResponse(sectionRepository.save(section));
    }

    @Override
    @Transactional
    public SectionResponse updateChronicle(String userId, String websiteId, String sectionId, ChronicleSectionRequest request) {
        BiographySection section = requireTypedSection(userId, websiteId, sectionId, SectionType.CHRONICLE_VALUES);
        applySettings(section, request.sortOrder, request.isVisible);
        applyChronicle(section.getChronicleSection(), request);
        return mapper.toSectionResponse(section);
    }

    @Override
    @Transactional
    public SectionResponse createPursuits(String userId, String websiteId, PursuitSectionRequest request) {
        BiographySection section = newSection(userId, websiteId, SectionType.SPECIALIZED_PURSUITS, "pursuits", request.sortOrder, request.isVisible);
        PursuitSection pursuit = new PursuitSection();
        pursuit.setSection(section);
        applyPursuit(pursuit, request, websiteId);
        section.setPursuitSection(pursuit);
        return mapper.toSectionResponse(sectionRepository.save(section));
    }

    @Override
    @Transactional
    public SectionResponse updatePursuits(String userId, String websiteId, String sectionId, PursuitSectionRequest request) {
        BiographySection section = requireTypedSection(userId, websiteId, sectionId, SectionType.SPECIALIZED_PURSUITS);
        applySettings(section, request.sortOrder, request.isVisible);
        applyPursuit(section.getPursuitSection(), request, websiteId);
        return mapper.toSectionResponse(section);
    }

    @Override
    @Transactional
    public SectionResponse createTimeline(String userId, String websiteId, TimelineSectionRequest request) {
        PerfTimer perf = PerfTimer.start("Timeline create", websiteId, null);
        registerTransactionCompletion(perf);
        PerfTimer previous = PerfTimer.setCurrent(perf);
        try {
            BiographySection section = perf.time("Timeline section creation/ownership", () ->
                    newSection(userId, websiteId, SectionType.LIFE_JOURNEY, "timeline", request.sortOrder, request.isVisible));
            TimelineSection timeline = new TimelineSection();
            timeline.setSection(section);
            perf.time("Timeline apply/reconcile", () -> applyTimeline(timeline, request, websiteId));
            section.setTimelineSection(timeline);
            SectionResponse response = perf.time("Timeline save + response mapping", () ->
                    mapper.toSectionResponse(sectionRepository.save(section)));
            perf.logBodyComplete();
            return response;
        } catch (RuntimeException e) {
            perf.logFailure(e);
            throw e;
        } finally {
            PerfTimer.setCurrent(previous);
        }
    }

    @Override
    @Transactional
    public SectionResponse updateTimeline(String userId, String websiteId, String sectionId, TimelineSectionRequest request) {
        PerfTimer perf = PerfTimer.start("Timeline update", websiteId, sectionId);
        registerTransactionCompletion(perf);
        PerfTimer previous = PerfTimer.setCurrent(perf);
        try {
            BiographySection section = perf.time("Timeline section lookup", () -> requireTimelineSection(userId, websiteId, sectionId));
            perf.time("Timeline settings apply", () -> applySettings(section, request.sortOrder, request.isVisible));
            perf.time("Timeline apply/reconcile", () -> applyTimeline(section.getTimelineSection(), request, websiteId));
            SectionResponse response = perf.time("Timeline response mapping", () -> mapper.toSectionResponse(section));
            perf.logBodyComplete();
            return response;
        } catch (RuntimeException e) {
            perf.logFailure(e);
            throw e;
        } finally {
            PerfTimer.setCurrent(previous);
        }
    }

    @Override
    @Transactional
    public SectionResponse createGallery(String userId, String websiteId, GallerySectionRequest request) {
        PerfTimer perf = PerfTimer.start("Gallery create", websiteId, null);
        registerTransactionCompletion(perf);
        PerfTimer previous = PerfTimer.setCurrent(perf);
        try {
            BiographySection section = perf.time("Gallery section creation/ownership", () ->
                    newSection(userId, websiteId, SectionType.MEDIA_GALLERY, "gallery", request.sortOrder, request.isVisible));
            GallerySection gallery = new GallerySection();
            gallery.setSection(section);
            perf.time("Gallery apply/update", () -> applyGallery(gallery, request, websiteId));
            section.setGallerySection(gallery);
            SectionResponse response = perf.time("Gallery save + response mapping", () ->
                    mapper.toSectionResponse(sectionRepository.save(section)));
            perf.logBodyComplete();
            return response;
        } catch (RuntimeException e) {
            perf.logFailure(e);
            throw e;
        } finally {
            PerfTimer.setCurrent(previous);
        }
    }

    @Override
    @Transactional
    public SectionResponse updateGallery(String userId, String websiteId, String sectionId, GallerySectionRequest request) {
        PerfTimer perf = PerfTimer.start("Gallery update", websiteId, sectionId);
        registerTransactionCompletion(perf);
        PerfTimer previous = PerfTimer.setCurrent(perf);
        try {
            BiographySection section = perf.time("Gallery section lookup", () ->
                    requireTypedSection(userId, websiteId, sectionId, SectionType.MEDIA_GALLERY));
            perf.time("Gallery settings apply", () -> applySettings(section, request.sortOrder, request.isVisible));
            perf.time("Gallery apply/update", () -> applyGallery(section.getGallerySection(), request, websiteId));
            SectionResponse response = perf.time("Gallery response mapping", () -> mapper.toSectionResponse(section));
            perf.logBodyComplete();
            return response;
        } catch (RuntimeException e) {
            perf.logFailure(e);
            throw e;
        } finally {
            PerfTimer.setCurrent(previous);
        }
    }

    @Override
    @Transactional
    public SectionResponse createContact(String userId, String websiteId, ContactSectionRequest request) {
        PerfTimer perf = PerfTimer.start("Contact create", websiteId, null);
        registerTransactionCompletion(perf);
        PerfTimer previous = PerfTimer.setCurrent(perf);
        try {
            BiographySection section = perf.time("Contact section creation/ownership", () ->
                    newSection(userId, websiteId, SectionType.CONTACT, "contact", request.sortOrder, request.isVisible));
            ContactSection contact = new ContactSection();
            contact.setSection(section);
            perf.time("Contact apply/update", () -> applyContact(contact, request));
            section.setContactSection(contact);
            SectionResponse response = perf.time("Contact save + response mapping", () ->
                    mapper.toSectionResponse(sectionRepository.save(section)));
            perf.logBodyComplete();
            return response;
        } catch (RuntimeException e) {
            perf.logFailure(e);
            throw e;
        } finally {
            PerfTimer.setCurrent(previous);
        }
    }

    @Override
    @Transactional
    public SectionResponse updateContact(String userId, String websiteId, String sectionId, ContactSectionRequest request) {
        PerfTimer perf = PerfTimer.start("Contact update", websiteId, sectionId);
        registerTransactionCompletion(perf);
        PerfTimer previous = PerfTimer.setCurrent(perf);
        try {
            BiographySection section = perf.time("Contact section lookup", () ->
                    requireTypedSection(userId, websiteId, sectionId, SectionType.CONTACT));
            perf.time("Contact settings apply", () -> applySettings(section, request.sortOrder, request.isVisible));
            perf.time("Contact apply/update", () -> applyContact(section.getContactSection(), request));
            SectionResponse response = perf.time("Contact response mapping", () -> mapper.toSectionResponse(section));
            perf.logBodyComplete();
            return response;
        } catch (RuntimeException e) {
            perf.logFailure(e);
            throw e;
        } finally {
            PerfTimer.setCurrent(previous);
        }
    }

    private BiographyWebsite requireOwnedWebsite(String userId, String websiteId) {
        return websiteRepository.findByWebsiteIdAndUserId(websiteId, userId)
                .orElseThrow(() -> new NotFoundException("Website not found"));
    }

    private BiographySection requireSection(String userId, String websiteId, String sectionId) {
        requireOwnedWebsite(userId, websiteId);
        return sectionRepository.findBySectionIdAndWebsiteWebsiteId(sectionId, websiteId)
                .orElseThrow(() -> new NotFoundException("Section not found"));
    }

    private BiographySection requireTypedSection(String userId, String websiteId, String sectionId, SectionType sectionType) {
        BiographySection section = requireSection(userId, websiteId, sectionId);
        if (section.getSectionType() != sectionType) {
            throw new BadRequestException("Invalid section type");
        }
        return section;
    }

    private BiographySection requireTimelineSection(String userId, String websiteId, String sectionId) {
        BiographySection section = sectionRepository
                .findBySectionIdAndWebsiteWebsiteIdAndWebsiteUserId(sectionId, websiteId, userId)
                .orElseThrow(() -> new NotFoundException("Section not found"));
        if (section.getSectionType() != SectionType.LIFE_JOURNEY) {
            throw new BadRequestException("Invalid section type");
        }
        return section;
    }

    private BiographySection newSection(String userId, String websiteId, SectionType sectionType, String sectionKey, Integer sortOrder, Boolean visible) {
        BiographyWebsite website = requireOwnedWebsite(userId, websiteId);
        if (sectionRepository.existsByWebsiteWebsiteIdAndSectionType(websiteId, sectionType)) {
            throw new BadRequestException("Section type already exists for this website");
        }
        LocalDateTime now = LocalDateTime.now();
        BiographySection section = new BiographySection();
        section.setSectionId(UUID.randomUUID().toString());
        section.setWebsite(website);
        section.setSectionType(sectionType);
        section.setSectionKey(sectionKey);
        section.setSortOrder(sortOrder);
        section.setVisible(visible);
        section.setCreatedAt(now);
        section.setUpdatedAt(now);
        return section;
    }

    private void applySettings(BiographySection section, Integer sortOrder, Boolean visible) {
        section.setSortOrder(sortOrder);
        section.setVisible(visible);
        touch(section);
    }

    private void touch(BiographySection section) {
        section.setUpdatedAt(LocalDateTime.now());
    }

    private WebsiteMediaAsset media(String websiteId, String mediaId) {
        if (mediaId == null || mediaId.isBlank()) {
            return null;
        }
        long startNanos = System.nanoTime();
        try {
            return mediaAssetRepository.findByMediaAssetIdAndWebsiteWebsiteId(mediaId, websiteId)
                    .orElseThrow(() -> new BadRequestException("Media asset does not belong to this website"));
        } finally {
            PerfTimer current = PerfTimer.current();
            if (current != null) {
                current.addAggregate("media asset resolution", startNanos);
            }
        }
    }

    private void applyHero(HeroSection hero, HeroSectionRequest request, String websiteId) {
        hero.setFullName(request.fullName);
        hero.setDesignation(request.designation);
        hero.setTagline(request.tagline);
        hero.setShortDescription(request.shortDescription);
        hero.setProfileImage(media(websiteId, request.profileImageId));
        hero.setBackgroundImage(media(websiteId, request.backgroundImageId));
        hero.setUpdatedAt(LocalDateTime.now());
        if (hero.getCreatedAt() == null) {
            hero.setCreatedAt(LocalDateTime.now());
        }
    }

    private void applyChronicle(ChronicleSection chronicle, ChronicleSectionRequest request) {
        chronicle.setSectionLabel(request.sectionLabel);
        chronicle.setSectionTitle(request.sectionTitle);
        chronicle.setSectionDescription(request.sectionDescription);
        if (request.journal != null) {
            chronicle.setJournalCardLabel(request.journal.cardLabel);
            chronicle.setJournalStoryTitle(request.journal.storyTitle);
            chronicle.setJournalStoryContent(request.journal.storyContent);
            chronicle.setJournalQuote(request.journal.quote);
        }
        chronicle.setBeliefsCardLabel(request.beliefs == null ? null : request.beliefs.cardLabel);
        Map<String, BeliefItem> existing = chronicle.getBeliefItems().stream()
                .collect(Collectors.toMap(BeliefItem::getBeliefItemId, Function.identity()));
        chronicle.getBeliefItems().clear();
        List<ChronicleSectionRequest.BeliefItemRequest> items = request.beliefs == null ? List.of() : request.beliefs.items;
        for (ChronicleSectionRequest.BeliefItemRequest itemRequest : nullSafe(items)) {
            BeliefItem item = itemRequest.id == null ? new BeliefItem() : existing.get(itemRequest.id);
            if (item == null) {
                throw new NotFoundException("Belief item not found");
            }
            if (item.getBeliefItemId() == null) {
                item.setBeliefItemId(UUID.randomUUID().toString());
                item.setCreatedAt(LocalDateTime.now());
            }
            item.setChronicleSection(chronicle);
            item.setIcon(itemRequest.icon);
            item.setTitle(itemRequest.title);
            item.setDescription(itemRequest.description);
            item.setSortOrder(itemRequest.sortOrder);
            item.setUpdatedAt(LocalDateTime.now());
            chronicle.getBeliefItems().add(item);
        }
        chronicle.setUpdatedAt(LocalDateTime.now());
        if (chronicle.getCreatedAt() == null) {
            chronicle.setCreatedAt(LocalDateTime.now());
        }
    }

    private void applyPursuit(PursuitSection pursuit, PursuitSectionRequest request, String websiteId) {
        pursuit.setSectionLabel(request.sectionLabel);
        Map<String, PursuitItem> existing = pursuit.getPursuitItems().stream()
                .collect(Collectors.toMap(PursuitItem::getPursuitItemId, Function.identity()));
        pursuit.getPursuitItems().clear();
        for (PursuitSectionRequest.PursuitItemRequest itemRequest : nullSafe(request.items)) {
            PursuitItem item = itemRequest.id == null ? new PursuitItem() : existing.get(itemRequest.id);
            if (item == null) {
                throw new NotFoundException("Pursuit item not found");
            }
            if (item.getPursuitItemId() == null) {
                item.setPursuitItemId(UUID.randomUUID().toString());
                item.setCreatedAt(LocalDateTime.now());
            }
            item.setPursuitSection(pursuit);
            item.setImage(media(websiteId, itemRequest.imageId));
            item.setIcon(itemRequest.icon);
            item.setTitle(itemRequest.title);
            item.setDescription(itemRequest.description);
            item.setSortOrder(itemRequest.sortOrder);
            item.setUpdatedAt(LocalDateTime.now());
            pursuit.getPursuitItems().add(item);
        }
        pursuit.setUpdatedAt(LocalDateTime.now());
        if (pursuit.getCreatedAt() == null) {
            pursuit.setCreatedAt(LocalDateTime.now());
        }
    }

    private void applyTimeline(TimelineSection timeline, TimelineSectionRequest request, String websiteId) {
        timeline.setSectionLabel(request.sectionLabel);
        timeline.setSectionTitle(request.sectionTitle);
        timeline.setSectionDescription(request.sectionDescription);
        Map<String, TimelineEvent> existingEvents = timeline.getTimelineEvents().stream()
                .collect(Collectors.toMap(TimelineEvent::getTimelineEventId, Function.identity()));
        Set<String> retainedEventIds = new HashSet<>();
        for (TimelineSectionRequest.TimelineEventRequest eventRequest : nullSafe(request.timelineEvents)) {
            TimelineEvent event = eventRequest.id == null ? new TimelineEvent() : existingEvents.get(eventRequest.id);
            if (event == null) {
                throw new NotFoundException("Timeline event not found");
            }
            if (event.getTimelineEventId() == null) {
                event.setTimelineEventId(UUID.randomUUID().toString());
                event.setCreatedAt(LocalDateTime.now());
            }
            event.setTimelineSection(timeline);
            event.setTimePeriod(eventRequest.timePeriod);
            event.setTitle(eventRequest.title);
            event.setLocation(eventRequest.location);
            event.setQuote(eventRequest.quote);
            event.setImage(media(websiteId, eventRequest.imageId));
            event.setImageAltText(eventRequest.imageAltText);
            event.setImageCaption(eventRequest.imageCaption);
            event.setSortOrder(eventRequest.sortOrder);
            long highlightStartNanos = System.nanoTime();
            try {
                reconcileHighlights(event, eventRequest.highlights);
            } finally {
                PerfTimer current = PerfTimer.current();
                if (current != null) {
                    current.addAggregate("Timeline highlight reconcile", highlightStartNanos);
                }
            }
            event.setUpdatedAt(LocalDateTime.now());
            if (!timeline.getTimelineEvents().contains(event)) {
                timeline.getTimelineEvents().add(event);
            }
            retainedEventIds.add(event.getTimelineEventId());
        }
        timeline.getTimelineEvents().removeIf(event -> !retainedEventIds.contains(event.getTimelineEventId()));
        timeline.setUpdatedAt(LocalDateTime.now());
        if (timeline.getCreatedAt() == null) {
            timeline.setCreatedAt(LocalDateTime.now());
        }
    }

    private void reconcileHighlights(TimelineEvent event, List<TimelineSectionRequest.TimelineHighlightRequest> requests) {
        Map<String, TimelineHighlight> existing = event.getHighlights().stream()
                .collect(Collectors.toMap(TimelineHighlight::getTimelineHighlightId, Function.identity()));
        Set<String> retainedHighlightIds = new HashSet<>();
        for (TimelineSectionRequest.TimelineHighlightRequest request : nullSafe(requests)) {
            TimelineHighlight highlight = request.id == null ? new TimelineHighlight() : existing.get(request.id);
            if (highlight == null) {
                throw new NotFoundException("Timeline highlight not found");
            }
            if (highlight.getTimelineHighlightId() == null) {
                highlight.setTimelineHighlightId(UUID.randomUUID().toString());
                highlight.setCreatedAt(LocalDateTime.now());
            }
            highlight.setTimelineEvent(event);
            highlight.setHighlightText(request.highlightText);
            highlight.setSortOrder(request.sortOrder);
            highlight.setUpdatedAt(LocalDateTime.now());
            if (!event.getHighlights().contains(highlight)) {
                event.getHighlights().add(highlight);
            }
            retainedHighlightIds.add(highlight.getTimelineHighlightId());
        }
        event.getHighlights().removeIf(highlight -> !retainedHighlightIds.contains(highlight.getTimelineHighlightId()));
    }

    private void applyGallery(GallerySection gallery, GallerySectionRequest request, String websiteId) {
        gallery.setSectionLabel(request.sectionLabel);
        gallery.setSectionTitle(request.sectionTitle);
        gallery.setSectionDescription(request.sectionDescription);
        Map<String, GalleryItem> existing = gallery.getItems().stream()
                .collect(Collectors.toMap(GalleryItem::getGalleryItemId, Function.identity()));
        gallery.getItems().clear();
        for (GallerySectionRequest.GalleryItemRequest itemRequest : nullSafe(request.items)) {
            GalleryItem item = itemRequest.id == null ? new GalleryItem() : existing.get(itemRequest.id);
            if (item == null) {
                throw new NotFoundException("Gallery item not found");
            }
            if (item.getGalleryItemId() == null) {
                item.setGalleryItemId(UUID.randomUUID().toString());
                item.setCreatedAt(LocalDateTime.now());
            }
            item.setGallerySection(gallery);
            item.setMediaAsset(media(websiteId, itemRequest.mediaAssetId));
            item.setThumbnailAsset(media(websiteId, itemRequest.thumbnailAssetId));
            item.setMediaType(itemRequest.mediaType == null ? GalleryMediaType.IMAGE : itemRequest.mediaType);
            item.setCategory(itemRequest.category);
            item.setRecordLabel(itemRequest.recordLabel);
            item.setDisplayYear(itemRequest.displayYear);
            item.setTitle(itemRequest.title);
            item.setDescription(itemRequest.description);
            item.setAltText(itemRequest.altText);
            item.setSortOrder(itemRequest.sortOrder);
            item.setUpdatedAt(LocalDateTime.now());
            gallery.getItems().add(item);
        }
        gallery.setUpdatedAt(LocalDateTime.now());
        if (gallery.getCreatedAt() == null) {
            gallery.setCreatedAt(LocalDateTime.now());
        }
    }

    private void applyContact(ContactSection contact, ContactSectionRequest request) {
        contact.setSectionLabel(request.sectionLabel);
        contact.setSectionTitle(request.sectionTitle);
        contact.setSectionDescription(request.sectionDescription);
        contact.setContactLabel(request.contactInfo == null ? null : request.contactInfo.label);
        contact.setContactEmail(request.contactInfo == null ? null : request.contactInfo.email);
        Map<String, SocialLink> existing = contact.getSocialLinks().stream()
                .collect(Collectors.toMap(SocialLink::getSocialLinkId, Function.identity()));
        contact.getSocialLinks().clear();
        for (ContactSectionRequest.SocialLinkRequest linkRequest : nullSafe(request.socialLinks)) {
            SocialLink link = linkRequest.id == null ? new SocialLink() : existing.get(linkRequest.id);
            if (link == null) {
                throw new NotFoundException("Social link not found");
            }
            if (link.getSocialLinkId() == null) {
                link.setSocialLinkId(UUID.randomUUID().toString());
                link.setCreatedAt(LocalDateTime.now());
            }
            link.setContactSection(contact);
            link.setPlatform(linkRequest.platform);
            link.setDisplayName(linkRequest.displayName);
            link.setProfileUrl(linkRequest.profileUrl);
            link.setIcon(linkRequest.icon);
            link.setSortOrder(linkRequest.sortOrder);
            link.setUpdatedAt(LocalDateTime.now());
            contact.getSocialLinks().add(link);
        }
        applyFormSettings(contact, request.formSettings);
        contact.setUpdatedAt(LocalDateTime.now());
        if (contact.getCreatedAt() == null) {
            contact.setCreatedAt(LocalDateTime.now());
        }
    }

    private void applyFormSettings(ContactSection contact, ContactSectionRequest.ContactFormSettingsRequest request) {
        if (request == null) {
            contact.setFormSettings(null);
            return;
        }
        ContactFormSettings settings = contact.getFormSettings() == null ? new ContactFormSettings() : contact.getFormSettings();
        settings.setContactSection(contact);
        settings.setTitle(request.title);
        settings.setNamePlaceholder(request.namePlaceholder);
        settings.setEmailPlaceholder(request.emailPlaceholder);
        settings.setSubjectPlaceholder(request.subjectPlaceholder);
        settings.setMessagePlaceholder(request.messagePlaceholder);
        settings.setSubmitButtonText(request.submitButtonText);
        settings.setSuccessMessage(request.successMessage);
        settings.setErrorMessage(request.errorMessage);
        settings.setUpdatedAt(LocalDateTime.now());
        if (settings.getCreatedAt() == null) {
            settings.setCreatedAt(LocalDateTime.now());
        }
        contact.setFormSettings(settings);
    }

    private <T> List<T> nullSafe(List<T> list) {
        return list == null ? List.of() : list;
    }

    private void registerTransactionCompletion(PerfTimer perf) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                perf.logTransactionComplete(status);
            }
        });
    }

    private static final class PerfTimer {
        private static final ThreadLocal<PerfTimer> CURRENT = new ThreadLocal<>();
        private final String label;
        private final String websiteId;
        private final String sectionId;
        private final long startNanos;
        private final Map<String, AggregateTiming> aggregates = new LinkedHashMap<>();
        private Long bodyCompleteNanos;

        private PerfTimer(String label, String websiteId, String sectionId) {
            this.label = label;
            this.websiteId = websiteId;
            this.sectionId = sectionId;
            this.startNanos = System.nanoTime();
            LOGGER.info("[PERF] {} START website={} section={}", label, websiteId, sectionId);
        }

        private static PerfTimer start(String label, String websiteId, String sectionId) {
            return new PerfTimer(label, websiteId, sectionId);
        }

        private static PerfTimer current() {
            return CURRENT.get();
        }

        private static PerfTimer setCurrent(PerfTimer timer) {
            PerfTimer previous = CURRENT.get();
            if (timer == null) {
                CURRENT.remove();
            } else {
                CURRENT.set(timer);
            }
            return previous;
        }

        private <T> T time(String stage, Supplier<T> operation) {
            long stageStartNanos = System.nanoTime();
            try {
                return operation.get();
            } finally {
                LOGGER.info("[PERF] {} {}: {} ms", label, stage, elapsedMs(stageStartNanos));
            }
        }

        private void time(String stage, Runnable operation) {
            time(stage, () -> {
                operation.run();
                return null;
            });
        }

        private void addAggregate(String stage, long stageStartNanos) {
            aggregates.computeIfAbsent(stage, ignored -> new AggregateTiming()).add(System.nanoTime() - stageStartNanos);
        }

        private void logBodyComplete() {
            bodyCompleteNanos = System.nanoTime();
            for (Map.Entry<String, AggregateTiming> entry : aggregates.entrySet()) {
                AggregateTiming aggregate = entry.getValue();
                LOGGER.info("[PERF] {} {} total: {} ms count={}", label, entry.getKey(), aggregate.elapsedMs(), aggregate.count);
            }
            LOGGER.info("[PERF] {} service body complete: {} ms", label, elapsedMs(startNanos));
        }

        private void logTransactionComplete(int status) {
            long totalMs = elapsedMs(startNanos);
            long bodyMs = bodyCompleteNanos == null ? totalMs : (bodyCompleteNanos - startNanos) / 1_000_000;
            long flushCommitMs = Math.max(0, totalMs - bodyMs);
            LOGGER.info(
                    "[PERF] {} transaction completion status={} flush/commit estimate={} ms TOTAL={} ms website={} section={}",
                    label,
                    txStatus(status),
                    flushCommitMs,
                    totalMs,
                    websiteId,
                    sectionId
            );
        }

        private void logFailure(RuntimeException exception) {
            LOGGER.info("[PERF] {} FAILED after {} ms exception={}", label, elapsedMs(startNanos), exception.getClass().getSimpleName());
        }

        private long elapsedMs(long fromNanos) {
            return (System.nanoTime() - fromNanos) / 1_000_000;
        }

        private String txStatus(int status) {
            return switch (status) {
                case TransactionSynchronization.STATUS_COMMITTED -> "COMMITTED";
                case TransactionSynchronization.STATUS_ROLLED_BACK -> "ROLLED_BACK";
                default -> "UNKNOWN";
            };
        }
    }

    private static final class AggregateTiming {
        private long elapsedNanos;
        private int count;

        private void add(long nanos) {
            elapsedNanos += nanos;
            count++;
        }

        private long elapsedMs() {
            return elapsedNanos / 1_000_000;
        }
    }
}

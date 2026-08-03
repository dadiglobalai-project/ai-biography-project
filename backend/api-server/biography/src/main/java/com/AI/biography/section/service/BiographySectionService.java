package com.AI.biography.section.service;

import com.AI.biography.section.dto.request.*;
import com.AI.biography.section.dto.response.SectionResponse;
import com.AI.biography.section.dto.response.SectionsResponse;

public interface BiographySectionService {
    SectionsResponse getSections(String userId, String websiteId);
    SectionResponse getSection(String userId, String websiteId, String sectionId);
    SectionResponse updateSettings(String userId, String websiteId, String sectionId, SectionSettingsRequest request);
    void deleteSection(String userId, String websiteId, String sectionId);
    SectionResponse createHero(String userId, String websiteId, HeroSectionRequest request);
    SectionResponse updateHero(String userId, String websiteId, String sectionId, HeroSectionRequest request);
    SectionResponse createChronicle(String userId, String websiteId, ChronicleSectionRequest request);
    SectionResponse updateChronicle(String userId, String websiteId, String sectionId, ChronicleSectionRequest request);
    SectionResponse createPursuits(String userId, String websiteId, PursuitSectionRequest request);
    SectionResponse updatePursuits(String userId, String websiteId, String sectionId, PursuitSectionRequest request);
    SectionResponse createTimeline(String userId, String websiteId, TimelineSectionRequest request);
    SectionResponse updateTimeline(String userId, String websiteId, String sectionId, TimelineSectionRequest request);
    SectionResponse createGallery(String userId, String websiteId, GallerySectionRequest request);
    SectionResponse updateGallery(String userId, String websiteId, String sectionId, GallerySectionRequest request);
    SectionResponse createContact(String userId, String websiteId, ContactSectionRequest request);
    SectionResponse updateContact(String userId, String websiteId, String sectionId, ContactSectionRequest request);
}

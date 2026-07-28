package com.AI.biography.section.service;

import com.AI.biography.section.dto.request.*;
import com.AI.biography.section.dto.response.SectionResponse;
import com.AI.biography.section.dto.response.SectionsResponse;

public interface BiographySectionService {
    SectionsResponse getSections(String websiteId);
    SectionResponse getSection(String websiteId, String sectionId);
    SectionResponse updateSettings(String websiteId, String sectionId, SectionSettingsRequest request);
    void deleteSection(String websiteId, String sectionId);
    SectionResponse createHero(String websiteId, HeroSectionRequest request);
    SectionResponse updateHero(String websiteId, String sectionId, HeroSectionRequest request);
    SectionResponse createChronicle(String websiteId, ChronicleSectionRequest request);
    SectionResponse updateChronicle(String websiteId, String sectionId, ChronicleSectionRequest request);
    SectionResponse createPursuits(String websiteId, PursuitSectionRequest request);
    SectionResponse updatePursuits(String websiteId, String sectionId, PursuitSectionRequest request);
    SectionResponse createTimeline(String websiteId, TimelineSectionRequest request);
    SectionResponse updateTimeline(String websiteId, String sectionId, TimelineSectionRequest request);
    SectionResponse createGallery(String websiteId, GallerySectionRequest request);
    SectionResponse updateGallery(String websiteId, String sectionId, GallerySectionRequest request);
    SectionResponse createContact(String websiteId, ContactSectionRequest request);
    SectionResponse updateContact(String websiteId, String sectionId, ContactSectionRequest request);
}

package com.AI.biography.section.repository;

import com.AI.biography.section.entity.BiographySection;
import com.AI.biography.section.enums.SectionType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BiographySectionRepository extends JpaRepository<BiographySection, String> {
    @EntityGraph(attributePaths = {
            "heroSection",
            "chronicleSection",
            "pursuitSection",
            "timelineSection",
            "gallerySection",
            "contactSection", "contactSection.formSettings"
    })
    List<BiographySection> findByWebsiteWebsiteIdOrderBySortOrderAsc(String websiteId);

    @EntityGraph(attributePaths = {
            "heroSection",
            "chronicleSection",
            "pursuitSection",
            "timelineSection",
            "gallerySection",
            "contactSection", "contactSection.formSettings"
    })
    Optional<BiographySection> findBySectionIdAndWebsiteWebsiteId(String sectionId, String websiteId);

    @EntityGraph(attributePaths = {
            "timelineSection",
            "timelineSection.timelineEvents"
    })
    Optional<BiographySection> findBySectionIdAndWebsiteWebsiteIdAndWebsiteUserId(
            String sectionId,
            String websiteId,
            String userId
    );

    boolean existsByWebsiteWebsiteIdAndSectionType(String websiteId, SectionType sectionType);
    boolean existsByWebsiteWebsiteIdAndSectionTypeAndSectionIdNot(String websiteId, SectionType sectionType, String sectionId);
}

package com.AI.biography.section.repository;

import com.AI.biography.section.entity.SocialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SocialLinkRepository extends JpaRepository<SocialLink, String> {
    Optional<SocialLink> findBySocialLinkIdAndContactSectionSectionId(String socialLinkId, String sectionId);
}

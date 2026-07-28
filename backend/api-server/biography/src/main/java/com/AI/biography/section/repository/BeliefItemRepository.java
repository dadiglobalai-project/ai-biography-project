package com.AI.biography.section.repository;

import com.AI.biography.section.entity.BeliefItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BeliefItemRepository extends JpaRepository<BeliefItem, String> {
    Optional<BeliefItem> findByBeliefItemIdAndChronicleSectionSectionId(String beliefItemId, String sectionId);
}

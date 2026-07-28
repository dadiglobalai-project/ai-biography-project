package com.AI.biography.section.repository;

import com.AI.biography.section.entity.PursuitItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PursuitItemRepository extends JpaRepository<PursuitItem, String> {
    Optional<PursuitItem> findByPursuitItemIdAndPursuitSectionSectionId(String pursuitItemId, String sectionId);
}

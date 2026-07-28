package com.AI.biography.section.repository;

import com.AI.biography.section.entity.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TimelineEventRepository extends JpaRepository<TimelineEvent, String> {
    Optional<TimelineEvent> findByTimelineEventIdAndTimelineSectionSectionId(String timelineEventId, String sectionId);
}

package com.AI.biography.section.repository;

import com.AI.biography.section.entity.TimelineHighlight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TimelineHighlightRepository extends JpaRepository<TimelineHighlight, String> {
    Optional<TimelineHighlight> findByTimelineHighlightIdAndTimelineEventTimelineEventId(String timelineHighlightId, String timelineEventId);
}

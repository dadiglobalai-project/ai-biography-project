package com.AI.biography.section.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "timeline_highlights")
public class TimelineHighlight {
    @Id
    @Column(name = "timeline_highlight_id", columnDefinition = "CHAR(36)", length = 36)
    private String timelineHighlightId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timeline_event_id", nullable = false, columnDefinition = "CHAR(36)")
    private TimelineEvent timelineEvent;
    @Column(name = "highlight_text", nullable = false)
    private String highlightText;
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getTimelineHighlightId() { return timelineHighlightId; }
    public void setTimelineHighlightId(String timelineHighlightId) { this.timelineHighlightId = timelineHighlightId; }
    public TimelineEvent getTimelineEvent() { return timelineEvent; }
    public void setTimelineEvent(TimelineEvent timelineEvent) { this.timelineEvent = timelineEvent; }
    public String getHighlightText() { return highlightText; }
    public void setHighlightText(String highlightText) { this.highlightText = highlightText; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

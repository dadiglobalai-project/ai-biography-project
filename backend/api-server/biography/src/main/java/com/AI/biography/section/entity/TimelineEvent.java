package com.AI.biography.section.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "timeline_events")
public class TimelineEvent {
    @Id
    @Column(name = "timeline_event_id", columnDefinition = "CHAR(36)", length = 36)
    private String timelineEventId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false, columnDefinition = "CHAR(36)")
    private TimelineSection timelineSection;
    @Column(name = "time_period", length = 100)
    private String timePeriod;
    @Column(name = "title", nullable = false)
    private String title;
    @Column(name = "location", length = 500)
    private String location;
    @Column(name = "quote")
    private String quote;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", columnDefinition = "CHAR(36)")
    private WebsiteMediaAsset image;
    @Column(name = "image_alt_text", length = 500)
    private String imageAltText;
    @Column(name = "image_caption")
    private String imageCaption;
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
    @OneToMany(mappedBy = "timelineEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @BatchSize(size = 50)
    private List<TimelineHighlight> highlights = new ArrayList<>();
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getTimelineEventId() { return timelineEventId; }
    public void setTimelineEventId(String timelineEventId) { this.timelineEventId = timelineEventId; }
    public TimelineSection getTimelineSection() { return timelineSection; }
    public void setTimelineSection(TimelineSection timelineSection) { this.timelineSection = timelineSection; }
    public String getTimePeriod() { return timePeriod; }
    public void setTimePeriod(String timePeriod) { this.timePeriod = timePeriod; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getQuote() { return quote; }
    public void setQuote(String quote) { this.quote = quote; }
    public WebsiteMediaAsset getImage() { return image; }
    public void setImage(WebsiteMediaAsset image) { this.image = image; }
    public String getImageAltText() { return imageAltText; }
    public void setImageAltText(String imageAltText) { this.imageAltText = imageAltText; }
    public String getImageCaption() { return imageCaption; }
    public void setImageCaption(String imageCaption) { this.imageCaption = imageCaption; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public List<TimelineHighlight> getHighlights() { return highlights; }
    public void setHighlights(List<TimelineHighlight> highlights) { this.highlights = highlights; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

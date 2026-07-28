package com.AI.biography.section.entity;

import com.AI.biography.section.enums.SectionType;
import com.AI.biography.website.BiographyWebsite;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "biography_sections")
public class BiographySection {
    @Id
    @Column(name = "section_id", columnDefinition = "CHAR(36)", length = 36)
    private String sectionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id", nullable = false, columnDefinition = "CHAR(36)")
    private BiographyWebsite website;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false, length = 50)
    private SectionType sectionType;

    @Column(name = "section_key", nullable = false, length = 100)
    private String sectionKey;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "is_visible", nullable = false)
    private Boolean visible;

    @OneToOne(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private HeroSection heroSection;

    @OneToOne(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ChronicleSection chronicleSection;

    @OneToOne(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PursuitSection pursuitSection;

    @OneToOne(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private TimelineSection timelineSection;

    @OneToOne(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private GallerySection gallerySection;

    @OneToOne(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ContactSection contactSection;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    public BiographyWebsite getWebsite() { return website; }
    public void setWebsite(BiographyWebsite website) { this.website = website; }
    public SectionType getSectionType() { return sectionType; }
    public void setSectionType(SectionType sectionType) { this.sectionType = sectionType; }
    public String getSectionKey() { return sectionKey; }
    public void setSectionKey(String sectionKey) { this.sectionKey = sectionKey; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }
    public HeroSection getHeroSection() { return heroSection; }
    public void setHeroSection(HeroSection heroSection) { this.heroSection = heroSection; }
    public ChronicleSection getChronicleSection() { return chronicleSection; }
    public void setChronicleSection(ChronicleSection chronicleSection) { this.chronicleSection = chronicleSection; }
    public PursuitSection getPursuitSection() { return pursuitSection; }
    public void setPursuitSection(PursuitSection pursuitSection) { this.pursuitSection = pursuitSection; }
    public TimelineSection getTimelineSection() { return timelineSection; }
    public void setTimelineSection(TimelineSection timelineSection) { this.timelineSection = timelineSection; }
    public GallerySection getGallerySection() { return gallerySection; }
    public void setGallerySection(GallerySection gallerySection) { this.gallerySection = gallerySection; }
    public ContactSection getContactSection() { return contactSection; }
    public void setContactSection(ContactSection contactSection) { this.contactSection = contactSection; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

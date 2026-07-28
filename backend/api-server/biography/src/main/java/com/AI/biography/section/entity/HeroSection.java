package com.AI.biography.section.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hero_sections")
public class HeroSection {
    @Id
    @Column(name = "section_id", columnDefinition = "CHAR(36)", length = 36)
    private String sectionId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "section_id", columnDefinition = "CHAR(36)")
    private BiographySection section;

    @Column(name = "full_name", nullable = false)
    private String fullName;
    @Column(name = "designation")
    private String designation;
    @Column(name = "tagline", length = 500)
    private String tagline;
    @Column(name = "short_description")
    private String shortDescription;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_image_id", columnDefinition = "CHAR(36)")
    private WebsiteMediaAsset profileImage;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "background_image_id", columnDefinition = "CHAR(36)")
    private WebsiteMediaAsset backgroundImage;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    public BiographySection getSection() { return section; }
    public void setSection(BiographySection section) { this.section = section; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public WebsiteMediaAsset getProfileImage() { return profileImage; }
    public void setProfileImage(WebsiteMediaAsset profileImage) { this.profileImage = profileImage; }
    public WebsiteMediaAsset getBackgroundImage() { return backgroundImage; }
    public void setBackgroundImage(WebsiteMediaAsset backgroundImage) { this.backgroundImage = backgroundImage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

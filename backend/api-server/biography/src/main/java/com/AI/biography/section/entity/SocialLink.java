package com.AI.biography.section.entity;

import com.AI.biography.section.enums.SocialPlatform;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "social_links")
public class SocialLink {
    @Id
    @Column(name = "social_link_id", columnDefinition = "CHAR(36)", length = 36)
    private String socialLinkId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false, columnDefinition = "CHAR(36)")
    private ContactSection contactSection;
    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 100)
    private SocialPlatform platform;
    @Column(name = "display_name")
    private String displayName;
    @Column(name = "profile_url", length = 2000)
    private String profileUrl;
    @Column(name = "icon")
    private String icon;
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getSocialLinkId() { return socialLinkId; }
    public void setSocialLinkId(String socialLinkId) { this.socialLinkId = socialLinkId; }
    public ContactSection getContactSection() { return contactSection; }
    public void setContactSection(ContactSection contactSection) { this.contactSection = contactSection; }
    public SocialPlatform getPlatform() { return platform; }
    public void setPlatform(SocialPlatform platform) { this.platform = platform; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getProfileUrl() { return profileUrl; }
    public void setProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

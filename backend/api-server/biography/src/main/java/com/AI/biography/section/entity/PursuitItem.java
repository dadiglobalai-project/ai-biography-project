package com.AI.biography.section.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pursuit_items")
public class PursuitItem {
    @Id
    @Column(name = "pursuit_item_id", columnDefinition = "CHAR(36)", length = 36)
    private String pursuitItemId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false, columnDefinition = "CHAR(36)")
    private PursuitSection pursuitSection;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", columnDefinition = "CHAR(36)")
    private WebsiteMediaAsset image;
    @Column(name = "icon")
    private String icon;
    @Column(name = "title", nullable = false)
    private String title;
    @Column(name = "description")
    private String description;
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getPursuitItemId() { return pursuitItemId; }
    public void setPursuitItemId(String pursuitItemId) { this.pursuitItemId = pursuitItemId; }
    public PursuitSection getPursuitSection() { return pursuitSection; }
    public void setPursuitSection(PursuitSection pursuitSection) { this.pursuitSection = pursuitSection; }
    public WebsiteMediaAsset getImage() { return image; }
    public void setImage(WebsiteMediaAsset image) { this.image = image; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

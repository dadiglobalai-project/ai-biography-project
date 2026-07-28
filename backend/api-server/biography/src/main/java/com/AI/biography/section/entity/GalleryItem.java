package com.AI.biography.section.entity;

import com.AI.biography.section.enums.GalleryMediaType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gallery_items")
public class GalleryItem {
    @Id
    @Column(name = "gallery_item_id", columnDefinition = "CHAR(36)", length = 36)
    private String galleryItemId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false, columnDefinition = "CHAR(36)")
    private GallerySection gallerySection;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_asset_id", columnDefinition = "CHAR(36)")
    private WebsiteMediaAsset mediaAsset;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thumbnail_asset_id", columnDefinition = "CHAR(36)")
    private WebsiteMediaAsset thumbnailAsset;
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 30)
    private GalleryMediaType mediaType;
    @Column(name = "category", length = 100)
    private String category;
    @Column(name = "record_label")
    private String recordLabel;
    @Column(name = "display_year", length = 50)
    private String displayYear;
    @Column(name = "title", nullable = false)
    private String title;
    @Column(name = "description")
    private String description;
    @Column(name = "alt_text", length = 500)
    private String altText;
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getGalleryItemId() { return galleryItemId; }
    public void setGalleryItemId(String galleryItemId) { this.galleryItemId = galleryItemId; }
    public GallerySection getGallerySection() { return gallerySection; }
    public void setGallerySection(GallerySection gallerySection) { this.gallerySection = gallerySection; }
    public WebsiteMediaAsset getMediaAsset() { return mediaAsset; }
    public void setMediaAsset(WebsiteMediaAsset mediaAsset) { this.mediaAsset = mediaAsset; }
    public WebsiteMediaAsset getThumbnailAsset() { return thumbnailAsset; }
    public void setThumbnailAsset(WebsiteMediaAsset thumbnailAsset) { this.thumbnailAsset = thumbnailAsset; }
    public GalleryMediaType getMediaType() { return mediaType; }
    public void setMediaType(GalleryMediaType mediaType) { this.mediaType = mediaType; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getRecordLabel() { return recordLabel; }
    public void setRecordLabel(String recordLabel) { this.recordLabel = recordLabel; }
    public String getDisplayYear() { return displayYear; }
    public void setDisplayYear(String displayYear) { this.displayYear = displayYear; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

package com.AI.biography.section.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "belief_items")
public class BeliefItem {
    @Id
    @Column(name = "belief_item_id", columnDefinition = "CHAR(36)", length = 36)
    private String beliefItemId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false, columnDefinition = "CHAR(36)")
    private ChronicleSection chronicleSection;
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

    public String getBeliefItemId() { return beliefItemId; }
    public void setBeliefItemId(String beliefItemId) { this.beliefItemId = beliefItemId; }
    public ChronicleSection getChronicleSection() { return chronicleSection; }
    public void setChronicleSection(ChronicleSection chronicleSection) { this.chronicleSection = chronicleSection; }
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

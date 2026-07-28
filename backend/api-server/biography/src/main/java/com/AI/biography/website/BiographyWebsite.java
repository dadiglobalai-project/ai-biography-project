package com.AI.biography.website;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "biography_websites")
public class BiographyWebsite {

    @Id
    @Column(name = "website_id", columnDefinition = "CHAR(36)", length = 36)
    private String websiteId;

    @Column(name = "user_id", columnDefinition = "CHAR(36)", length = 36, nullable = false)
    private String userId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "subdomain", unique = true, length = 100)
    private String subdomain;

    @Column(name = "template_id", columnDefinition = "CHAR(36)", length = 36, nullable = false)
    private String templateId;

    @Column(name = "subject_type", length = 50)
    private String subjectType;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BiographyWebsite() {
    }

    public String getWebsiteId() {
        return websiteId;
    }

    public void setWebsiteId(String websiteId) {
        this.websiteId = websiteId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubdomain() {
        return subdomain;
    }

    public void setSubdomain(String subdomain) {
        this.subdomain = subdomain;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public String getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(String subjectType) {
        this.subjectType = subjectType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
package com.AI.biography.website.dto;

import java.time.LocalDateTime;

public class WebsiteResponse {

    private String websiteId;
    private String title;
    private String subdomain;
    private String templateId;
    private String subjectType;
    private String status;
    private String thumbnailUrl;
    private LocalDateTime thumbnailGeneratedAt;

    public WebsiteResponse() {
    }

    public String getWebsiteId() {
        return websiteId;
    }

    public void setWebsiteId(String websiteId) {
        this.websiteId = websiteId;
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

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public LocalDateTime getThumbnailGeneratedAt() {
        return thumbnailGeneratedAt;
    }

    public void setThumbnailGeneratedAt(LocalDateTime thumbnailGeneratedAt) {
        this.thumbnailGeneratedAt = thumbnailGeneratedAt;
    }
}

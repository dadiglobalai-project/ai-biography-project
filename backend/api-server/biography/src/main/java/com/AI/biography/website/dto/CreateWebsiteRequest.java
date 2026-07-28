package com.AI.biography.website.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateWebsiteRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String templateId;

    private String subjectType;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }

    public String getSubjectType() { return subjectType; }
    public void setSubjectType(String subjectType) { this.subjectType = subjectType; }
}
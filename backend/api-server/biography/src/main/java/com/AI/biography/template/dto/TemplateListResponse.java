package com.AI.biography.template.dto;
import java.util.List;


public class TemplateListResponse {

    private List<TemplateResponse> templates;
    private int totalTemplates;

    public TemplateListResponse() {
    }

    public TemplateListResponse(List<TemplateResponse> templates) {
        this.templates = templates;
        this.totalTemplates = templates.size();
    }

    public List<TemplateResponse> getTemplates() {
        return templates;
    }

    public void setTemplates(List<TemplateResponse> templates) {
        this.templates = templates;
    }

    public int getTotalTemplates() {
        return totalTemplates;
    }

    public void setTotalTemplates(int totalTemplates) {
        this.totalTemplates = totalTemplates;
    }
}
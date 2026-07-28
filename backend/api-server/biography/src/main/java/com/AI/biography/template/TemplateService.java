package com.AI.biography.template;

import com.AI.biography.template.dto.TemplateListResponse;
import com.AI.biography.template.dto.TemplateResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    public TemplateListResponse getTemplates() {

        List<TemplateResponse> templates = templateRepository
                .findByStatusOrderByCreatedAtAsc("ACTIVE")
                .stream()
                .map(this::mapToResponse)
                .toList();

        return new TemplateListResponse(templates);
    }

    // Helper method
    private TemplateResponse mapToResponse(Template template) {

        TemplateResponse response = new TemplateResponse();

        response.setTemplateId(template.getTemplateId());
        response.setName(template.getName());
        response.setDescription(template.getDescription());
        response.setThumbnailUrl(template.getThumbnailUrl());
        response.setLayoutKey(template.getLayoutKey());
        response.setCategory(template.getCategory());
        response.setPremium(template.getPremium());

        return response;
    }
}
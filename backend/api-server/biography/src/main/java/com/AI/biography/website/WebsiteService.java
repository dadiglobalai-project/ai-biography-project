package com.AI.biography.website;

import com.AI.biography.template.Template;
import com.AI.biography.template.TemplateRepository;
import com.AI.biography.website.dto.CreateWebsiteRequest;
import com.AI.biography.website.dto.WebsiteResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class WebsiteService {

    private final BiographyWebsiteRepository biographyWebsiteRepository;
    private final TemplateRepository templateRepository;

    public WebsiteService(
            BiographyWebsiteRepository biographyWebsiteRepository,
            TemplateRepository templateRepository) {

        this.biographyWebsiteRepository = biographyWebsiteRepository;
        this.templateRepository = templateRepository;
    }

    public WebsiteResponse createWebsite(String userId, CreateWebsiteRequest request) {

        if (userId == null || userId.isBlank()) {
            throw new RuntimeException("Unauthorized request");
        }

        Template template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!"ACTIVE".equalsIgnoreCase(template.getStatus())) {
            throw new RuntimeException("Selected template is not available");
        }

        String title = request.getTitle().trim();

        String subjectType = request.getSubjectType() != null
                ? request.getSubjectType().trim().toUpperCase()
                : "SELF";

        if (!isValidSubjectType(subjectType)) {
            throw new RuntimeException("Invalid subject type");
        }

        BiographyWebsite website = new BiographyWebsite();

        website.setWebsiteId(UUID.randomUUID().toString());
        website.setUserId(userId);
        website.setTitle(title);
        website.setTemplateId(template.getTemplateId());
        website.setSubjectType(subjectType);
        website.setStatus("DRAFT");
        website.setSubdomain(null);
        website.setCreatedAt(LocalDateTime.now());
        website.setUpdatedAt(LocalDateTime.now());

        BiographyWebsite savedWebsite = biographyWebsiteRepository.save(website);

        return mapToResponse(savedWebsite);
    }

    public List<WebsiteResponse> getUserWebsites(String userId) {

        if (userId == null || userId.isBlank()) {
            throw new RuntimeException("Unauthorized request");
        }

        return biographyWebsiteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private boolean isValidSubjectType(String subjectType) {

        return subjectType.equals("SELF")
                || subjectType.equals("PARENT")
                || subjectType.equals("GRANDPARENT")
                || subjectType.equals("CHILD")
                || subjectType.equals("SPOUSE")
                || subjectType.equals("LOVED_ONE");
    }

    private WebsiteResponse mapToResponse(BiographyWebsite website) {

        WebsiteResponse response = new WebsiteResponse();

        response.setWebsiteId(website.getWebsiteId());
        response.setTitle(website.getTitle());
        response.setSubdomain(website.getSubdomain());
        response.setTemplateId(website.getTemplateId());
        response.setSubjectType(website.getSubjectType());
        response.setStatus(website.getStatus());

        return response;
    }

    public WebsiteResponse getWebsiteById(String userId, String websiteId) {

        if (userId == null || userId.isBlank()) {
            throw new RuntimeException("Unauthorized request");
        }

        BiographyWebsite website = biographyWebsiteRepository
                .findByWebsiteIdAndUserId(websiteId, userId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        return mapToResponse(website);
    }
}
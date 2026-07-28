package com.AI.biography.template;

import com.AI.biography.template.dto.TemplateListResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    public TemplateListResponse getTemplates() {
        return templateService.getTemplates();
    }
}
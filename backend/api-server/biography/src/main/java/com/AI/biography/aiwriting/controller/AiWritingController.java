package com.AI.biography.aiwriting.controller;

import com.AI.biography.aiwriting.dto.request.AiWritingGenerateRequest;
import com.AI.biography.aiwriting.dto.response.AiWritingResponse;
import com.AI.biography.aiwriting.service.AiWritingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-writing")
@CrossOrigin(origins = "*")
public class AiWritingController {
    private final AiWritingService aiWritingService;

    public AiWritingController(AiWritingService aiWritingService) {
        this.aiWritingService = aiWritingService;
    }

    @PostMapping("/generate")
    public AiWritingResponse generate(@Valid @RequestBody AiWritingGenerateRequest request) {
        return aiWritingService.generate(request);
    }
}

package com.AI.biography.section.controller;

import com.AI.biography.section.dto.request.PublicContactMessageRequest;
import com.AI.biography.section.dto.response.PublicContactMessageResponse;
import com.AI.biography.section.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/websites/{websiteId}/contact-messages")
@CrossOrigin(origins = "*")
public class PublicContactMessageController {
    private final ContactMessageService contactMessageService;

    public PublicContactMessageController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @PostMapping
    public ResponseEntity<PublicContactMessageResponse> createMessage(
            @PathVariable String websiteId,
            @Valid @RequestBody PublicContactMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactMessageService.createPublicMessage(websiteId, request));
    }
}

package com.AI.biography.section.controller;

import com.AI.biography.section.dto.request.ContactMessageStatusRequest;
import com.AI.biography.section.dto.response.ContactMessageResponse;
import com.AI.biography.section.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/websites/{websiteId}/contact-messages")
@CrossOrigin(origins = "*")
public class ContactMessageController {
    private final ContactMessageService contactMessageService;

    public ContactMessageController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @GetMapping
    public List<ContactMessageResponse> getMessages(@PathVariable String websiteId) {
        return contactMessageService.getMessages(websiteId);
    }

    @GetMapping("/{messageId}")
    public ContactMessageResponse getMessage(@PathVariable String websiteId, @PathVariable String messageId) {
        return contactMessageService.getMessage(websiteId, messageId);
    }

    @PatchMapping("/{messageId}/status")
    public ContactMessageResponse updateStatus(@PathVariable String websiteId,
                                               @PathVariable String messageId,
                                               @Valid @RequestBody ContactMessageStatusRequest request) {
        return contactMessageService.updateStatus(websiteId, messageId, request);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String websiteId, @PathVariable String messageId) {
        contactMessageService.deleteMessage(websiteId, messageId);
        return ResponseEntity.noContent().build();
    }
}

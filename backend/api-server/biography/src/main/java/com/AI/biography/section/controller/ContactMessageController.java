package com.AI.biography.section.controller;

import com.AI.biography.section.dto.request.ContactMessageStatusRequest;
import com.AI.biography.section.dto.response.ContactMessageResponse;
import com.AI.biography.section.service.ContactMessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/websites/{websiteId}/contact-messages")
public class ContactMessageController {
    private final ContactMessageService contactMessageService;

    public ContactMessageController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @GetMapping
    public List<ContactMessageResponse> getMessages(@PathVariable String websiteId, HttpServletRequest request) {
        return contactMessageService.getMessages(userId(request), websiteId);
    }

    @GetMapping("/{messageId}")
    public ContactMessageResponse getMessage(@PathVariable String websiteId,
                                             @PathVariable String messageId,
                                             HttpServletRequest request) {
        return contactMessageService.getMessage(userId(request), websiteId, messageId);
    }

    @PatchMapping("/{messageId}/status")
    public ContactMessageResponse updateStatus(@PathVariable String websiteId,
                                               @PathVariable String messageId,
                                               @Valid @RequestBody ContactMessageStatusRequest statusRequest,
                                               HttpServletRequest request) {
        return contactMessageService.updateStatus(userId(request), websiteId, messageId, statusRequest);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String websiteId,
                                              @PathVariable String messageId,
                                              HttpServletRequest request) {
        contactMessageService.deleteMessage(userId(request), websiteId, messageId);
        return ResponseEntity.noContent().build();
    }

    private String userId(HttpServletRequest request) {
        return (String) request.getAttribute("userId");
    }
}

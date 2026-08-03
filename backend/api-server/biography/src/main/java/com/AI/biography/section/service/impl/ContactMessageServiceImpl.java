package com.AI.biography.section.service.impl;

import com.AI.biography.section.dto.request.ContactMessageStatusRequest;
import com.AI.biography.section.dto.request.PublicContactMessageRequest;
import com.AI.biography.section.dto.response.ContactMessageResponse;
import com.AI.biography.section.dto.response.PublicContactMessageResponse;
import com.AI.biography.section.entity.ContactMessage;
import com.AI.biography.section.enums.ContactMessageStatus;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.section.mapper.BiographySectionMapper;
import com.AI.biography.section.repository.ContactMessageRepository;
import com.AI.biography.section.service.ContactMessageService;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ContactMessageServiceImpl implements ContactMessageService {
    private final BiographyWebsiteRepository websiteRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final BiographySectionMapper mapper;

    public ContactMessageServiceImpl(BiographyWebsiteRepository websiteRepository,
                                     ContactMessageRepository contactMessageRepository,
                                     BiographySectionMapper mapper) {
        this.websiteRepository = websiteRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public PublicContactMessageResponse createPublicMessage(String websiteId, PublicContactMessageRequest request) {
        BiographyWebsite website = requireWebsite(websiteId);
        ContactMessage message = new ContactMessage();
        message.setContactMessageId(UUID.randomUUID().toString());
        message.setWebsite(website);
        message.setSenderName(request.senderName);
        message.setSenderEmail(request.senderEmail);
        message.setSubject(request.subject);
        message.setMessage(request.message);
        message.setStatus(ContactMessageStatus.NEW);
        message.setSubmittedAt(LocalDateTime.now());
        return mapper.toPublicContactMessageResponse(contactMessageRepository.save(message));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactMessageResponse> getMessages(String userId, String websiteId) {
        requireOwnedWebsite(userId, websiteId);
        return contactMessageRepository.findByWebsiteWebsiteIdOrderBySubmittedAtDesc(websiteId)
                .stream()
                .map(mapper::toContactMessageResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ContactMessageResponse getMessage(String userId, String websiteId, String messageId) {
        return mapper.toContactMessageResponse(requireMessage(userId, websiteId, messageId));
    }

    @Override
    @Transactional
    public ContactMessageResponse updateStatus(String userId, String websiteId, String messageId, ContactMessageStatusRequest request) {
        ContactMessage message = requireMessage(userId, websiteId, messageId);
        message.setStatus(request.status);
        if (request.status == ContactMessageStatus.READ && message.getReadAt() == null) {
            message.setReadAt(LocalDateTime.now());
        }
        if (request.status == ContactMessageStatus.REPLIED && message.getRepliedAt() == null) {
            message.setRepliedAt(LocalDateTime.now());
        }
        return mapper.toContactMessageResponse(message);
    }

    @Override
    @Transactional
    public void deleteMessage(String userId, String websiteId, String messageId) {
        ContactMessage message = requireMessage(userId, websiteId, messageId);
        contactMessageRepository.delete(message);
    }

    private BiographyWebsite requireWebsite(String websiteId) {
        return websiteRepository.findById(websiteId)
                .orElseThrow(() -> new NotFoundException("Website not found"));
    }

    private BiographyWebsite requireOwnedWebsite(String userId, String websiteId) {
        return websiteRepository.findByWebsiteIdAndUserId(websiteId, userId)
                .orElseThrow(() -> new NotFoundException("Website not found"));
    }

    private ContactMessage requireMessage(String userId, String websiteId, String messageId) {
        requireOwnedWebsite(userId, websiteId);
        return contactMessageRepository.findByContactMessageIdAndWebsiteWebsiteId(messageId, websiteId)
                .orElseThrow(() -> new NotFoundException("Contact message not found"));
    }
}

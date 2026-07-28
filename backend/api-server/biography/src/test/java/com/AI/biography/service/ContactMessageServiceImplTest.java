package com.AI.biography.service;

import com.AI.biography.section.dto.request.ContactMessageStatusRequest;
import com.AI.biography.section.dto.request.PublicContactMessageRequest;
import com.AI.biography.section.entity.ContactMessage;
import com.AI.biography.section.enums.ContactMessageStatus;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.section.mapper.BiographySectionMapper;
import com.AI.biography.section.repository.ContactMessageRepository;
import com.AI.biography.section.service.impl.ContactMessageServiceImpl;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactMessageServiceImplTest {
    private static final String WEBSITE_ID = "website-1";
    private static final String MESSAGE_ID = "message-1";

    @Mock
    private BiographyWebsiteRepository websiteRepository;

    @Mock
    private ContactMessageRepository contactMessageRepository;

    @Spy
    private BiographySectionMapper mapper = new BiographySectionMapper();

    @InjectMocks
    private ContactMessageServiceImpl service;

    @Test
    void createPublicMessageSavesNewMessage() {
        when(websiteRepository.findById(WEBSITE_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(contactMessageRepository.save(any(ContactMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PublicContactMessageRequest request = new PublicContactMessageRequest();
        request.senderName = "Grace Hopper";
        request.senderEmail = "grace@example.com";
        request.subject = "Hello";
        request.message = "Message body";

        var response = service.createPublicMessage(WEBSITE_ID, request);

        assertThat(response.contactMessageId).isNotBlank();
        assertThat(response.status).isEqualTo(ContactMessageStatus.NEW);
        assertThat(response.submittedAt).isNotNull();
    }

    @Test
    void getUpdateAndDeleteUseWebsiteScopedMessageLookup() {
        ContactMessage message = message();
        when(websiteRepository.findById(WEBSITE_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(contactMessageRepository.findByContactMessageIdAndWebsiteWebsiteId(MESSAGE_ID, WEBSITE_ID))
                .thenReturn(Optional.of(message));

        assertThat(service.getMessage(WEBSITE_ID, MESSAGE_ID).contactMessageId).isEqualTo(MESSAGE_ID);

        ContactMessageStatusRequest statusRequest = new ContactMessageStatusRequest();
        statusRequest.status = ContactMessageStatus.REPLIED;
        var updated = service.updateStatus(WEBSITE_ID, MESSAGE_ID, statusRequest);
        assertThat(updated.status).isEqualTo(ContactMessageStatus.REPLIED);
        assertThat(updated.repliedAt).isNotNull();

        service.deleteMessage(WEBSITE_ID, MESSAGE_ID);
        verify(contactMessageRepository).delete(message);
    }

    @Test
    void getMessagesReturnsMessagesForWebsite() {
        when(websiteRepository.findById(WEBSITE_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(contactMessageRepository.findByWebsiteWebsiteIdOrderBySubmittedAtDesc(WEBSITE_ID))
                .thenReturn(List.of(message()));

        var responses = service.getMessages(WEBSITE_ID);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).websiteId).isEqualTo(WEBSITE_ID);
        assertThat(responses.get(0).status).isEqualTo(ContactMessageStatus.NEW);
    }

    @Test
    void missingWebsiteAndWrongWebsiteOwnershipReturnNotFound() {
        when(websiteRepository.findById("missing")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.createPublicMessage("missing", new PublicContactMessageRequest()))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Website not found");

        when(websiteRepository.findById(WEBSITE_ID)).thenReturn(Optional.of(website(WEBSITE_ID)));
        when(contactMessageRepository.findByContactMessageIdAndWebsiteWebsiteId(MESSAGE_ID, WEBSITE_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getMessage(WEBSITE_ID, MESSAGE_ID))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Contact message not found");
    }

    private BiographyWebsite website(String websiteId) {
        BiographyWebsite website = new BiographyWebsite();
        website.setWebsiteId(websiteId);
        return website;
    }

    private ContactMessage message() {
        ContactMessage message = new ContactMessage();
        message.setContactMessageId(MESSAGE_ID);
        message.setWebsite(website(WEBSITE_ID));
        message.setSenderName("Grace Hopper");
        message.setSenderEmail("grace@example.com");
        message.setSubject("Hello");
        message.setMessage("Message body");
        message.setStatus(ContactMessageStatus.NEW);
        message.setSubmittedAt(LocalDateTime.now());
        return message;
    }
}

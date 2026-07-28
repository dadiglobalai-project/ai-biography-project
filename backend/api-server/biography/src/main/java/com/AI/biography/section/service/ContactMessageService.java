package com.AI.biography.section.service;

import com.AI.biography.section.dto.request.ContactMessageStatusRequest;
import com.AI.biography.section.dto.request.PublicContactMessageRequest;
import com.AI.biography.section.dto.response.ContactMessageResponse;
import com.AI.biography.section.dto.response.PublicContactMessageResponse;
import java.util.List;

public interface ContactMessageService {
    PublicContactMessageResponse createPublicMessage(String websiteId, PublicContactMessageRequest request);
    List<ContactMessageResponse> getMessages(String websiteId);
    ContactMessageResponse getMessage(String websiteId, String messageId);
    ContactMessageResponse updateStatus(String websiteId, String messageId, ContactMessageStatusRequest request);
    void deleteMessage(String websiteId, String messageId);
}

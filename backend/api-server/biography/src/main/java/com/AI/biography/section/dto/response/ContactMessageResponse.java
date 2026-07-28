package com.AI.biography.section.dto.response;

import com.AI.biography.section.enums.ContactMessageStatus;
import java.time.LocalDateTime;

public class ContactMessageResponse {
    public String contactMessageId;
    public String websiteId;
    public String senderName;
    public String senderEmail;
    public String subject;
    public String message;
    public ContactMessageStatus status;
    public LocalDateTime submittedAt;
    public LocalDateTime readAt;
    public LocalDateTime repliedAt;
}

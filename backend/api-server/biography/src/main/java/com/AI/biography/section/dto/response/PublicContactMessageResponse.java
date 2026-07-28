package com.AI.biography.section.dto.response;

import com.AI.biography.section.enums.ContactMessageStatus;
import java.time.LocalDateTime;

public class PublicContactMessageResponse {
    public String contactMessageId;
    public ContactMessageStatus status;
    public LocalDateTime submittedAt;
}

package com.AI.biography.section.dto.request;

import com.AI.biography.section.enums.ContactMessageStatus;
import jakarta.validation.constraints.NotNull;

public class ContactMessageStatusRequest {
    @NotNull
    public ContactMessageStatus status;
}

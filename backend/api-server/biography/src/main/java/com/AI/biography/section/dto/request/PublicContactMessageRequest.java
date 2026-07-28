package com.AI.biography.section.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PublicContactMessageRequest {
    @NotBlank
    @Size(max = 255)
    public String senderName;
    @NotBlank
    @Email
    @Size(max = 320)
    public String senderEmail;
    @Size(max = 500)
    public String subject;
    @NotBlank
    public String message;
}

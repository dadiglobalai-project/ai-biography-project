package com.AI.biography.membership.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateRefundRequest {
    @NotBlank
    @Size(max = 36)
    public String paymentId;

    @Size(max = 500)
    public String reason;
}

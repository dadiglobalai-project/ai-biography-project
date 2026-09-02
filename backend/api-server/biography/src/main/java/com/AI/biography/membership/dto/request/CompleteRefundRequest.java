package com.AI.biography.membership.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompleteRefundRequest {
    @NotBlank
    @Size(max = 30)
    public String refundMethod;

    @Size(max = 255)
    public String externalRefundReference;
}

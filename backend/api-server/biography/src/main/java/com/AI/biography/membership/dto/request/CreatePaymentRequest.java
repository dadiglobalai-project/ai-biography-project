package com.AI.biography.membership.dto.request;

import com.AI.biography.membership.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreatePaymentRequest {
    @NotBlank
    @Size(max = 36)
    public String planId;

    @NotNull
    public PaymentMethod paymentMethod;

    @Size(max = 255)
    public String paymentRemark;

    public Boolean autoRenew;
}

package com.AI.biography.membership.dto.response;

import com.AI.biography.membership.enums.PaymentMethod;
import com.AI.biography.membership.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminPaymentResponse {
    public String paymentId;
    public String membershipId;
    public String userId;
    public String userFullName;
    public String userEmail;
    public String paymentReference;
    public BigDecimal amount;
    public String currency;
    public PaymentMethod paymentMethod;
    public String paymentRemark;
    public PaymentStatus status;
    public LocalDateTime paidAt;
    public String verifiedBy;
    public LocalDateTime verifiedAt;
    public LocalDateTime createdAt;
}

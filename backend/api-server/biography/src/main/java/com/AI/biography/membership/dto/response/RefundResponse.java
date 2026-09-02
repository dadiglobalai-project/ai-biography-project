package com.AI.biography.membership.dto.response;

import com.AI.biography.membership.enums.RefundStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RefundResponse {
    public String refundId;
    public String paymentId;
    public BigDecimal amount;
    public String currency;
    public String reason;
    public RefundStatus status;
    public String refundMethod;
    public String externalRefundReference;
    public LocalDateTime requestedAt;
    public LocalDateTime processedAt;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}

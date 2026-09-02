package com.AI.biography.membership.service;

import com.AI.biography.membership.dto.request.CreateRefundRequest;
import com.AI.biography.membership.dto.response.RefundResponse;
import com.AI.biography.membership.entity.Payment;
import com.AI.biography.membership.entity.Refund;
import com.AI.biography.membership.enums.PaymentStatus;
import com.AI.biography.membership.enums.RefundStatus;
import com.AI.biography.membership.exception.MembershipConflictException;
import com.AI.biography.membership.repository.PaymentRepository;
import com.AI.biography.membership.repository.RefundRepository;
import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefundService {
    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final MembershipAuthorizationService authorizationService;

    public RefundService(RefundRepository refundRepository,
                         PaymentRepository paymentRepository,
                         MembershipAuthorizationService authorizationService) {
        this.refundRepository = refundRepository;
        this.paymentRepository = paymentRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional
    public RefundResponse requestRefund(CreateRefundRequest request) {
        if (request == null) {
            throw new BadRequestException("Refund request is required");
        }
        String userId = authorizationService.currentUserId();
        Payment payment = paymentRepository.findByPaymentIdAndUserUserId(request.paymentId, userId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        if (payment.getStatus() != PaymentStatus.CONFIRMED) {
            throw new MembershipConflictException("Only confirmed payments can be refunded");
        }
        if (payment.getPaidAt() == null) {
            throw new MembershipConflictException("Payment has no paid timestamp");
        }
        if (refundRepository.existsByPaymentPaymentId(payment.getPaymentId())) {
            throw new MembershipConflictException("Refund already exists for this payment");
        }
        validateRefundWindow(payment, LocalDateTime.now());

        LocalDateTime now = LocalDateTime.now();
        Refund refund = new Refund();
        refund.setRefundId(UUID.randomUUID().toString());
        refund.setPayment(payment);
        refund.setAmount(payment.getAmount());
        refund.setCurrency(payment.getCurrency());
        refund.setReason(request.reason);
        refund.setStatus(RefundStatus.REQUESTED);
        refund.setRequestedAt(now);
        refund.setCreatedAt(now);
        refund.setUpdatedAt(now);
        return mapRefund(refundRepository.save(refund));
    }

    @Transactional(readOnly = true)
    public RefundResponse getRefundForCurrentUser(String refundId) {
        String userId = authorizationService.currentUserId();
        return mapRefund(refundRepository.findByRefundIdAndPaymentUserUserId(refundId, userId)
                .orElseThrow(() -> new NotFoundException("Refund not found")));
    }

    private void validateRefundWindow(Payment payment, LocalDateTime checkedAt) {
        LocalDateTime deadline = refundDeadline(payment);
        if (checkedAt.isAfter(deadline)) {
            throw new MembershipConflictException("Refund window has expired");
        }
    }

    private LocalDateTime refundDeadline(Payment payment) {
        Integer refundWindowDays = payment.getMembership().getPlan().getRefundWindowDays();
        return payment.getPaidAt().plusDays(refundWindowDays);
    }

    private RefundResponse mapRefund(Refund refund) {
        RefundResponse response = new RefundResponse();
        response.refundId = refund.getRefundId();
        response.paymentId = refund.getPayment().getPaymentId();
        response.amount = refund.getAmount();
        response.currency = refund.getCurrency();
        response.reason = refund.getReason();
        response.status = refund.getStatus();
        response.refundMethod = refund.getRefundMethod();
        response.externalRefundReference = refund.getExternalRefundReference();
        response.requestedAt = refund.getRequestedAt();
        response.processedAt = refund.getProcessedAt();
        response.createdAt = refund.getCreatedAt();
        response.updatedAt = refund.getUpdatedAt();
        return response;
    }

}

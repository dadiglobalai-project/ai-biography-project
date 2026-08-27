package com.AI.biography.membership.service;

import com.AI.biography.membership.dto.request.CompleteRefundRequest;
import com.AI.biography.membership.dto.response.AdminRefundResponse;
import com.AI.biography.membership.entity.Membership;
import com.AI.biography.membership.entity.Payment;
import com.AI.biography.membership.entity.Refund;
import com.AI.biography.membership.enums.MembershipStatus;
import com.AI.biography.membership.enums.PaymentStatus;
import com.AI.biography.membership.enums.RefundStatus;
import com.AI.biography.membership.exception.MembershipConflictException;
import com.AI.biography.membership.repository.RefundRepository;
import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.user.User;
import com.AI.biography.user.UserProfile;
import com.AI.biography.user.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminRefundService {
    private final RefundRepository refundRepository;
    private final UserProfileRepository userProfileRepository;
    private final MembershipAuthorizationService authorizationService;
    private final MembershipService membershipService;

    public AdminRefundService(RefundRepository refundRepository,
                              UserProfileRepository userProfileRepository,
                              MembershipAuthorizationService authorizationService,
                              MembershipService membershipService) {
        this.refundRepository = refundRepository;
        this.userProfileRepository = userProfileRepository;
        this.authorizationService = authorizationService;
        this.membershipService = membershipService;
    }

    @Transactional(readOnly = true)
    public List<AdminRefundResponse> getRefunds(RefundStatus status) {
        authorizationService.requireAdmin();
        List<Refund> refunds = status == null
                ? refundRepository.findAllByOrderByRequestedAtDesc()
                : refundRepository.findByStatusOrderByRequestedAtDesc(status);
        return refunds.stream().map(this::mapAdminRefund).toList();
    }

    @Transactional(readOnly = true)
    public List<AdminRefundResponse> getRefundRequests() {
        authorizationService.requireAdmin();
        return refundRepository.findByStatusOrderByRequestedAtDesc(RefundStatus.REQUESTED)
                .stream()
                .map(this::mapAdminRefund)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminRefundResponse getRefundDetails(String refundId) {
        authorizationService.requireAdmin();
        return mapAdminRefund(refundRepository.findById(refundId)
                .orElseThrow(() -> new NotFoundException("Refund not found")));
    }

    @Transactional
    public AdminRefundResponse approveRefund(String refundId) {
        User admin = authorizationService.requireAdmin();
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new NotFoundException("Refund not found"));
        if (refund.getStatus() != RefundStatus.REQUESTED) {
            throw new MembershipConflictException("Only requested refunds can be approved");
        }
        validateRefundRequestWasWithinWindow(refund);
        refund.setStatus(RefundStatus.APPROVED);
        refund.setProcessedBy(admin);
        return mapAdminRefund(refund);
    }

    @Transactional
    public AdminRefundResponse rejectRefund(String refundId) {
        User admin = authorizationService.requireAdmin();
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new NotFoundException("Refund not found"));
        if (refund.getStatus() != RefundStatus.REQUESTED) {
            throw new MembershipConflictException("Only requested refunds can be rejected");
        }
        refund.setStatus(RefundStatus.REJECTED);
        refund.setProcessedBy(admin);
        refund.setProcessedAt(LocalDateTime.now());
        return mapAdminRefund(refund);
    }

    @Transactional
    public AdminRefundResponse completeRefund(String refundId, CompleteRefundRequest request) {
        if (request == null) {
            throw new BadRequestException("Complete refund request is required");
        }
        User admin = authorizationService.requireAdmin();
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new NotFoundException("Refund not found"));
        if (refund.getStatus() != RefundStatus.APPROVED && refund.getStatus() != RefundStatus.PROCESSING) {
            throw new MembershipConflictException("Only approved or processing refunds can be completed");
        }
        Payment payment = refund.getPayment();
        if (payment.getStatus() != PaymentStatus.CONFIRMED) {
            throw new MembershipConflictException("Only confirmed payments can be marked refunded");
        }

        LocalDateTime now = LocalDateTime.now();
        refund.setStatus(RefundStatus.COMPLETED);
        refund.setRefundMethod(request.refundMethod);
        refund.setExternalRefundReference(request.externalRefundReference);
        refund.setProcessedBy(admin);
        refund.setProcessedAt(now);

        payment.setStatus(PaymentStatus.REFUNDED);
        Membership membership = payment.getMembership();
        if (membership != null && membership.getStatus() == MembershipStatus.ACTIVE) {
            membershipService.cancelMembership(membership);
        }
        return mapAdminRefund(refund);
    }

    private void validateRefundRequestWasWithinWindow(Refund refund) {
        if (refund.getRequestedAt() == null) {
            throw new MembershipConflictException("Refund has no request timestamp");
        }
        LocalDateTime deadline = refundDeadline(refund.getPayment());
        if (refund.getRequestedAt().isAfter(deadline)) {
            throw new MembershipConflictException("Refund request was outside the refund window");
        }
    }

    private LocalDateTime refundDeadline(Payment payment) {
        Integer refundWindowDays = payment.getMembership().getPlan().getRefundWindowDays();
        return payment.getPaidAt().plusDays(refundWindowDays);
    }

    private AdminRefundResponse mapAdminRefund(Refund refund) {
        Payment payment = refund.getPayment();
        AdminRefundResponse response = new AdminRefundResponse();
        response.refundId = refund.getRefundId();
        response.paymentId = payment.getPaymentId();
        response.userId = payment.getUser().getUserId();
        response.userEmail = payment.getUser().getEmail();
        response.userFullName = fullName(payment.getUser().getUserId());
        response.amount = refund.getAmount();
        response.currency = refund.getCurrency();
        response.reason = refund.getReason();
        response.status = refund.getStatus();
        response.refundMethod = refund.getRefundMethod();
        response.externalRefundReference = refund.getExternalRefundReference();
        response.requestedAt = refund.getRequestedAt();
        response.processedAt = refund.getProcessedAt();
        response.processedBy = refund.getProcessedBy() != null ? refund.getProcessedBy().getUserId() : null;
        response.createdAt = refund.getCreatedAt();
        response.updatedAt = refund.getUpdatedAt();
        return response;
    }

    private String fullName(String userId) {
        return userProfileRepository.findByUserId(userId)
                .map(this::fullName)
                .orElse(null);
    }

    private String fullName(UserProfile profile) {
        String firstName = profile.getFirstName();
        String lastName = profile.getLastName();
        String name = ((StringUtils.hasText(firstName) ? firstName : "") + " "
                + (StringUtils.hasText(lastName) ? lastName : "")).trim();
        return StringUtils.hasText(name) ? name : null;
    }
}

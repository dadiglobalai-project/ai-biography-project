package com.AI.biography.membership.service;

import com.AI.biography.membership.dto.request.ConfirmPaymentRequest;
import com.AI.biography.membership.dto.response.AdminPaymentResponse;
import com.AI.biography.membership.entity.Membership;
import com.AI.biography.membership.entity.Payment;
import com.AI.biography.membership.enums.MembershipStatus;
import com.AI.biography.membership.enums.PaymentStatus;
import com.AI.biography.membership.exception.MembershipConflictException;
import com.AI.biography.membership.repository.MembershipRepository;
import com.AI.biography.membership.repository.PaymentRepository;
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
public class AdminPaymentService {
    private final PaymentRepository paymentRepository;
    private final MembershipRepository membershipRepository;
    private final UserProfileRepository userProfileRepository;
    private final MembershipAuthorizationService authorizationService;
    private final MembershipService membershipService;

    public AdminPaymentService(PaymentRepository paymentRepository,
                               MembershipRepository membershipRepository,
                               UserProfileRepository userProfileRepository, 
                               MembershipAuthorizationService authorizationService,
                               MembershipService membershipService) {
        this.paymentRepository = paymentRepository;
        this.membershipRepository = membershipRepository;
        this.userProfileRepository = userProfileRepository;
        this.authorizationService = authorizationService;
        this.membershipService = membershipService;
    }

    @Transactional(readOnly = true)
    public List<AdminPaymentResponse> getPayments(PaymentStatus status) {
        authorizationService.requireAdmin();
        List<Payment> payments = status == null
                ? paymentRepository.findAllByOrderByCreatedAtDesc()
                : paymentRepository.findByStatusOrderByCreatedAtDesc(status);
        return payments.stream().map(this::mapAdminPayment).toList();
    }

    @Transactional(readOnly = true)
    public List<AdminPaymentResponse> getPendingPayments() {
        authorizationService.requireAdmin();
        return paymentRepository.findByStatusOrderByCreatedAtDesc(PaymentStatus.PENDING)
                .stream()
                .map(this::mapAdminPayment)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminPaymentResponse getPaymentDetails(String paymentId) {
        authorizationService.requireAdmin();
        return mapAdminPayment(paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found")));
    }

    @Transactional
    public AdminPaymentResponse confirmPayment(String paymentId, ConfirmPaymentRequest request) {
        User admin = authorizationService.requireAdmin();
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new MembershipConflictException("Only pending payments can be confirmed");
        }
        Membership membership = payment.getMembership();
        if (membership == null || membership.getPlan() == null) {
            throw new MembershipConflictException("Payment membership is invalid");
        }
        if (membership.getStatus() != MembershipStatus.PENDING) {
            throw new MembershipConflictException("Only pending memberships can be activated");
        }
        rejectIfAnotherActiveMembership(payment.getUser().getUserId(), membership.getMembershipId());

        LocalDateTime now = LocalDateTime.now();
        payment.setStatus(PaymentStatus.CONFIRMED);
        payment.setVerifiedBy(admin);
        payment.setVerifiedAt(now);
        payment.setPaidAt(request != null && request.paidAt != null ? request.paidAt : now);
        membershipService.activateMembership(membership, now);

        return mapAdminPayment(payment);
    }

    @Transactional
    public AdminPaymentResponse rejectPayment(String paymentId) {
        User admin = authorizationService.requireAdmin();
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new MembershipConflictException("Only pending payments can be rejected");
        }
        payment.setStatus(PaymentStatus.REJECTED);
        payment.setVerifiedBy(admin);
        payment.setVerifiedAt(LocalDateTime.now());
        if (payment.getMembership() != null && payment.getMembership().getStatus() == MembershipStatus.PENDING) {
            membershipService.cancelMembership(payment.getMembership());
        }
        return mapAdminPayment(payment);
    }

    private void rejectIfAnotherActiveMembership(String userId, String activatingMembershipId) {
        LocalDateTime now = LocalDateTime.now();
        boolean hasAnotherActiveMembership = membershipRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .anyMatch(membership -> membership.getStatus() == MembershipStatus.ACTIVE
                        && membership.getExpiresAt() != null
                        && membership.getExpiresAt().isAfter(now)
                        && !membership.getMembershipId().equals(activatingMembershipId));
        if (hasAnotherActiveMembership) {
            throw new MembershipConflictException("User already has another active membership");
        }
    }

    private AdminPaymentResponse mapAdminPayment(Payment payment) {
        AdminPaymentResponse response = new AdminPaymentResponse();
        response.paymentId = payment.getPaymentId();
        response.membershipId = payment.getMembership().getMembershipId();
        response.userId = payment.getUser().getUserId();
        response.userEmail = payment.getUser().getEmail();
        response.userFullName = fullName(payment.getUser().getUserId());
        response.paymentReference = payment.getPaymentReference();
        response.amount = payment.getAmount();
        response.currency = payment.getCurrency();
        response.paymentMethod = payment.getPaymentMethod();
        response.paymentRemark = payment.getPaymentRemark();
        response.status = payment.getStatus(); 
        response.paidAt = payment.getPaidAt();
        response.verifiedBy = payment.getVerifiedBy() != null ? payment.getVerifiedBy().getUserId() : null;
        response.verifiedAt = payment.getVerifiedAt();
        response.createdAt = payment.getCreatedAt();
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

package com.AI.biography.membership.service;

import com.AI.biography.membership.dto.request.CreatePaymentRequest;
import com.AI.biography.membership.dto.response.PaymentResponse;
import com.AI.biography.membership.entity.Membership;
import com.AI.biography.membership.entity.MembershipPlan;
import com.AI.biography.membership.entity.Payment;
import com.AI.biography.membership.enums.MembershipStatus;
import com.AI.biography.membership.enums.PaymentStatus;
import com.AI.biography.membership.exception.MembershipConflictException;
import com.AI.biography.membership.repository.MembershipPlanRepository;
import com.AI.biography.membership.repository.MembershipRepository;
import com.AI.biography.membership.repository.PaymentRepository;
import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {
    private static final String PAYMENT_REFERENCE_PREFIX = "PAY-";

    private final PaymentRepository paymentRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipPlanRepository planRepository;
    private final MembershipAuthorizationService authorizationService;
    private final MembershipService membershipService;

    public PaymentService(PaymentRepository paymentRepository,
                          MembershipRepository membershipRepository,
                          MembershipPlanRepository planRepository,
                          MembershipAuthorizationService authorizationService,
                          MembershipService membershipService) {
        this.paymentRepository = paymentRepository;
        this.membershipRepository = membershipRepository;
        this.planRepository = planRepository;
        this.authorizationService = authorizationService;
        this.membershipService = membershipService;
    }

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        if (request == null) {
            throw new BadRequestException("Payment request is required");
        }
        User user = authorizationService.currentUser();
        MembershipPlan plan = planRepository.findById(request.planId)
                .orElseThrow(() -> new NotFoundException("Membership plan not found"));
        if (!Boolean.TRUE.equals(plan.getActive())) {
            throw new BadRequestException("Membership plan is inactive");
        }
        if (membershipService.hasCurrentActiveMembership(user.getUserId())) {
            throw new MembershipConflictException("User already has an active membership");
        }
        if (paymentRepository.existsByUserUserIdAndStatus(user.getUserId(), PaymentStatus.PENDING)) {
            throw new MembershipConflictException("Pending payment already exists");
        }

        LocalDateTime now = LocalDateTime.now();
        Membership membership = new Membership();
        membership.setMembershipId(UUID.randomUUID().toString());
        membership.setUser(user);
        membership.setPlan(plan);
        membership.setStatus(MembershipStatus.PENDING);
        membership.setAutoRenew(request.autoRenew == null || Boolean.TRUE.equals(request.autoRenew));
        membership.setCreatedAt(now);
        membership.setUpdatedAt(now);
        membership = membershipRepository.save(membership);

        Payment payment = new Payment();
        payment.setPaymentId(UUID.randomUUID().toString());
        payment.setMembership(membership);
        payment.setUser(user);
        payment.setPaymentReference(generatePaymentReference());
        payment.setAmount(plan.getStandardPrice());
        payment.setCurrency(plan.getCurrency());
        payment.setPaymentMethod(request.paymentMethod);
        payment.setPaymentRemark(request.paymentRemark);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(now);

        return mapPayment(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public PaymentResponse getCurrentPayment() {
        String userId = authorizationService.currentUserId();
        Payment payment = paymentRepository.findFirstByUserUserIdAndStatusOrderByCreatedAtDesc(userId, PaymentStatus.PENDING)
                .or(() -> paymentRepository.findFirstByUserUserIdOrderByCreatedAtDesc(userId))
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        return mapPayment(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentForCurrentUser(String paymentId) {
        String userId = authorizationService.currentUserId();
        return mapPayment(paymentRepository.findByPaymentIdAndUserUserId(paymentId, userId)
                .orElseThrow(() -> new NotFoundException("Payment not found")));
    }

    private String generatePaymentReference() {
        String reference;
        do {
            reference = PAYMENT_REFERENCE_PREFIX + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (paymentRepository.findByPaymentReference(reference).isPresent());
        return reference;
    }

    private PaymentResponse mapPayment(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.paymentId = payment.getPaymentId();
        response.membershipId = payment.getMembership().getMembershipId();
        response.paymentReference = payment.getPaymentReference();
        response.amount = payment.getAmount();
        response.currency = payment.getCurrency();
        response.paymentMethod = payment.getPaymentMethod();
        response.paymentRemark = payment.getPaymentRemark();
        response.status = payment.getStatus();
        response.paidAt = payment.getPaidAt();
        response.verifiedAt = payment.getVerifiedAt();
        response.createdAt = payment.getCreatedAt();
        return response;
    }

}

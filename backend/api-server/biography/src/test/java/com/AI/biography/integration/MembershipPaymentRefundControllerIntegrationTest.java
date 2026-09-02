package com.AI.biography.integration;

import com.AI.biography.auth.JwtService;
import com.AI.biography.membership.entity.Membership;
import com.AI.biography.membership.entity.MembershipPlan;
import com.AI.biography.membership.entity.Payment;
import com.AI.biography.membership.entity.Refund;
import com.AI.biography.membership.enums.MembershipStatus;
import com.AI.biography.membership.enums.PaymentMethod;
import com.AI.biography.membership.enums.PaymentStatus;
import com.AI.biography.membership.enums.RefundStatus;
import com.AI.biography.membership.enums.UserRole;
import com.AI.biography.membership.repository.MembershipPlanRepository;
import com.AI.biography.membership.repository.MembershipRepository;
import com.AI.biography.membership.repository.PaymentRepository;
import com.AI.biography.membership.repository.RefundRepository;
import com.AI.biography.user.User;
import com.AI.biography.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MembershipPaymentRefundControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void unauthenticatedAndInvalidJwtRequestsReturnUnauthorized() throws Exception {
        Fixture fixture = fixture();

        mockMvc.perform(get("/api/membership/current"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPaymentJson(fixture.plan().getPlanId())))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/payments"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(patch("/api/admin/payments/{paymentId}/confirm", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/membership/current")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer not-a-valid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void normalUserCannotAccessAdminEndpointsOrEscalateRoleWithHeaders() throws Exception {
        Fixture fixture = fixture();
        Payment payment = pendingPayment(fixture.userA(), fixture.plan());
        Refund refund = requestedRefund(confirmedPayment(fixture.userA(), fixture.plan(), LocalDateTime.now()), "user reason");

        mockMvc.perform(get("/api/admin/payments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/payments/{paymentId}", payment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken()))
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/admin/payments/{paymentId}/confirm", payment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken()))
                        .header("X-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/admin/payments/{paymentId}/reject", payment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/refunds")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/admin/refunds/{refundId}/approve", refund.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/admin/refunds/{refundId}/reject", refund.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/admin/refunds/{refundId}/complete", refund.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(completeRefundJson()))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/users/{userId}/membership", fixture.userB().getUserId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isForbidden());
    }

    @Test
    void paymentCreationUsesAuthenticatedUserAndBackendControlledValues() throws Exception {
        Fixture fixture = fixture();

        MvcResult result = mockMvc.perform(post("/api/payments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "planId": "%s",
                                  "paymentMethod": "WECHAT",
                                  "paymentRemark": "wechat-name",
                                  "autoRenew": false,
                                  "userId": "%s",
                                  "amount": 1,
                                  "currency": "USD",
                                  "status": "CONFIRMED",
                                  "paymentReference": "HACKED"
                                }
                                """.formatted(fixture.plan().getPlanId(), fixture.userB().getUserId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.amount").value(360.00))
                .andExpect(jsonPath("$.currency").value("CNY"))
                .andExpect(jsonPath("$.paymentReference").isNotEmpty())
                .andReturn();

        String paymentId = read(result).get("paymentId").asText();
        Payment payment = payment(paymentId);
        assertThat(payment.getUser().getUserId()).isEqualTo(fixture.userA().getUserId());
        assertThat(payment.getAmount()).isEqualByComparingTo(fixture.plan().getStandardPrice());
        assertThat(payment.getCurrency()).isEqualTo(fixture.plan().getCurrency());
        assertThat(payment.getPaymentReference()).isNotEqualTo("HACKED");
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(payment.getMembership().getStatus()).isEqualTo(MembershipStatus.PENDING);

        mockMvc.perform(post("/api/payments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPaymentJson(fixture.plan().getPlanId())))
                .andExpect(status().isConflict());
    }

    @Test
    void usersCanReadOnlyTheirOwnPaymentAndRefundResources() throws Exception {
        Fixture fixture = fixture();
        Payment userAPayment = confirmedPayment(fixture.userA(), fixture.plan(), LocalDateTime.now());
        Refund userARefund = requestedRefund(userAPayment, "original user reason");

        mockMvc.perform(get("/api/payments/{paymentId}", userAPayment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(userAPayment.getPaymentId()));
        mockMvc.perform(get("/api/refunds/{refundId}", userARefund.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.refundId").value(userARefund.getRefundId()));

        mockMvc.perform(get("/api/payments/{paymentId}", userAPayment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userBToken())))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/refunds/{refundId}", userARefund.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userBToken())))
                .andExpect(status().isNotFound());
    }

    @Test
    void confirmingPaymentActivatesMembershipAndInvalidConfirmTransitionsConflict() throws Exception {
        Fixture fixture = fixture();
        Payment pending = pendingPayment(fixture.userA(), fixture.plan());
        LocalDateTime paidAt = LocalDateTime.now().minusHours(2);

        mockMvc.perform(patch("/api/admin/payments/{paymentId}/confirm", pending.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paidAt\":\"" + paidAt.truncatedTo(ChronoUnit.SECONDS) + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        Payment confirmed = payment(pending.getPaymentId());
        Membership membership = confirmed.getMembership();
        assertThat(confirmed.getStatus()).isEqualTo(PaymentStatus.CONFIRMED);
        assertThat(confirmed.getVerifiedBy().getUserId()).isEqualTo(fixture.admin().getUserId());
        assertThat(confirmed.getVerifiedAt()).isNotNull();
        assertThat(membership.getStatus()).isEqualTo(MembershipStatus.ACTIVE);
        assertThat(membership.getStartAt()).isNotNull();
        assertThat(membership.getExpiresAt()).isEqualTo(membership.getStartAt().plusMonths(fixture.plan().getDurationMonths()));

        mockMvc.perform(patch("/api/admin/payments/{paymentId}/confirm", confirmed.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isConflict());
        assertConfirmConflict(fixture, rejectedPayment(fixture.userB(), fixture.plan()));
        Payment refunded = confirmedPayment(fixture.userB(), fixture.plan(), LocalDateTime.now());
        refunded.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.saveAndFlush(refunded);
        assertConfirmConflict(fixture, refunded);
    }

    @Test
    void rejectingPaymentRejectsPendingPaymentWithoutActivatingMembershipAndInvalidRejectionsConflict() throws Exception {
        Fixture fixture = fixture();
        Payment pending = pendingPayment(fixture.userA(), fixture.plan());

        mockMvc.perform(patch("/api/admin/payments/{paymentId}/reject", pending.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"ignored\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        Payment rejected = payment(pending.getPaymentId());
        assertThat(rejected.getStatus()).isEqualTo(PaymentStatus.REJECTED);
        assertThat(rejected.getMembership().getStatus()).isEqualTo(MembershipStatus.CANCELLED);

        mockMvc.perform(patch("/api/admin/payments/{paymentId}/reject", rejected.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isConflict());
        assertRejectConflict(fixture, confirmedPayment(fixture.userB(), fixture.plan(), LocalDateTime.now()));
    }

    @Test
    void currentMembershipReturnsNoContentWithoutValidActiveMembershipAndOkAfterConfirmation() throws Exception {
        Fixture fixture = fixture();

        mockMvc.perform(get("/api/membership/current")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isNoContent());

        activeMembership(fixture.userA(), fixture.plan(), LocalDateTime.now().minusMonths(2), LocalDateTime.now().minusDays(1));
        mockMvc.perform(get("/api/membership/current")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isNoContent());

        Payment payment = pendingPayment(fixture.userB(), fixture.plan());
        mockMvc.perform(patch("/api/admin/payments/{paymentId}/confirm", payment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/membership/current")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userBToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void membershipPlansAndAdminListingsReturnExpectedResources() throws Exception {
        Fixture fixture = fixture();
        Payment payment = pendingPayment(fixture.userA(), fixture.plan());
        Refund refund = requestedRefund(confirmedPayment(fixture.userB(), fixture.plan(), LocalDateTime.now()), "reason");

        mockMvc.perform(get("/api/membership/plans")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plans[*].planId").value(hasItem(fixture.plan().getPlanId())));
        mockMvc.perform(get("/api/payments/current")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(payment.getPaymentId()));
        mockMvc.perform(get("/api/admin/payments?status=PENDING")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].paymentId").value(hasItem(payment.getPaymentId())));
        mockMvc.perform(get("/api/admin/payments/{paymentId}", payment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(payment.getPaymentId()));
        mockMvc.perform(get("/api/admin/refunds?status=REQUESTED")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].refundId").value(hasItem(refund.getRefundId())));
        mockMvc.perform(get("/api/admin/refunds/{refundId}", refund.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.refundId").value(refund.getRefundId()));
    }

    @Test
    void refundRequestUsesOriginalPaymentValuesAndRejectsInvalidRequests() throws Exception {
        Fixture fixture = fixture();
        Payment confirmed = confirmedPayment(fixture.userA(), fixture.plan(), LocalDateTime.now());

        MvcResult result = mockMvc.perform(post("/api/refunds")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "paymentId": "%s",
                                  "reason": "I no longer want the service",
                                  "amount": 1,
                                  "currency": "USD",
                                  "status": "COMPLETED"
                                }
                                """.formatted(confirmed.getPaymentId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REQUESTED"))
                .andExpect(jsonPath("$.amount").value(360.00))
                .andExpect(jsonPath("$.currency").value("CNY"))
                .andExpect(jsonPath("$.reason").value("I no longer want the service"))
                .andReturn();

        Refund refund = refund(read(result).get("refundId").asText());
        assertThat(refund.getAmount()).isEqualByComparingTo(confirmed.getAmount());
        assertThat(refund.getCurrency()).isEqualTo(confirmed.getCurrency());
        assertThat(refund.getReason()).isEqualTo("I no longer want the service");

        mockMvc.perform(post("/api/refunds")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userAToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRefundJson(confirmed.getPaymentId(), "duplicate")))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/api/refunds")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userBToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRefundJson(confirmed.getPaymentId(), "wrong user")))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/refunds")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userBToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRefundJson(pendingPayment(fixture.userB(), fixture.plan()).getPaymentId(), "pending")))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/api/refunds")
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.userBToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRefundJson(confirmedPayment(fixture.userB(), fixture.plan(), LocalDateTime.now().minusDays(8)).getPaymentId(), "late")))
                .andExpect(status().isConflict());
    }

    @Test
    void adminRefundApprovalRejectionAndInvalidTransitionsAreEnforced() throws Exception {
        Fixture fixture = fixture();
        Refund approveMe = requestedRefund(confirmedPayment(fixture.userA(), fixture.plan(), LocalDateTime.now()), "approve reason");
        Refund rejectMe = requestedRefund(confirmedPayment(fixture.userB(), fixture.plan(), LocalDateTime.now()), "original user reason");

        mockMvc.perform(patch("/api/admin/refunds/{refundId}/approve", approveMe.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(patch("/api/admin/refunds/{refundId}/reject", rejectMe.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"admin rejection should not be used\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.reason").value("original user reason"));

        assertThat(refund(rejectMe.getRefundId()).getReason()).isEqualTo("original user reason");
        mockMvc.perform(patch("/api/admin/refunds/{refundId}/approve", rejectMe.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isConflict());
        mockMvc.perform(patch("/api/admin/refunds/{refundId}/complete", rejectMe.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(completeRefundJson()))
                .andExpect(status().isConflict());

        Refund requested = requestedRefund(confirmedPayment(fixture.userA(), inactivePlan(), LocalDateTime.now()), "requested");
        mockMvc.perform(patch("/api/admin/refunds/{refundId}/complete", requested.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(completeRefundJson()))
                .andExpect(status().isConflict());
    }

    @Test
    void completingRefundUpdatesRefundPaymentAndOnlyAssociatedMembership() throws Exception {
        Fixture fixture = fixture();
        Payment oldPayment = confirmedPayment(fixture.userA(), fixture.plan(), LocalDateTime.now());
        Membership newerMembership = activeMembership(fixture.userA(), fixture.plan(), LocalDateTime.now().plusDays(1), LocalDateTime.now().plusMonths(13));
        Refund refund = requestedRefund(oldPayment, "original reason");

        mockMvc.perform(patch("/api/admin/refunds/{refundId}/approve", refund.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/admin/refunds/{refundId}/complete", refund.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(completeRefundJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.refundMethod").value("WECHAT"))
                .andExpect(jsonPath("$.externalRefundReference").value("TEST-REFUND-001"));

        Refund completed = refund(refund.getRefundId());
        Payment refundedPayment = payment(oldPayment.getPaymentId());
        Membership cancelledMembership = membership(oldPayment.getMembership().getMembershipId());
        Membership untouchedMembership = membership(newerMembership.getMembershipId());
        assertThat(completed.getStatus()).isEqualTo(RefundStatus.COMPLETED);
        assertThat(completed.getProcessedBy().getUserId()).isEqualTo(fixture.admin().getUserId());
        assertThat(completed.getProcessedAt()).isNotNull();
        assertThat(refundedPayment.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        assertThat(cancelledMembership.getStatus()).isEqualTo(MembershipStatus.CANCELLED);
        assertThat(untouchedMembership.getStatus()).isEqualTo(MembershipStatus.ACTIVE);

        mockMvc.perform(patch("/api/admin/refunds/{refundId}/complete", completed.getRefundId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(completeRefundJson()))
                .andExpect(status().isConflict());
    }

    @Test
    void adminMembershipLookupReturnsCurrentMembershipOrNoContent() throws Exception {
        Fixture fixture = fixture();
        activeMembership(fixture.userA(), fixture.plan(), LocalDateTime.now().minusDays(1), LocalDateTime.now().plusMonths(12));

        mockMvc.perform(get("/api/admin/users/{userId}/membership", fixture.userA().getUserId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
        mockMvc.perform(get("/api/admin/users/{userId}/membership", UUID.randomUUID().toString())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isNoContent());
    }

    private void assertConfirmConflict(Fixture fixture, Payment payment) throws Exception {
        mockMvc.perform(patch("/api/admin/payments/{paymentId}/confirm", payment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isConflict());
    }

    private void assertRejectConflict(Fixture fixture, Payment payment) throws Exception {
        mockMvc.perform(patch("/api/admin/payments/{paymentId}/reject", payment.getPaymentId())
                        .header(HttpHeaders.AUTHORIZATION, bearer(fixture.adminToken())))
                .andExpect(status().isConflict());
    }

    private Fixture fixture() {
        User userA = user(UserRole.USER);
        User userB = user(UserRole.USER);
        User admin = user(UserRole.ADMIN);
        MembershipPlan plan = activePlan();
        return new Fixture(userA, userB, admin, jwtService.generateToken(userA), jwtService.generateToken(userB),
                jwtService.generateToken(admin), plan);
    }

    private User user(UserRole role) {
        User user = userRepository.saveAndFlush(TestDataFactory.user());
        jdbcTemplate.update("update users set role = ? where user_id = ?", role.name(), user.getUserId());
        entityManager.clear();
        return userRepository.findById(user.getUserId()).orElseThrow();
    }

    private MembershipPlan activePlan() {
        MembershipPlan plan = new MembershipPlan();
        plan.setPlanId(UUID.randomUUID().toString());
        plan.setName("DIY Membership");
        plan.setStandardPrice(new BigDecimal("360.00"));
        plan.setCurrency("CNY");
        plan.setDurationMonths(12);
        plan.setRefundWindowDays(7);
        plan.setActive(true);
        return planRepository.saveAndFlush(plan);
    }

    private MembershipPlan inactivePlan() {
        MembershipPlan plan = activePlan();
        plan.setActive(false);
        return planRepository.saveAndFlush(plan);
    }

    private Payment pendingPayment(User user, MembershipPlan plan) {
        Membership membership = membership(user, plan, MembershipStatus.PENDING, null, null);
        Payment payment = payment(user, membership, PaymentStatus.PENDING, null);
        return paymentRepository.saveAndFlush(payment);
    }

    private Payment rejectedPayment(User user, MembershipPlan plan) {
        Membership membership = membership(user, plan, MembershipStatus.CANCELLED, null, null);
        Payment payment = payment(user, membership, PaymentStatus.REJECTED, null);
        payment.setVerifiedAt(LocalDateTime.now());
        return paymentRepository.saveAndFlush(payment);
    }

    private Payment confirmedPayment(User user, MembershipPlan plan, LocalDateTime paidAt) {
        LocalDateTime start = LocalDateTime.now().minusHours(1);
        Membership membership = membership(user, plan, MembershipStatus.ACTIVE, start, start.plusMonths(plan.getDurationMonths()));
        Payment payment = payment(user, membership, PaymentStatus.CONFIRMED, paidAt);
        return paymentRepository.saveAndFlush(payment);
    }

    private Membership activeMembership(User user, MembershipPlan plan, LocalDateTime startAt, LocalDateTime expiresAt) {
        return membership(user, plan, MembershipStatus.ACTIVE, startAt, expiresAt);
    }

    private Membership membership(User user,
                                  MembershipPlan plan,
                                  MembershipStatus status,
                                  LocalDateTime startAt,
                                  LocalDateTime expiresAt) {
        Membership membership = new Membership();
        membership.setMembershipId(UUID.randomUUID().toString());
        membership.setUser(user);
        membership.setPlan(plan);
        membership.setStatus(status);
        membership.setStartAt(startAt);
        membership.setExpiresAt(expiresAt);
        membership.setAutoRenew(true);
        return membershipRepository.saveAndFlush(membership);
    }

    private Payment payment(User user, Membership membership, PaymentStatus status, LocalDateTime paidAt) {
        Payment payment = new Payment();
        payment.setPaymentId(UUID.randomUUID().toString());
        payment.setMembership(membership);
        payment.setUser(user);
        payment.setPaymentReference("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setAmount(membership.getPlan().getStandardPrice());
        payment.setCurrency(membership.getPlan().getCurrency());
        payment.setPaymentMethod(PaymentMethod.WECHAT);
        payment.setPaymentRemark("wechat-name");
        payment.setStatus(status);
        payment.setPaidAt(paidAt);
        return payment;
    }

    private Refund requestedRefund(Payment payment, String reason) {
        Refund refund = new Refund();
        refund.setRefundId(UUID.randomUUID().toString());
        refund.setPayment(payment);
        refund.setAmount(payment.getAmount());
        refund.setCurrency(payment.getCurrency());
        refund.setReason(reason);
        refund.setStatus(RefundStatus.REQUESTED);
        refund.setRequestedAt(LocalDateTime.now());
        return refundRepository.saveAndFlush(refund);
    }

    private Payment payment(String paymentId) {
        entityManager.flush();
        entityManager.clear();
        return paymentRepository.findById(paymentId).orElseThrow();
    }

    private Refund refund(String refundId) {
        entityManager.flush();
        entityManager.clear();
        return refundRepository.findById(refundId).orElseThrow();
    }

    private Membership membership(String membershipId) {
        entityManager.flush();
        entityManager.clear();
        return membershipRepository.findById(membershipId).orElseThrow();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String createPaymentJson(String planId) {
        return """
                {
                  "planId": "%s",
                  "paymentMethod": "WECHAT",
                  "paymentRemark": "wechat-name",
                  "autoRenew": true
                }
                """.formatted(planId);
    }

    private String createRefundJson(String paymentId, String reason) {
        return """
                {
                  "paymentId": "%s",
                  "reason": "%s"
                }
                """.formatted(paymentId, reason);
    }

    private String completeRefundJson() {
        return """
                {
                  "refundMethod": "WECHAT",
                  "externalRefundReference": "TEST-REFUND-001"
                }
                """;
    }

    private JsonNode read(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private record Fixture(User userA,
                           User userB,
                           User admin,
                           String userAToken,
                           String userBToken,
                           String adminToken,
                           MembershipPlan plan) {
    }
}

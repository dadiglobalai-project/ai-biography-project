package com.AI.biography.membership.controller;

import com.AI.biography.membership.dto.request.ConfirmPaymentRequest;
import com.AI.biography.membership.dto.response.AdminPaymentResponse;
import com.AI.biography.membership.enums.PaymentStatus;
import com.AI.biography.membership.service.AdminPaymentService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {
    private final AdminPaymentService adminPaymentService;

    public AdminPaymentController(AdminPaymentService adminPaymentService) {
        this.adminPaymentService = adminPaymentService;
    }

    @GetMapping
    public List<AdminPaymentResponse> getPayments(@RequestParam(required = false) PaymentStatus status) {
        return adminPaymentService.getPayments(status);
    }

    @GetMapping("/{paymentId}")
    public AdminPaymentResponse getPayment(@PathVariable String paymentId) {
        return adminPaymentService.getPaymentDetails(paymentId);
    }

    @PatchMapping("/{paymentId}/confirm")
    public AdminPaymentResponse confirmPayment(@PathVariable String paymentId,
                                               @RequestBody(required = false) ConfirmPaymentRequest request) {
        return adminPaymentService.confirmPayment(paymentId, request);
    }

    @PatchMapping("/{paymentId}/reject")
    public AdminPaymentResponse rejectPayment(@PathVariable String paymentId) {
        return adminPaymentService.rejectPayment(paymentId);
    }
}

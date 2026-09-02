package com.AI.biography.membership.controller;

import com.AI.biography.membership.dto.request.CompleteRefundRequest;
import com.AI.biography.membership.dto.response.AdminRefundResponse;
import com.AI.biography.membership.enums.RefundStatus;
import com.AI.biography.membership.service.AdminRefundService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/refunds")
@CrossOrigin(origins = "*")
public class AdminRefundController {
    private final AdminRefundService adminRefundService;

    public AdminRefundController(AdminRefundService adminRefundService) {
        this.adminRefundService = adminRefundService;
    }

    @GetMapping
    public List<AdminRefundResponse> getRefunds(@RequestParam(required = false) RefundStatus status) {
        return adminRefundService.getRefunds(status);
    }

    @GetMapping("/{refundId}")
    public AdminRefundResponse getRefund(@PathVariable String refundId) {
        return adminRefundService.getRefundDetails(refundId);
    }

    @PatchMapping("/{refundId}/approve")
    public AdminRefundResponse approveRefund(@PathVariable String refundId) {
        return adminRefundService.approveRefund(refundId);
    }

    @PatchMapping("/{refundId}/reject")
    public AdminRefundResponse rejectRefund(@PathVariable String refundId) {
        return adminRefundService.rejectRefund(refundId);
    }

    @PatchMapping("/{refundId}/complete")
    public AdminRefundResponse completeRefund(@PathVariable String refundId,
                                              @Valid @RequestBody CompleteRefundRequest request) {
        return adminRefundService.completeRefund(refundId, request);
    }
}

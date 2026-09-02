package com.AI.biography.membership.controller;

import com.AI.biography.membership.dto.request.CreateRefundRequest;
import com.AI.biography.membership.dto.response.RefundResponse;
import com.AI.biography.membership.service.RefundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/refunds")
@CrossOrigin(origins = "*")
public class RefundController {
    private final RefundService refundService;

    public RefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    @PostMapping
    public ResponseEntity<RefundResponse> requestRefund(@Valid @RequestBody CreateRefundRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(refundService.requestRefund(request));
    }

    @GetMapping("/{refundId}")
    public RefundResponse getRefund(@PathVariable String refundId) {
        return refundService.getRefundForCurrentUser(refundId);
    }
}

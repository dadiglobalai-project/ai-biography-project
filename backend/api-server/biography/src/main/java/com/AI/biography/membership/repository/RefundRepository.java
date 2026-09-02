package com.AI.biography.membership.repository;

import com.AI.biography.membership.entity.Refund;
import com.AI.biography.membership.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, String> {
    Optional<Refund> findByPaymentPaymentId(String paymentId);

    boolean existsByPaymentPaymentId(String paymentId);

    Optional<Refund> findByRefundIdAndPaymentUserUserId(String refundId, String userId);

    List<Refund> findAllByOrderByRequestedAtDesc();

    List<Refund> findByStatusOrderByRequestedAtDesc(RefundStatus status);
}

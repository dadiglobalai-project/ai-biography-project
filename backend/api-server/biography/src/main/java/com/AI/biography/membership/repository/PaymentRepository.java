package com.AI.biography.membership.repository;

import com.AI.biography.membership.entity.Payment;
import com.AI.biography.membership.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    Optional<Payment> findByPaymentReference(String paymentReference);

    List<Payment> findByUserUserIdOrderByCreatedAtDesc(String userId);

    Optional<Payment> findFirstByUserUserIdOrderByCreatedAtDesc(String userId);

    Optional<Payment> findFirstByUserUserIdAndStatusOrderByCreatedAtDesc(
            String userId,
            PaymentStatus status
    );

    boolean existsByUserUserIdAndStatus(String userId, PaymentStatus status);

    List<Payment> findAllByOrderByCreatedAtDesc();

    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

    Optional<Payment> findByPaymentIdAndUserUserId(String paymentId, String userId);
}

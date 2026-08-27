package com.AI.biography.membership.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "membership_plans")
public class MembershipPlan {
    @Id
    @Column(name = "plan_id", columnDefinition = "CHAR(36)", length = 36)
    private String planId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "standard_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal standardPrice;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Column(name = "refund_window_days", nullable = false)
    private Integer refundWindowDays;

    @Column(name = "is_active", nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public String getPlanId() {
        return planId;
    }

    public void setPlanId(String planId) {
        this.planId = planId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getStandardPrice() {
        return standardPrice;
    }

    public void setStandardPrice(BigDecimal standardPrice) {
        this.standardPrice = standardPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Integer getDurationMonths() {
        return durationMonths;
    }

    public void setDurationMonths(Integer durationMonths) {
        this.durationMonths = durationMonths;
    }

    public Integer getRefundWindowDays() {
        return refundWindowDays;
    }

    public void setRefundWindowDays(Integer refundWindowDays) {
        this.refundWindowDays = refundWindowDays;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

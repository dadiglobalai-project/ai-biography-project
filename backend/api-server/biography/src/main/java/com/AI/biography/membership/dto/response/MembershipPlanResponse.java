package com.AI.biography.membership.dto.response;

import java.math.BigDecimal;

public class MembershipPlanResponse {
    public String planId;
    public String name;
    public BigDecimal standardPrice;
    public String currency;
    public Integer durationMonths;
    public Integer refundWindowDays;
    public Boolean active;
}

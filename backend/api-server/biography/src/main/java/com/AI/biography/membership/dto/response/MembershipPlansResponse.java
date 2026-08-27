package com.AI.biography.membership.dto.response;

import java.util.List;

public class MembershipPlansResponse {
    public List<MembershipPlanResponse> plans;
    public int totalPlans;

    public MembershipPlansResponse() {
    }

    public MembershipPlansResponse(List<MembershipPlanResponse> plans) {
        this.plans = plans;
        this.totalPlans = plans.size();
    }
}

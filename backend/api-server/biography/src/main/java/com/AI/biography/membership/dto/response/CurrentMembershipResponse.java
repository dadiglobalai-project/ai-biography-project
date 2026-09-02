package com.AI.biography.membership.dto.response;

import com.AI.biography.membership.enums.MembershipStatus;
import java.time.LocalDateTime;

public class CurrentMembershipResponse {
    public String membershipId;
    public String planId;
    public String planName;
    public MembershipStatus status;
    public LocalDateTime startAt;
    public LocalDateTime expiresAt;
    public Boolean autoRenew;
    public Boolean active;
}

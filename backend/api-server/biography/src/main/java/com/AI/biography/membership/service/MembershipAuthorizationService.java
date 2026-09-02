package com.AI.biography.membership.service;

import com.AI.biography.membership.enums.UserRole;
import com.AI.biography.membership.exception.MembershipForbiddenException;
import com.AI.biography.membership.exception.MembershipUnauthorizedException;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.user.User;
import com.AI.biography.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class MembershipAuthorizationService {
    private final UserRepository userRepository;

    public MembershipAuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String currentUserId() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            throw new MembershipUnauthorizedException("Unauthorized request");
        }
        HttpServletRequest request = attributes.getRequest();
        Object userId = request.getAttribute("userId");
        if (!(userId instanceof String value) || !StringUtils.hasText(value)) {
            throw new MembershipUnauthorizedException("Unauthorized request");
        }
        return value;
    }

    public User currentUser() {
        return userRepository.findById(currentUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public User requireAdmin() {
        User user = currentUser();

        if (user.getRole() != UserRole.ADMIN
                && user.getRole() != UserRole.SUPER_ADMIN) {
            throw new MembershipForbiddenException("Admin access required");
        }
        return user;
    }
}

package com.AI.biography.dashboard;

import com.AI.biography.dashboard.dto.DashboardResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboard(HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        return dashboardService.getDashboard(userId);
    }
} 

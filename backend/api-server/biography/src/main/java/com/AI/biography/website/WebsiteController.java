package com.AI.biography.website;

import com.AI.biography.website.dto.CreateWebsiteRequest;
import com.AI.biography.website.dto.WebsiteResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/websites")
public class WebsiteController {

    private final WebsiteService websiteService;

    public WebsiteController(WebsiteService websiteService) {
        this.websiteService = websiteService;
    }

    @PostMapping
    public WebsiteResponse createWebsite(
            @Valid @RequestBody CreateWebsiteRequest request,
            HttpServletRequest httpRequest) {

        String userId = (String) httpRequest.getAttribute("userId");

        return websiteService.createWebsite(userId, request);
    }

    @GetMapping
    public List<WebsiteResponse> getUserWebsites(HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        return websiteService.getUserWebsites(userId);
    }

    @GetMapping("/{websiteId}")
    public WebsiteResponse getWebsiteById(
            @PathVariable String websiteId,
            HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        return websiteService.getWebsiteById(userId, websiteId);
    }
}

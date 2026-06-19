package com.AI.biography.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public String hello(HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        String email = (String) request.getAttribute("email");

        return "JWT is working!\n"
                + "User ID: " + userId + "\n"
                + "Email: " + email;
    }
} 
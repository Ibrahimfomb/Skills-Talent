package com.skillset.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private boolean onboardingCompleted;
}

package com.cms.dto;

import lombok.*;

/**
 * Auth Response DTO - JWT authentication response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private long expiresIn;
    private String userId;
    private String name;
    private String email;
    private String role;
}

package com.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Status Update Request DTO - For updating complaint status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String notes;
}

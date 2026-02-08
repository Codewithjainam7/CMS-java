package com.cms.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Complaint DTO - Data Transfer Object for complaint data.
 * Used for API responses to avoid exposing entity internals.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDTO {
    private String id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String sentiment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime slaDeadline;
    private String customerId;
    private String customerName;
    private String assignedStaffId;
    private String assignedStaffName;
}

package com.cms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Comment Entity - Represents communication on a complaint.
 * 
 * Supports both customer-visible and internal (staff-only) comments.
 * Used for tracking all communication related to complaint resolution.
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Entity
@Table(name = "comments", indexes = {
    @Index(name = "idx_comment_complaint", columnList = "complaint_id"),
    @Index(name = "idx_comment_created", columnList = "created_at")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @NotBlank(message = "Comment content is required")
    @Size(min = 1, max = 2000, message = "Comment must be between 1 and 2000 characters")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Internal comments are only visible to ADMIN and STAFF users.
     * Customer users cannot see internal notes.
     */
    @Column(name = "is_internal", nullable = false)
    private boolean internal = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

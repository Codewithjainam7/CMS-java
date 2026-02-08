package com.cms.service;

import com.cms.dto.ComplaintDTO;
import com.cms.dto.ComplaintRequest;
import com.cms.model.Complaint;
import com.cms.model.Complaint.*;
import com.cms.model.User;
import com.cms.repository.ComplaintRepository;
import com.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Complaint Service - Core business logic for complaint management.
 * 
 * Handles complaint lifecycle, status transitions, assignment,
 * and integrates with other services (Sentiment, SLA, Gamification).
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final SentimentAnalysisService sentimentService;
    private final SLAService slaService;
    private final GamificationService gamificationService;

    /**
     * Create a new complaint from customer request.
     * Automatically analyzes sentiment and calculates SLA deadline.
     */
    public ComplaintDTO create(ComplaintRequest request, String customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Analyze sentiment from description
        Sentiment sentiment = sentimentService.analyzeSentiment(request.getDescription());

        // Calculate SLA based on priority
        LocalDateTime slaDeadline = slaService.calculateSLADeadline(request.getPriority());

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(ComplaintStatus.NEW)
                .sentiment(sentiment)
                .slaDeadline(slaDeadline)
                .customer(customer)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        log.info("Created complaint {} with priority {} and SLA {}",
                saved.getId(), saved.getPriority(), saved.getSlaDeadline());

        return mapToDTO(saved);
    }

    /**
     * Get paginated list of all complaints with optional status filter.
     */
    @Transactional(readOnly = true)
    public Page<ComplaintDTO> findAll(int page, String status) {
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());

        Page<Complaint> complaints;
        if (status != null && !status.isEmpty()) {
            complaints = complaintRepository.findByStatus(
                    ComplaintStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            complaints = complaintRepository.findAll(pageable);
        }

        return complaints.map(this::mapToDTO);
    }

    /**
     * Get single complaint by ID.
     */
    @Transactional(readOnly = true)
    public ComplaintDTO findById(String id) {
        return complaintRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + id));
    }

    /**
     * Get all complaints for a specific customer.
     */
    @Transactional(readOnly = true)
    public Page<ComplaintDTO> findByCustomer(String customerId, int page) {
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());
        return complaintRepository.findByCustomerId(customerId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Assign complaint to a staff member.
     */
    public ComplaintDTO assignToStaff(String complaintId, String staffId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (staff.getRole() != User.UserRole.STAFF && staff.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("User is not a staff member");
        }

        complaint.setAssignedStaff(staff);
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        Complaint saved = complaintRepository.save(complaint);
        log.info("Assigned complaint {} to staff {}", complaintId, staffId);

        return mapToDTO(saved);
    }

    /**
     * Update complaint status with proper state transitions.
     * Awards gamification points on resolution.
     */
    public ComplaintDTO updateStatus(String complaintId, ComplaintStatus newStatus) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        validateStatusTransition(oldStatus, newStatus);

        complaint.setStatus(newStatus);

        // Award points if resolved
        if (newStatus == ComplaintStatus.RESOLVED && complaint.getAssignedStaff() != null) {
            boolean withinSLA = LocalDateTime.now().isBefore(complaint.getSlaDeadline());
            gamificationService.awardPointsForResolution(
                    complaint.getAssignedStaff().getId(),
                    withinSLA,
                    complaint.getPriority());
        }

        Complaint saved = complaintRepository.save(complaint);
        log.info("Updated complaint {} status from {} to {}", complaintId, oldStatus, newStatus);

        return mapToDTO(saved);
    }

    /**
     * Get dashboard statistics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Status counts
        List<Object[]> statusCounts = complaintRepository.countByStatus();
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            byStatus.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("byStatus", byStatus);

        // Priority counts
        List<Object[]> priorityCounts = complaintRepository.countByPriority();
        Map<String, Long> byPriority = new HashMap<>();
        for (Object[] row : priorityCounts) {
            byPriority.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("byPriority", byPriority);

        // SLA stats
        stats.put("slaBreached", complaintRepository.findBreachedSLAComplaints(LocalDateTime.now()).size());
        stats.put("slaNearBreach", complaintRepository.findComplaintsNearingSLA(
                LocalDateTime.now(), LocalDateTime.now().plusHours(2)).size());

        // Resolution metrics
        stats.put("avgResolutionHours", complaintRepository.getAverageResolutionTimeHours());
        stats.put("totalComplaints", complaintRepository.count());

        return stats;
    }

    /**
     * Search complaints by keyword.
     */
    @Transactional(readOnly = true)
    public Page<ComplaintDTO> search(String keyword, int page) {
        Pageable pageable = PageRequest.of(page, 20);
        return complaintRepository.searchByKeyword(keyword, pageable)
                .map(this::mapToDTO);
    }

    // Validate status transitions
    private void validateStatusTransition(ComplaintStatus from, ComplaintStatus to) {
        Map<ComplaintStatus, Set<ComplaintStatus>> validTransitions = Map.of(
                ComplaintStatus.NEW, Set.of(ComplaintStatus.ASSIGNED, ComplaintStatus.CLOSED),
                ComplaintStatus.ASSIGNED,
                Set.of(ComplaintStatus.IN_PROGRESS, ComplaintStatus.ESCALATED, ComplaintStatus.CLOSED),
                ComplaintStatus.IN_PROGRESS, Set.of(ComplaintStatus.RESOLVED, ComplaintStatus.ESCALATED),
                ComplaintStatus.ESCALATED, Set.of(ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED),
                ComplaintStatus.RESOLVED, Set.of(ComplaintStatus.CLOSED),
                ComplaintStatus.CLOSED, Set.of());

        if (!validTransitions.getOrDefault(from, Set.of()).contains(to)) {
            throw new RuntimeException("Invalid status transition from " + from + " to " + to);
        }
    }

    // Map entity to DTO
    private ComplaintDTO mapToDTO(Complaint complaint) {
        return ComplaintDTO.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory().name())
                .priority(complaint.getPriority().name())
                .status(complaint.getStatus().name())
                .sentiment(complaint.getSentiment().name())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .slaDeadline(complaint.getSlaDeadline())
                .customerId(complaint.getCustomer().getId())
                .customerName(complaint.getCustomer().getName())
                .assignedStaffId(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getId() : null)
                .assignedStaffName(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getName() : null)
                .build();
    }
}

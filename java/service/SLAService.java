package com.cms.service;

import com.cms.model.Complaint;
import com.cms.model.Complaint.*;
import com.cms.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * SLA Service - Service Level Agreement monitoring and enforcement.
 * 
 * Calculates SLA deadlines based on priority, monitors for breaches,
 * handles escalations, and sends notifications.
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SLAService {

    private final ComplaintRepository complaintRepository;
    private final NotificationService notificationService;

    // SLA deadlines by priority (in hours)
    private static final int SLA_CRITICAL = 2; // 2 hours
    private static final int SLA_HIGH = 24; // 24 hours (1 day)
    private static final int SLA_MEDIUM = 72; // 72 hours (3 days)
    private static final int SLA_LOW = 168; // 168 hours (7 days)

    // Warning threshold (percentage of SLA time before warning)
    private static final double WARNING_THRESHOLD = 0.75;

    /**
     * Calculate SLA deadline based on complaint priority.
     */
    public LocalDateTime calculateSLADeadline(Priority priority) {
        int hours = switch (priority) {
            case CRITICAL -> SLA_CRITICAL;
            case HIGH -> SLA_HIGH;
            case MEDIUM -> SLA_MEDIUM;
            case LOW -> SLA_LOW;
        };

        LocalDateTime deadline = LocalDateTime.now().plusHours(hours);
        log.debug("Calculated SLA deadline for {} priority: {}", priority, deadline);
        return deadline;
    }

    /**
     * Check if a complaint's SLA is near breach.
     */
    public boolean isSLANearBreach(Complaint complaint) {
        if (isTerminalStatus(complaint.getStatus())) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = complaint.getSlaDeadline();
        LocalDateTime createdAt = complaint.getCreatedAt();

        // Calculate total SLA duration and elapsed time
        long totalMinutes = Duration.between(createdAt, deadline).toMinutes();
        long elapsedMinutes = Duration.between(createdAt, now).toMinutes();

        double percentageElapsed = (double) elapsedMinutes / totalMinutes;

        return percentageElapsed >= WARNING_THRESHOLD && now.isBefore(deadline);
    }

    /**
     * Check if a complaint's SLA has been breached.
     */
    public boolean isSLABreached(Complaint complaint) {
        if (isTerminalStatus(complaint.getStatus())) {
            return false;
        }
        return LocalDateTime.now().isAfter(complaint.getSlaDeadline());
    }

    /**
     * Get remaining time until SLA breach.
     */
    public Duration getTimeUntilBreach(Complaint complaint) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = complaint.getSlaDeadline();

        if (now.isAfter(deadline)) {
            return Duration.ZERO;
        }

        return Duration.between(now, deadline);
    }

    /**
     * Scheduled task to check SLA deadlines every 5 minutes.
     * Identifies near-breach and breached complaints for escalation.
     */
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void checkSLADeadlines() {
        log.info("Running SLA deadline check...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningWindow = now.plusHours(2);

        // Find complaints nearing SLA breach
        List<Complaint> nearingBreach = complaintRepository.findComplaintsNearingSLA(now, warningWindow);
        for (Complaint complaint : nearingBreach) {
            handleNearingBreach(complaint);
        }

        // Find complaints that have breached SLA
        List<Complaint> breached = complaintRepository.findBreachedSLAComplaints(now);
        for (Complaint complaint : breached) {
            handleSLABreach(complaint);
        }

        log.info("SLA check complete. {} nearing breach, {} breached.",
                nearingBreach.size(), breached.size());
    }

    /**
     * Handle a complaint nearing SLA breach.
     */
    private void handleNearingBreach(Complaint complaint) {
        Duration remaining = getTimeUntilBreach(complaint);

        // Send warning notification
        String message = String.format(
                "SLA Warning: Complaint %s has only %d minutes remaining before breach. Priority: %s",
                complaint.getId(),
                remaining.toMinutes(),
                complaint.getPriority());

        notificationService.sendSLAWarning(complaint, message);
        log.warn("SLA warning sent for complaint {}", complaint.getId());
    }

    /**
     * Handle an SLA breach - escalate the complaint.
     */
    @Transactional
    protected void handleSLABreach(Complaint complaint) {
        // Escalate the complaint
        complaint.setEscalationLevel(complaint.getEscalationLevel() + 1);

        if (complaint.getStatus() != ComplaintStatus.ESCALATED) {
            complaint.setStatus(ComplaintStatus.ESCALATED);
        }

        complaintRepository.save(complaint);

        // Send breach notification
        String message = String.format(
                "SLA BREACHED: Complaint %s has exceeded its SLA deadline. " +
                        "Priority: %s, Escalation Level: %d",
                complaint.getId(),
                complaint.getPriority(),
                complaint.getEscalationLevel());

        notificationService.sendSLABreach(complaint, message);
        log.error("SLA breached for complaint {}. Escalated to level {}",
                complaint.getId(), complaint.getEscalationLevel());
    }

    /**
     * Get SLA compliance statistics.
     */
    @Transactional(readOnly = true)
    public SLAStatistics getStatistics() {
        LocalDateTime now = LocalDateTime.now();

        List<Complaint> nearBreach = complaintRepository.findComplaintsNearingSLA(
                now, now.plusHours(2));
        List<Complaint> breached = complaintRepository.findBreachedSLAComplaints(now);

        long totalActive = complaintRepository.findByStatusNot(ComplaintStatus.CLOSED).size();
        long onTrack = totalActive - nearBreach.size() - breached.size();

        double complianceRate = totalActive > 0
                ? (double) onTrack / totalActive * 100
                : 100.0;

        return new SLAStatistics(
                totalActive,
                onTrack,
                nearBreach.size(),
                breached.size(),
                complianceRate);
    }

    private boolean isTerminalStatus(ComplaintStatus status) {
        return status == ComplaintStatus.RESOLVED || status == ComplaintStatus.CLOSED;
    }

    // Statistics record
    public record SLAStatistics(
            long totalActive,
            long onTrack,
            long nearBreach,
            long breached,
            double complianceRate) {
    }
}

package com.cms.service;

import com.cms.model.Complaint;
import com.cms.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Notification Service - Handles all system notifications.
 * 
 * Sends email alerts, SLA warnings, and status updates.
 * Can be extended to support SMS, push notifications, etc.
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    /**
     * Send SLA warning notification.
     */
    public void sendSLAWarning(Complaint complaint, String message) {
        log.warn("SLA Warning for {}: {}", complaint.getId(), message);

        // Notify assigned staff
        if (complaint.getAssignedStaff() != null) {
            sendEmail(
                    complaint.getAssignedStaff().getEmail(),
                    "SLA Warning - Complaint " + complaint.getId(),
                    message);
        }

        // Could also send to managers, create in-app notifications, etc.
    }

    /**
     * Send SLA breach notification.
     */
    public void sendSLABreach(Complaint complaint, String message) {
        log.error("SLA Breach for {}: {}", complaint.getId(), message);

        // Notify staff and managers
        if (complaint.getAssignedStaff() != null) {
            sendEmail(
                    complaint.getAssignedStaff().getEmail(),
                    "URGENT: SLA Breach - Complaint " + complaint.getId(),
                    message);
        }

        // Send to admin/manager escalation list
        sendToEscalationList(complaint, message);
    }

    /**
     * Send complaint status update to customer.
     */
    public void sendStatusUpdate(Complaint complaint, String newStatus) {
        String message = String.format(
                "Your complaint %s has been updated.\n\n" +
                        "New Status: %s\n" +
                        "Title: %s\n\n" +
                        "Track your complaint at: https://cms.example.com/track/%s",
                complaint.getId(),
                newStatus,
                complaint.getTitle(),
                complaint.getId());

        sendEmail(
                complaint.getCustomer().getEmail(),
                "Complaint Update - " + complaint.getId(),
                message);
    }

    /**
     * Send new complaint confirmation to customer.
     */
    public void sendComplaintConfirmation(Complaint complaint) {
        String message = String.format(
                "Thank you for submitting your complaint.\n\n" +
                        "Complaint ID: %s\n" +
                        "Title: %s\n" +
                        "Priority: %s\n" +
                        "SLA Deadline: %s\n\n" +
                        "You can track your complaint at: https://cms.example.com/track/%s",
                complaint.getId(),
                complaint.getTitle(),
                complaint.getPriority(),
                complaint.getSlaDeadline(),
                complaint.getId());

        sendEmail(
                complaint.getCustomer().getEmail(),
                "Complaint Received - " + complaint.getId(),
                message);
    }

    /**
     * Notify staff of new assignment.
     */
    public void sendAssignmentNotification(Complaint complaint, User staff) {
        String message = String.format(
                "You have been assigned a new complaint.\n\n" +
                        "Complaint ID: %s\n" +
                        "Title: %s\n" +
                        "Priority: %s\n" +
                        "Customer: %s\n" +
                        "SLA Deadline: %s\n\n" +
                        "Please review and begin resolution.",
                complaint.getId(),
                complaint.getTitle(),
                complaint.getPriority(),
                complaint.getCustomer().getName(),
                complaint.getSlaDeadline());

        sendEmail(
                staff.getEmail(),
                "New Assignment - Complaint " + complaint.getId(),
                message);
    }

    /**
     * Send to escalation list (managers, admins).
     */
    private void sendToEscalationList(Complaint complaint, String message) {
        // In production, fetch from config or database
        String[] escalationEmails = { "manager@cms.com", "admin@cms.com" };

        for (String email : escalationEmails) {
            sendEmail(email, "ESCALATION: Complaint " + complaint.getId(), message);
        }
    }

    /**
     * Send email using JavaMailSender.
     */
    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@cms.com");

            mailSender.send(message);
            log.info("Email sent to {} with subject: {}", to, subject);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            // In production, could retry or queue for later
        }
    }
}

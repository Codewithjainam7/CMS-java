package com.cms.controller;

import com.cms.dto.ComplaintDTO;
import com.cms.dto.ComplaintRequest;
import com.cms.dto.StatusUpdateRequest;
import com.cms.model.Complaint.ComplaintStatus;
import com.cms.service.ComplaintService;
import com.cms.service.QRCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Complaint Controller - REST API for complaint management.
 * 
 * Provides endpoints for creating, reading, updating complaints.
 * Implements role-based access control using Spring Security.
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final QRCodeService qrCodeService;

    /**
     * Create a new complaint (Customer only).
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ComplaintDTO> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal UserDetails user) {

        log.info("Creating complaint for user: {}", user.getUsername());
        ComplaintDTO complaint = complaintService.create(request, getUserId(user));
        return ResponseEntity.ok(complaint);
    }

    /**
     * Get all complaints with pagination (Admin/Staff).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<ComplaintDTO>> getAllComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String status) {

        log.debug("Fetching complaints - page: {}, status: {}", page, status);
        Page<ComplaintDTO> complaints = complaintService.findAll(page, status);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Get single complaint by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<ComplaintDTO> getComplaint(@PathVariable String id) {
        ComplaintDTO complaint = complaintService.findById(id);
        return ResponseEntity.ok(complaint);
    }

    /**
     * Get complaints for current customer.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<ComplaintDTO>> getMyComplaints(
            @RequestParam(defaultValue = "0") int page,
            @AuthenticationPrincipal UserDetails user) {

        Page<ComplaintDTO> complaints = complaintService.findByCustomer(getUserId(user), page);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Search complaints by keyword.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<ComplaintDTO>> searchComplaints(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page) {

        Page<ComplaintDTO> results = complaintService.search(q, page);
        return ResponseEntity.ok(results);
    }

    /**
     * Update complaint status (Admin/Staff).
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ComplaintDTO> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request) {

        log.info("Updating complaint {} status to {}", id, request.getStatus());
        ComplaintDTO updated = complaintService.updateStatus(id,
                ComplaintStatus.valueOf(request.getStatus().toUpperCase()));
        return ResponseEntity.ok(updated);
    }

    /**
     * Assign complaint to staff (Admin only).
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintDTO> assignComplaint(
            @PathVariable String id,
            @RequestParam String staffId) {

        log.info("Assigning complaint {} to staff {}", id, staffId);
        ComplaintDTO updated = complaintService.assignToStaff(id, staffId);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get dashboard statistics (Admin/Staff).
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = complaintService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Generate QR code for complaint tracking.
     */
    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getTrackingQRCode(@PathVariable String id) {
        byte[] qrCode = qrCodeService.generateComplaintTrackingQR(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(qrCode.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(qrCode);
    }

    /**
     * Get QR code as base64 string.
     */
    @GetMapping("/{id}/qr/base64")
    public ResponseEntity<Map<String, String>> getTrackingQRCodeBase64(@PathVariable String id) {
        String base64 = qrCodeService.generateComplaintTrackingQRBase64(id);
        return ResponseEntity.ok(Map.of(
                "complaintId", id,
                "qrCodeBase64", base64,
                "dataUri", "data:image/png;base64," + base64));
    }

    // Helper to extract user ID from authentication
    private String getUserId(UserDetails user) {
        // In production, would get from custom UserDetails implementation
        return user.getUsername();
    }
}

package com.cms.repository;

import com.cms.model.Complaint;
import com.cms.model.Complaint.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Complaint Repository - Data access layer for complaints.
 * 
 * Provides custom queries for dashboard analytics, SLA monitoring,
 * and filtered complaint retrieval.
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {

    // Find all complaints by status
    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);

    // Find all complaints NOT in a specific status (for SLA checking)
    List<Complaint> findByStatusNot(ComplaintStatus status);

    // Find complaints by priority
    Page<Complaint> findByPriority(Priority priority, Pageable pageable);

    // Find complaints by customer
    Page<Complaint> findByCustomerId(String customerId, Pageable pageable);

    // Find complaints assigned to staff
    Page<Complaint> findByAssignedStaffId(String staffId, Pageable pageable);

    // Find complaints with SLA deadline approaching (for alerts)
    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('RESOLVED', 'CLOSED') " +
            "AND c.slaDeadline BETWEEN :now AND :deadline")
    List<Complaint> findComplaintsNearingSLA(
            @Param("now") LocalDateTime now,
            @Param("deadline") LocalDateTime deadline);

    // Find breached SLA complaints
    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('RESOLVED', 'CLOSED') " +
            "AND c.slaDeadline < :now")
    List<Complaint> findBreachedSLAComplaints(@Param("now") LocalDateTime now);

    // Dashboard analytics - Count by status
    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatus();

    // Dashboard analytics - Count by category
    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategory();

    // Dashboard analytics - Count by priority
    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countByPriority();

    // Dashboard analytics - Complaints created in date range
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.createdAt BETWEEN :start AND :end")
    Long countCreatedBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Dashboard analytics - Resolved complaints by staff
    @Query("SELECT c.assignedStaff.id, COUNT(c) FROM Complaint c " +
            "WHERE c.status = 'RESOLVED' GROUP BY c.assignedStaff.id")
    List<Object[]> countResolvedByStaff();

    // Search complaints by title or description
    @Query("SELECT c FROM Complaint c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Complaint> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Get average resolution time in hours
    @Query("SELECT AVG(FUNCTION('TIMESTAMPDIFF', HOUR, c.createdAt, c.updatedAt)) " +
            "FROM Complaint c WHERE c.status = 'RESOLVED'")
    Double getAverageResolutionTimeHours();
}

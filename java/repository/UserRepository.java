package com.cms.repository;

import com.cms.model.User;
import com.cms.model.User.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * User Repository - Data access layer for users.
 * 
 * Provides queries for authentication, staff leaderboard,
 * and user management.
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Find user by email (for authentication)
    Optional<User> findByEmail(String email);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find users by role
    Page<User> findByRole(UserRole role, Pageable pageable);

    // Get all staff members
    List<User> findByRoleOrderByTotalPointsDesc(UserRole role);

    // Staff leaderboard - Top performers
    @Query("SELECT u FROM User u WHERE u.role = 'STAFF' ORDER BY u.totalPoints DESC")
    List<User> getStaffLeaderboard(Pageable pageable);

    // Find staff with specific badge
    @Query("SELECT u FROM User u JOIN u.badges b WHERE b = :badge")
    List<User> findStaffWithBadge(@Param("badge") String badge);

    // Get staff statistics
    @Query("SELECT u.id, u.name, u.totalPoints, u.complaintsResolved, u.customerRating " +
            "FROM User u WHERE u.role = 'STAFF' ORDER BY u.totalPoints DESC")
    List<Object[]> getStaffPerformanceStats();

    // Count users by role
    Long countByRole(UserRole role);

    // Find active staff (not locked, enabled)
    @Query("SELECT u FROM User u WHERE u.role = 'STAFF' AND u.enabled = true AND u.accountLocked = false")
    List<User> findActiveStaff();
}

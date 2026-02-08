package com.cms.service;

import com.cms.model.Complaint.Priority;
import com.cms.model.User;
import com.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Gamification Service - Staff motivation and reward system.
 * 
 * Implements a point-based gamification system to incentivize
 * efficient complaint resolution and customer satisfaction.
 * Awards points, badges, and manages leaderboards.
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final UserRepository userRepository;

    // Point values for different actions
    private static final int POINTS_RESOLVE_CRITICAL = 100;
    private static final int POINTS_RESOLVE_HIGH = 50;
    private static final int POINTS_RESOLVE_MEDIUM = 30;
    private static final int POINTS_RESOLVE_LOW = 10;
    private static final int POINTS_WITHIN_SLA_BONUS = 25;
    private static final int POINTS_FIVE_STAR_RATING = 40;
    private static final int POINTS_QUICK_RESPONSE = 15;

    // Badge definitions
    public enum Badge {
        QUICK_RESOLVER("🚀 Quick Resolver", "Resolved 10 complaints within SLA", 10),
        CUSTOMER_CHAMPION("⭐ Customer Champion", "Received 10 five-star ratings", 10),
        SPEED_DEMON("⚡ Speed Demon", "Resolved 5 complaints in under 1 hour", 5),
        QUALITY_EXPERT("💎 Quality Expert", "Maintained 4.5+ average rating", 0),
        CENTURY_CLUB("💯 Century Club", "Resolved 100 complaints", 100),
        TOP_PERFORMER("🏆 Top Performer", "Ranked #1 in monthly leaderboard", 0),
        FIRE_FIGHTER("🔥 Fire Fighter", "Resolved 10 critical priority issues", 10),
        FIRST_RESPONSE("🎯 First Response", "Responded to 50 complaints within 15 min", 50);

        public final String displayName;
        public final String description;
        public final int threshold;

        Badge(String displayName, String description, int threshold) {
            this.displayName = displayName;
            this.description = description;
            this.threshold = threshold;
        }
    }

    /**
     * Award points for resolving a complaint.
     */
    @Transactional
    public PointsAwarded awardPointsForResolution(String staffId, boolean withinSLA, Priority priority) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        int basePoints = switch (priority) {
            case CRITICAL -> POINTS_RESOLVE_CRITICAL;
            case HIGH -> POINTS_RESOLVE_HIGH;
            case MEDIUM -> POINTS_RESOLVE_MEDIUM;
            case LOW -> POINTS_RESOLVE_LOW;
        };

        int bonusPoints = withinSLA ? POINTS_WITHIN_SLA_BONUS : 0;
        int totalPoints = basePoints + bonusPoints;

        staff.setTotalPoints(staff.getTotalPoints() + totalPoints);
        staff.setComplaintsResolved(staff.getComplaintsResolved() + 1);

        // Check for new badges
        List<String> newBadges = checkAndAwardBadges(staff, withinSLA);

        userRepository.save(staff);

        log.info("Awarded {} points to staff {} for resolving {} priority complaint{}",
                totalPoints, staffId, priority, withinSLA ? " within SLA" : "");

        return new PointsAwarded(basePoints, bonusPoints, totalPoints, newBadges);
    }

    /**
     * Award points for receiving a customer rating.
     */
    @Transactional
    public int awardPointsForRating(String staffId, int rating) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        int points = 0;
        if (rating == 5) {
            points = POINTS_FIVE_STAR_RATING;
        } else if (rating == 4) {
            points = POINTS_FIVE_STAR_RATING / 2;
        }

        if (points > 0) {
            staff.setTotalPoints(staff.getTotalPoints() + points);

            // Update average rating
            double currentAvg = staff.getCustomerRating() != null ? staff.getCustomerRating() : 0;
            int totalRatings = staff.getComplaintsResolved();
            double newAvg = ((currentAvg * (totalRatings - 1)) + rating) / totalRatings;
            staff.setCustomerRating(newAvg);

            checkAndAwardBadges(staff, false);
            userRepository.save(staff);

            log.info("Awarded {} points to staff {} for {}-star rating", points, staffId, rating);
        }

        return points;
    }

    /**
     * Get leaderboard of top performing staff.
     */
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard(int limit) {
        List<User> topStaff = userRepository.getStaffLeaderboard(
                org.springframework.data.domain.PageRequest.of(0, limit));

        List<LeaderboardEntry> leaderboard = new ArrayList<>();
        int rank = 1;

        for (User staff : topStaff) {
            leaderboard.add(new LeaderboardEntry(
                    rank++,
                    staff.getId(),
                    staff.getName(),
                    staff.getTotalPoints(),
                    staff.getComplaintsResolved(),
                    staff.getCustomerRating(),
                    new ArrayList<>(staff.getBadges())));
        }

        return leaderboard;
    }

    /**
     * Get detailed stats for a staff member.
     */
    @Transactional(readOnly = true)
    public StaffStats getStaffStats(String staffId) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Calculate rank
        List<User> allStaff = userRepository.findByRoleOrderByTotalPointsDesc(User.UserRole.STAFF);
        int rank = 1;
        for (User s : allStaff) {
            if (s.getId().equals(staffId))
                break;
            rank++;
        }

        return new StaffStats(
                staff.getTotalPoints(),
                rank,
                allStaff.size(),
                staff.getComplaintsResolved(),
                staff.getCustomerRating(),
                new ArrayList<>(staff.getBadges()),
                calculateNextBadgeProgress(staff));
    }

    /**
     * Check and award badges based on current achievements.
     */
    private List<String> checkAndAwardBadges(User staff, boolean resolutionWithinSLA) {
        List<String> newBadges = new ArrayList<>();
        Set<String> currentBadges = staff.getBadges();

        // Century Club - 100 complaints resolved
        if (staff.getComplaintsResolved() >= 100 &&
                !currentBadges.contains(Badge.CENTURY_CLUB.displayName)) {
            currentBadges.add(Badge.CENTURY_CLUB.displayName);
            newBadges.add(Badge.CENTURY_CLUB.displayName);
        }

        // Quality Expert - 4.5+ rating
        if (staff.getCustomerRating() != null && staff.getCustomerRating() >= 4.5 &&
                staff.getComplaintsResolved() >= 10 &&
                !currentBadges.contains(Badge.QUALITY_EXPERT.displayName)) {
            currentBadges.add(Badge.QUALITY_EXPERT.displayName);
            newBadges.add(Badge.QUALITY_EXPERT.displayName);
        }

        // Quick Resolver - Track separately (would need additional field)
        // For demo, award at 25 resolutions
        if (staff.getComplaintsResolved() >= 25 &&
                !currentBadges.contains(Badge.QUICK_RESOLVER.displayName)) {
            currentBadges.add(Badge.QUICK_RESOLVER.displayName);
            newBadges.add(Badge.QUICK_RESOLVER.displayName);
        }

        // Customer Champion - Track 5-star ratings (simplified)
        if (staff.getCustomerRating() != null && staff.getCustomerRating() >= 4.8 &&
                staff.getComplaintsResolved() >= 20 &&
                !currentBadges.contains(Badge.CUSTOMER_CHAMPION.displayName)) {
            currentBadges.add(Badge.CUSTOMER_CHAMPION.displayName);
            newBadges.add(Badge.CUSTOMER_CHAMPION.displayName);
        }

        for (String badge : newBadges) {
            log.info("Staff {} earned new badge: {}", staff.getId(), badge);
        }

        return newBadges;
    }

    private Map<String, Double> calculateNextBadgeProgress(User staff) {
        Map<String, Double> progress = new HashMap<>();

        // Century Club progress
        if (!staff.getBadges().contains(Badge.CENTURY_CLUB.displayName)) {
            progress.put(Badge.CENTURY_CLUB.displayName,
                    Math.min(100.0, (staff.getComplaintsResolved() / 100.0) * 100));
        }

        // Quick Resolver progress
        if (!staff.getBadges().contains(Badge.QUICK_RESOLVER.displayName)) {
            progress.put(Badge.QUICK_RESOLVER.displayName,
                    Math.min(100.0, (staff.getComplaintsResolved() / 25.0) * 100));
        }

        return progress;
    }

    // Record types for results
    public record PointsAwarded(int basePoints, int bonusPoints, int totalPoints, List<String> newBadges) {
    }

    public record LeaderboardEntry(
            int rank, String staffId, String name, int totalPoints,
            int complaintsResolved, Double customerRating, List<String> badges) {
    }

    public record StaffStats(
            int totalPoints, int rank, int totalStaff, int complaintsResolved,
            Double customerRating, List<String> badges, Map<String, Double> nextBadgeProgress) {
    }
}

/**
 * Java Backend Code Snippets
 * 
 * Complete Spring Boot backend implementation for the Enterprise CMS.
 * These represent the actual Java source files in the /java directory.
 */

// ============================================
// MODELS / ENTITIES
// ============================================

export const JAVA_COMPLAINT_ENTITY = `
package com.cms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints", indexes = {
    @Index(name = "idx_complaint_status", columnList = "status"),
    @Index(name = "idx_complaint_priority", columnList = "priority")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;

    @Enumerated(EnumType.STRING)
    private Sentiment sentiment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime slaDeadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedStaff;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = ComplaintStatus.NEW;
    }

    public enum Category { TECHNICAL, BILLING, PRODUCT, SERVICE, SECURITY }
    public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }
    public enum ComplaintStatus { NEW, ASSIGNED, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED }
    public enum Sentiment { ANGRY, FRUSTRATED, NEUTRAL, SATISFIED }
}
`;

export const JAVA_USER_ENTITY = `
package com.cms.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    // Gamification fields
    private Integer totalPoints = 0;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_badges")
    private Set<String> badges = new HashSet<>();

    private Integer complaintsResolved = 0;
    private Double customerRating;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() { return this.email; }

    @Override
    public boolean isAccountNonExpired() { return true; }
    
    @Override
    public boolean isAccountNonLocked() { return true; }
    
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    
    @Override
    public boolean isEnabled() { return true; }

    public enum UserRole { ADMIN, STAFF, CUSTOMER }
}
`;

// ============================================
// REPOSITORIES
// ============================================

export const JAVA_COMPLAINT_REPOSITORY = `
package com.cms.repository;

import com.cms.model.Complaint;
import com.cms.model.Complaint.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, String> {

    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);
    List<Complaint> findByStatusNot(ComplaintStatus status);
    Page<Complaint> findByCustomerId(String customerId, Pageable pageable);
    
    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('RESOLVED', 'CLOSED') " +
           "AND c.slaDeadline BETWEEN :now AND :deadline")
    List<Complaint> findComplaintsNearingSLA(
        @Param("now") LocalDateTime now, 
        @Param("deadline") LocalDateTime deadline
    );
    
    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('RESOLVED', 'CLOSED') " +
           "AND c.slaDeadline < :now")
    List<Complaint> findBreachedSLAComplaints(@Param("now") LocalDateTime now);
    
    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatus();
    
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, c.createdAt, c.updatedAt)) " +
           "FROM Complaint c WHERE c.status = 'RESOLVED'")
    Double getAverageResolutionTimeHours();
}
`;

// ============================================
// SERVICES
// ============================================

export const JAVA_SENTIMENT_LOGIC = `
package com.cms.service;

import com.cms.model.Complaint.Sentiment;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SentimentAnalysisService {

    private static final Map<String, Integer> ANGRY_KEYWORDS = Map.of(
        "terrible", -3, "worst", -3, "horrible", -3, 
        "unacceptable", -3, "disgusted", -3, "outraged", -3
    );

    private static final Map<String, Integer> FRUSTRATED_KEYWORDS = Map.of(
        "disappointed", -1, "annoying", -1, "frustrated", -1,
        "slow", -1, "failing", -1, "stuck", -1
    );

    public Sentiment analyzeSentiment(String text) {
        if (text == null || text.isBlank()) return Sentiment.NEUTRAL;
        
        String lowerText = text.toLowerCase();
        int score = 0;
        
        for (var entry : ANGRY_KEYWORDS.entrySet()) {
            if (lowerText.contains(entry.getKey())) score += entry.getValue();
        }
        for (var entry : FRUSTRATED_KEYWORDS.entrySet()) {
            if (lowerText.contains(entry.getKey())) score += entry.getValue();
        }
        
        if (score <= -6) return Sentiment.ANGRY;
        if (score <= -2) return Sentiment.FRUSTRATED;
        return Sentiment.NEUTRAL;
    }
}
`;

export const JAVA_SLA_SCHEDULER = `
package com.cms.service;

import com.cms.model.Complaint;
import com.cms.model.Complaint.*;
import com.cms.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SLAService {

    private final ComplaintRepository complaintRepository;
    private final NotificationService notificationService;

    public LocalDateTime calculateSLADeadline(Priority priority) {
        int hours = switch (priority) {
            case CRITICAL -> 2;
            case HIGH -> 24;
            case MEDIUM -> 72;
            case LOW -> 168;
        };
        return LocalDateTime.now().plusHours(hours);
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void checkSLADeadlines() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find and handle near-breach complaints
        List<Complaint> nearingBreach = complaintRepository
            .findComplaintsNearingSLA(now, now.plusHours(2));
        nearingBreach.forEach(this::handleNearingBreach);
        
        // Find and escalate breached complaints
        List<Complaint> breached = complaintRepository.findBreachedSLAComplaints(now);
        breached.forEach(this::handleSLABreach);
    }

    private void handleNearingBreach(Complaint complaint) {
        notificationService.sendSLAWarning(complaint, "SLA breach imminent");
    }

    private void handleSLABreach(Complaint complaint) {
        complaint.setStatus(ComplaintStatus.ESCALATED);
        complaint.setEscalationLevel(complaint.getEscalationLevel() + 1);
        complaintRepository.save(complaint);
        notificationService.sendSLABreach(complaint, "SLA breached - escalated");
    }
}
`;

export const JAVA_GAMIFICATION = `
package com.cms.service;

import com.cms.model.Complaint.Priority;
import com.cms.model.User;
import com.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository userRepository;

    public enum Badge {
        QUICK_RESOLVER("🚀 Quick Resolver", 10),
        CUSTOMER_CHAMPION("⭐ Customer Champion", 10),
        CENTURY_CLUB("💯 Century Club", 100),
        TOP_PERFORMER("🏆 Top Performer", 0);

        public final String displayName;
        public final int threshold;
        Badge(String name, int threshold) { 
            this.displayName = name; 
            this.threshold = threshold; 
        }
    }

    @Transactional
    public int awardPointsForResolution(String staffId, boolean withinSLA, Priority priority) {
        User staff = userRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff not found"));

        int basePoints = switch (priority) {
            case CRITICAL -> 100;
            case HIGH -> 50;
            case MEDIUM -> 30;
            case LOW -> 10;
        };

        int bonus = withinSLA ? 25 : 0;
        int totalPoints = basePoints + bonus;

        staff.setTotalPoints(staff.getTotalPoints() + totalPoints);
        staff.setComplaintsResolved(staff.getComplaintsResolved() + 1);
        
        checkAndAwardBadges(staff);
        userRepository.save(staff);
        
        return totalPoints;
    }

    private void checkAndAwardBadges(User staff) {
        Set<String> badges = staff.getBadges();
        
        if (staff.getComplaintsResolved() >= 100 && 
            !badges.contains(Badge.CENTURY_CLUB.displayName)) {
            badges.add(Badge.CENTURY_CLUB.displayName);
        }
        
        if (staff.getCustomerRating() != null && staff.getCustomerRating() >= 4.5 &&
            !badges.contains(Badge.CUSTOMER_CHAMPION.displayName)) {
            badges.add(Badge.CUSTOMER_CHAMPION.displayName);
        }
    }

    public List<User> getLeaderboard(int limit) {
        return userRepository.getStaffLeaderboard(
            org.springframework.data.domain.PageRequest.of(0, limit));
    }
}
`;

export const JAVA_QR_GENERATION = `
package com.cms.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.*;

@Service
public class QRCodeService {

    @Value("\${app.base-url:https://cms.example.com}")
    private String baseUrl;

    public byte[] generateComplaintTrackingQR(String complaintId) {
        return generateComplaintTrackingQR(complaintId, 300);
    }

    public byte[] generateComplaintTrackingQR(String complaintId, int size) {
        try {
            String trackingUrl = baseUrl + "/track/" + complaintId;
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = Map.of(
                EncodeHintType.MARGIN, 2,
                EncodeHintType.CHARACTER_SET, "UTF-8"
            );
            
            BitMatrix bitMatrix = qrCodeWriter.encode(
                trackingUrl, BarcodeFormat.QR_CODE, size, size, hints
            );
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    public String generateComplaintTrackingQRBase64(String complaintId) {
        byte[] qrBytes = generateComplaintTrackingQR(complaintId);
        return Base64.getEncoder().encodeToString(qrBytes);
    }
}
`;

// ============================================
// CONTROLLERS
// ============================================

export const JAVA_CONTROLLER = `
package com.cms.controller;

import com.cms.dto.*;
import com.cms.model.Complaint.ComplaintStatus;
import com.cms.service.ComplaintService;
import com.cms.service.QRCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final QRCodeService qrCodeService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ComplaintDTO> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(complaintService.create(request, user.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<ComplaintDTO>> getAllComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(complaintService.findAll(page, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDTO> getComplaint(@PathVariable String id) {
        return ResponseEntity.ok(complaintService.findById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ComplaintDTO> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(id, 
            ComplaintStatus.valueOf(request.getStatus().toUpperCase())));
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getTrackingQRCode(@PathVariable String id) {
        byte[] qrCode = qrCodeService.generateComplaintTrackingQR(id);
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(qrCode);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(complaintService.getDashboardStats());
    }
}
`;

export const JAVA_AUTH_CONTROLLER = `
package com.cms.controller;

import com.cms.dto.*;
import com.cms.model.User;
import com.cms.repository.UserRepository;
import com.cms.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = (User) auth.getPrincipal();
        String token = tokenProvider.generateToken(user);
        
        return ResponseEntity.ok(AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole().name())
            .build());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(User.UserRole.CUSTOMER)
            .build();
        
        User saved = userRepository.save(user);
        String token = tokenProvider.generateToken(saved);
        
        return ResponseEntity.ok(AuthResponse.builder()
            .token(token)
            .userId(saved.getId())
            .email(saved.getEmail())
            .role(saved.getRole().name())
            .build());
    }
}
`;

// ============================================
// SECURITY
// ============================================

export const JAVA_SECURITY = `
package com.cms.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/v1/complaints/*/qr/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/complaints").hasRole("CUSTOMER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
`;

export const JAVA_JWT_PROVIDER = `
package com.cms.security;

import com.cms.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("\${jwt.secret}")
    private String jwtSecret;

    @Value("\${jwt.expiration:86400000}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .setSubject(user.getId())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get("email", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException ex) {
            return false;
        }
    }
}
`;

// ============================================
// MAIN APPLICATION
// ============================================

export const JAVA_APPLICATION = `
package com.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CmsApplication.class, args);
        System.out.println("""
            ╔═══════════════════════════════════════════════════════════╗
            ║     Enterprise Complaint Management System (CMS)          ║
            ║                                                           ║
            ║  📋 REST API: http://localhost:8080                       ║
            ║                                                           ║
            ║  Features:                                                ║
            ║  ✓ JWT Authentication                                     ║
            ║  ✓ Role-based Access Control                              ║
            ║  ✓ AI Sentiment Analysis                                  ║
            ║  ✓ SLA Monitoring & Escalation                            ║
            ║  ✓ Staff Gamification                                     ║
            ║  ✓ QR Code Tracking                                       ║
            ╚═══════════════════════════════════════════════════════════╝
            """);
    }
}
`;

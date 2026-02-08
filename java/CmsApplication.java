package com.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * CMS Application - Main entry point for the Spring Boot application.
 * 
 * Enterprise Complaint Management System backend.
 * Features:
 * - RESTful API for complaint management
 * - JWT-based authentication
 * - Role-based access control (Admin, Staff, Customer)
 * - AI-powered sentiment analysis
 * - SLA monitoring with automatic escalation
 * - Staff gamification system
 * - QR code generation for tracking
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@SpringBootApplication
@EnableScheduling
public class CmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CmsApplication.class, args);
        System.out.println("""

                ╔═══════════════════════════════════════════════════════════╗
                ║     Enterprise Complaint Management System (CMS)          ║
                ║                                                           ║
                ║  📋 REST API running on: http://localhost:8080            ║
                ║  📖 Swagger UI: http://localhost:8080/swagger-ui.html     ║
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

package com.pms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

public class JobDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobRequest {
        @NotBlank(message = "Job title is required")
        private String title;

        @NotBlank(message = "Job description is required")
        private String description;

        private String requirements;

        @NotNull(message = "Salary package is required")
        @DecimalMin(value = "0.1", message = "Salary package must be at least 0.1 LPA")
        private Double salaryPackage; // LPA

        @NotBlank(message = "Location is required")
        private String location;

        @NotBlank(message = "Work type is required")
        private String workType; // REMOTE, HYBRID, ON_SITE

        @NotNull(message = "Application deadline is required")
        private LocalDateTime applicationDeadline;

        private Double minCgpa;
        private Integer maxBacklogs;
        private Set<String> branches;
        private Set<String> skills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobResponse {
        private Long id;
        private String title;
        private String description;
        private String requirements;
        private Double salaryPackage;
        private String location;
        private String workType;
        private LocalDateTime applicationDeadline;
        private Double minCgpa;
        private Integer maxBacklogs;
        private String status; // PENDING_APPROVAL, APPROVED, REJECTED, CLOSED
        private Set<String> branches;
        private Set<String> skills;
        private String companyName;
        private String companyLogoUrl;
        private Long recruiterId;
        private String recruiterName;
        private LocalDateTime createdAt;
    }
}

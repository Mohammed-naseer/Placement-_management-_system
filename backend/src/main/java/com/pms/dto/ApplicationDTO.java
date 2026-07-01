package com.pms.dto;

import lombok.*;
import java.time.LocalDateTime;

public class ApplicationDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationResponse {
        private Long id;
        private Long jobId;
        private String jobTitle;
        private String companyName;
        private String companyLogoUrl;
        private Double salaryPackage;
        private Long studentId;
        private String studentName;
        private String studentRollNumber;
        private String studentBranch;
        private Double studentCgpa;
        private String resumeUrl;
        private String status; // APPLIED, UNDER_REVIEW, SHORTLISTED, etc.
        private LocalDateTime appliedAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private String status;
    }
}

package com.pms.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private boolean isActive;
    private StudentProfileDTO studentProfile;
    private RecruiterProfileDTO recruiterProfile;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentProfileDTO {
        private Long id;
        private String rollNumber;
        private String branch;
        private String section;
        private Integer year;
        private Double cgpa;
        private Integer backlogs;
        private String resumeUrl;
        private String linkedinUrl;
        private String githubUrl;
        private String portfolioUrl;
        private boolean eligibilityStatus;
        private Set<String> skills;
        private List<ProjectDTO> projects;
        private List<CertificateDTO> certificates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecruiterProfileDTO {
        private Long id;
        private String designation;
        private boolean isVerified;
        private CompanyDTO company;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectDTO {
        private Long id;
        private String title;
        private String description;
        private String technologiesUsed;
        private String projectUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificateDTO {
        private Long id;
        private String name;
        private String issuingOrganization;
        private LocalDate issueDate;
        private LocalDate expirationDate;
        private String credentialUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyDTO {
        private Long id;
        private String name;
        private String website;
        private String industry;
        private String description;
        private String location;
        private String verificationStatus;
        private String logoUrl;
        private Double rating;
    }
}

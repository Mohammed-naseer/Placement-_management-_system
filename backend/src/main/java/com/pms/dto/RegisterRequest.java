package com.pms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Role is required")
    private String role; // STUDENT, RECRUITER, PLACEMENT_OFFICER, FACULTY_COORDINATOR

    // Student Fields (Conditional)
    private String rollNumber;
    private String branch;
    private String section;
    private Integer year;
    private Double cgpa;
    private Integer backlogs;

    // Recruiter Fields (Conditional)
    private String companyName;
    private String companyWebsite;
    private String companyIndustry;
    private String designation;
}

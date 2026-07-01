package com.pms.service.impl;

import com.pms.dto.ApplicationDTO;
import com.pms.exception.CustomExceptions;
import com.pms.model.*;
import com.pms.repository.*;
import com.pms.service.ApplicationService;
import com.pms.service.SmartEligibilityEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SmartEligibilityEngine eligibilityEngine;

    @Override
    @Transactional
    public Application applyToJob(String studentUsername, Long jobId, String resumeUrl) {
        User user = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Student profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Job not found"));

        if (!job.getStatus().equalsIgnoreCase("APPROVED")) {
            throw new CustomExceptions.BadRequestException("Cannot apply to a job that is not approved");
        }

        if (job.getApplicationDeadline().isBefore(LocalDateTime.now())) {
            throw new CustomExceptions.BadRequestException("The deadline for this job application has passed");
        }

        // Verify Duplicate Submission
        if (applicationRepository.findByStudentIdAndJobId(student.getId(), job.getId()).isPresent()) {
            throw new CustomExceptions.BadRequestException("You have already applied for this job");
        }

        // SMART ELIGIBILITY SYSTEM CHECK
        eligibilityEngine.isEligible(student, job);

        // Resume Fallback
        String finalResumeUrl = (resumeUrl != null && !resumeUrl.isEmpty()) ? resumeUrl : student.getResumeUrl();
        if (finalResumeUrl == null || finalResumeUrl.isEmpty()) {
            throw new CustomExceptions.BadRequestException("Please upload or provide a resume URL to apply");
        }

        Application application = Application.builder()
                .student(student)
                .job(job)
                .resumeUrl(finalResumeUrl)
                .status("APPLIED")
                .build();

        Application savedApp = applicationRepository.save(application);

        // Alert student and recruiter
        notificationRepository.save(Notification.builder()
                .user(student.getUser())
                .title("Application Submitted")
                .message("You successfully applied for: " + job.getTitle() + " at " + job.getRecruiter().getCompany().getName())
                .type("APPLICATION")
                .build());

        notificationRepository.save(Notification.builder()
                .user(job.getRecruiter().getUser())
                .title("New Application Received")
                .message("Student " + student.getUser().getUsername() + " applied for your posting: " + job.getTitle())
                .type("APPLICATION")
                .build());

        return savedApp;
    }

    @Override
    @Transactional
    public Application updateApplicationStatus(Long applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Application not found"));

        // Validate status workflow
        String normalizedStatus = status.trim().toUpperCase();
        List<String> validStatuses = List.of("APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "SELECTED", "OFFER_RELEASED", "REJECTED");
        if (!validStatuses.contains(normalizedStatus)) {
            throw new CustomExceptions.BadRequestException("Invalid application status: " + status);
        }

        application.setStatus(normalizedStatus);
        Application savedApp = applicationRepository.save(application);

        // Notify student of status update
        String companyName = application.getJob().getRecruiter().getCompany().getName();
        notificationRepository.save(Notification.builder()
                .user(application.getStudent().getUser())
                .title("Application Status Updated")
                .message(String.format("Your application for '%s' at %s is now: %s",
                        application.getJob().getTitle(), companyName, normalizedStatus))
                .type("APPLICATION")
                .build());

        return savedApp;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDTO.ApplicationResponse> getStudentApplications(String studentUsername) {
        User user = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Student profile not found"));

        return applicationRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDTO.ApplicationResponse> getJobApplications(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDTO.ApplicationResponse> getRecruiterApplications(String recruiterUsername) {
        User user = userRepository.findByUsername(recruiterUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        Recruiter recruiter = recruiterRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Recruiter profile not found"));

        return applicationRepository.findByJobRecruiterId(recruiter.getId()).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDTO.ApplicationResponse getApplicationById(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Application not found"));
        return mapToResponse(application);
    }

    private ApplicationDTO.ApplicationResponse mapToResponse(Application app) {
        return ApplicationDTO.ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .companyName(app.getJob().getRecruiter().getCompany().getName())
                .companyLogoUrl(app.getJob().getRecruiter().getCompany().getLogoUrl())
                .salaryPackage(app.getJob().getSalaryPackage())
                .studentId(app.getStudent().getId())
                .studentName(app.getStudent().getUser().getUsername())
                .studentRollNumber(app.getStudent().getRollNumber())
                .studentBranch(app.getStudent().getBranch())
                .studentCgpa(app.getStudent().getCgpa())
                .resumeUrl(app.getResumeUrl())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}

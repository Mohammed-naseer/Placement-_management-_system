package com.pms.controller;

import com.pms.dto.ApplicationDTO;
import com.pms.model.Application;
import com.pms.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Application> applyToJob(Principal principal, @RequestParam Long jobId, @RequestParam(required = false) String resumeUrl) {
        Application app = applicationService.applyToJob(principal.getName(), jobId, resumeUrl);
        return ResponseEntity.ok(app);
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<Application> updateApplicationStatus(@PathVariable Long applicationId, @RequestParam String status) {
        Application app = applicationService.updateApplicationStatus(applicationId, status);
        return ResponseEntity.ok(app);
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ApplicationDTO.ApplicationResponse>> getStudentApplications(Principal principal) {
        List<ApplicationDTO.ApplicationResponse> apps = applicationService.getStudentApplications(principal.getName());
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<ApplicationDTO.ApplicationResponse>> getRecruiterApplications(Principal principal) {
        List<ApplicationDTO.ApplicationResponse> apps = applicationService.getRecruiterApplications(principal.getName());
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<List<ApplicationDTO.ApplicationResponse>> getJobApplications(@PathVariable Long jobId) {
        List<ApplicationDTO.ApplicationResponse> apps = applicationService.getJobApplications(jobId);
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<ApplicationDTO.ApplicationResponse> getApplicationById(@PathVariable Long applicationId) {
        ApplicationDTO.ApplicationResponse app = applicationService.getApplicationById(applicationId);
        return ResponseEntity.ok(app);
    }
}

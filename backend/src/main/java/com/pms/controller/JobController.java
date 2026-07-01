package com.pms.controller;

import com.pms.dto.JobDTO;
import com.pms.model.Job;
import com.pms.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Job> createJob(Principal principal, @RequestBody JobDTO.JobRequest request) {
        Job job = jobService.createJob(principal.getName(), request);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Job> updateJob(Principal principal, @PathVariable Long jobId, @RequestBody JobDTO.JobRequest request) {
        Job job = jobService.updateJob(jobId, principal.getName(), request);
        return ResponseEntity.ok(job);
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteJob(Principal principal, @PathVariable Long jobId) {
        jobService.deleteJob(jobId, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<List<JobDTO.JobResponse>> getAllJobs(@RequestParam(required = false) String status) {
        List<JobDTO.JobResponse> jobs = jobService.getAllJobs(status);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/public")
    public ResponseEntity<List<JobDTO.JobResponse>> getPublicJobs() {
        List<JobDTO.JobResponse> jobs = jobService.getAllJobs("APPROVED");
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<JobDTO.JobResponse>> getRecruiterJobs(Principal principal) {
        List<JobDTO.JobResponse> jobs = jobService.getRecruiterJobs(principal.getName());
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{jobId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<JobDTO.JobResponse> getJobById(@PathVariable Long jobId) {
        JobDTO.JobResponse job = jobService.getJobById(jobId);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{jobId}/approve")
    @PreAuthorize("hasAnyRole('PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<Job> approveJob(@PathVariable Long jobId, @RequestParam String status, @RequestParam(required = false) String feedback) {
        Job job = jobService.approveJob(jobId, status, feedback);
        return ResponseEntity.ok(job);
    }
}

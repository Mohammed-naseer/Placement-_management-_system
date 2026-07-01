package com.pms.service.impl;

import com.pms.dto.JobDTO;
import com.pms.exception.CustomExceptions;
import com.pms.model.*;
import com.pms.repository.*;
import com.pms.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Override
    @Transactional
    public Job createJob(String recruiterUsername, JobDTO.JobRequest request) {
        User user = userRepository.findByUsername(recruiterUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        Recruiter recruiter = recruiterRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Recruiter profile not found"));

        if (!recruiter.isVerified()) {
            throw new CustomExceptions.BadRequestException("Recruiter account is not verified by TPO yet");
        }

        Set<Skill> skills = new HashSet<>();
        if (request.getSkills() != null) {
            for (String skillName : request.getSkills()) {
                Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName.trim()).build()));
                skills.add(skill);
            }
        }

        Job job = Job.builder()
                .recruiter(recruiter)
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .salaryPackage(request.getSalaryPackage())
                .location(request.getLocation())
                .workType(request.getWorkType())
                .applicationDeadline(request.getApplicationDeadline())
                .minCgpa(request.getMinCgpa() != null ? request.getMinCgpa() : 0.0)
                .maxBacklogs(request.getMaxBacklogs() != null ? request.getMaxBacklogs() : 0)
                .status("PENDING_APPROVAL")
                .branches(request.getBranches() != null ? request.getBranches() : new HashSet<>())
                .skills(skills)
                .build();

        return jobRepository.save(job);
    }

    @Override
    @Transactional
    public Job updateJob(Long jobId, String recruiterUsername, JobDTO.JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Job not found"));

        if (!job.getRecruiter().getUser().getUsername().equals(recruiterUsername)) {
            throw new CustomExceptions.BadRequestException("Unauthorized job modification");
        }

        Set<Skill> skills = new HashSet<>();
        if (request.getSkills() != null) {
            for (String skillName : request.getSkills()) {
                Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName.trim()).build()));
                skills.add(skill);
            }
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setSalaryPackage(request.getSalaryPackage());
        job.setLocation(request.getLocation());
        job.setWorkType(request.getWorkType());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setMinCgpa(request.getMinCgpa());
        job.setMaxBacklogs(request.getMaxBacklogs());
        job.setBranches(request.getBranches() != null ? request.getBranches() : new HashSet<>());
        job.setSkills(skills);

        return jobRepository.save(job);
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, String username) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Job not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.PLACEMENT_OFFICER &&
                !job.getRecruiter().getUser().getUsername().equals(username)) {
            throw new CustomExceptions.BadRequestException("Unauthorized job deletion");
        }

        jobRepository.delete(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDTO.JobResponse> getAllJobs(String statusFilter) {
        List<Job> jobs;
        if (statusFilter != null && !statusFilter.isEmpty()) {
            jobs = jobRepository.findByStatus(statusFilter.toUpperCase());
        } else {
            jobs = jobRepository.findAll();
        }
        return jobs.stream().map(this::mapToJobResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDTO.JobResponse> getRecruiterJobs(String recruiterUsername) {
        User user = userRepository.findByUsername(recruiterUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        Recruiter recruiter = recruiterRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Recruiter profile not found"));

        return jobRepository.findByRecruiterId(recruiter.getId()).stream()
                .map(this::mapToJobResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobDTO.JobResponse getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Job not found"));
        return mapToJobResponse(job);
    }

    @Override
    @Transactional
    public Job approveJob(Long jobId, String status, String feedback) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Job not found"));

        if (!status.equalsIgnoreCase("APPROVED") && !status.equalsIgnoreCase("REJECTED")) {
            throw new CustomExceptions.BadRequestException("Invalid approval status. Must be APPROVED or REJECTED");
        }

        job.setStatus(status.toUpperCase());
        // Feedback can be appended or logged in reports if needed.
        return jobRepository.save(job);
    }

    private JobDTO.JobResponse mapToJobResponse(Job job) {
        return JobDTO.JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .salaryPackage(job.getSalaryPackage())
                .location(job.getLocation())
                .workType(job.getWorkType())
                .applicationDeadline(job.getApplicationDeadline())
                .minCgpa(job.getMinCgpa())
                .maxBacklogs(job.getMaxBacklogs())
                .status(job.getStatus())
                .branches(job.getBranches())
                .skills(job.getSkills().stream().map(Skill::getName).collect(Collectors.toSet()))
                .companyName(job.getRecruiter().getCompany().getName())
                .companyLogoUrl(job.getRecruiter().getCompany().getLogoUrl())
                .recruiterId(job.getRecruiter().getId())
                .recruiterName(job.getRecruiter().getUser().getUsername())
                .createdAt(job.getCreatedAt())
                .build();
    }
}

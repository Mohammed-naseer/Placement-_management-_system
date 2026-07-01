package com.pms.service;

import com.pms.dto.JobDTO;
import com.pms.model.Job;

import java.util.List;

public interface JobService {
    Job createJob(String recruiterUsername, JobDTO.JobRequest request);
    Job updateJob(Long jobId, String recruiterUsername, JobDTO.JobRequest request);
    void deleteJob(Long jobId, String username);
    List<JobDTO.JobResponse> getAllJobs(String statusFilter);
    List<JobDTO.JobResponse> getRecruiterJobs(String recruiterUsername);
    JobDTO.JobResponse getJobById(Long jobId);
    Job approveJob(Long jobId, String status, String feedback);
}

package com.pms.service;

import com.pms.dto.ApplicationDTO;
import com.pms.model.Application;

import java.util.List;

public interface ApplicationService {
    Application applyToJob(String studentUsername, Long jobId, String resumeUrl);
    Application updateApplicationStatus(Long applicationId, String status);
    List<ApplicationDTO.ApplicationResponse> getStudentApplications(String studentUsername);
    List<ApplicationDTO.ApplicationResponse> getJobApplications(Long jobId);
    List<ApplicationDTO.ApplicationResponse> getRecruiterApplications(String recruiterUsername);
    ApplicationDTO.ApplicationResponse getApplicationById(Long applicationId);
}

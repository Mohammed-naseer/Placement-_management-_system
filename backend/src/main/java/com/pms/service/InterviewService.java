package com.pms.service;

import com.pms.model.Interview;
import java.time.LocalDateTime;
import java.util.List;

public interface InterviewService {
    Interview scheduleInterview(Long applicationId, String recruiterUsername, String title, LocalDateTime dateTime, String locationLink, Integer durationMinutes);
    Interview submitFeedback(Long interviewId, String recruiterUsername, Integer score, String feedback);
    Interview cancelInterview(Long interviewId, String recruiterUsername);
    List<Interview> getStudentInterviews(String studentUsername);
    List<Interview> getRecruiterInterviews(String recruiterUsername);
    Interview getInterviewById(Long interviewId);
}

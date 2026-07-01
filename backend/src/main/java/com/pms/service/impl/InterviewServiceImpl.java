package com.pms.service.impl;

import com.pms.exception.CustomExceptions;
import com.pms.model.*;
import com.pms.repository.*;
import com.pms.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewServiceImpl implements InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Override
    @Transactional
    public Interview scheduleInterview(Long applicationId, String recruiterUsername, String title,
                                       LocalDateTime dateTime, String locationLink, Integer durationMinutes) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Application not found"));

        User user = userRepository.findByUsername(recruiterUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Recruiter user not found"));

        Recruiter recruiter = recruiterRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Recruiter profile not found"));

        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new CustomExceptions.BadRequestException("You cannot schedule an interview for another recruiter's posting");
        }

        Interview interview = Interview.builder()
                .application(application)
                .recruiter(recruiter)
                .title(title)
                .dateTime(dateTime)
                .locationLink(locationLink)
                .durationMinutes(durationMinutes != null ? durationMinutes : 30)
                .status("SCHEDULED")
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        // Update application status to INTERVIEW_SCHEDULED
        application.setStatus("INTERVIEW_SCHEDULED");
        applicationRepository.save(application);

        // Notify student
        notificationRepository.save(Notification.builder()
                .user(application.getStudent().getUser())
                .title("Interview Scheduled")
                .message(String.format("An interview '%s' has been scheduled for '%s' on %s. Link: %s",
                        title, application.getJob().getTitle(), dateTime.toString(), locationLink))
                .type("INTERVIEW")
                .build());

        return savedInterview;
    }

    @Override
    @Transactional
    public Interview submitFeedback(Long interviewId, String recruiterUsername, Integer score, String feedback) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Interview not found"));

        if (!interview.getRecruiter().getUser().getUsername().equals(recruiterUsername)) {
            throw new CustomExceptions.BadRequestException("Unauthorized feedback submission");
        }

        if (score < 1 || score > 10) {
            throw new CustomExceptions.BadRequestException("Score must be between 1 and 10");
        }

        interview.setScore(score);
        interview.setFeedback(feedback);
        interview.setStatus("COMPLETED");

        Interview savedInterview = interviewRepository.save(interview);

        // Notify student of feedback
        notificationRepository.save(Notification.builder()
                .user(interview.getApplication().getStudent().getUser())
                .title("Interview Feedback Submitted")
                .message(String.format("Feedback submitted for interview '%s'. Score: %d/10.",
                        interview.getTitle(), score))
                .type("INTERVIEW")
                .build());

        return savedInterview;
    }

    @Override
    @Transactional
    public Interview cancelInterview(Long interviewId, String recruiterUsername) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Interview not found"));

        User user = userRepository.findByUsername(recruiterUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.PLACEMENT_OFFICER &&
                !interview.getRecruiter().getUser().getUsername().equals(recruiterUsername)) {
            throw new CustomExceptions.BadRequestException("Unauthorized interview cancellation");
        }

        interview.setStatus("CANCELLED");
        Interview savedInterview = interviewRepository.save(interview);

        // Notify student
        notificationRepository.save(Notification.builder()
                .user(interview.getApplication().getStudent().getUser())
                .title("Interview Cancelled")
                .message(String.format("Your interview '%s' has been cancelled.", interview.getTitle()))
                .type("INTERVIEW")
                .build());

        return savedInterview;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Interview> getStudentInterviews(String studentUsername) {
        User user = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Student profile not found"));
        return interviewRepository.findByApplicationStudentId(student.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Interview> getRecruiterInterviews(String recruiterUsername) {
        User user = userRepository.findByUsername(recruiterUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        Recruiter recruiter = recruiterRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Recruiter profile not found"));
        return interviewRepository.findByRecruiterId(recruiter.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Interview getInterviewById(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Interview not found"));
    }
}

package com.pms.controller;

import com.pms.model.Interview;
import com.pms.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    public static class ScheduleRequest {
        public Long applicationId;
        public String title;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        public LocalDateTime dateTime;
        public String locationLink;
        public Integer durationMinutes;
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Interview> scheduleInterview(Principal principal, @RequestBody ScheduleRequest request) {
        Interview interview = interviewService.scheduleInterview(
                request.applicationId,
                principal.getName(),
                request.title,
                request.dateTime,
                request.locationLink,
                request.durationMinutes
        );
        return ResponseEntity.ok(interview);
    }

    @PutMapping("/{interviewId}/feedback")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Interview> submitFeedback(
            Principal principal,
            @PathVariable Long interviewId,
            @RequestParam Integer score,
            @RequestBody String feedback) {
        Interview interview = interviewService.submitFeedback(interviewId, principal.getName(), score, feedback);
        return ResponseEntity.ok(interview);
    }

    @PutMapping("/{interviewId}/cancel")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<Interview> cancelInterview(Principal principal, @PathVariable Long interviewId) {
        Interview interview = interviewService.cancelInterview(interviewId, principal.getName());
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Interview>> getStudentInterviews(Principal principal) {
        List<Interview> interviews = interviewService.getStudentInterviews(principal.getName());
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<Interview>> getRecruiterInterviews(Principal principal) {
        List<Interview> interviews = interviewService.getRecruiterInterviews(principal.getName());
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{interviewId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<Interview> getInterviewById(@PathVariable Long interviewId) {
        Interview interview = interviewService.getInterviewById(interviewId);
        return ResponseEntity.ok(interview);
    }
}

package com.pms.controller;

import com.pms.dto.AIDTO.*;
import com.pms.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/analyze-resume")
    public ResponseEntity<ResumeAnalysisResponse> analyzeResume(
            @RequestParam String resumeText,
            @RequestParam String jobDescription) {
        ResumeAnalysisResponse response = aiService.analyzeResume(resumeText, jobDescription);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mock-questions")
    public ResponseEntity<MockInterviewResponse> generateMockQuestions(
            @RequestParam String jobDescription) {
        MockInterviewResponse response = aiService.generateMockQuestions(jobDescription);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assess-answer")
    public ResponseEntity<InterviewFeedbackResponse> assessAnswer(
            @RequestBody InterviewFeedbackRequest request) {
        InterviewFeedbackResponse response = aiService.assessMockAnswer(request.getQuestion(), request.getAnswer());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/career-guidance")
    public ResponseEntity<CareerGuidanceResponse> provideCareerGuidance(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        CareerGuidanceResponse response = aiService.provideCareerGuidance(principal.getName());
        return ResponseEntity.ok(response);
    }
}

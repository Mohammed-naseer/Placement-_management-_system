package com.pms.service;

import com.pms.dto.AIDTO.*;

public interface AIService {
    ResumeAnalysisResponse analyzeResume(String resumeText, String jobDescription);
    MockInterviewResponse generateMockQuestions(String jobDescription);
    InterviewFeedbackResponse assessMockAnswer(String question, String answer);
    CareerGuidanceResponse provideCareerGuidance(String username);
}

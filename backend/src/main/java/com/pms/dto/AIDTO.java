package com.pms.dto;

import lombok.*;
import java.util.List;

public class AIDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeAnalysisResponse {
        private List<String> parsedSkills;
        private Integer atsScore;
        private List<String> missingSkills;
        private List<String> improvements;
        private Integer matchPercentage;
        private Integer industryReadinessScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MockInterviewResponse {
        private List<String> questions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewFeedbackRequest {
        private String question;
        private String answer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewFeedbackResponse {
        private Integer score; // out of 10
        private String technicalFeedback;
        private String confidenceAnalysis;
        private String sampleAnswer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerGuidanceResponse {
        private List<String> recommendedPaths;
        private List<String> skillGapAnalysis;
        private List<String> stepsToImprove;
    }
}

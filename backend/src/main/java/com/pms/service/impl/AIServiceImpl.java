package com.pms.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pms.dto.AIDTO.*;
import com.pms.exception.CustomExceptions;
import com.pms.model.Certificate;
import com.pms.model.Project;
import com.pms.model.Skill;
import com.pms.model.Student;
import com.pms.model.User;
import com.pms.repository.StudentRepository;
import com.pms.repository.UserRepository;
import com.pms.service.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIServiceImpl implements AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIServiceImpl.class);

    @Value("${pms.ai.gemini.key:mock_gemini_key_for_offline_use}")
    private String geminiKey;

    @Value("${pms.ai.gemini.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String geminiUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private boolean isMockMode() {
        return "mock_gemini_key_for_offline_use".equalsIgnoreCase(geminiKey) || geminiKey.isEmpty();
    }

    private String invokeGemini(String prompt) {
        if (isMockMode()) {
            logger.info("Using mock Gemini response for offline development.");
            return null;
        }

        try {
            String fullUrl = geminiUrl + "?key=" + geminiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct payload
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> body = new HashMap<>();
            body.put("contents", List.of(content));

            // Set system instruction or generation configuration to return JSON
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            body.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode textNode = root.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text");
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
        } catch (Exception e) {
            logger.error("Error communicating with Gemini API: {}. Falling back to mock data.", e.getMessage());
        }
        return null;
    }

    @Override
    public ResumeAnalysisResponse analyzeResume(String resumeText, String jobDescription) {
        String prompt = String.format(
                "You are an expert resume parser and ATS (Applicant Tracking System). " +
                "Analyze the following resume text against the job description. " +
                "Determine the skills, ATS score (out of 100), missing skills, suggested improvements, match percentage (out of 100), and industry readiness score (out of 100). " +
                "You MUST return your answer in valid JSON matching the following structure:\n" +
                "{\n" +
                "  \"parsedSkills\": [\"skill1\", \"skill2\"],\n" +
                "  \"atsScore\": 85,\n" +
                "  \"missingSkills\": [\"skill3\"],\n" +
                "  \"improvements\": [\"improvement1\"],\n" +
                "  \"matchPercentage\": 80,\n" +
                "  \"industryReadinessScore\": 75\n" +
                "}\n\n" +
                "Resume Text:\n%s\n\nJob Description:\n%s",
                resumeText, jobDescription
        );

        String jsonResponse = invokeGemini(prompt);
        if (jsonResponse != null) {
            try {
                return objectMapper.readValue(jsonResponse, ResumeAnalysisResponse.class);
            } catch (Exception e) {
                logger.error("Failed to parse Gemini response for resume analysis: {}", e.getMessage());
            }
        }

        // Mock Fallback
        List<String> mockParsed = Arrays.asList("Java", "Spring Boot", "REST APIs", "SQL", "Git");
        List<String> mockMissing = Arrays.asList("Docker", "AWS", "CI/CD");
        List<String> mockImprovements = Arrays.asList(
                "Incorporate quantitative metrics in project achievements.",
                "Detail deployment experience using containerization tools."
        );
        return ResumeAnalysisResponse.builder()
                .parsedSkills(mockParsed)
                .atsScore(78)
                .missingSkills(mockMissing)
                .improvements(mockImprovements)
                .matchPercentage(72)
                .industryReadinessScore(80)
                .build();
    }

    @Override
    public MockInterviewResponse generateMockQuestions(String jobDescription) {
        String prompt = String.format(
                "You are a technical recruiter. Based on the following job description, generate 5 relevant mock interview questions (technical and behavioral) for a placement candidate. " +
                "You MUST return your answer in valid JSON matching the following structure:\n" +
                "{\n" +
                "  \"questions\": [\n" +
                "    \"question 1\",\n" +
                "    \"question 2\"\n" +
                "  ]\n" +
                "}\n\n" +
                "Job Description:\n%s",
                jobDescription
        );

        String jsonResponse = invokeGemini(prompt);
        if (jsonResponse != null) {
            try {
                return objectMapper.readValue(jsonResponse, MockInterviewResponse.class);
            } catch (Exception e) {
                logger.error("Failed to parse Gemini response for mock questions: {}", e.getMessage());
            }
        }

        // Mock Fallback
        return MockInterviewResponse.builder()
                .questions(Arrays.asList(
                        "Can you explain the difference between a REST API and a SOAP API, and why we prefer REST in modern microservices?",
                        "Explain how Spring Boot manages dependency injection and the lifecycle of a bean.",
                        "How do you optimize a complex database query in MySQL? Explain indexing, execution plans, and join order.",
                        "Describe a challenging technical problem you solved in one of your projects, including how you diagnosed it and the final solution.",
                        "How do you handle team conflict when working on an agile deadline?"
                ))
                .build();
    }

    @Override
    public InterviewFeedbackResponse assessMockAnswer(String question, String answer) {
        String prompt = String.format(
                "You are a technical interviewer assessing a candidate's response. Evaluate the candidate's answer to the given question. " +
                "Provide a score from 1 to 10, detailed technical feedback, confidence and articulation analysis, and a sample exemplary answer. " +
                "You MUST return your answer in valid JSON matching the following structure:\n" +
                "{\n" +
                "  \"score\": 8,\n" +
                "  \"technicalFeedback\": \"detailed feedback\",\n" +
                "  \"confidenceAnalysis\": \"detailed analysis\",\n" +
                "  \"sampleAnswer\": \"sample answer\"\n" +
                "}\n\n" +
                "Question:\n%s\n\nCandidate's Answer:\n%s",
                question, answer
        );

        String jsonResponse = invokeGemini(prompt);
        if (jsonResponse != null) {
            try {
                return objectMapper.readValue(jsonResponse, InterviewFeedbackResponse.class);
            } catch (Exception e) {
                logger.error("Failed to parse Gemini response for interview assessment: {}", e.getMessage());
            }
        }

        // Mock Fallback
        return InterviewFeedbackResponse.builder()
                .score(8)
                .technicalFeedback("Your explanation covers the core ideas correctly. To improve, mention real-world caching or transaction safety aspects.")
                .confidenceAnalysis("Your tone is clear, but adding structured bullet points would make your response sound more structured and assertive.")
                .sampleAnswer("An ideal response would detail how dependency injection decouples application logic, referencing the ApplicationContext and scope management.")
                .build();
    }

    @Override
    public CareerGuidanceResponse provideCareerGuidance(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Student profile not found"));

        String skillsStr = student.getSkills().stream().map(Skill::getName).collect(Collectors.joining(", "));
        String projectsStr = student.getProjects().stream()
                .map(p -> p.getTitle() + ": " + p.getDescription() + " (Tech: " + p.getTechnologiesUsed() + ")")
                .collect(Collectors.joining("; "));
        String certsStr = student.getCertificates().stream().map(Certificate::getName).collect(Collectors.joining(", "));

        String prompt = String.format(
                "You are a professional career counselor. Analyze the academic profile and portfolio of this student: " +
                "CGPA: %s, Branch: %s, Skills: [%s], Projects: [%s], Certifications: [%s]. " +
                "Recommend career paths, identify their skill gaps, and provide actionable steps to improve. " +
                "You MUST return your answer in valid JSON matching the following structure:\n" +
                "{\n" +
                "  \"recommendedPaths\": [\"Path 1\", \"Path 2\"],\n" +
                "  \"skillGapAnalysis\": [\"Gap 1\", \"Gap 2\"],\n" +
                "  \"stepsToImprove\": [\"Step 1\", \"Step 2\"]\n" +
                "}\n",
                student.getCgpa(), student.getBranch(), skillsStr, projectsStr, certsStr
        );

        String jsonResponse = invokeGemini(prompt);
        if (jsonResponse != null) {
            try {
                return objectMapper.readValue(jsonResponse, CareerGuidanceResponse.class);
            } catch (Exception e) {
                logger.error("Failed to parse Gemini response for career guidance: {}", e.getMessage());
            }
        }

        // Mock Fallback
        return CareerGuidanceResponse.builder()
                .recommendedPaths(Arrays.asList("Full Stack Software Engineer", "Java Enterprise Developer", "Database Administrator"))
                .skillGapAnalysis(Arrays.asList(
                        "Lacks cloud infrastructure or DevOps deployment experience (AWS, Azure, CI/CD).",
                        "No exposure to modern frontend frameworks (React, Angular) to complement backend Java skills."
                ))
                .stepsToImprove(Arrays.asList(
                        "Learn dockerization basics and deploy one of your projects to a cloud provider.",
                        "Pick up React basics and build a frontend for your existing Java REST APIs.",
                        "Practice algorithms on LeetCode/HackerRank to prepare for coding rounds."
                ))
                .build();
    }
}

package com.pms.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    // Public / Authentication Views
    @GetMapping({"/", "/index"})
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "forgot-password";
    }

    // Student Views
    @GetMapping("/student/dashboard")
    public String studentDashboard() {
        return "student/dashboard";
    }

    @GetMapping("/student/profile")
    public String studentProfile() {
        return "student/profile";
    }

    @GetMapping("/student/jobs")
    public String studentJobs() {
        return "student/jobs";
    }

    @GetMapping("/student/job-details")
    public String studentJobDetails() {
        return "student/job-details";
    }

    @GetMapping("/student/applied-jobs")
    public String studentAppliedJobs() {
        return "student/applied-jobs";
    }

    @GetMapping("/student/interviews")
    public String studentInterviews() {
        return "student/interviews";
    }

    @GetMapping("/student/certificates")
    public String studentCertificates() {
        return "student/certificates";
    }

    @GetMapping("/student/projects")
    public String studentProjects() {
        return "student/projects";
    }

    @GetMapping("/student/skills")
    public String studentSkills() {
        return "student/skills";
    }

    @GetMapping("/student/resume")
    public String studentResume() {
        return "student/resume";
    }

    @GetMapping("/student/chatbot")
    public String studentChatbot() {
        return "student/chatbot";
    }

    @GetMapping("/student/notifications")
    public String studentNotifications() {
        return "student/notifications";
    }

    @GetMapping("/student/settings")
    public String studentSettings() {
        return "student/settings";
    }

    // Recruiter Views
    @GetMapping("/recruiter/dashboard")
    public String recruiterDashboard() {
        return "recruiter/dashboard";
    }

    @GetMapping("/recruiter/profile")
    public String recruiterProfile() {
        return "recruiter/profile";
    }

    @GetMapping("/recruiter/post-job")
    public String recruiterPostJob() {
        return "recruiter/post-job";
    }

    @GetMapping("/recruiter/manage-jobs")
    public String recruiterManageJobs() {
        return "recruiter/manage-jobs";
    }

    @GetMapping("/recruiter/applicants")
    public String recruiterApplicants() {
        return "recruiter/applicants";
    }

    @GetMapping("/recruiter/interviews")
    public String recruiterInterviews() {
        return "recruiter/interviews";
    }

    @GetMapping("/recruiter/settings")
    public String recruiterSettings() {
        return "recruiter/settings";
    }

    // Admin Views
    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "admin/dashboard";
    }

    @GetMapping("/admin/students")
    public String adminStudents() {
        return "admin/students";
    }

    @GetMapping("/admin/recruiters")
    public String adminRecruiters() {
        return "admin/recruiters";
    }

    @GetMapping("/admin/companies")
    public String adminCompanies() {
        return "admin/companies";
    }

    @GetMapping("/admin/jobs")
    public String adminJobs() {
        return "admin/jobs";
    }

    @GetMapping("/admin/applications")
    public String adminApplications() {
        return "admin/applications";
    }

    @GetMapping("/admin/interviews")
    public String adminInterviews() {
        return "admin/interviews";
    }

    @GetMapping("/admin/reports")
    public String adminReports() {
        return "admin/reports";
    }

    @GetMapping("/admin/analytics")
    public String adminAnalytics() {
        return "admin/analytics";
    }

    @GetMapping("/admin/notifications")
    public String adminNotifications() {
        return "admin/notifications";
    }

    @GetMapping("/admin/users")
    public String adminUsers() {
        return "admin/users";
    }

    @GetMapping("/admin/settings")
    public String adminSettings() {
        return "admin/settings";
    }

    // AI Views
    @GetMapping("/ai/chatbot")
    public String aiChatbot() {
        return "ai/chatbot";
    }

    @GetMapping("/ai/resume-analyzer")
    public String aiResumeAnalyzer() {
        return "ai/resume-analyzer";
    }
}

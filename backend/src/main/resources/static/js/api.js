// AI-Powered Placement Management System - Central API Controller
window.API_BASE = "/api";
window.WS_BASE = "/ws";

// Centralized Application State
window.state = {
    user: null,
    token: null,
    activePanel: "dashboard",
    isMocked: false,
    wsClient: null,
    chatUser: null,
    notifications: []
};

// Initial Mock Databases stored in localStorage if backend fails
window.initMockDBs = () => {
    if (!localStorage.getItem("mock_jobs")) {
        localStorage.setItem("mock_jobs", JSON.stringify([
            { id: 1, title: "Backend Engineer", description: "Develop high-scale REST APIs in Java and Spring Boot.", requirements: "Java, SQL, Git", salaryPackage: 12.5, location: "Bangalore", workType: "HYBRID", applicationDeadline: "2026-07-15T23:59:59", minCgpa: 8.0, maxBacklogs: 0, status: "APPROVED", branches: ["IT", "CSE"], companyName: "TechCorp Inc.", companyLogoUrl: null, recruiterId: 2 },
            { id: 2, title: "Frontend Developer", description: "Build slick interfaces using modern HTML, CSS, JavaScript.", requirements: "CSS Grid, Flexbox, API integration", salaryPackage: 8.0, location: "Remote", workType: "REMOTE", applicationDeadline: "2026-07-20T23:59:59", minCgpa: 7.0, maxBacklogs: 1, status: "PENDING_APPROVAL", branches: ["IT", "CSE", "ECE"], companyName: "PixelStudio", companyLogoUrl: null, recruiterId: 2 }
        ]));
    }
    if (!localStorage.getItem("mock_applications")) {
        localStorage.setItem("mock_applications", JSON.stringify([]));
    }
    if (!localStorage.getItem("mock_interviews")) {
        localStorage.setItem("mock_interviews", JSON.stringify([]));
    }
    if (!localStorage.getItem("mock_reports")) {
        localStorage.setItem("mock_reports", JSON.stringify([]));
    }
};

// REST Request Helper
window.apiRequest = async (path, method = "GET", body = null, isMultipart = false) => {
    const headers = {};
    if (!isMultipart) {
        headers["Content-Type"] = "application/json";
    }
    if (window.state.token) {
        headers["Authorization"] = `Bearer ${window.state.token}`;
    }

    const config = { method, headers };
    if (body) {
        config.body = isMultipart ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${window.API_BASE}${path}`, config);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || `HTTP error: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.warn("Backend API error, falling back to mock database simulation.", err.message);
        window.state.isMocked = true;
        return window.simulateMockRequest(path, method, body);
    }
};

// Simulation Layer for Mock Database
window.simulateMockRequest = (path, method, body) => {
    if (path.startsWith("/auth/login")) {
        const username = body.username;
        return {
            token: "mock_jwt_token",
            id: username === "recruiter" ? 2 : username === "tpo" ? 3 : 1,
            username: username,
            email: `${username}@placement.demo`,
            role: username === "recruiter" ? "RECRUITER" : username === "tpo" ? "PLACEMENT_OFFICER" : "STUDENT"
        };
    }
    if (path.startsWith("/auth/register")) {
        return { id: 99, username: body.username, email: body.email, role: body.role, active: false };
    }
    if (path.startsWith("/auth/verify-otp")) {
        return { message: "Mock OTP Verified" };
    }
    if (path.startsWith("/auth/profile")) {
        const r = window.state.user.role;
        return {
            id: window.state.user.id, username: window.state.user.username, email: window.state.user.email, role: r, isActive: true,
            studentProfile: r === "STUDENT" ? {
                id: 1, rollNumber: "21IT045", branch: "IT", year: 4, cgpa: 8.5, backlogs: 0,
                skills: ["Java", "Spring Boot", "SQL"], projects: [], certificates: [], eligibilityStatus: true
            } : null,
            recruiterProfile: r === "RECRUITER" ? {
                id: 1, designation: "Lead Recruiter", isVerified: true,
                company: { id: 1, name: "TechCorp Inc.", website: "techcorp.com", industry: "IT Services", verificationStatus: "VERIFIED" }
            } : null
        };
    }

    if (path.startsWith("/jobs")) {
        let mockJobs = JSON.parse(localStorage.getItem("mock_jobs")) || [];
        if (method === "GET") {
            if (path.includes("/recruiter")) {
                return mockJobs.filter(j => j.recruiterId === window.state.user.id);
            }
            if (path.includes("/public") || path.endsWith("/jobs")) {
                return mockJobs.filter(j => j.status === "APPROVED");
            }
            if (path.match(/\/jobs\/\d+\/approve/)) {
                const jobId = parseInt(path.split("/")[2]);
                const jobIndex = mockJobs.findIndex(j => j.id === jobId);
                if (jobIndex > -1) {
                    mockJobs[jobIndex].status = "APPROVED";
                    localStorage.setItem("mock_jobs", JSON.stringify(mockJobs));
                    return mockJobs[jobIndex];
                }
            }
        }
        if (method === "POST") {
            const newJob = {
                id: mockJobs.length + 1,
                ...body,
                status: "PENDING_APPROVAL",
                companyName: "MockCorp",
                recruiterId: window.state.user.id
            };
            mockJobs.push(newJob);
            localStorage.setItem("mock_jobs", JSON.stringify(mockJobs));
            return newJob;
        }
    }

    if (path.startsWith("/applications")) {
        let mockApps = JSON.parse(localStorage.getItem("mock_applications")) || [];
        if (method === "POST") {
            const jobId = parseInt(body ? body.jobId : path.split("jobId=")[1]);
            const mockJobs = JSON.parse(localStorage.getItem("mock_jobs")) || [];
            const job = mockJobs.find(j => j.id === jobId) || {};
            const newApp = {
                id: mockApps.length + 1,
                jobId,
                jobTitle: job.title || "Software Engineer",
                companyName: job.companyName || "TechCorp Inc.",
                studentId: 1,
                studentName: window.state.user.username,
                studentRollNumber: "21IT045",
                studentBranch: "IT",
                studentCgpa: 8.5,
                status: "APPLIED",
                appliedAt: new Date().toISOString()
            };
            mockApps.push(newApp);
            localStorage.setItem("mock_applications", JSON.stringify(mockApps));
            return newApp;
        }
        if (method === "GET") {
            if (path.includes("/student")) {
                return mockApps.filter(a => a.studentName === window.state.user.username);
            }
            if (path.includes("/recruiter")) {
                return mockApps;
            }
            if (path.includes("/job/")) {
                const jId = parseInt(path.split("/").pop());
                return mockApps.filter(a => a.jobId === jId);
            }
        }
        if (method === "PUT") {
            const appId = parseInt(path.split("/")[2]);
            const appIndex = mockApps.findIndex(a => a.id === appId);
            if (appIndex > -1) {
                const status = path.split("status=")[1] || "UNDER_REVIEW";
                mockApps[appIndex].status = status;
                localStorage.setItem("mock_applications", JSON.stringify(mockApps));
                return mockApps[appIndex];
            }
        }
    }

    if (path.startsWith("/reports")) {
        let reports = JSON.parse(localStorage.getItem("mock_reports")) || [];
        if (method === "POST") {
            const rType = path.includes("reportType=") ? path.split("reportType=")[1].split("&")[0] : "GENERAL";
            const newReport = {
                id: reports.length + 1,
                title: "Mock System Compilation",
                reportType: rType,
                dataJson: JSON.stringify({
                    totalStudentsRegistered: 48,
                    totalStudentsPlaced: 36,
                    placementPercentage: 75.0,
                    averagePlacedCgpa: 8.4,
                    averageUnplacedCgpa: 7.1,
                    totalApplications: 110,
                    minimumPackageLPA: 4.5,
                    maximumPackageLPA: 18.0,
                    averagePackageLPA: 7.8
                }),
                createdBy: { username: window.state.user.username },
                createdAt: new Date().toISOString()
            };
            reports.push(newReport);
            localStorage.setItem("mock_reports", JSON.stringify(reports));
            return newReport;
        }
        if (method === "GET") {
            return reports;
        }
    }

    if (path.startsWith("/ai")) {
        if (path.includes("analyze-resume")) {
            return {
                parsedSkills: ["Java", "SQL", "Spring Boot", "Git"],
                atsScore: 82,
                missingSkills: ["Docker", "AWS"],
                improvements: ["Incorporate cloud architecture examples.", "Highlight database query optimization."],
                matchPercentage: 78,
                industryReadinessScore: 85
            };
        }
        if (path.includes("mock-questions")) {
            return {
                questions: [
                    "Explain the difference between a REST API and a SOAP API.",
                    "How does Spring Boot configure standard beans?",
                    "What is query indexing in MySQL and why is it important?",
                    "Describe a time you solved a complex backend issue.",
                    "What is transaction rollback in JPA databases?"
                ]
            };
        }
        if (path.includes("assess-answer")) {
            return {
                score: 8,
                technicalFeedback: "The concept of DI and inversion of control is correct. Try to also mention Bean Scopes.",
                confidenceAnalysis: "Articulation is excellent. Use technical terms like ApplicationContext.",
                sampleAnswer: "A standard Spring DI response managing IOC container and auto-wired components."
            };
        }
        if (path.includes("career-guidance")) {
            return {
                recommendedPaths: ["Full Stack Java Developer", "Cloud Solutions Architect", "Database Administrator"],
                skillGapAnalysis: ["Lacks container deployments (Docker/Kubernetes).", "No frontend React/Vue expertise."],
                stepsToImprove: ["Implement docker containers on AWS.", "Build a portfolio project combining React & Spring Boot."]
            };
        }
    }

    if (path.startsWith("/interviews")) {
        let mockInt = JSON.parse(localStorage.getItem("mock_interviews")) || [];
        if (method === "POST") {
            const newInt = {
                id: mockInt.length + 1,
                title: body.title,
                dateTime: body.dateTime || new Date().toISOString(),
                locationLink: body.locationLink || "http://meet.google.com/abc",
                durationMinutes: body.durationMinutes || 30,
                status: "SCHEDULED"
            };
            mockInt.push(newInt);
            localStorage.setItem("mock_interviews", JSON.stringify(mockInt));
            return newInt;
        }
        if (method === "GET") {
            return mockInt;
        }
    }

    return {};
};

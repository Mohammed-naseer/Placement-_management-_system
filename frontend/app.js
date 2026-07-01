// AI-Powered Placement Management System - Frontend App Controller
const API_BASE = "http://localhost:8080/api";
const WS_BASE = "http://localhost:8080/ws";

// Global App State
let state = {
    user: null,
    token: null,
    activePanel: "dashboard",
    isMocked: false,
    wsClient: null,
    chatUser: null, // User currently messaging with
    notifications: []
};

// Initial Mock Databases stored in localStorage if backend fails
const initMockDBs = () => {
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

// Bootstrap App
document.addEventListener("DOMContentLoaded", () => {
    initMockDBs();
    
    // Check for saved login session
    const savedSession = localStorage.getItem("pms_session");
    if (savedSession) {
        try {
            const data = JSON.parse(savedSession);
            state.user = data.user;
            state.token = data.token;
            state.isMocked = data.isMocked || false;
            showPortalView();
        } catch (e) {
            localStorage.removeItem("pms_session");
        }
    }

    // Attach authentication form submit handlers
    document.getElementById("login-form").addEventListener("submit", handleLogin);
    document.getElementById("register-form").addEventListener("submit", handleRegister);
    document.getElementById("logout-btn").addEventListener("click", handleLogout);
});

// Toast Alerts
const showToast = (title, desc, type = "info") => {
    const banner = document.getElementById("toast-banner");
    const titleEl = document.getElementById("toast-title");
    const descEl = document.getElementById("toast-desc");
    const iconEl = document.getElementById("toast-icon");

    titleEl.textContent = title;
    descEl.textContent = desc;
    
    let color = "var(--accent-blue)";
    let icon = '<i class="fa-solid fa-info-circle"></i>';
    if (type === "success") {
        color = "var(--accent-emerald)";
        icon = '<i class="fa-solid fa-circle-check"></i>';
    } else if (type === "error") {
        color = "var(--accent-rose)";
        icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    } else if (type === "warning") {
        color = "var(--accent-amber)";
        icon = '<i class="fa-solid fa-bell"></i>';
    }

    banner.style.borderLeftColor = color;
    iconEl.innerHTML = icon;
    iconEl.style.color = color;
    banner.style.display = "block";

    setTimeout(hideToast, 5000);
};

const hideToast = () => {
    document.getElementById("toast-banner").style.display = "none";
};

// Auth Tab Switching
const switchAuthTab = (tab) => {
    document.getElementById("tab-login").classList.toggle("active", tab === "login");
    document.getElementById("tab-register").classList.toggle("active", tab === "register");
    document.getElementById("login-form").style.display = tab === "login" ? "block" : "none";
    document.getElementById("register-form").style.display = tab === "register" ? "block" : "none";
    document.getElementById("otp-wrapper").style.display = "none";
};

const toggleRoleFields = () => {
    const role = document.getElementById("reg-role").value;
    document.getElementById("student-only-fields").style.display = role === "STUDENT" ? "block" : "none";
    document.getElementById("recruiter-only-fields").style.display = role === "RECRUITER" ? "block" : "none";
};

// REST Request Helper
const apiRequest = async (path, method = "GET", body = null, isMultipart = false) => {
    const headers = {};
    if (!isMultipart) {
        headers["Content-Type"] = "application/json";
    }
    if (state.token) {
        headers["Authorization"] = `Bearer ${state.token}`;
    }

    const config = { method, headers };
    if (body) {
        config.body = isMultipart ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${path}`, config);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || `HTTP error: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.warn("Backend API error, falling back to mock database simulation.", err.message);
        state.isMocked = true;
        return simulateMockRequest(path, method, body);
    }
};

// Simulation Layer for Mock Database
const simulateMockRequest = (path, method, body) => {
    // 1. Auth Routing
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
        const r = state.user.role;
        return {
            id: state.user.id, username: state.user.username, email: state.user.email, role: r, isActive: true,
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

    // 2. Jobs
    if (path.startsWith("/jobs")) {
        let mockJobs = JSON.parse(localStorage.getItem("mock_jobs"));
        if (method === "GET") {
            if (path.includes("/recruiter")) {
                return mockJobs.filter(j => j.recruiterId === state.user.id);
            }
            if (path.includes("/public") || path.endsWith("/jobs")) {
                return mockJobs.filter(j => j.status === "APPROVED");
            }
            // Approve route
            if (path.match(/\/jobs\/\d+\/approve/)) {
                const jobId = parseInt(path.split("/")[2]);
                const jobIndex = mockJobs.findIndex(j => j.id === jobId);
                if (jobIndex > -1) {
                    const params = new URLSearchParams(path.split("?")[1]);
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
                recruiterId: state.user.id
            };
            mockJobs.push(newJob);
            localStorage.setItem("mock_jobs", JSON.stringify(mockJobs));
            return newJob;
        }
    }

    // 3. Applications
    if (path.startsWith("/applications")) {
        let mockApps = JSON.parse(localStorage.getItem("mock_applications"));
        if (method === "POST") {
            const params = new URLSearchParams(path.split("?")[1]);
            const jobId = parseInt(body ? body.jobId : path.split("jobId=")[1]);
            const mockJobs = JSON.parse(localStorage.getItem("mock_jobs"));
            const job = mockJobs.find(j => j.id === jobId) || {};
            const newApp = {
                id: mockApps.length + 1,
                jobId,
                jobTitle: job.title || "Software Engineer",
                companyName: job.companyName || "TechCorp Inc.",
                studentId: 1,
                studentName: state.user.username,
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
                return mockApps.filter(a => a.studentName === state.user.username);
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
            // Status Update
            const appId = parseInt(path.split("/")[2]);
            const appIndex = mockApps.findIndex(a => a.id === appId);
            if (appIndex > -1) {
                // Extracts status from URL param
                const status = path.split("status=")[1] || "UNDER_REVIEW";
                mockApps[appIndex].status = status;
                localStorage.setItem("mock_applications", JSON.stringify(mockApps));
                return mockApps[appIndex];
            }
        }
    }

    // 4. Reports
    if (path.startsWith("/reports")) {
        let reports = JSON.parse(localStorage.getItem("mock_reports"));
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
                createdBy: { username: state.user.username },
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

    // 5. AI features
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

    // 6. Interviews
    if (path.startsWith("/interviews")) {
        let mockInt = JSON.parse(localStorage.getItem("mock_interviews"));
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

// Login Handler
const handleLogin = async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await apiRequest("/auth/login", "POST", { username, password });
        state.user = { id: res.id, username: res.username, email: res.email, role: res.role };
        state.token = res.token;
        
        // Save Session
        localStorage.setItem("pms_session", JSON.stringify({
            user: state.user,
            token: state.token,
            isMocked: state.isMocked
        }));

        showToast("Success", "Welcome back, " + username + "!", "success");
        showPortalView();
    } catch (err) {
        showToast("Login Failed", err.message, "error");
    }
};

// Register Handler
const handleRegister = async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const role = document.getElementById("reg-role").value;

    const payload = { username, email, password, role };

    if (role === "STUDENT") {
        payload.rollNumber = document.getElementById("reg-roll").value;
        payload.branch = document.getElementById("reg-branch").value;
        payload.year = parseInt(document.getElementById("reg-year").value);
        payload.cgpa = parseFloat(document.getElementById("reg-cgpa").value);
        payload.backlogs = parseInt(document.getElementById("reg-backlogs").value || 0);
    } else if (role === "RECRUITER") {
        payload.companyName = document.getElementById("reg-company").value;
        payload.designation = document.getElementById("reg-designation").value;
        payload.companyWebsite = document.getElementById("reg-website").value;
    }

    try {
        await apiRequest("/auth/register", "POST", payload);
        showToast("Registration Success", "An OTP verification code was sent to " + email, "success");
        
        // Save register username temporarily and show OTP card
        state.tempUsername = username;
        document.getElementById("otp-wrapper").style.display = "block";
    } catch (err) {
        showToast("Registration Failed", err.message, "error");
    }
};

const verifyOtp = async () => {
    const otp = document.getElementById("otp-code").value;
    if (otp.length !== 6) {
        showToast("Validation Error", "OTP must be exactly 6 digits", "error");
        return;
    }

    try {
        await apiRequest(`/auth/verify-otp?username=${state.tempUsername}&otp=${otp}`, "POST");
        showToast("Verified", "Verification successful! You can now log in.", "success");
        switchAuthTab("login");
    } catch (err) {
        showToast("Verification Failed", err.message, "error");
    }
};

const resendOtp = async () => {
    try {
        await apiRequest(`/auth/generate-otp?username=${state.tempUsername}`, "POST");
        showToast("OTP Sent", "A new OTP code was dispatched.", "success");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// Logout Handler
const handleLogout = () => {
    // Terminate WS connection
    if (state.wsClient) {
        state.wsClient.disconnect();
        state.wsClient = null;
    }
    
    state.user = null;
    state.token = null;
    localStorage.removeItem("pms_session");
    
    document.getElementById("main-header").style.display = "none";
    document.getElementById("portal-view").style.display = "none";
    document.getElementById("auth-view").style.display = "flex";
    showToast("Logged Out", "Goodbye!", "info");
};

// Switch Views
const showPortalView = () => {
    document.getElementById("auth-view").style.display = "none";
    document.getElementById("main-header").style.display = "block";
    document.getElementById("portal-view").style.display = "grid";

    // Set Avatar & Info
    document.getElementById("nav-username").textContent = state.user.username;
    document.getElementById("nav-role").textContent = state.user.role.replace("_", " ");
    document.getElementById("nav-avatar").textContent = state.user.username.charAt(0).toUpperCase();

    // Render Side Menu and Default Panel
    renderSidebarMenu();
    switchPanel("dashboard");

    // Initiate WebSockets for chat alerts
    initWebSockets();
};

// Dynamic Sidebar Menu based on Role
const renderSidebarMenu = () => {
    const menu = document.getElementById("sidebar-menu");
    menu.innerHTML = "";

    const items = [
        { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" }
    ];

    if (state.user.role === "STUDENT") {
        items.push(
            { id: "profile", label: "My Portfolio", icon: "fa-user-graduate" },
            { id: "jobs", label: "Job Postings", icon: "fa-briefcase" },
            { id: "ai-parser", label: "AI Resume ATS Matcher", icon: "fa-robot" },
            { id: "career-guide", label: "AI Career Advisor", icon: "fa-compass" }
        );
    } else if (state.user.role === "RECRUITER") {
        items.push(
            { id: "post-job", label: "Post a Job", icon: "fa-plus-circle" },
            { id: "my-jobs", label: "My Job Postings", icon: "fa-folder-open" },
            { id: "applicants", label: "Applicants", icon: "fa-users-line" }
        );
    } else if (state.user.role === "PLACEMENT_OFFICER") {
        items.push(
            { id: "tpo-approvals", label: "Pending Job Approvals", icon: "fa-signature" },
            { id: "tpo-reports", label: "Placement Reports", icon: "fa-file-invoice-dollar" }
        );
    }

    // Chat is common for all authenticated users
    items.push({ id: "chat", label: "Chat Support", icon: "fa-comments" });

    items.forEach(item => {
        const li = document.createElement("li");
        li.className = `sidebar-item ${state.activePanel === item.id ? "active" : ""}`;
        li.innerHTML = `<i class="fa-solid ${item.icon}"></i> <span>${item.label}</span>`;
        li.onclick = () => switchPanel(item.id);
        menu.appendChild(li);
    });
};

const switchPanel = (panelId) => {
    state.activePanel = panelId;
    
    // Highlight sidebar active item
    const items = document.querySelectorAll(".sidebar-item");
    items.forEach(item => {
        const text = item.querySelector("span").textContent.toLowerCase();
        // Check fuzzy match
        item.classList.toggle("active", 
            (panelId === "dashboard" && text.includes("dashboard")) ||
            (panelId === "profile" && text.includes("portfolio")) ||
            (panelId === "jobs" && text.includes("job postings")) ||
            (panelId === "ai-parser" && text.includes("ats")) ||
            (panelId === "career-guide" && text.includes("career")) ||
            (panelId === "post-job" && text.includes("post a job")) ||
            (panelId === "my-jobs" && text.includes("my job")) ||
            (panelId === "applicants" && text.includes("applicants")) ||
            (panelId === "tpo-approvals" && text.includes("approvals")) ||
            (panelId === "tpo-reports" && text.includes("reports")) ||
            (panelId === "chat" && text.includes("chat"))
        );
    });

    renderPanelContent(panelId);
};

// Panel content router and generator
const renderPanelContent = async (panelId) => {
    const container = document.getElementById("panel-content");
    container.innerHTML = `<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-blue);"></i><p style="margin-top: 1rem; color: var(--text-secondary);">Loading panel data...</p></div>`;

    let html = "";

    try {
        switch (panelId) {
            case "dashboard":
                html = await generateDashboardPanel();
                break;
            case "profile":
                html = await generateProfilePanel();
                break;
            case "jobs":
                html = await generateJobsPanel();
                break;
            case "ai-parser":
                html = generateAIParserPanel();
                break;
            case "career-guide":
                html = generateCareerGuidePanel();
                break;
            case "post-job":
                html = generatePostJobPanel();
                break;
            case "my-jobs":
                html = await generateMyJobsPanel();
                break;
            case "applicants":
                html = await generateApplicantsPanel();
                break;
            case "tpo-approvals":
                html = await generateTPOApprovalsPanel();
                break;
            case "tpo-reports":
                html = await generateTPOReportsPanel();
                break;
            case "chat":
                html = generateChatPanel();
                break;
            default:
                html = `<div class="glass-card"><h2>Welcome</h2><p>Page content is under development.</p></div>`;
        }
    } catch (e) {
        html = `<div class="glass-card" style="border-color: var(--accent-rose);"><h3>Error Loading Data</h3><p style="color: var(--accent-rose); margin-top: 0.5rem;">${e.message}</p></div>`;
    }

    container.innerHTML = html;
};

// Panel Generator: General Dashboard View
const generateDashboardPanel = async () => {
    let notificationsHtml = "";
    
    // Fetch notifications
    try {
        const notifs = await apiRequest("/notifications/unread", "GET");
        state.notifications = notifs;
        if (notifs.length === 0) {
            notificationsHtml = `<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No unread alerts or notifications.</p>`;
        } else {
            notificationsHtml = notifs.map(n => `
                <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="font-size: 0.95rem;"><i class="fa-solid fa-bell" style="color: var(--accent-amber); margin-right: 0.5rem;"></i> ${n.title}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${n.message}</p>
                    </div>
                    <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="markNotificationRead(${n.id})">Mark read</button>
                </div>
            `).join("");
        }
    } catch (e) {
        notificationsHtml = `<p style="color: var(--accent-rose); text-align: center;">Alert configurations loading error.</p>`;
    }

    // Role Specific Analytics Stats
    let stats = "";
    if (state.user.role === "STUDENT") {
        stats = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-briefcase"></i></div>
                    <div class="stat-info"><h3>8.5</h3><p>Current CGPA</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="stat-info"><h3>Eligible</h3><p>Status</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(139, 92, 246, 0.1); color: var(--accent-purple);"><i class="fa-solid fa-file-export"></i></div>
                    <div class="stat-info"><h3>2</h3><p>Active Applications</p></div>
                </div>
            </div>
        `;
    } else if (state.user.role === "RECRUITER") {
        stats = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-file-invoice"></i></div>
                    <div class="stat-info"><h3>5</h3><p>Open Positions</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald);"><i class="fa-solid fa-users"></i></div>
                    <div class="stat-info"><h3>14</h3><p>Total Candidates</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--accent-amber);"><i class="fa-solid fa-calendar-days"></i></div>
                    <div class="stat-info"><h3>3</h3><p>Interviews Scheduled</p></div>
                </div>
            </div>
        `;
    } else {
        stats = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-university"></i></div>
                    <div class="stat-info"><h3>120</h3><p>Students Enrolled</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald);"><i class="fa-solid fa-award"></i></div>
                    <div class="stat-info"><h3>86%</h3><p>Placement Rate</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(139, 92, 246, 0.1); color: var(--accent-purple);"><i class="fa-solid fa-building"></i></div>
                    <div class="stat-info"><h3>14</h3><p>Partner Companies</p></div>
                </div>
            </div>
        `;
    }

    return `
        <h2>Overview Dashboard</h2>
        <p style="color: var(--text-secondary); margin-top: -1.5rem; margin-bottom: 1.5rem;">Quick stats and system updates.</p>
        ${stats}
        <div class="glass-card" style="margin-top: 1.5rem;">
            <div class="card-header">
                <h3><i class="fa-solid fa-bullhorn"></i> Important Placement Notifications</h3>
                ${state.notifications.length > 0 ? `<button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="markAllNotificationsRead()">Mark all as read</button>` : ""}
            </div>
            <div class="notifications-list">
                ${notificationsHtml}
            </div>
        </div>
    `;
};

// Panel Generator: My Portfolio for Students
const generateProfilePanel = async () => {
    const profile = await apiRequest("/auth/profile", "GET");
    const sp = profile.studentProfile || {};

    const projectsHtml = (sp.projects || []).map(p => `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h4>${p.title}</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${p.description}</p>
                <p style="font-size: 0.8rem; color: var(--accent-blue); margin-top: 0.5rem;"><i class="fa-solid fa-code"></i> Tech: ${p.technologiesUsed}</p>
            </div>
            <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="deleteProject(${p.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join("");

    const certsHtml = (sp.certificates || []).map(c => `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h4>${c.name}</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">Issued by: ${c.issuingOrganization}</p>
            </div>
            <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="deleteCertificate(${c.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join("");

    return `
        <h2>My Academic Portfolio</h2>
        <div class="glass-card">
            <h3><i class="fa-solid fa-graduation-cap"></i> Profile Details</h3>
            <form id="profile-details-form" onsubmit="updateStudentProfile(event)" style="margin-top: 1.5rem;">
                <div class="form-row">
                    <div class="form-group">
                        <label>Roll Number</label>
                        <input type="text" id="prof-roll" value="${sp.rollNumber || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Branch</label>
                        <input type="text" id="prof-branch" value="${sp.branch || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Section</label>
                        <input type="text" id="prof-section" value="${sp.section || ''}">
                    </div>
                    <div class="form-group">
                        <label>Year</label>
                        <input type="number" id="prof-year" value="${sp.year || 4}" min="1" max="4" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>CGPA</label>
                        <input type="number" id="prof-cgpa" value="${sp.cgpa || 0.0}" step="0.01" min="0" max="10" required>
                    </div>
                    <div class="form-group">
                        <label>Active Backlogs</label>
                        <input type="number" id="prof-backlogs" value="${sp.backlogs || 0}" min="0" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>LinkedIn URL</label>
                        <input type="text" id="prof-linkedin" value="${sp.linkedinUrl || ''}">
                    </div>
                    <div class="form-group">
                        <label>GitHub URL</label>
                        <input type="text" id="prof-github" value="${sp.githubUrl || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Resume URL (Upload below or link directly)</label>
                    <input type="text" id="prof-resume" value="${sp.resumeUrl || ''}">
                </div>
                <button type="submit" class="btn">Save Profile Changes</button>
            </form>
        </div>

        <div class="glass-card" style="margin-top: 1.5rem;">
            <h3><i class="fa-solid fa-file-pdf"></i> Upload Resume</h3>
            <div style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;">
                <input type="file" id="resume-file-input" accept=".pdf,.doc,.docx" style="max-width: 300px;">
                <button class="btn btn-secondary" onclick="uploadResumeFile()"><i class="fa-solid fa-cloud-arrow-up"></i> Upload</button>
            </div>
            ${sp.resumeUrl ? `<p style="margin-top: 1rem; font-size: 0.85rem; color: var(--accent-emerald);"><i class="fa-solid fa-check-circle"></i> Active Resume: <a href="${sp.resumeUrl}" target="_blank" style="color: var(--text-primary); text-decoration: underline;">Open Link</a></p>` : ""}
        </div>

        <div class="form-row" style="margin-top: 1.5rem;">
            <div class="glass-card">
                <div class="card-header">
                    <h3><i class="fa-solid fa-diagram-project"></i> Projects</h3>
                    <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="showAddProjectModal()"><i class="fa-solid fa-plus"></i> Add</button>
                </div>
                <div id="projects-list">${projectsHtml || "<p style='color: var(--text-muted); font-size: 0.85rem;'>No projects listed.</p>"}</div>
            </div>

            <div class="glass-card">
                <div class="card-header">
                    <h3><i class="fa-solid fa-certificate"></i> Certifications</h3>
                    <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="showAddCertModal()"><i class="fa-solid fa-plus"></i> Add</button>
                </div>
                <div id="certs-list">${certsHtml || "<p style='color: var(--text-muted); font-size: 0.85rem;'>No certifications listed.</p>"}</div>
            </div>
        </div>

        <!-- Add Project Modals -->
        <div id="project-modal" class="auth-wrapper" style="display: none; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.8); z-index: 9999;">
            <div class="auth-card">
                <h3>Add New Project</h3>
                <form onsubmit="addProjectSubmit(event)" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label>Project Title</label>
                        <input type="text" id="proj-title" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="proj-desc" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Technologies Used (comma separated)</label>
                        <input type="text" id="proj-tech" placeholder="Java, MySQL, React" required>
                    </div>
                    <div class="form-group">
                        <label>Project Link (GitHub/live)</label>
                        <input type="text" id="proj-url">
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('project-modal')">Cancel</button>
                        <button type="submit" class="btn">Add Project</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Add Certificate Modal -->
        <div id="cert-modal" class="auth-wrapper" style="display: none; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.8); z-index: 9999;">
            <div class="auth-card">
                <h3>Add New Certification</h3>
                <form onsubmit="addCertSubmit(event)" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label>Certificate Name</label>
                        <input type="text" id="cert-name" required>
                    </div>
                    <div class="form-group">
                        <label>Issuing Organization</label>
                        <input type="text" id="cert-org" required>
                    </div>
                    <div class="form-group">
                        <label>Credential URL</label>
                        <input type="text" id="cert-url">
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('cert-modal')">Cancel</button>
                        <button type="submit" class="btn">Add Certificate</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// Panel Generator: Job Postings view for Students
const generateJobsPanel = async () => {
    const jobs = await apiRequest("/jobs/public", "GET");
    const studentApps = await apiRequest("/applications/student", "GET");

    const appliedJobIds = new Set(studentApps.map(a => a.jobId));

    const jobsHtml = jobs.map(j => {
        const isApplied = appliedJobIds.has(j.id);
        return `
            <div class="job-card">
                <div class="job-details">
                    <div class="company-logo"><i class="fa-solid fa-building"></i></div>
                    <div class="job-info">
                        <h3 style="font-size: 1.25rem;">${j.title}</h3>
                        <p style="color: var(--accent-cyan); font-weight: 500;">${j.companyName}</p>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">${j.description}</p>
                        <div class="job-meta">
                            <span><i class="fa-solid fa-money-bill-wave"></i> ${j.salaryPackage} LPA</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${j.location}</span>
                            <span><i class="fa-solid fa-briefcase"></i> ${j.workType}</span>
                        </div>
                    </div>
                </div>
                <div class="job-actions">
                    <span class="badge badge-approved">Approved</span>
                    ${isApplied ? `
                        <button class="btn btn-secondary" style="padding: 0.5rem 1rem;" disabled><i class="fa-solid fa-check"></i> Applied</button>
                    ` : `
                        <button class="btn" style="padding: 0.5rem 1rem;" onclick="applyToJob(${j.id})">Apply Now <i class="fa-solid fa-paper-plane"></i></button>
                    `}
                </div>
            </div>
        `;
    }).join("");

    return `
        <h2>Available Job Opportunities</h2>
        <div class="jobs-list">
            ${jobsHtml || "<p style='color: var(--text-secondary); text-align: center; padding: 2rem;'>No active jobs available for recruitment at the moment.</p>"}
        </div>
    `;
};

// Panel Generator: AI Resume ATS Parser
const generateAIParserPanel = () => {
    return `
        <h2>AI Resume ATS Matcher</h2>
        <p style="color: var(--text-secondary); margin-top: -1.5rem; margin-bottom: 1.5rem;">Analyze your resume against any job description to compute your ATS compatibility score.</p>
        
        <div class="glass-card">
            <form onsubmit="runAIResumeAnalysis(event)">
                <div class="form-group">
                    <label>Paste Resume Text</label>
                    <textarea id="ai-resume-text" rows="5" placeholder="Paste the content of your resume here..." required></textarea>
                </div>
                <div class="form-group">
                    <label>Paste Target Job Description</label>
                    <textarea id="ai-job-desc" rows="4" placeholder="Paste the target job description details here..." required></textarea>
                </div>
                <button type="submit" class="btn"><i class="fa-solid fa-brain"></i> Run AI Match Analysis</button>
            </form>
        </div>

        <div id="ai-analysis-results" style="display: none; margin-top: 1.5rem;" class="glass-card">
            <!-- Results filled by JS -->
        </div>
    `;
};

// Panel Generator: AI Career Advisor
const generateCareerGuidePanel = () => {
    return `
        <h2>AI Career Advisor</h2>
        <p style="color: var(--text-secondary); margin-top: -1.5rem; margin-bottom: 1.5rem;">Analyze your academic records, certificates, and projects for custom path recommendations.</p>
        
        <div class="glass-card" style="text-align: center; padding: 3rem;">
            <i class="fa-solid fa-compass" style="font-size: 3rem; color: var(--accent-cyan); margin-bottom: 1.5rem;"></i>
            <h3>Get Personalized Career Advice</h3>
            <p style="color: var(--text-secondary); margin: 0.5rem 0 1.5rem 0; max-width: 500px; margin-inline: auto;">Our Gemini-powered analysis engine reviews your profile against top tech industry benchmarks to evaluate skill gaps and suggest paths.</p>
            <button class="btn" onclick="runAICareerAdvisor()"><i class="fa-solid fa-magic"></i> Generate Career Guidance Report</button>
        </div>

        <div id="ai-career-results" style="display: none; margin-top: 1.5rem;" class="glass-card">
            <!-- Results filled by JS -->
        </div>
    `;
};

// Panel Generator: Recruiter Job Posting
const generatePostJobPanel = () => {
    return `
        <h2>Post a New Job Opportunity</h2>
        <div class="glass-card">
            <form onsubmit="postNewJob(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Job Title</label>
                        <input type="text" id="job-title" placeholder="e.g. Lead Devops Engineer" required>
                    </div>
                    <div class="form-group">
                        <label>Salary Package (LPA)</label>
                        <input type="number" id="job-salary" step="0.1" placeholder="e.g. 14.5" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="job-desc" rows="4" placeholder="Detail standard daily tasks and role scope..." required></textarea>
                </div>
                <div class="form-group">
                    <label>Core Requirements / Skills (comma separated)</label>
                    <input type="text" id="job-reqs" placeholder="e.g. Docker, AWS, Node.js" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Job Location</label>
                        <input type="text" id="job-location" placeholder="e.g. Bangalore, Remote" required>
                    </div>
                    <div class="form-group">
                        <label>Work Type</label>
                        <select id="job-work-type" required>
                            <option value="REMOTE">Remote</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="ON_SITE">On-Site</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Minimum Eligible CGPA</label>
                        <input type="number" id="job-min-cgpa" step="0.1" value="0.0">
                    </div>
                    <div class="form-group">
                        <label>Maximum Allowed Backlogs</label>
                        <input type="number" id="job-max-backlogs" value="0">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Application Deadline</label>
                        <input type="datetime-local" id="job-deadline" required>
                    </div>
                    <div class="form-group">
                        <label>Open to Branches (comma separated)</label>
                        <input type="text" id="job-branches" placeholder="IT, CSE, ECE" required>
                    </div>
                </div>
                <button type="submit" class="btn" style="margin-top: 1rem;"><i class="fa-solid fa-paper-plane"></i> Publish Posting for TPO Approval</button>
            </form>
        </div>
    `;
};

// Panel Generator: Recruiter My Job Postings
const generateMyJobsPanel = async () => {
    const jobs = await apiRequest("/jobs/recruiter", "GET");

    const jobsHtml = jobs.map(j => `
        <div class="job-card">
            <div class="job-details">
                <div class="company-logo"><i class="fa-solid fa-briefcase"></i></div>
                <div class="job-info">
                    <h3 style="font-size: 1.25rem;">${j.title}</h3>
                    <div class="job-meta">
                        <span><i class="fa-solid fa-money-bill-wave"></i> ${j.salaryPackage} LPA</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${j.location}</span>
                    </div>
                </div>
            </div>
            <div class="job-actions">
                <span class="badge ${j.status === 'APPROVED' ? 'badge-approved' : j.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}">${j.status}</span>
                <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="deleteJob(${j.id})"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join("");

    return `
        <h2>My Published Job Postings</h2>
        <div class="jobs-list">
            ${jobsHtml || "<p style='color: var(--text-secondary); text-align: center; padding: 2rem;'>You have not posted any jobs yet.</p>"}
        </div>
    `;
};

// Panel Generator: Recruiter Applicants list
const generateApplicantsPanel = async () => {
    const apps = await apiRequest("/applications/recruiter", "GET");

    const appsHtml = apps.map(a => `
        <div class="job-card">
            <div class="job-details">
                <div class="company-logo"><i class="fa-solid fa-user-graduate"></i></div>
                <div class="job-info">
                    <h3 style="font-size: 1.25rem;">${a.studentName}</h3>
                    <p style="color: var(--accent-cyan); font-weight: 500;">Applying for: ${a.jobTitle}</p>
                    <div class="job-meta">
                        <span>Roll: ${a.studentRollNumber}</span>
                        <span>Branch: ${a.studentBranch}</span>
                        <span>CGPA: ${a.studentCgpa}</span>
                    </div>
                    ${a.resumeUrl ? `<p style="margin-top: 0.5rem; font-size: 0.85rem;"><i class="fa-solid fa-file-pdf"></i> Resume: <a href="${a.resumeUrl}" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">View Candidate Resume</a></p>` : ""}
                </div>
            </div>
            <div class="job-actions">
                <span class="badge badge-review">${a.status}</span>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="btn" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="showScheduleModal(${a.id})"><i class="fa-solid fa-calendar-plus"></i> Schedule Interview</button>
                    <select onchange="updateApplicationStatus(${a.id}, this.value)" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; width: auto; background: var(--bg-tertiary);">
                        <option value="">Update Status</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="SHORTLISTED">Shortlist</option>
                        <option value="SELECTED">Select Candidate</option>
                        <option value="REJECTED">Reject</option>
                    </select>
                </div>
            </div>
        </div>
    `).join("");

    return `
        <h2>Candidate Applications</h2>
        <div class="jobs-list">
            ${appsHtml || "<p style='color: var(--text-secondary); text-align: center; padding: 2rem;'>No applicants listed for your job opportunities yet.</p>"}
        </div>

        <!-- Schedule Interview Modal -->
        <div id="schedule-modal" class="auth-wrapper" style="display: none; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.8); z-index: 9999;">
            <div class="auth-card">
                <h3>Schedule Candidate Interview</h3>
                <form onsubmit="scheduleInterviewSubmit(event)" style="margin-top: 1.5rem;">
                    <input type="hidden" id="sched-app-id">
                    <div class="form-group">
                        <label>Interview Title</label>
                        <input type="text" id="sched-title" placeholder="e.g. Technical Round 1" required>
                    </div>
                    <div class="form-group">
                        <label>Date & Time</label>
                        <input type="datetime-local" id="sched-datetime" required>
                    </div>
                    <div class="form-group">
                        <label>Meeting Link (Google Meet / Zoom)</label>
                        <input type="url" id="sched-link" placeholder="https://meet.google.com/..." required>
                    </div>
                    <div class="form-group">
                        <label>Duration (Minutes)</label>
                        <input type="number" id="sched-duration" value="30" required>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('schedule-modal')">Cancel</button>
                        <button type="submit" class="btn">Schedule</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// Panel Generator: TPO Approvals
const generateTPOApprovalsPanel = async () => {
    const jobs = await apiRequest("/jobs?status=PENDING_APPROVAL", "GET");
    const pendingJobs = jobs.filter(j => j.status === "PENDING_APPROVAL");

    const approvalsHtml = pendingJobs.map(j => `
        <div class="job-card">
            <div class="job-details">
                <div class="company-logo"><i class="fa-solid fa-briefcase"></i></div>
                <div class="job-info">
                    <h3 style="font-size: 1.25rem;">${j.title}</h3>
                    <p style="color: var(--accent-cyan); font-weight: 500;">Company: ${j.companyName}</p>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">${j.description}</p>
                    <div class="job-meta">
                        <span>Min CGPA: ${j.minCgpa}</span>
                        <span>Package: ${j.salaryPackage} LPA</span>
                        <span>Deadline: ${new Date(j.applicationDeadline).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="job-actions">
                <span class="badge badge-pending">Pending Approval</span>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="approveJob(${j.id}, 'APPROVED')"><i class="fa-solid fa-check"></i> Approve</button>
                    <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="approveJob(${j.id}, 'REJECTED')"><i class="fa-solid fa-times"></i> Reject</button>
                </div>
            </div>
        </div>
    `).join("");

    return `
        <h2>Pending Recruiter Job Postings</h2>
        <div class="jobs-list">
            ${approvalsHtml || "<p style='color: var(--text-secondary); text-align: center; padding: 2rem;'>No pending job posts waiting for approvals.</p>"}
        </div>
    `;
};

// Panel Generator: TPO Reports Compilation
const generateTPOReportsPanel = async () => {
    const reports = await apiRequest("/reports", "GET");

    const reportsHtml = reports.map(r => {
        let stats = {};
        try {
            stats = JSON.parse(r.dataJson);
        } catch (e) {}

        return `
            <div class="job-card" style="align-items: center;">
                <div class="job-details">
                    <div class="company-logo"><i class="fa-solid fa-file-lines"></i></div>
                    <div class="job-info">
                        <h3 style="font-size: 1.15rem;">${r.title}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">Type: ${r.reportType} | Compiled by: ${r.createdBy.username}</p>
                    </div>
                </div>
                <div class="job-actions">
                    <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick='showReportDetails(${JSON.stringify(stats)})'><i class="fa-solid fa-chart-simple"></i> View Analytics</button>
                </div>
            </div>
        `;
    }).join("");

    return `
        <h2>Placement Analytics Reports</h2>
        <div class="glass-card" style="margin-bottom: 1.5rem;">
            <h3>Compile New Report</h3>
            <form onsubmit="compileReportSubmit(event)" style="margin-top: 1rem; display: flex; gap: 1rem; align-items: flex-end;">
                <div class="form-group" style="flex: 2; margin-bottom: 0;">
                    <label>Report Title</label>
                    <input type="text" id="report-title" placeholder="e.g. Placement Report 2026 Q2" required>
                </div>
                <div class="form-group" style="flex: 1; margin-bottom: 0;">
                    <label>Report Scope Type</label>
                    <select id="report-type" required>
                        <option value="GENERAL">General Overview</option>
                        <option value="BRANCH_WISE">Branch Breakdown</option>
                        <option value="SALARY_DISTRIBUTION">Salary Packages</option>
                        <option value="COMPANY_WISE">Company Placements</option>
                    </select>
                </div>
                <button type="submit" class="btn" style="height: fit-content; padding: 0.75rem 1.5rem;"><i class="fa-solid fa-cogs"></i> Compile Report</button>
            </form>
        </div>

        <div class="jobs-list">
            ${reportsHtml || "<p style='color: var(--text-secondary); text-align: center; padding: 2rem;'>No reports compiled yet.</p>"}
        </div>

        <!-- Report Details Modal -->
        <div id="report-modal" class="auth-wrapper" style="display: none; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.8); z-index: 9999;">
            <div class="auth-card" style="max-width: 600px;">
                <h3>Report Analytics Data</h3>
                <div id="report-analytics-content" style="margin-top: 1.5rem; max-height: 400px; overflow-y: auto;">
                    <!-- Filled by js -->
                </div>
                <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn" onclick="closeModal('report-modal')">Close</button>
                </div>
            </div>
        </div>
    `;
};

// Panel Generator: Real-time Direct Chat
const generateChatPanel = () => {
    // Generate active contact item list
    const contacts = [
        { id: 2, name: "Recruiter Admin", role: "RECRUITER" },
        { id: 3, name: "Placement Officer Office", role: "PLACEMENT_OFFICER" }
    ];
    if (state.user.role !== "STUDENT") {
        contacts.push({ id: 1, name: "Candidate Student", role: "STUDENT" });
    }

    const contactsHtml = contacts.map(c => `
        <div class="chat-user-item ${state.chatUser && state.chatUser.id === c.id ? "active" : ""}" onclick='selectChatUser(${JSON.stringify(c)})'>
            <div class="user-avatar" style="width:36px; height:36px; font-size: 0.8rem;">${c.name.charAt(0)}</div>
            <div class="chat-user-info">
                <h4>${c.name}</h4>
                <p>${c.role.replace("_", " ")}</p>
            </div>
        </div>
    `).join("");

    return `
        <h2>Real-time Direct Chat Support</h2>
        <div class="chat-container">
            <div class="chat-users-list">
                <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-weight: 600;">Contacts</div>
                ${contactsHtml}
            </div>
            <div class="chat-window">
                ${state.chatUser ? `
                    <div class="chat-header">
                        <div class="user-avatar" style="width:36px; height:36px;">${state.chatUser.name.charAt(0)}</div>
                        <div>
                            <h4 style="font-size: 1rem;">${state.chatUser.name}</h4>
                            <p style="font-size: 0.75rem; color: var(--text-secondary);">${state.chatUser.role.replace("_", " ")}</p>
                        </div>
                    </div>
                    <div class="chat-messages" id="chat-messages-box">
                        <p style="color: var(--text-muted); text-align: center; font-size: 0.85rem;">Beginning of conversation history.</p>
                    </div>
                    <div class="chat-input-area">
                        <input type="text" id="chat-msg-input" placeholder="Type a message..." onkeypress="handleChatKeyPress(event)">
                        <button class="btn" onclick="sendChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
                    </div>
                ` : `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                        <i class="fa-solid fa-message" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-muted);"></i>
                        <p>Select a contact from the list to start messaging.</p>
                    </div>
                `}
            </div>
        </div>
    `;
};

// Profile CRUD Submit Functions
const updateStudentProfile = async (e) => {
    e.preventDefault();
    const payload = {
        rollNumber: document.getElementById("prof-roll").value,
        branch: document.getElementById("prof-branch").value,
        section: document.getElementById("prof-section").value,
        year: parseInt(document.getElementById("prof-year").value),
        cgpa: parseFloat(document.getElementById("prof-cgpa").value),
        backlogs: parseInt(document.getElementById("prof-backlogs").value),
        linkedinUrl: document.getElementById("prof-linkedin").value,
        githubUrl: document.getElementById("prof-github").value,
        resumeUrl: document.getElementById("prof-resume").value
    };

    try {
        await apiRequest("/students/profile", "PUT", payload);
        showToast("Success", "Academic Profile updated successfully", "success");
        renderPanelContent("profile");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

const uploadResumeFile = async () => {
    const input = document.getElementById("resume-file-input");
    if (input.files.length === 0) {
        showToast("Validation Error", "Please select a resume file first.", "error");
        return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await apiRequest("/students/resume", "POST", formData, true);
        showToast("Success", "Resume uploaded successfully", "success");
        renderPanelContent("profile");
    } catch (err) {
        showToast("Upload Error", err.message, "error");
    }
};

// Modal helpers
const showAddProjectModal = () => document.getElementById("project-modal").style.display = "flex";
const showAddCertModal = () => document.getElementById("cert-modal").style.display = "flex";
const closeModal = (modalId) => document.getElementById(modalId).style.display = "none";

const addProjectSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        title: document.getElementById("proj-title").value,
        description: document.getElementById("proj-desc").value,
        technologiesUsed: document.getElementById("proj-tech").value,
        projectUrl: document.getElementById("proj-url").value
    };

    try {
        await apiRequest("/students/projects", "POST", payload);
        showToast("Success", "Project added to portfolio", "success");
        closeModal("project-modal");
        renderPanelContent("profile");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

const deleteProject = async (projId) => {
    if (!confirm("Are you sure you want to remove this project?")) return;
    try {
        await apiRequest(`/students/projects/${projId}`, "DELETE");
        showToast("Deleted", "Project removed from portfolio", "success");
        renderPanelContent("profile");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

const addCertSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById("cert-name").value,
        issuingOrganization: document.getElementById("cert-org").value,
        credentialUrl: document.getElementById("cert-url").value
    };

    try {
        await apiRequest("/students/certificates", "POST", payload);
        showToast("Success", "Certificate added to portfolio", "success");
        closeModal("cert-modal");
        renderPanelContent("profile");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

const deleteCertificate = async (certId) => {
    if (!confirm("Are you sure you want to remove this certification?")) return;
    try {
        await apiRequest(`/students/certificates/${certId}`, "DELETE");
        showToast("Deleted", "Certificate removed", "success");
        renderPanelContent("profile");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// Applying to Job
const applyToJob = async (jobId) => {
    try {
        await apiRequest(`/applications?jobId=${jobId}`, "POST");
        showToast("Success", "Application submitted successfully!", "success");
        renderPanelContent("jobs");
    } catch (err) {
        showToast("Application Denied", err.message, "error");
    }
};

// AI Resume analysis execution
const runAIResumeAnalysis = async (e) => {
    e.preventDefault();
    const resumeText = document.getElementById("ai-resume-text").value;
    const jobDescription = document.getElementById("ai-job-desc").value;

    const resBox = document.getElementById("ai-analysis-results");
    resBox.style.display = "block";
    resBox.innerHTML = `<div style="text-align: center; padding: 1.5rem;"><i class="fa-solid fa-spinner fa-spin" style="color:var(--accent-blue);"></i> Analyzing compatibility metrics...</div>`;

    try {
        const res = await apiRequest(`/ai/analyze-resume?resumeText=${encodeURIComponent(resumeText)}&jobDescription=${encodeURIComponent(jobDescription)}`, "POST");
        resBox.innerHTML = `
            <h3 style="color: var(--accent-cyan);"><i class="fa-solid fa-calculator"></i> ATS Match: ${res.matchPercentage}%</h3>
            <div class="stats-grid" style="margin-top: 1rem;">
                <div class="stat-card" style="padding: 1rem;">
                    <div class="stat-info"><h3>${res.atsScore}/100</h3><p>ATS Rating</p></div>
                </div>
                <div class="stat-card" style="padding: 1rem;">
                    <div class="stat-info"><h3>${res.industryReadinessScore}/100</h3><p>Readiness Rating</p></div>
                </div>
            </div>
            <h4 style="margin-top:1.5rem;">Detected Skills</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">${res.parsedSkills.join(", ")}</p>
            <h4 style="margin-top:1rem; color: var(--accent-amber);">Missing Target Skills</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">${res.missingSkills.join(", ")}</p>
            <h4 style="margin-top:1rem;">Recommended Action Items</h4>
            <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${res.improvements.map(i => `<li style="margin-top:0.25rem;">${i}</li>`).join("")}
            </ul>
        `;
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// AI Career Advisor
const runAICareerAdvisor = async () => {
    const resBox = document.getElementById("ai-career-results");
    resBox.style.display = "block";
    resBox.innerHTML = `<div style="text-align: center; padding: 1.5rem;"><i class="fa-solid fa-spinner fa-spin" style="color:var(--accent-cyan);"></i> Processing profile credentials...</div>`;

    try {
        const res = await apiRequest("/ai/career-guidance", "GET");
        resBox.innerHTML = `
            <h3>AI Recommendations & Paths</h3>
            <h4 style="margin-top: 1.25rem; color: var(--accent-emerald);"><i class="fa-solid fa-graduation-cap"></i> Target Industries</h4>
            <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${res.recommendedPaths.map(r => `<li style="margin-top:0.25rem;">${r}</li>`).join("")}
            </ul>
            <h4 style="margin-top: 1.25rem; color: var(--accent-rose);"><i class="fa-solid fa-chart-line"></i> Skill Gaps Identified</h4>
            <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${res.skillGapAnalysis.map(r => `<li style="margin-top:0.25rem;">${r}</li>`).join("")}
            </ul>
            <h4 style="margin-top: 1.25rem; color: var(--accent-blue);"><i class="fa-solid fa-list-check"></i> Actionable Roadmap Steps</h4>
            <ol style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${res.stepsToImprove.map(r => `<li style="margin-top:0.25rem;">${r}</li>`).join("")}
            </ol>
        `;
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// Recruiter Post Job
const postNewJob = async (e) => {
    e.preventDefault();
    const payload = {
        title: document.getElementById("job-title").value,
        salaryPackage: parseFloat(document.getElementById("job-salary").value),
        description: document.getElementById("job-desc").value,
        requirements: document.getElementById("job-reqs").value,
        location: document.getElementById("job-location").value,
        workType: document.getElementById("job-work-type").value,
        minCgpa: parseFloat(document.getElementById("job-min-cgpa").value || 0.0),
        maxBacklogs: parseInt(document.getElementById("job-max-backlogs").value || 0),
        applicationDeadline: document.getElementById("job-deadline").value,
        branches: document.getElementById("job-branches").value.split(",").map(b => b.trim())
    };

    try {
        await apiRequest("/jobs", "POST", payload);
        showToast("Success", "Job published for TPO Approval", "success");
        switchPanel("my-jobs");
    } catch (err) {
        showToast("Posting Failed", err.message, "error");
    }
};

const deleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
        await apiRequest(`/jobs/${jobId}`, "DELETE");
        showToast("Deleted", "Job posting removed", "success");
        renderPanelContent("my-jobs");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// Update Candidate Status
const updateApplicationStatus = async (appId, status) => {
    if (!status) return;
    try {
        await apiRequest(`/applications/${appId}/status?status=${status}`, "PUT");
        showToast("Status Updated", `Application status is now: ${status}`, "success");
        renderPanelContent("applicants");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// Sched interview modals
const showScheduleModal = (appId) => {
    document.getElementById("sched-app-id").value = appId;
    document.getElementById("schedule-modal").style.display = "flex";
};

const scheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    const appId = parseInt(document.getElementById("sched-app-id").value);
    const payload = {
        applicationId: appId,
        title: document.getElementById("sched-title").value,
        dateTime: document.getElementById("sched-datetime").value,
        locationLink: document.getElementById("sched-link").value,
        durationMinutes: parseInt(document.getElementById("sched-duration").value)
    };

    try {
        await apiRequest("/interviews", "POST", payload);
        showToast("Success", "Interview round scheduled successfully", "success");
        closeModal("schedule-modal");
        renderPanelContent("applicants");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// TPO approvals
const approveJob = async (jobId, status) => {
    try {
        await apiRequest(`/jobs/${jobId}/approve?status=${status}`, "PUT");
        showToast("Success", `Job status marked as ${status}`, "success");
        renderPanelContent("tpo-approvals");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// TPO Compile Reports
const compileReportSubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById("report-title").value;
    const reportType = document.getElementById("report-type").value;

    try {
        await apiRequest(`/reports?title=${encodeURIComponent(title)}&reportType=${reportType}`, "POST");
        showToast("Compiled", "Placement metrics compiled successfully", "success");
        renderPanelContent("tpo-reports");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

const showReportDetails = (stats) => {
    const box = document.getElementById("report-analytics-content");
    box.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" style="padding:1rem;">
                <div class="stat-info"><h3>${stats.totalStudentsRegistered || 0}</h3><p>Registered</p></div>
            </div>
            <div class="stat-card" style="padding:1rem;">
                <div class="stat-info"><h3>${stats.totalStudentsPlaced || 0}</h3><p>Placed</p></div>
            </div>
            <div class="stat-card" style="padding:1rem;">
                <div class="stat-info"><h3>${stats.placementPercentage || 0}%</h3><p>Rate</p></div>
            </div>
        </div>
        <div style="margin-top: 1.5rem;">
            <h4>Salary Package Outlines</h4>
            <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Minimum: ${stats.minimumPackageLPA || 0} LPA</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Maximum: ${stats.maximumPackageLPA || 0} LPA</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Average: ${stats.averagePackageLPA || 0} LPA</p>
        </div>
    `;
    document.getElementById("report-modal").style.display = "flex";
};

// Notification Helpers
const markNotificationRead = async (id) => {
    try {
        await apiRequest(`/notifications/${id}/read`, "PUT");
        renderPanelContent("dashboard");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

const markAllNotificationsRead = async () => {
    try {
        await apiRequest("/notifications/read-all", "PUT");
        renderPanelContent("dashboard");
    } catch (err) {
        showToast("Error", err.message, "error");
    }
};

// Chat Contact selections & WebSocket messaging
const selectChatUser = (user) => {
    state.chatUser = user;
    renderPanelContent("chat");
    loadChatHistory();
};

const loadChatHistory = async () => {
    if (!state.chatUser) return;
    const chatBox = document.getElementById("chat-messages-box");
    if (!chatBox) return;

    try {
        const history = await apiRequest(`/chat/history/${state.chatUser.id}`, "GET");
        chatBox.innerHTML = history.map(m => {
            const isMe = m.senderId === state.user.id;
            return `
                <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
                    ${m.message}
                    <div class="message-meta">${new Date(m.sentAt).toLocaleTimeString()}</div>
                </div>
            `;
        }).join("");
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) {
        chatBox.innerHTML = `<p style="color: var(--text-muted); text-align: center;">No local history or offline fallback active.</p>`;
    }
};

const sendChatMessage = () => {
    const input = document.getElementById("chat-msg-input");
    const msg = input.value.trim();
    if (!msg || !state.chatUser) return;

    const payload = {
        senderId: state.user.id,
        senderName: state.user.username,
        receiverId: state.chatUser.id,
        receiverName: state.chatUser.name,
        message: msg,
        sentAt: new Date().toISOString()
    };

    if (state.wsClient && state.wsClient.connected) {
        state.wsClient.send("/app/chat.send", {}, JSON.stringify(payload));
    } else {
        // Mock socket loopback fallback
        console.warn("WebSocket not active, loopback loop active.");
        appendLocalMessage(payload);
    }
    input.value = "";
};

const handleChatKeyPress = (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
};

const appendLocalMessage = (m) => {
    const chatBox = document.getElementById("chat-messages-box");
    if (!chatBox) return;
    const isMe = m.senderId === state.user.id;
    chatBox.innerHTML += `
        <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
            ${m.message}
            <div class="message-meta">${new Date(m.sentAt).toLocaleTimeString()}</div>
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
};

// WebSocket STOMP Configurations
const initWebSockets = () => {
    if (state.wsClient) return;

    try {
        const socket = new SockJS(WS_BASE);
        state.wsClient = Stomp.over(socket);
        state.wsClient.debug = null; // Quiet logs

        state.wsClient.connect({}, (frame) => {
            console.log("WebSocket connection established successfully.");
            
            // Subscribe to private user queues
            state.wsClient.subscribe(`/user/queue/messages`, (msg) => {
                const chatMsg = JSON.parse(msg.body);
                // If chatting with the sender, show bubble directly
                if (state.chatUser && (chatMsg.senderId === state.chatUser.id || chatMsg.senderId === state.user.id)) {
                    appendLocalMessage(chatMsg);
                } else {
                    // Show global Alert notification
                    showToast(`New Chat from ${chatMsg.senderName}`, chatMsg.message, "info");
                }
            });
        }, (err) => {
            console.warn("Could not start WebSocket channel: ", err);
        });
    } catch (e) {
        console.warn("SockJS initialization failed.");
    }
};

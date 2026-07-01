// Student Operations and Portfolio Handlers
window.loadStudentDashboardData = async () => {
    try {
        const profile = await window.apiRequest("/auth/profile", "GET");
        if (profile && profile.studentProfile) {
            const sp = profile.studentProfile;
            // Update profile form fields if on profile page
            const rollEl = document.getElementById("profile-roll");
            if (rollEl) rollEl.value = sp.rollNumber || "";
            const branchEl = document.getElementById("profile-branch");
            if (branchEl) branchEl.value = sp.branch || "";
            const yearEl = document.getElementById("profile-year");
            if (yearEl) yearEl.value = sp.year || 4;
            const cgpaEl = document.getElementById("profile-cgpa");
            if (cgpaEl) cgpaEl.value = sp.cgpa || 0.0;
            const backlogsEl = document.getElementById("profile-backlogs");
            if (backlogsEl) backlogsEl.value = sp.backlogs || 0;

            // Load skills
            const skillsList = document.getElementById("skills-list");
            if (skillsList) {
                skillsList.innerHTML = (sp.skills || []).map(s => `<span class="badge badge-review">${s}</span>`).join(" ");
            }

            // Load projects
            const projectsList = document.getElementById("projects-list");
            if (projectsList) {
                projectsList.innerHTML = (sp.projects || []).map(p => `
                    <div class="applicant-card" style="margin-top: 1rem;">
                        <div style="display:flex; justify-content:space-between;">
                            <h4>${p.title}</h4>
                            <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.deleteStudentProject(${p.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">${p.description}</p>
                        ${p.technologies ? `<p style="font-size:0.8rem; color:var(--accent-blue); margin-top:0.25rem;">Tech: ${p.technologies}</p>` : ''}
                    </div>
                `).join("");
            }

            // Load certificates
            const certList = document.getElementById("certificates-list");
            if (certList) {
                certList.innerHTML = (sp.certificates || []).map(c => `
                    <div class="applicant-card" style="margin-top: 1rem;">
                        <div style="display:flex; justify-content:space-between;">
                            <h4>${c.name}</h4>
                            <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.deleteStudentCertificate(${c.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">Issued by: ${c.issuingOrganization}</p>
                        ${c.credentialUrl ? `<a href="${c.credentialUrl}" target="_blank" style="font-size:0.8rem; color:var(--accent-cyan); display:block; margin-top:0.25rem;">View Credential</a>` : ''}
                    </div>
                `).join("");
            }
        }
    } catch (e) {
        console.warn("Could not load student profile data", e);
    }
};

window.updateStudentProfile = async (e) => {
    if (e) e.preventDefault();
    const payload = {
        rollNumber: document.getElementById("profile-roll").value,
        branch: document.getElementById("profile-branch").value,
        year: parseInt(document.getElementById("profile-year").value),
        cgpa: parseFloat(document.getElementById("profile-cgpa").value),
        backlogs: parseInt(document.getElementById("profile-backlogs").value || 0)
    };

    try {
        await window.apiRequest("/students/profile", "PUT", payload);
        window.showToast("Success", "Profile details updated successfully!", "success");
        window.loadStudentDashboardData();
    } catch (err) {
        window.showToast("Failed to Update", err.message, "error");
    }
};

window.syncStudentSkills = async () => {
    const input = document.getElementById("new-skills-input");
    if (!input || !input.value.trim()) return;
    
    const skills = input.value.split(",").map(s => s.trim()).filter(Boolean);
    try {
        await window.apiRequest("/students/skills", "POST", skills);
        window.showToast("Success", "Skills synchronized!", "success");
        input.value = "";
        window.loadStudentDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.addStudentProject = async (e) => {
    if (e) e.preventDefault();
    const payload = {
        title: document.getElementById("proj-title").value,
        description: document.getElementById("proj-desc").value,
        technologies: document.getElementById("proj-tech").value,
        projectLink: document.getElementById("proj-link").value
    };

    try {
        await window.apiRequest("/students/projects", "POST", payload);
        window.showToast("Success", "Project added to portfolio", "success");
        // Reset fields
        document.getElementById("proj-title").value = "";
        document.getElementById("proj-desc").value = "";
        document.getElementById("proj-tech").value = "";
        document.getElementById("proj-link").value = "";
        window.loadStudentDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.deleteStudentProject = async (id) => {
    if (!confirm("Remove this project from your portfolio?")) return;
    try {
        await window.apiRequest(`/students/projects/${id}`, "DELETE");
        window.showToast("Removed", "Project deleted", "success");
        window.loadStudentDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.addStudentCertificate = async (e) => {
    if (e) e.preventDefault();
    const payload = {
        name: document.getElementById("cert-name").value,
        issuingOrganization: document.getElementById("cert-org").value,
        credentialUrl: document.getElementById("cert-link").value
    };

    try {
        await window.apiRequest("/students/certificates", "POST", payload);
        window.showToast("Success", "Certificate registered", "success");
        // Reset fields
        document.getElementById("cert-name").value = "";
        document.getElementById("cert-org").value = "";
        document.getElementById("cert-link").value = "";
        window.loadStudentDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.deleteStudentCertificate = async (id) => {
    if (!confirm("Remove this certificate?")) return;
    try {
        await window.apiRequest(`/students/certificates/${id}`, "DELETE");
        window.showToast("Removed", "Certificate deleted", "success");
        window.loadStudentDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

// Auto-trigger load when dashboard or profile is ready
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.startsWith("/student/")) {
        window.loadStudentDashboardData();
        
        const profileForm = document.getElementById("student-profile-form");
        if (profileForm) profileForm.addEventListener("submit", window.updateStudentProfile);
        
        const projForm = document.getElementById("student-project-form");
        if (projForm) projForm.addEventListener("submit", window.addStudentProject);

        const certForm = document.getElementById("student-certificate-form");
        if (certForm) certForm.addEventListener("submit", window.addStudentCertificate);
    }
});

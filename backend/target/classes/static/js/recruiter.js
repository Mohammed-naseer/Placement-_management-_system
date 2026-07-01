// Recruiter Dashboard Controller
window.loadRecruiterDashboardData = async () => {
    try {
        const jobs = await window.apiRequest("/jobs/recruiter", "GET");
        const jobsList = document.getElementById("recruiter-jobs-list");
        if (jobsList) {
            jobsList.innerHTML = jobs.map(j => `
                <div class="job-card">
                    <div class="job-details">
                        <div class="company-logo"><i class="fa-solid fa-building"></i></div>
                        <div class="job-info">
                            <h3>${j.title}</h3>
                            <div class="job-meta">
                                <span><i class="fa-solid fa-wallet"></i> ${j.salaryPackage} LPA</span>
                                <span><i class="fa-solid fa-location-dot"></i> ${j.location} (${j.workType})</span>
                            </div>
                            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.5rem;">Status: <span class="badge ${j.status === 'APPROVED' ? 'badge-approved' : 'badge-pending'}">${j.status}</span></p>
                        </div>
                    </div>
                    <div class="job-actions">
                        <button class="btn btn-danger btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="window.deleteJob(${j.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                </div>
            `).join("");
        }

        const applicants = await window.apiRequest("/applications/recruiter", "GET");
        const applicantsList = document.getElementById("recruiter-applicants-list");
        if (applicantsList) {
            applicantsList.innerHTML = applicants.map(a => `
                <div class="applicant-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <h3>${a.studentName}</h3>
                            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">Applying for: <strong>${a.jobTitle}</strong> (${a.companyName})</p>
                            <p style="font-size:0.85rem; color:var(--text-secondary);">CGPA: ${a.studentCgpa} | Roll Number: ${a.studentRollNumber}</p>
                            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Applied: ${window.formatDate(a.appliedAt)}</p>
                        </div>
                        <div>
                            <span class="badge ${a.status === 'SELECTED' || a.status === 'APPROVED' ? 'badge-approved' : a.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}">${a.status}</span>
                        </div>
                    </div>
                    <div style="display:flex; gap:1rem; margin-top:1rem; justify-content:flex-end;">
                        <select onchange="window.updateApplicationStatus(${a.id}, this.value)" style="max-width:180px; padding:0.4rem;">
                            <option value="">Update Status...</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="SHORTLISTED">Shortlisted</option>
                            <option value="REJECTED">Reject</option>
                            <option value="SELECTED">Select Candidate</option>
                        </select>
                        <button class="btn" onclick="window.showScheduleModal(${a.id})"><i class="fa-solid fa-calendar-check"></i> Schedule Round</button>
                    </div>
                </div>
            `).join("");
        }
    } catch (e) {
        console.warn("Could not load recruiter drive data.", e);
    }
};

window.postNewJob = async (e) => {
    if (e) e.preventDefault();
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
        await window.apiRequest("/jobs", "POST", payload);
        window.showToast("Success", "Job published for TPO Approval", "success");
        setTimeout(() => {
            window.location.href = "/recruiter/manage-jobs";
        }, 1000);
    } catch (err) {
        window.showToast("Posting Failed", err.message, "error");
    }
};

window.deleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
        await window.apiRequest(`/jobs/${jobId}`, "DELETE");
        window.showToast("Deleted", "Job posting removed", "success");
        window.loadRecruiterDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.updateApplicationStatus = async (appId, status) => {
    if (!status) return;
    try {
        await window.apiRequest(`/applications/${appId}/status?status=${status}`, "PUT");
        window.showToast("Status Updated", `Application status is now: ${status}`, "success");
        window.loadRecruiterDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

// Bind elements
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.startsWith("/recruiter/")) {
        window.loadRecruiterDashboardData();
        
        const jobForm = document.getElementById("post-job-form");
        if (jobForm) jobForm.addEventListener("submit", window.postNewJob);
    }
});

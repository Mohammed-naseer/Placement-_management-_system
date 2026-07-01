// Application Submissions and tracking
window.applyForJob = async (jobId) => {
    try {
        await window.apiRequest(`/applications?jobId=${jobId}`, "POST");
        window.showToast("Applied", "Your application has been registered successfully!", "success");
        if (window.loadJobsList) window.loadJobsList();
    } catch (e) {
        window.showToast("Application Failed", e.message, "error");
    }
};

window.loadAppliedJobs = async () => {
    try {
        const apps = await window.apiRequest("/applications/student", "GET");
        const listEl = document.getElementById("student-applied-list");
        if (listEl) {
            if (apps.length === 0) {
                listEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">You haven't applied to any job drives yet.</p>`;
            } else {
                listEl.innerHTML = apps.map(a => `
                    <div class="job-card">
                        <div class="job-details">
                            <div class="company-logo"><i class="fa-solid fa-file-circle-check"></i></div>
                            <div class="job-info">
                                <h3>${a.jobTitle}</h3>
                                <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.25rem;">${a.companyName}</p>
                                <p style="font-size:0.8rem; color:var(--text-muted);">Applied: ${window.formatDate(a.appliedAt)}</p>
                            </div>
                        </div>
                        <div class="job-actions">
                            <span class="badge ${a.status === 'SELECTED' || a.status === 'APPROVED' ? 'badge-approved' : a.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}">${a.status}</span>
                        </div>
                    </div>
                `).join("");
            }
        }
    } catch (e) {
        console.warn("Could not retrieve applied jobs.", e);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("student-applied-list");
    if (listEl) {
        window.loadAppliedJobs();
    }
});

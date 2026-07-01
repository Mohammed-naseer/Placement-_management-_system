// Admin and Placement Officer Dashboard Controller
window.loadAdminDashboardData = async () => {
    try {
        // Load pending jobs
        const jobs = await window.apiRequest("/jobs", "GET"); // retrieves public approved or all depending on auth
        const pendingJobs = (jobs || []).filter(j => j.status === "PENDING_APPROVAL");
        const pendingJobsList = document.getElementById("admin-pending-jobs");
        if (pendingJobsList) {
            if (pendingJobs.length === 0) {
                pendingJobsList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">No jobs pending approval.</p>`;
            } else {
                pendingJobsList.innerHTML = pendingJobs.map(j => `
                    <div class="job-card">
                        <div class="job-details">
                            <div class="company-logo"><i class="fa-solid fa-building"></i></div>
                            <div class="job-info">
                                <h3>${j.title}</h3>
                                <div class="job-meta">
                                    <span><i class="fa-solid fa-wallet"></i> ${j.salaryPackage} LPA</span>
                                    <span><i class="fa-solid fa-location-dot"></i> ${j.location}</span>
                                </div>
                                <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.5rem;">CGPA Min: ${j.minCgpa} | Backlogs Max: ${j.maxBacklogs}</p>
                            </div>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button class="btn" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="window.approveJob(${j.id}, 'APPROVED')"><i class="fa-solid fa-check"></i> Approve</button>
                            <button class="btn btn-danger" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="window.approveJob(${j.id}, 'REJECTED')"><i class="fa-solid fa-times"></i> Reject</button>
                        </div>
                    </div>
                `).join("");
            }
        }

        // Load reports
        const reportsList = document.getElementById("admin-reports-list");
        if (reportsList) {
            const reports = await window.apiRequest("/reports", "GET");
            if (reports.length === 0) {
                reportsList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">No reports compiled yet.</p>`;
            } else {
                reportsList.innerHTML = reports.map(r => {
                    const stats = JSON.parse(r.dataJson || '{}');
                    return `
                        <div class="applicant-card">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <h3>${r.title}</h3>
                                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">Type: ${r.reportType} | Compiled by: ${r.createdBy?.username || 'System'}</p>
                                    <p style="font-size:0.85rem; color:var(--text-muted);">${window.formatDate(r.createdAt)}</p>
                                </div>
                                <button class="btn btn-secondary" onclick="window.showReportDetails(${JSON.stringify(stats).replace(/"/g, '&quot;')})"><i class="fa-solid fa-eye"></i> View Stats</button>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }
    } catch (e) {
        console.warn("Could not load admin panel data.", e);
    }
};

window.approveJob = async (jobId, status) => {
    try {
        await window.apiRequest(`/jobs/${jobId}/approve?status=${status}`, "PUT");
        window.showToast("Success", `Job status marked as ${status}`, "success");
        window.loadAdminDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.compileReportSubmit = async (e) => {
    if (e) e.preventDefault();
    const title = document.getElementById("report-title").value;
    const reportType = document.getElementById("report-type").value;

    try {
        await window.apiRequest(`/reports?title=${encodeURIComponent(title)}&reportType=${reportType}`, "POST");
        window.showToast("Compiled", "Placement metrics compiled successfully", "success");
        document.getElementById("report-title").value = "";
        window.loadAdminDashboardData();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.showReportDetails = (stats) => {
    const detailBox = document.getElementById("report-detail-modal-body");
    const modal = document.getElementById("report-detail-modal");
    if (!detailBox || !modal) return;

    detailBox.innerHTML = `
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
        <div style="margin-top: 1.5rem; border-top:1px solid var(--border-color); padding-top:1rem;">
            <h4 style="margin-bottom:0.5rem;">Salary Package Outlines</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Minimum Package: <strong>${stats.minimumPackageLPA || 0} LPA</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Maximum Package: <strong>${stats.maximumPackageLPA || 0} LPA</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Average Package: <strong>${stats.averagePackageLPA || 0} LPA</strong></p>
        </div>
    `;
    modal.style.display = "flex";
};

window.closeAdminModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
};

// Bind elements
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.startsWith("/admin/")) {
        window.loadAdminDashboardData();
        
        const rForm = document.getElementById("compile-report-form");
        if (rForm) rForm.addEventListener("submit", window.compileReportSubmit);
    }
});

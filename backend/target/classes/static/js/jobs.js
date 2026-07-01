// Job Posting Queries and Rendering
window.loadJobsList = async () => {
    try {
        const jobs = await window.apiRequest("/jobs/public", "GET");
        const listEl = document.getElementById("public-jobs-list");
        if (listEl) {
            if (jobs.length === 0) {
                listEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">No active placement drives found.</p>`;
            } else {
                listEl.innerHTML = jobs.map(j => `
                    <div class="job-card">
                        <div class="job-details">
                            <div class="company-logo"><i class="fa-solid fa-briefcase"></i></div>
                            <div class="job-info">
                                <h3>${j.title}</h3>
                                <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.25rem;">${j.companyName || 'Corporate Partner'}</p>
                                <div class="job-meta">
                                    <span><i class="fa-solid fa-wallet"></i> ${j.salaryPackage} LPA</span>
                                    <span><i class="fa-solid fa-location-dot"></i> ${j.location}</span>
                                    <span><i class="fa-solid fa-graduation-cap"></i> Min CGPA: ${j.minCgpa}</span>
                                </div>
                            </div>
                        </div>
                        <div class="job-actions">
                            <button class="btn" onclick="window.applyForJob(${j.id})"><i class="fa-solid fa-paper-plane"></i> Apply Now</button>
                        </div>
                    </div>
                `).join("");
            }
        }
    } catch (e) {
        console.warn("Could not retrieve jobs listing.", e);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("public-jobs-list");
    if (listEl) {
        window.loadJobsList();
    }
});

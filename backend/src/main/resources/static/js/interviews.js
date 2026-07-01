// Interviews Scheduling and Coordination
window.loadInterviewsData = async () => {
    try {
        const interviews = await window.apiRequest("/interviews", "GET");
        const listEl = document.getElementById("interviews-list");
        if (listEl) {
            if (interviews.length === 0) {
                listEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">No interview rounds scheduled yet.</p>`;
            } else {
                listEl.innerHTML = interviews.map(i => `
                    <div class="job-card">
                        <div class="job-details">
                            <div class="company-logo" style="color: var(--accent-purple);"><i class="fa-solid fa-calendar-days"></i></div>
                            <div class="job-info">
                                <h3>${i.title}</h3>
                                <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.25rem;"><i class="fa-solid fa-clock"></i> ${window.formatDate(i.dateTime)} (${i.durationMinutes} mins)</p>
                                ${i.locationLink ? `<a href="${i.locationLink}" target="_blank" style="font-size:0.85rem; color:var(--accent-blue); text-decoration:none;"><i class="fa-solid fa-video"></i> Join Meet Call</a>` : ''}
                            </div>
                        </div>
                        <div class="job-actions">
                            <span class="badge badge-review">${i.status}</span>
                        </div>
                    </div>
                `).join("");
            }
        }
    } catch (e) {
        console.warn("Could not retrieve interviews lists.", e);
    }
};

window.showScheduleModal = (appId) => {
    const input = document.getElementById("sched-app-id");
    const modal = document.getElementById("schedule-modal");
    if (input && modal) {
        input.value = appId;
        modal.style.display = "flex";
    }
};

window.scheduleInterviewSubmit = async (e) => {
    if (e) e.preventDefault();
    const appId = parseInt(document.getElementById("sched-app-id").value);
    const payload = {
        applicationId: appId,
        title: document.getElementById("sched-title").value,
        dateTime: document.getElementById("sched-datetime").value,
        locationLink: document.getElementById("sched-link").value,
        durationMinutes: parseInt(document.getElementById("sched-duration").value)
    };

    try {
        await window.apiRequest("/interviews", "POST", payload);
        window.showToast("Success", "Interview round scheduled successfully", "success");
        window.closeInterviewModal("schedule-modal");
        
        // Refresh recruiter dashboard data if functions exist
        if (window.loadRecruiterDashboardData) {
            window.loadRecruiterDashboardData();
        }
        if (window.loadInterviewsData) {
            window.loadInterviewsData();
        }
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.closeInterviewModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "none";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("interviews-list");
    if (listEl) {
        window.loadInterviewsData();
    }

    const schedForm = document.getElementById("schedule-interview-form");
    if (schedForm) {
        schedForm.addEventListener("submit", window.scheduleInterviewSubmit);
    }
});

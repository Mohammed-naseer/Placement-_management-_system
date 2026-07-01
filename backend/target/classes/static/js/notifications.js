// System Alert Notifications Handlers
window.loadNotificationsList = async () => {
    try {
        const notifications = await window.apiRequest("/notifications", "GET");
        window.state.notifications = notifications || [];
        
        // Update notification badges
        const badgeEl = document.getElementById("nav-notif-badge");
        const unreadCount = window.state.notifications.filter(n => !n.isRead).length;
        if (badgeEl) {
            badgeEl.textContent = unreadCount;
            badgeEl.style.display = unreadCount > 0 ? "inline-block" : "none";
        }

        const listEl = document.getElementById("notifications-page-list");
        if (listEl) {
            if (window.state.notifications.length === 0) {
                listEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">No alerts or notifications recorded.</p>`;
            } else {
                listEl.innerHTML = window.state.notifications.map(n => `
                    <div class="notification-item">
                        <div style="display:flex; align-items:center;">
                            <span class="notification-dot ${!n.isRead ? 'unread' : ''}"></span>
                            <div>
                                <p style="font-size:0.95rem; color:${!n.isRead ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-weight:${!n.isRead ? '600' : '400'};">${n.message}</p>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${window.formatDate(n.createdAt)}</span>
                            </div>
                        </div>
                        ${!n.isRead ? `<button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.markNotificationRead(${n.id})"><i class="fa-solid fa-check"></i> Read</button>` : ''}
                    </div>
                `).join("");
            }
        }
    } catch (e) {
        console.warn("Could not retrieve notifications", e);
    }
};

window.markNotificationRead = async (id) => {
    try {
        await window.apiRequest(`/notifications/${id}/read`, "PUT");
        window.loadNotificationsList();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.markAllNotificationsRead = async () => {
    try {
        await window.apiRequest("/notifications/read-all", "PUT");
        window.showToast("Success", "All alerts marked as read", "success");
        window.loadNotificationsList();
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (window.state.user) {
        window.loadNotificationsList();
    }
});

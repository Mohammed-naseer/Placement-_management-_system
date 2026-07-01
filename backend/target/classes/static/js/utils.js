// UI Utility Helpers
window.showToast = (title, desc, type = "info") => {
    const banner = document.getElementById("toast-banner");
    const titleEl = document.getElementById("toast-title");
    const descEl = document.getElementById("toast-desc");
    const iconEl = document.getElementById("toast-icon");

    if (!banner || !titleEl || !descEl || !iconEl) return;

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

    setTimeout(window.hideToast, 5000);
};

window.hideToast = () => {
    const banner = document.getElementById("toast-banner");
    if (banner) {
        banner.style.display = "none";
    }
};

window.formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

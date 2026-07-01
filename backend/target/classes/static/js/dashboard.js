// Dashboard Lifecycle and Common Elements Controller
document.addEventListener("DOMContentLoaded", () => {
    // 1. Session Verification
    const sessionData = localStorage.getItem("pms_session");
    const publicPaths = ["/", "/index", "/login", "/register", "/forgot-password"];
    const currentPath = window.location.pathname;

    if (!sessionData) {
        if (!publicPaths.includes(currentPath)) {
            // Redirect to login if accessing protected route
            window.location.href = "/login";
            return;
        }
    } else {
        try {
            const data = JSON.parse(sessionData);
            window.state.user = data.user;
            window.state.token = data.token;
            window.state.isMocked = data.isMocked || false;

            // Redirect away from login/register if already logged in
            if (publicPaths.includes(currentPath) && currentPath !== "/" && currentPath !== "/index") {
                if (window.state.user.role === "STUDENT") {
                    window.location.href = "/student/dashboard";
                } else if (window.state.user.role === "RECRUITER") {
                    window.location.href = "/recruiter/dashboard";
                } else {
                    window.location.href = "/admin/dashboard";
                }
                return;
            }
        } catch (e) {
            localStorage.removeItem("pms_session");
            if (!publicPaths.includes(currentPath)) {
                window.location.href = "/login";
                return;
            }
        }
    }

    // 2. Initialize Common UI Components
    if (window.state.user) {
        // Set header profile details
        const navUsername = document.getElementById("nav-username");
        const navRole = document.getElementById("nav-role");
        const navAvatar = document.getElementById("nav-avatar");

        if (navUsername) navUsername.textContent = window.state.user.username;
        if (navRole) navRole.textContent = window.state.user.role.replace("_", " ");
        if (navAvatar) navAvatar.textContent = window.state.user.username.charAt(0).toUpperCase();

        // Highlight active sidebar item based on current URL path
        highlightActiveSidebar();

        // Start WebSockets
        if (window.initWebSockets) {
            window.initWebSockets();
        }
    }
});

function highlightActiveSidebar() {
    const currentPath = window.location.pathname;
    const items = document.querySelectorAll(".sidebar-item");
    items.forEach(item => {
        const link = item.getAttribute("onclick");
        if (link) {
            // Extracts route name from onclick e.g. location.href='/student/jobs'
            const match = link.match(/'([^']+)'/);
            if (match && match[1] === currentPath) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        }
    });
}

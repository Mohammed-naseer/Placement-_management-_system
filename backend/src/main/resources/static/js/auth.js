// Authentication Handlers
window.handleLogin = async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await window.apiRequest("/auth/login", "POST", { username, password });
        window.state.user = { id: res.id, username: res.username, email: res.email, role: res.role };
        window.state.token = res.token;
        
        // Save Session
        localStorage.setItem("pms_session", JSON.stringify({
            user: window.state.user,
            token: window.state.token,
            isMocked: window.state.isMocked
        }));

        window.showToast("Success", "Welcome back, " + username + "!", "success");

        // Redirect based on role
        setTimeout(() => {
            if (res.role === "STUDENT") {
                window.location.href = "/student/dashboard";
            } else if (res.role === "RECRUITER") {
                window.location.href = "/recruiter/dashboard";
            } else if (res.role === "PLACEMENT_OFFICER" || res.role === "ADMIN") {
                window.location.href = "/admin/dashboard";
            } else {
                window.location.href = "/";
            }
        }, 1000);
    } catch (err) {
        window.showToast("Login Failed", err.message, "error");
    }
};

window.handleRegister = async (e) => {
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
        await window.apiRequest("/auth/register", "POST", payload);
        window.showToast("Registration Success", "An OTP verification code was sent to " + email, "success");
        
        window.state.tempUsername = username;
        document.getElementById("otp-wrapper").style.display = "block";
    } catch (err) {
        window.showToast("Registration Failed", err.message, "error");
    }
};

window.verifyOtp = async () => {
    const otp = document.getElementById("otp-code").value;
    if (otp.length !== 6) {
        window.showToast("Validation Error", "OTP must be exactly 6 digits", "error");
        return;
    }

    try {
        await window.apiRequest(`/auth/verify-otp?username=${window.state.tempUsername}&otp=${otp}`, "POST");
        window.showToast("Verified", "Verification successful! You can now log in.", "success");
        setTimeout(() => {
            window.location.href = "/login";
        }, 1500);
    } catch (err) {
        window.showToast("Verification Failed", err.message, "error");
    }
};

window.resendOtp = async () => {
    try {
        await window.apiRequest(`/auth/generate-otp?username=${window.state.tempUsername}`, "POST");
        window.showToast("OTP Sent", "A new OTP code was dispatched.", "success");
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.handleLogout = () => {
    if (window.state.wsClient) {
        window.state.wsClient.disconnect();
        window.state.wsClient = null;
    }
    
    window.state.user = null;
    window.state.token = null;
    localStorage.removeItem("pms_session");
    
    window.showToast("Logged Out", "Goodbye!", "info");
    setTimeout(() => {
        window.location.href = "/login";
    }, 1000);
};

window.toggleRoleFields = () => {
    const role = document.getElementById("reg-role").value;
    document.getElementById("student-only-fields").style.display = role === "STUDENT" ? "block" : "none";
    document.getElementById("recruiter-only-fields").style.display = role === "RECRUITER" ? "block" : "none";
};

// Bind elements if present
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", window.handleLogin);

    const regForm = document.getElementById("register-form");
    if (regForm) regForm.addEventListener("submit", window.handleRegister);

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", window.handleLogout);
});

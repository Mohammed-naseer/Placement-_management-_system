// Chat Support and AI Chatbot Functions
window.selectChatUser = (userId, username, role) => {
    window.state.chatUser = { id: userId, name: username, role: role };
    
    // Set chat header
    const chatTitle = document.getElementById("chat-partner-name");
    const chatRole = document.getElementById("chat-partner-role");
    if (chatTitle) chatTitle.textContent = username;
    if (chatRole) chatRole.textContent = role.replace("_", " ");

    window.loadChatHistory();
};

window.loadChatHistory = async () => {
    if (!window.state.chatUser) return;
    const chatBox = document.getElementById("chat-messages-box");
    if (!chatBox) return;

    chatBox.innerHTML = `<div style="text-align: center; padding: 1.5rem;"><i class="fa-solid fa-spinner fa-spin" style="color:var(--accent-blue);"></i> Loading chat thread...</div>`;

    try {
        const history = await window.apiRequest(`/chat/history/${window.state.chatUser.id}`, "GET");
        chatBox.innerHTML = history.map(m => {
            const isMe = m.senderId === window.state.user.id;
            return `
                <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
                    ${m.message}
                    <div class="message-meta">${new Date(m.sentAt).toLocaleTimeString()}</div>
                </div>
            `;
        }).join("");
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) {
        chatBox.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No history found. Send a message to start chatting.</p>`;
    }
};

window.sendChatMessage = () => {
    const input = document.getElementById("chat-msg-input");
    if (!input) return;
    const msg = input.value.trim();
    if (!msg || !window.state.chatUser) return;

    const payload = {
        senderId: window.state.user.id,
        senderName: window.state.user.username,
        receiverId: window.state.chatUser.id,
        receiverName: window.state.chatUser.name,
        message: msg,
        sentAt: new Date().toISOString()
    };

    if (window.state.wsClient && window.state.wsClient.connected) {
        window.state.wsClient.send("/app/chat.send", {}, JSON.stringify(payload));
        window.appendLocalMessage(payload);
    } else {
        console.warn("WebSocket not active, using loopback simulation.");
        window.appendLocalMessage(payload);
        
        // Loopback AI Response Simulation
        setTimeout(() => {
            window.appendLocalMessage({
                senderId: window.state.chatUser.id,
                senderName: window.state.chatUser.name,
                message: `Hi there! I am offline right now, but I received your message: "${msg}". I'll get back to you shortly!`,
                sentAt: new Date().toISOString()
            });
        }, 1500);
    }
    input.value = "";
};

window.handleChatKeyPress = (e) => {
    if (e.key === 'Enter') {
        window.sendChatMessage();
    }
};

window.appendLocalMessage = (m) => {
    const chatBox = document.getElementById("chat-messages-box");
    if (!chatBox) return;
    const isMe = m.senderId === window.state.user.id;
    
    // Check if chat history contains loading text or placeholder
    if (chatBox.textContent.includes("No history") || chatBox.textContent.includes("Loading")) {
        chatBox.innerHTML = "";
    }
    
    chatBox.innerHTML += `
        <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
            ${m.message}
            <div class="message-meta">${new Date(m.sentAt).toLocaleTimeString()}</div>
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
};

// AI Features Integration
window.analyzeResumeSubmit = async (e) => {
    if (e) e.preventDefault();
    const resumeText = document.getElementById("ai-resume-text").value;
    const jobDescription = document.getElementById("ai-job-desc").value;
    const resBox = document.getElementById("ai-analysis-results");
    
    if (!resumeText || !jobDescription) {
        window.showToast("Validation Error", "Please paste both resume text and job description.", "warning");
        return;
    }

    resBox.style.display = "block";
    resBox.innerHTML = `<div style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin" style="color:var(--accent-cyan); font-size:1.5rem;"></i> Running neural ATS alignment model...</div>`;

    try {
        const res = await window.apiRequest(`/ai/analyze-resume?resumeText=${encodeURIComponent(resumeText)}&jobDescription=${encodeURIComponent(jobDescription)}`, "POST");
        resBox.innerHTML = `
            <h3 style="color: var(--accent-cyan);"><i class="fa-solid fa-calculator"></i> ATS Match: ${res.matchPercentage}%</h3>
            <div class="stats-grid" style="margin-top: 1rem;">
                <div class="stat-card" style="padding: 1rem;">
                    <div class="stat-info"><h3>${res.atsScore}/100</h3><p>ATS Rating</p></div>
                </div>
                <div class="stat-card" style="padding: 1rem;">
                    <div class="stat-info"><h3>${res.industryReadinessScore}/100</h3><p>Readiness Rating</p></div>
                </div>
            </div>
            <h4 style="margin-top:1.5rem;">Detected Skills</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">${res.parsedSkills.join(", ")}</p>
            <h4 style="margin-top:1rem; color: var(--accent-amber);">Missing Target Skills</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">${res.missingSkills.join(", ")}</p>
            <h4 style="margin-top:1rem;">Recommended Action Items</h4>
            <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${res.improvements.map(i => `<li style="margin-top:0.25rem;">${i}</li>`).join("")}
            </ul>
        `;
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

window.runAICareerAdvisor = async () => {
    const resBox = document.getElementById("ai-career-results");
    if (!resBox) return;
    
    resBox.style.display = "block";
    resBox.innerHTML = `<div style="text-align: center; padding: 1.5rem;"><i class="fa-solid fa-spinner fa-spin" style="color:var(--accent-cyan);"></i> Processing profile credentials...</div>`;

    try {
        const res = await window.apiRequest("/ai/career-guidance", "GET");
        resBox.innerHTML = `
            <h3>AI Recommendations & Paths</h3>
            <h4 style="margin-top: 1.25rem; color: var(--accent-emerald);"><i class="fa-solid fa-graduation-cap"></i> Target Industries</h4>
            <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${res.recommendedPaths.map(r => `<li style="margin-top:0.25rem;">${r}</li>`).join("")}
            </ul>
            <h4 style="margin-top: 1.25rem; color: var(--accent-rose);"><i class="fa-solid fa-chart-line"></i> Skill Gaps Identified</h4>
            <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${res.skillGapAnalysis.map(r => `<li style="margin-top:0.25rem;">${r}</li>`).join("")}
            </ul>
            <h4 style="margin-top: 1.25rem; color: var(--accent-blue);"><i class="fa-solid fa-list-check"></i> Actionable Roadmap Steps</h4>
            <ol style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${res.stepsToImprove.map(r => `<li style="margin-top:0.25rem;">${r}</li>`).join("")}
            </ol>
        `;
    } catch (err) {
        window.showToast("Error", err.message, "error");
    }
};

// Chat contact lists load
window.loadChatContacts = async () => {
    const contactsList = document.getElementById("chat-contacts-list");
    if (!contactsList) return;

    try {
        // Mock user lists for communication
        const users = [
            { id: 2, username: "Hiring Manager", role: "RECRUITER" },
            { id: 3, username: "Placement Officer", role: "PLACEMENT_OFFICER" },
            { id: 1, username: "Lead Student Coordinator", role: "STUDENT" }
        ];

        // Exclude current user
        const filtered = users.filter(u => u.username !== window.state.user.username);
        
        contactsList.innerHTML = filtered.map(u => `
            <div class="chat-user-item ${window.state.chatUser && window.state.chatUser.id === u.id ? 'active' : ''}" onclick="window.selectChatUser(${u.id}, '${u.username}', '${u.role}')">
                <div class="user-avatar" style="width:40px; height:40px;">${u.username.charAt(0)}</div>
                <div class="chat-user-info">
                    <h4>${u.username}</h4>
                    <p>${u.role.replace("_", " ")}</p>
                </div>
            </div>
        `).join("");
    } catch (e) {
        console.warn("Could not load contact directories", e);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const contactsList = document.getElementById("chat-contacts-list");
    if (contactsList) {
        window.loadChatContacts();
    }

    const resumeForm = document.getElementById("ai-resume-form");
    if (resumeForm) {
        resumeForm.addEventListener("submit", window.analyzeResumeSubmit);
    }

    const advisorBtn = document.getElementById("ai-advisor-trigger");
    if (advisorBtn) {
        advisorBtn.addEventListener("click", window.runAICareerAdvisor);
    }
});

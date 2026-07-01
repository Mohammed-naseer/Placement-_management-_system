// WebSocket STOMP Configurations for Direct Chat Support
window.initWebSockets = () => {
    if (window.state.wsClient) return;

    try {
        const socket = new SockJS(window.WS_BASE);
        window.state.wsClient = Stomp.over(socket);
        window.state.wsClient.debug = null; // Quiet logs

        window.state.wsClient.connect({}, (frame) => {
            console.log("WebSocket connection established successfully.");
            
            // Subscribe to private user queues
            window.state.wsClient.subscribe(`/user/queue/messages`, (msg) => {
                const chatMsg = JSON.parse(msg.body);
                // If chatting with the sender, show bubble directly
                if (window.state.chatUser && (chatMsg.senderId === window.state.chatUser.id || chatMsg.senderId === window.state.user.id)) {
                    if (window.appendLocalMessage) {
                        window.appendLocalMessage(chatMsg);
                    }
                } else {
                    // Show global Alert notification
                    window.showToast(`New Chat from ${chatMsg.senderName}`, chatMsg.message, "info");
                }
            });
        }, (err) => {
            console.warn("Could not start WebSocket channel: ", err);
        });
    } catch (e) {
        console.warn("SockJS initialization failed.");
    }
};

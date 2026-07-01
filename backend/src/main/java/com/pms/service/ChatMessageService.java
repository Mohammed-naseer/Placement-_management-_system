package com.pms.service;

import com.pms.model.ChatMessage;
import java.util.List;

public interface ChatMessageService {
    ChatMessage saveMessage(Long senderId, Long receiverId, String message, String fileUrl);
    List<ChatMessage> getChatHistory(Long userId1, Long userId2);
}

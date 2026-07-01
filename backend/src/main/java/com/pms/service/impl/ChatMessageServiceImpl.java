package com.pms.service.impl;

import com.pms.exception.CustomExceptions;
import com.pms.model.ChatMessage;
import com.pms.model.User;
import com.pms.repository.ChatMessageRepository;
import com.pms.repository.UserRepository;
import com.pms.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatMessageServiceImpl implements ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public ChatMessage saveMessage(Long senderId, Long receiverId, String message, String fileUrl) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Sender user not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Receiver user not found"));

        ChatMessage chatMessage = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .message(message)
                .fileUrl(fileUrl)
                .build();

        return chatMessageRepository.save(chatMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessage> getChatHistory(Long userId1, Long userId2) {
        if (!userRepository.existsById(userId1) || !userRepository.existsById(userId2)) {
            throw new CustomExceptions.ResourceNotFoundException("One or both users not found");
        }
        return chatMessageRepository.findChatHistory(userId1, userId2);
    }
}

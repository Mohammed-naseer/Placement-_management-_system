package com.pms.controller;

import com.pms.dto.ChatMessageDTO;
import com.pms.exception.CustomExceptions;
import com.pms.model.ChatMessage;
import com.pms.model.User;
import com.pms.repository.UserRepository;
import com.pms.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDTO chatMessageDTO) {
        ChatMessage saved = chatMessageService.saveMessage(
                chatMessageDTO.getSenderId(),
                chatMessageDTO.getReceiverId(),
                chatMessageDTO.getMessage(),
                chatMessageDTO.getFileUrl()
        );

        ChatMessageDTO responseDTO = mapToDTO(saved);

        // Send to receiver
        messagingTemplate.convertAndSendToUser(
                saved.getReceiver().getUsername(),
                "/queue/messages",
                responseDTO
        );

        // Send back to sender to sync multiple sessions/tabs
        messagingTemplate.convertAndSendToUser(
                saved.getSender().getUsername(),
                "/queue/messages",
                responseDTO
        );
    }

    @GetMapping("/api/chat/history/{withUserId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(Principal principal, @PathVariable Long withUserId) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        List<ChatMessage> history = chatMessageService.getChatHistory(currentUser.getId(), withUserId);
        List<ChatMessageDTO> dtos = history.stream().map(this::mapToDTO).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private ChatMessageDTO mapToDTO(ChatMessage msg) {
        return ChatMessageDTO.builder()
                .id(msg.getId())
                .senderId(msg.getSender().getId())
                .senderName(msg.getSender().getUsername())
                .senderRole(msg.getSender().getRole().name())
                .receiverId(msg.getReceiver().getId())
                .receiverName(msg.getReceiver().getUsername())
                .message(msg.getMessage())
                .fileUrl(msg.getFileUrl())
                .sentAt(msg.getSentAt())
                .build();
    }
}

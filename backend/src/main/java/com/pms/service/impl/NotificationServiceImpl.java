package com.pms.service.impl;

import com.pms.exception.CustomExceptions;
import com.pms.model.Notification;
import com.pms.model.User;
import com.pms.repository.NotificationRepository;
import com.pms.repository.UserRepository;
import com.pms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String username) {
        User user = getUserByUsername(username);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(String username) {
        User user = getUserByUsername(username);
        return notificationRepository.findByUserIdAndIsRead(user.getId(), false);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId, String username) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getUsername().equals(username)) {
            throw new CustomExceptions.BadRequestException("Unauthorized notification modification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        User user = getUserByUsername(username);
        List<Notification> unread = notificationRepository.findByUserIdAndIsRead(user.getId(), false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public Notification createNotification(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type != null ? type : "SYSTEM")
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }
}

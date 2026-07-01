package com.pms.service;

import com.pms.model.Notification;
import com.pms.model.User;
import java.util.List;

public interface NotificationService {
    List<Notification> getUserNotifications(String username);
    List<Notification> getUnreadNotifications(String username);
    Notification markAsRead(Long notificationId, String username);
    void markAllAsRead(String username);
    Notification createNotification(User user, String title, String message, String type);
}

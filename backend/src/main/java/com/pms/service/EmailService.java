package com.pms.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otp);
    void sendNotificationEmail(String toEmail, String subject, String body);
}

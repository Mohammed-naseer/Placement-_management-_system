package com.pms.service.impl;

import com.pms.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "AI-PMS - One Time Password (OTP) Verification";
        String body = "Dear User,\n\n" +
                "Your OTP code for verification is: " + otp + "\n" +
                "This code will expire in 10 minutes.\n\n" +
                "Regards,\n" +
                "Placement Management Office";
        sendEmail(toEmail, subject, body);
    }

    @Override
    public void sendNotificationEmail(String toEmail, String subject, String body) {
        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String toEmail, String subject, String body) {
        if (mailSender == null) {
            logger.warn("[OFFLINE MOCK MAIL] To: {}, Subject: {}, Body: {}", toEmail, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("placement.system.demo@gmail.com");
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Email successfully sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send email to {}. Fallback warning printed. Error: {}", toEmail, e.getMessage());
            logger.warn("[OFFLINE FALLBACK MAIL] To: {}, Subject: {}, Body: {}", toEmail, subject, body);
        }
    }
}

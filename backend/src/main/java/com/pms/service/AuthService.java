package com.pms.service;

import com.pms.dto.AuthResponse;
import com.pms.dto.LoginRequest;
import com.pms.dto.RegisterRequest;
import com.pms.dto.UserProfileDTO;
import com.pms.model.User;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    User register(RegisterRequest registerRequest);
    boolean verifyOtp(String username, String otp);
    void generateOtp(String username);
    UserProfileDTO getUserProfile(String username);
}

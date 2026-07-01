package com.pms.service.impl;

import com.pms.config.JwtUtils;
import com.pms.dto.AuthResponse;
import com.pms.dto.LoginRequest;
import com.pms.dto.RegisterRequest;
import com.pms.dto.UserProfileDTO;
import com.pms.exception.CustomExceptions;
import com.pms.model.*;
import com.pms.repository.*;
import com.pms.service.AuthService;
import com.pms.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService, UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    @Override
    @Transactional
    public User register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new CustomExceptions.BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new CustomExceptions.BadRequestException("Email is already registered");
        }

        Role role;
        try {
            role = Role.valueOf(req.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomExceptions.BadRequestException("Invalid user role: " + req.getRole());
        }

        // Build core user (deactivated by default to await email/OTP validation)
        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .email(req.getEmail())
                .role(role)
                .isActive(false) // Verification required
                .build();

        User savedUser = userRepository.save(user);

        if (role == Role.STUDENT) {
            if (req.getRollNumber() == null || req.getBranch() == null || req.getYear() == null || req.getCgpa() == null) {
                throw new CustomExceptions.BadRequestException("Missing academic profiles detail for Student");
            }
            Student student = Student.builder()
                    .user(savedUser)
                    .rollNumber(req.getRollNumber())
                    .branch(req.getBranch())
                    .section(req.getSection())
                    .year(req.getYear())
                    .cgpa(req.getCgpa())
                    .backlogs(req.getBacklogs() != null ? req.getBacklogs() : 0)
                    .eligibilityStatus(req.getBacklogs() == null || req.getBacklogs() == 0)
                    .build();
            studentRepository.save(student);
        } else if (role == Role.RECRUITER) {
            if (req.getCompanyName() == null) {
                throw new CustomExceptions.BadRequestException("Company name is required for Recruiter");
            }
            // Find or create company
            Company company = companyRepository.findByName(req.getCompanyName())
                    .orElseGet(() -> {
                        Company newComp = Company.builder()
                                .name(req.getCompanyName())
                                .website(req.getCompanyWebsite())
                                .industry(req.getCompanyIndustry())
                                .verificationStatus("PENDING")
                                .build();
                        return companyRepository.save(newComp);
                    });

            Recruiter recruiter = Recruiter.builder()
                    .user(savedUser)
                    .company(company)
                    .designation(req.getDesignation())
                    .isVerified(false) // Pending TPO approval
                    .build();
            recruiterRepository.save(recruiter);
        }

        // Generate OTP and send email
        generateOtp(savedUser.getUsername());

        return savedUser;
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        User user = (User) authentication.getPrincipal();
        if (!user.isActive()) {
            throw new CustomExceptions.BadRequestException("User account is inactive. Please complete OTP verification.");
        }

        String jwt = jwtUtils.generateToken(user, user.getRole().name());

        return AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public boolean verifyOtp(String username, String otp) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return false;
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new CustomExceptions.BadRequestException("OTP expired");
        }

        user.setActive(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return true;
    }

    @Override
    @Transactional
    public void generateOtp(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        // Generate 6-digit random code
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        UserProfileDTO.UserProfileDTOBuilder builder = UserProfileDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.isActive());

        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Student profile not found"));

            UserProfileDTO.StudentProfileDTO studentDTO = UserProfileDTO.StudentProfileDTO.builder()
                    .id(student.getId())
                    .rollNumber(student.getRollNumber())
                    .branch(student.getBranch())
                    .section(student.getSection())
                    .year(student.getYear())
                    .cgpa(student.getCgpa())
                    .backlogs(student.getBacklogs())
                    .resumeUrl(student.getResumeUrl())
                    .linkedinUrl(student.getLinkedinUrl())
                    .githubUrl(student.getGithubUrl())
                    .portfolioUrl(student.getPortfolioUrl())
                    .eligibilityStatus(student.isEligibilityStatus())
                    .skills(student.getSkills().stream().map(Skill::getName).collect(Collectors.toSet()))
                    .projects(student.getProjects().stream().map(p -> UserProfileDTO.ProjectDTO.builder()
                            .id(p.getId())
                            .title(p.getTitle())
                            .description(p.getDescription())
                            .technologiesUsed(p.getTechnologiesUsed())
                            .projectUrl(p.getProjectUrl())
                            .build()).collect(Collectors.toList()))
                    .certificates(student.getCertificates().stream().map(c -> UserProfileDTO.CertificateDTO.builder()
                            .id(c.getId())
                            .name(c.getName())
                            .issuingOrganization(c.getIssuingOrganization())
                            .issueDate(c.getIssueDate())
                            .expirationDate(c.getExpirationDate())
                            .credentialUrl(c.getCredentialUrl())
                            .build()).collect(Collectors.toList()))
                    .build();

            builder.studentProfile(studentDTO);
        } else if (user.getRole() == Role.RECRUITER) {
            Recruiter recruiter = recruiterRepository.findByUser(user)
                    .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Recruiter profile not found"));

            UserProfileDTO.CompanyDTO companyDTO = UserProfileDTO.CompanyDTO.builder()
                    .id(recruiter.getCompany().getId())
                    .name(recruiter.getCompany().getName())
                    .website(recruiter.getCompany().getWebsite())
                    .industry(recruiter.getCompany().getIndustry())
                    .description(recruiter.getCompany().getDescription())
                    .location(recruiter.getCompany().getLocation())
                    .logoUrl(recruiter.getCompany().getLogoUrl())
                    .verificationStatus(recruiter.getCompany().getVerificationStatus())
                    .rating(recruiter.getCompany().getRating())
                    .build();

            UserProfileDTO.RecruiterProfileDTO recruiterDTO = UserProfileDTO.RecruiterProfileDTO.builder()
                    .id(recruiter.getId())
                    .designation(recruiter.getDesignation())
                    .isVerified(recruiter.isVerified())
                    .company(companyDTO)
                    .build();

            builder.recruiterProfile(recruiterDTO);
        }

        return builder.build();
    }
}

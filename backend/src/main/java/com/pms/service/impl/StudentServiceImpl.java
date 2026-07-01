package com.pms.service.impl;

import com.pms.dto.UserProfileDTO;
import com.pms.exception.CustomExceptions;
import com.pms.model.*;
import com.pms.repository.*;
import com.pms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    private Student getStudentByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Student profile not found"));
    }

    @Override
    @Transactional
    public Student updateProfile(String username, UserProfileDTO.StudentProfileDTO dto) {
        Student student = getStudentByUsername(username);

        student.setRollNumber(dto.getRollNumber());
        student.setBranch(dto.getBranch());
        student.setSection(dto.getSection());
        student.setYear(dto.getYear());
        student.setCgpa(dto.getCgpa());
        student.setBacklogs(dto.getBacklogs());
        student.setLinkedinUrl(dto.getLinkedinUrl());
        student.setGithubUrl(dto.getGithubUrl());
        student.setPortfolioUrl(dto.getPortfolioUrl());
        
        // Auto-re-evaluate base eligibility
        student.setEligibilityStatus(dto.getBacklogs() == 0);

        return studentRepository.save(student);
    }

    @Override
    @Transactional
    public Student addProject(String username, Project project) {
        Student student = getStudentByUsername(username);
        project.setStudent(student);
        student.getProjects().add(project);
        return studentRepository.save(student);
    }

    @Override
    @Transactional
    public void deleteProject(String username, Long projectId) {
        Student student = getStudentByUsername(username);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Project not found"));

        if (!project.getStudent().getId().equals(student.getId())) {
            throw new CustomExceptions.BadRequestException("Unauthorized project modification");
        }
        student.getProjects().remove(project);
        projectRepository.delete(project);
    }

    @Override
    @Transactional
    public Student addCertificate(String username, Certificate certificate) {
        Student student = getStudentByUsername(username);
        certificate.setStudent(student);
        student.getCertificates().add(certificate);
        return studentRepository.save(student);
    }

    @Override
    @Transactional
    public void deleteCertificate(String username, Long certificateId) {
        Student student = getStudentByUsername(username);
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Certificate not found"));

        if (!certificate.getStudent().getId().equals(student.getId())) {
            throw new CustomExceptions.BadRequestException("Unauthorized certificate modification");
        }
        student.getCertificates().remove(certificate);
        certificateRepository.delete(certificate);
    }

    @Override
    @Transactional
    public Student syncSkills(String username, Set<String> skillNames) {
        Student student = getStudentByUsername(username);
        Set<Skill> skills = new HashSet<>();

        for (String skillName : skillNames) {
            Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                    .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName.trim()).build()));
            skills.add(skill);
        }

        student.setSkills(skills);
        return studentRepository.save(student);
    }

    @Override
    @Transactional
    public Student updateResume(String username, String resumeUrl) {
        Student student = getStudentByUsername(username);
        student.setResumeUrl(resumeUrl);
        return studentRepository.save(student);
    }
}

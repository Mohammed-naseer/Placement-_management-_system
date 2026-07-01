package com.pms.service;

import com.pms.dto.UserProfileDTO;
import com.pms.model.Certificate;
import com.pms.model.Project;
import com.pms.model.Student;

import java.util.Set;

public interface StudentService {
    Student updateProfile(String username, UserProfileDTO.StudentProfileDTO profileDTO);
    Student addProject(String username, Project project);
    void deleteProject(String username, Long projectId);
    Student addCertificate(String username, Certificate certificate);
    void deleteCertificate(String username, Long certificateId);
    Student syncSkills(String username, Set<String> skillNames);
    Student updateResume(String username, String resumeUrl);
}

package com.pms.controller;

import com.pms.dto.UserProfileDTO;
import com.pms.model.Certificate;
import com.pms.model.Project;
import com.pms.model.Student;
import com.pms.service.FileStorageService;
import com.pms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/students")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private FileStorageService fileStorageService;

    @PutMapping("/profile")
    public ResponseEntity<Student> updateProfile(Principal principal, @RequestBody UserProfileDTO.StudentProfileDTO dto) {
        Student updated = studentService.updateProfile(principal.getName(), dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/resume")
    public ResponseEntity<?> uploadResume(Principal principal, @RequestParam("file") MultipartFile file) {
        String resumeUrl = fileStorageService.storeFile(file, "resumes");
        Student updated = studentService.updateResume(principal.getName(), resumeUrl);
        return ResponseEntity.ok(Map.of(
                "message", "Resume uploaded successfully",
                "resumeUrl", resumeUrl,
                "student", updated
        ));
    }

    @PostMapping("/skills")
    public ResponseEntity<Student> syncSkills(Principal principal, @RequestBody Set<String> skillNames) {
        Student updated = studentService.syncSkills(principal.getName(), skillNames);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/projects")
    public ResponseEntity<Student> addProject(Principal principal, @RequestBody Project project) {
        Student updated = studentService.addProject(principal.getName(), project);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<?> deleteProject(Principal principal, @PathVariable Long projectId) {
        studentService.deleteProject(principal.getName(), projectId);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }

    @PostMapping("/certificates")
    public ResponseEntity<Student> addCertificate(Principal principal, @RequestBody Certificate certificate) {
        Student updated = studentService.addCertificate(principal.getName(), certificate);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/certificates/{certificateId}")
    public ResponseEntity<?> deleteCertificate(Principal principal, @PathVariable Long certificateId) {
        studentService.deleteCertificate(principal.getName(), certificateId);
        return ResponseEntity.ok(Map.of("message", "Certificate deleted successfully"));
    }
}

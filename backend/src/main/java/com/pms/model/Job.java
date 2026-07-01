package com.pms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter recruiter;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "salary_package", nullable = false)
    private Double salaryPackage; // in LPA

    @Column(nullable = false, length = 100)
    private String location;

    @Column(name = "work_type", nullable = false, length = 20)
    private String workType; // REMOTE, HYBRID, ON_SITE

    @Column(name = "application_deadline", nullable = false)
    private LocalDateTime applicationDeadline;

    @Builder.Default
    @Column(name = "min_cgpa")
    private Double minCgpa = 0.0;

    @Builder.Default
    @Column(name = "max_backlogs")
    private Integer maxBacklogs = 0;

    @Builder.Default
    @Column(length = 20)
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, APPROVED, REJECTED, CLOSED

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_branches", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "branch")
    @Builder.Default
    private Set<String> branches = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "job_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

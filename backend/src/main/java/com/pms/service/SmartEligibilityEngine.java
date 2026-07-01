package com.pms.service;

import com.pms.exception.CustomExceptions;
import com.pms.model.Job;
import com.pms.model.Student;
import org.springframework.stereotype.Service;

@Service
public class SmartEligibilityEngine {

    public boolean isEligible(Student student, Job job) {
        // 1. Check general student eligibility status (active backlogs constraint)
        if (!student.isEligibilityStatus()) {
            throw new CustomExceptions.EligibilityException("Your account is marked ineligible for recruitment due to active backlogs.");
        }

        // 2. Check CGPA Mismatch
        if (job.getMinCgpa() != null && student.getCgpa() < job.getMinCgpa()) {
            throw new CustomExceptions.EligibilityException(
                    String.format("CGPA Mismatch: Required minimum CGPA is %s, your current CGPA is %s",
                            job.getMinCgpa(), student.getCgpa())
            );
        }

        // 3. Check Backlog Count Mismatch
        if (job.getMaxBacklogs() != null && student.getBacklogs() > job.getMaxBacklogs()) {
            throw new CustomExceptions.EligibilityException(
                    String.format("Backlogs Mismatch: Maximum allowed backlogs is %d, you have %d",
                            job.getMaxBacklogs(), student.getBacklogs())
            );
        }

        // 4. Check Branch Mismatch
        if (job.getBranches() != null && !job.getBranches().isEmpty()) {
            boolean branchMatch = job.getBranches().stream()
                    .anyMatch(branch -> branch.trim().equalsIgnoreCase(student.getBranch().trim()));
            if (!branchMatch) {
                throw new CustomExceptions.EligibilityException(
                        String.format("Branch Mismatch: This role is open to branches: %s. Your branch is %s",
                                String.join(", ", job.getBranches()), student.getBranch())
                );
            }
        }

        return true;
    }
}

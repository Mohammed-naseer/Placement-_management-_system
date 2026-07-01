package com.pms.repository;

import com.pms.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(String status);
    List<Job> findByRecruiterId(Long recruiterId);
    List<Job> findByRecruiterCompanyId(Long companyId);
}

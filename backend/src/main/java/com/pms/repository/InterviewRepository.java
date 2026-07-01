package com.pms.repository;

import com.pms.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationStudentId(Long studentId);
    List<Interview> findByRecruiterId(Long recruiterId);
}

package com.pms.repository;

import com.pms.model.PlacementReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementReportRepository extends JpaRepository<PlacementReport, Long> {
    List<PlacementReport> findByCreatedById(Long userId);
}

package com.pms.service;

import com.pms.model.PlacementReport;
import java.util.List;

public interface PlacementReportService {
    PlacementReport generateReport(String title, String reportType, String creatorUsername);
    List<PlacementReport> getAllReports();
    PlacementReport getReportById(Long id);
}

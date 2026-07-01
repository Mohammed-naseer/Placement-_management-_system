package com.pms.controller;

import com.pms.model.PlacementReport;
import com.pms.service.PlacementReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('PLACEMENT_OFFICER', 'SUPER_ADMIN')")
public class PlacementReportController {

    @Autowired
    private PlacementReportService reportService;

    @PostMapping
    public ResponseEntity<PlacementReport> generateReport(
            Principal principal,
            @RequestParam String title,
            @RequestParam String reportType) {
        PlacementReport report = reportService.generateReport(title, reportType, principal.getName());
        return ResponseEntity.ok(report);
    }

    @GetMapping
    public ResponseEntity<List<PlacementReport>> getAllReports() {
        List<PlacementReport> reports = reportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<PlacementReport> getReportById(@PathVariable Long reportId) {
        PlacementReport report = reportService.getReportById(reportId);
        return ResponseEntity.ok(report);
    }
}

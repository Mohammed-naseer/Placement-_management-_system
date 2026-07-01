package com.pms.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pms.exception.CustomExceptions;
import com.pms.model.*;
import com.pms.repository.ApplicationRepository;
import com.pms.repository.PlacementReportRepository;
import com.pms.repository.StudentRepository;
import com.pms.repository.UserRepository;
import com.pms.service.PlacementReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlacementReportServiceImpl implements PlacementReportService {

    @Autowired
    private PlacementReportRepository reportRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public PlacementReport generateReport(String title, String reportType, String creatorUsername) {
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Creator user not found"));

        if (creator.getRole() != Role.SUPER_ADMIN && creator.getRole() != Role.PLACEMENT_OFFICER) {
            throw new CustomExceptions.BadRequestException("Only TPOs and Admins can generate placement reports");
        }

        String normalizedType = reportType.trim().toUpperCase();
        List<String> validTypes = List.of("GENERAL", "BRANCH_WISE", "SALARY_DISTRIBUTION", "COMPANY_WISE");
        if (!validTypes.contains(normalizedType)) {
            throw new CustomExceptions.BadRequestException("Invalid report type: " + reportType);
        }

        List<Student> students = studentRepository.findAll();
        List<Application> applications = applicationRepository.findAll();

        Map<String, Object> dataMap = new HashMap<>();

        // Helper set to identify placed student IDs
        Set<Long> placedStudentIds = applications.stream()
                .filter(app -> app.getStatus().equalsIgnoreCase("SELECTED") || app.getStatus().equalsIgnoreCase("OFFER_RELEASED"))
                .map(app -> app.getStudent().getId())
                .collect(Collectors.toSet());

        switch (normalizedType) {
            case "GENERAL":
                long totalStudents = students.size();
                long totalPlaced = placedStudentIds.size();
                double placementRate = totalStudents > 0 ? (double) totalPlaced * 100 / totalStudents : 0.0;

                double avgPlacedCgpa = students.stream()
                        .filter(s -> placedStudentIds.contains(s.getId()))
                        .mapToDouble(Student::getCgpa)
                        .average()
                        .orElse(0.0);

                double avgUnplacedCgpa = students.stream()
                        .filter(s -> !placedStudentIds.contains(s.getId()))
                        .mapToDouble(Student::getCgpa)
                        .average()
                        .orElse(0.0);

                dataMap.put("totalStudentsRegistered", totalStudents);
                dataMap.put("totalStudentsPlaced", totalPlaced);
                dataMap.put("placementPercentage", Math.round(placementRate * 100.0) / 100.0);
                dataMap.put("averagePlacedCgpa", Math.round(avgPlacedCgpa * 100.0) / 100.0);
                dataMap.put("averageUnplacedCgpa", Math.round(avgUnplacedCgpa * 100.0) / 100.0);
                dataMap.put("totalApplications", applications.size());
                break;

            case "BRANCH_WISE":
                Map<String, Long> regByBranch = students.stream()
                        .collect(Collectors.groupingBy(Student::getBranch, Collectors.counting()));

                Map<String, Long> placedByBranch = students.stream()
                        .filter(s -> placedStudentIds.contains(s.getId()))
                        .collect(Collectors.groupingBy(Student::getBranch, Collectors.counting()));

                Map<String, Object> branchBreakdown = new HashMap<>();
                for (String branch : regByBranch.keySet()) {
                    Map<String, Object> branchStats = new HashMap<>();
                    long registered = regByBranch.get(branch);
                    long placed = placedByBranch.getOrDefault(branch, 0L);
                    double rate = registered > 0 ? (double) placed * 100 / registered : 0.0;

                    branchStats.put("registered", registered);
                    branchStats.put("placed", placed);
                    branchStats.put("placementRate", Math.round(rate * 100.0) / 100.0);
                    branchBreakdown.put(branch, branchStats);
                }
                dataMap.put("branchWiseStats", branchBreakdown);
                break;

            case "SALARY_DISTRIBUTION":
                List<Double> salaries = applications.stream()
                        .filter(app -> app.getStatus().equalsIgnoreCase("SELECTED") || app.getStatus().equalsIgnoreCase("OFFER_RELEASED"))
                        .map(app -> app.getJob().getSalaryPackage())
                        .collect(Collectors.toList());

                double minSal = salaries.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
                double maxSal = salaries.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
                double avgSal = salaries.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

                dataMap.put("minimumPackageLPA", minSal);
                dataMap.put("maximumPackageLPA", maxSal);
                dataMap.put("averagePackageLPA", Math.round(avgSal * 100.0) / 100.0);
                dataMap.put("totalOffers", salaries.size());
                break;

            case "COMPANY_WISE":
                Map<String, Long> placementsByCompany = applications.stream()
                        .filter(app -> app.getStatus().equalsIgnoreCase("SELECTED") || app.getStatus().equalsIgnoreCase("OFFER_RELEASED"))
                        .collect(Collectors.groupingBy(
                                app -> app.getJob().getRecruiter().getCompany().getName(),
                                Collectors.counting()
                        ));
                dataMap.put("companyWisePlacements", placementsByCompany);
                break;
        }

        String jsonStr;
        try {
            jsonStr = objectMapper.writeValueAsString(dataMap);
        } catch (Exception e) {
            throw new CustomExceptions.BadRequestException("Failed to format report data: " + e.getMessage());
        }

        PlacementReport report = PlacementReport.builder()
                .title(title)
                .reportType(normalizedType)
                .dataJson(jsonStr)
                .createdBy(creator)
                .build();

        return reportRepository.save(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlacementReport> getAllReports() {
        return reportRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public PlacementReport getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Placement report not found"));
    }
}

package com.pms.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.pms.exception.CustomExceptions;
import com.pms.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageServiceImpl.class);

    @Value("${pms.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${pms.cloudinary.api-key:}")
    private String apiKey;

    @Value("${pms.cloudinary.api-secret:}")
    private String apiSecret;

    private Cloudinary cloudinary;
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.isEmpty() &&
            apiKey != null && !apiKey.isEmpty() &&
            apiSecret != null && !apiSecret.isEmpty()) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
            ));
            logger.info("Cloudinary service initialized successfully.");
        } else {
            logger.warn("Cloudinary configuration missing or incomplete. Falling back to local storage.");
            try {
                Files.createDirectories(this.fileStorageLocation);
            } catch (Exception ex) {
                throw new CustomExceptions.BadRequestException("Could not create local upload folder: " + ex.getMessage());
            }
        }
    }

    @Override
    public String storeFile(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new CustomExceptions.BadRequestException("Cannot upload empty file");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.contains("..")) {
            throw new CustomExceptions.BadRequestException("Invalid file name: " + originalFileName);
        }

        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i);
        }
        String fileName = UUID.randomUUID().toString() + extension;

        if (cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", fileName.substring(0, fileName.lastIndexOf('.'))
                ));
                return (String) uploadResult.get("secure_url");
            } catch (IOException e) {
                logger.error("Cloudinary upload failed, falling back to local file storage. Error: {}", e.getMessage());
            }
        }

        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "http://localhost:8080/api/public/files/" + fileName;
        } catch (IOException ex) {
            throw new CustomExceptions.BadRequestException("Could not store file locally: " + ex.getMessage());
        }
    }
}

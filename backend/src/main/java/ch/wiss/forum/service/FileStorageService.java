package ch.wiss.forum.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.file-storage.base-dir:uploads}")
    private String baseDir;

    @Value("${app.file-storage.base-url:http://localhost:8080/api/files}")
    private String baseUrl;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(baseDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("File storage initialized at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, String userId) {
        // Normalize file name
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");
        
        try {
            // Check if the file's name contains invalid characters
            if (originalFilename.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFilename);
            }

            // Generate unique filename
            String fileExtension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                fileExtension = originalFilename.substring(dotIndex);
            }
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            String fileName = String.format("%s_%s_%s%s", userId, timestamp, uniqueId, fileExtension);

            // Create subdirectory structure: uploads/YYYY/MM/DD/
            LocalDateTime now = LocalDateTime.now();
            Path dateDirectory = fileStorageLocation
                .resolve(String.valueOf(now.getYear()))
                .resolve(String.format("%02d", now.getMonthValue()))
                .resolve(String.format("%02d", now.getDayOfMonth()));
            
            Files.createDirectories(dateDirectory);

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = dateDirectory.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path for URL generation
            String relativePath = fileStorageLocation.relativize(targetLocation).toString().replace("\\", "/");
            
            log.info("File stored successfully: {}", relativePath);
            return relativePath;
            
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String filePath) {
        try {
            Path file = fileStorageLocation.resolve(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + filePath, ex);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path file = fileStorageLocation.resolve(filePath).normalize();
            Files.deleteIfExists(file);
            log.info("File deleted: {}", filePath);
        } catch (IOException ex) {
            log.error("Could not delete file: {}", filePath, ex);
        }
    }

    public String generateFileUrl(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return null;
        }
        return baseUrl + "/" + filePath;
    }

    public boolean fileExists(String filePath) {
        try {
            Path file = fileStorageLocation.resolve(filePath).normalize();
            return Files.exists(file);
        } catch (Exception ex) {
            return false;
        }
    }

    public long getFileSize(String filePath) {
        try {
            Path file = fileStorageLocation.resolve(filePath).normalize();
            return Files.size(file);
        } catch (IOException ex) {
            return 0;
        }
    }

    public String migrateBase64ToFile(String base64Data, String userId, String fileExtension) {
        if (base64Data == null || !base64Data.startsWith("data:")) {
            return base64Data; // Not a base64 data URL, return as-is
        }
        
        try {
            // Extract base64 content
            String[] parts = base64Data.split(",");
            if (parts.length != 2) {
                return base64Data; // Invalid format
            }
            
            byte[] decodedBytes = java.util.Base64.getDecoder().decode(parts[1]);
            
            // Generate unique filename
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            String fileName = String.format("migrated_%s_%s_%s%s", userId, timestamp, uniqueId, fileExtension);

            // Create subdirectory structure
            LocalDateTime now = LocalDateTime.now();
            Path dateDirectory = fileStorageLocation
                .resolve(String.valueOf(now.getYear()))
                .resolve(String.format("%02d", now.getMonthValue()))
                .resolve(String.format("%02d", now.getDayOfMonth()));
            
            Files.createDirectories(dateDirectory);

            // Write file
            Path targetLocation = dateDirectory.resolve(fileName);
            Files.write(targetLocation, decodedBytes);

            // Return relative path for URL generation
            String relativePath = fileStorageLocation.relativize(targetLocation).toString().replace("\\", "/");
            
            log.info("Migrated base64 data to file: {}", relativePath);
            return generateFileUrl(relativePath);
            
        } catch (Exception ex) {
            log.error("Failed to migrate base64 data to file", ex);
            return base64Data; // Return original on failure
        }
    }
} 
package ch.wiss.forum.service;

import ch.wiss.forum.model.FileEntity;
import ch.wiss.forum.repository.FileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Autowired
    private FileRepository fileRepository;

    @Value("${app.file-storage.base-url:http://localhost:8080/api/files}")
    private String baseUrl;

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

            // Read file data
            byte[] fileData = file.getBytes();
            
            // Create FileEntity and save to database
            FileEntity fileEntity = new FileEntity(
                fileName,
                originalFilename,
                file.getContentType(),
                file.getSize(),
                fileData,
                userId
            );
            
            FileEntity savedFile = fileRepository.save(fileEntity);
            
            log.info("File stored successfully in database: {} (ID: {})", originalFilename, savedFile.getId());
            return savedFile.getId(); // Return the database ID instead of file path
            
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    public Optional<FileEntity> getFile(String fileId) {
        return fileRepository.findById(fileId);
    }
    
    public Optional<FileEntity> getFileByFilename(String filename) {
        return fileRepository.findByFilename(filename);
    }

    public void deleteFile(String fileId) {
        try {
            fileRepository.deleteById(fileId);
            log.info("File deleted from database: {}", fileId);
        } catch (Exception ex) {
            log.error("Could not delete file: {}", fileId, ex);
        }
    }

    public String generateFileUrl(String fileId) {
        if (fileId == null || fileId.isEmpty()) {
            return null;
        }
        return baseUrl + "/" + fileId;
    }

    public boolean fileExists(String fileId) {
        try {
            return fileRepository.existsById(fileId);
        } catch (Exception ex) {
            return false;
        }
    }

    public long getFileSize(String fileId) {
        try {
            Optional<FileEntity> file = fileRepository.findById(fileId);
            return file.map(FileEntity::getSize).orElse(0L);
        } catch (Exception ex) {
            return 0;
        }
    }

    public String migrateBase64ToFile(String base64Data, String userId, String fileExtension) {
        if (base64Data == null || !base64Data.startsWith("data:")) {
            return base64Data; // Not a base64 data URL, return as-is
        }
        
        try {
            // Extract base64 content and MIME type
            String[] parts = base64Data.split(",");
            if (parts.length != 2) {
                return base64Data; // Invalid format
            }
            
            String header = parts[0]; // e.g., "data:image/jpeg;base64"
            String data = parts[1];
            
            // Extract MIME type
            String mimeType = header.substring(5, header.indexOf(";"));
            
            byte[] decodedBytes = java.util.Base64.getDecoder().decode(data);
            
            // Generate unique filename
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            String fileName = String.format("migrated_%s_%s_%s%s", userId, timestamp, uniqueId, fileExtension);

            // Create FileEntity and save to database
            FileEntity fileEntity = new FileEntity(
                fileName,
                "migrated_file" + fileExtension,
                mimeType,
                (long) decodedBytes.length,
                decodedBytes,
                userId
            );
            
            FileEntity savedFile = fileRepository.save(fileEntity);
            
            log.info("Migrated base64 data to database: {}", savedFile.getId());
            return generateFileUrl(savedFile.getId());
            
        } catch (Exception ex) {
            log.error("Failed to migrate base64 data to database", ex);
            return base64Data; // Return original on failure
        }
    }
} 
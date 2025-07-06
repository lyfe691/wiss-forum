package ch.wiss.forum.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ch.wiss.forum.model.FileEntity;
import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.response.MessageResponse;
import ch.wiss.forum.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class FileController {
    
    private final FileStorageService fileStorageService;
    
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_IMAGE_TYPES = {
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    };
    private static final String[] ALLOWED_DOCUMENT_TYPES = {
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    };
    
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("User not authenticated"));
        }
        
        User currentUser = (User) authentication.getPrincipal();
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Please select a file to upload"));
            }
            
            // Check file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("File size must be less than " + (MAX_FILE_SIZE / (1024 * 1024)) + "MB"));
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !isAllowedFileType(contentType)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("File type not supported. Allowed types: images, PDFs, and documents"));
            }
            
            // Store file in database and get file ID
            String fileId = fileStorageService.storeFile(file, currentUser.getId());
            String fileUrl = fileStorageService.generateFileUrl(fileId);
            
            // Create response with file information
            Map<String, Object> response = new HashMap<>();
            response.put("id", fileId);
            response.put("name", file.getOriginalFilename());
            response.put("size", file.getSize());
            response.put("type", contentType);
            response.put("url", fileUrl);
            response.put("uploadedBy", currentUser.getId());
            response.put("uploadedAt", java.time.LocalDateTime.now());
            
            log.info("File uploaded successfully to database: {} by user {}", file.getOriginalFilename(), currentUser.getUsername());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to upload file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to upload file: " + e.getMessage()));
        }
    }
    
    @GetMapping("/files/{fileId}")
    public ResponseEntity<byte[]> serveFile(@PathVariable String fileId) {
        try {
            Optional<FileEntity> fileOptional = fileStorageService.getFile(fileId);
            
            if (fileOptional.isEmpty()) {
                log.warn("File not found: {}", fileId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            FileEntity file = fileOptional.get();
            
            // Determine content type
            String contentType = file.getContentType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600") // Cache for 1 hour
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getOriginalName() + "\"")
                    .body(file.getData());
                    
        } catch (Exception e) {
            log.error("Error serving file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    private boolean isAllowedFileType(String contentType) {
        // Check if it's an allowed image type
        for (String allowedType : ALLOWED_IMAGE_TYPES) {
            if (allowedType.equals(contentType)) {
                return true;
            }
        }
        
        // Check if it's an allowed document type
        for (String allowedType : ALLOWED_DOCUMENT_TYPES) {
            if (allowedType.equals(contentType)) {
                return true;
            }
        }
        
        return false;
    }
} 
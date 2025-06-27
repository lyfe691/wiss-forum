package ch.wiss.forum.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "files")
public class FileEntity {
    @Id
    private String id;
    
    @Field("filename")
    private String filename;
    
    @Field("original_name")
    private String originalName;
    
    @Field("content_type")
    private String contentType;
    
    @Field("size")
    private Long size;
    
    @Field("data")
    private byte[] data;
    
    @Field("uploaded_by")
    private String uploadedBy;
    
    @Field("uploaded_at")
    private LocalDateTime uploadedAt;
    
    // Constructors
    public FileEntity() {}
    
    public FileEntity(String filename, String originalName, String contentType, Long size, byte[] data, String uploadedBy) {
        this.filename = filename;
        this.originalName = originalName;
        this.contentType = contentType;
        this.size = size;
        this.data = data;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getFilename() {
        return filename;
    }
    
    public void setFilename(String filename) {
        this.filename = filename;
    }
    
    public String getOriginalName() {
        return originalName;
    }
    
    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public Long getSize() {
        return size;
    }
    
    public void setSize(Long size) {
        this.size = size;
    }
    
    public byte[] getData() {
        return data;
    }
    
    public void setData(byte[] data) {
        this.data = data;
    }
    
    public String getUploadedBy() {
        return uploadedBy;
    }
    
    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
} 
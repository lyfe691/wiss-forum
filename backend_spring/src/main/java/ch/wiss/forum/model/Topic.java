package ch.wiss.forum.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "topics")
public class Topic {
    
    @Id
    private String id;
    
    private String title;
    
    private String content;
    
    @Indexed(unique = true)
    private String slug;
    
    @DBRef
    private Category category;
    
    @DBRef
    private User author;
    
    private int viewCount;
    
    private int replyCount;
    
    @DBRef
    private Post lastPost;
    
    private LocalDateTime lastPostAt;
    
    private List<String> tags;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 
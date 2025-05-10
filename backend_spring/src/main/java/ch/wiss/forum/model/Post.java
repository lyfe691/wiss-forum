package ch.wiss.forum.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Post {
    
    @Id
    private String id;
    
    private String content;
    
    @DBRef
    @JsonIdentityReference(alwaysAsId = true)
    private Topic topic;
    
    @DBRef
    private User author;
    
    private boolean isEdited;
    
    private LocalDateTime lastEditedAt;
    
    @DBRef
    @JsonIdentityReference(alwaysAsId = true)
    private Post replyTo;
    
    @Builder.Default
    private List<String> likes = new ArrayList<>();
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 
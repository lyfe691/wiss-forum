package ch.wiss.forum.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.wiss.forum.model.Category;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.response.MessageResponse;
import ch.wiss.forum.service.CategoryService;
import ch.wiss.forum.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {
    
    private final TopicService topicService;
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<Page<Topic>> getAllTopics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        
        Sort.Direction direction = order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));
        
        Page<Topic> topics = topicService.getAllTopics(pageable);
        return ResponseEntity.ok(topics);
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getTopicsByCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            // Create pageable with descending sort by createdAt
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // First try to get by ID
            try {
                Category category = categoryService.getCategoryById(categoryId);
                Page<Topic> topicsPage = topicService.getTopicsByCategory(categoryId, pageable);
                return ResponseEntity.ok(topicsPage.getContent());
            } catch (Exception idError) {
                // If not found by ID, try by slug
                Category category = categoryService.getCategoryBySlug(categoryId);
                Page<Topic> topicsPage = topicService.getTopicsByCategory(category.getId(), pageable);
                return ResponseEntity.ok(topicsPage.getContent());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<Topic>> getRecentTopics() {
        List<Topic> topics = topicService.getRecentTopics();
        return ResponseEntity.ok(topics);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<Topic>> searchTopics(
            @RequestParam String term,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Topic> topics = topicService.searchTopics(term, pageable);
        return ResponseEntity.ok(topics);
    }
    
    @GetMapping("/{idOrSlug}")
    public ResponseEntity<?> getTopicById(@PathVariable String idOrSlug) {
        try {
            // Check for null or invalid id
            if (idOrSlug == null || idOrSlug.equals("null") || idOrSlug.equals("undefined") || idOrSlug.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Topic not found: Invalid ID/slug"));
            }
            
            try {
                // First try to look up by ID
                Topic topic = topicService.getTopicById(idOrSlug);
                return ResponseEntity.ok(topic);
            } catch (Exception idError) {
                // If ID lookup fails, try to find by slug
                Topic topic = topicService.getTopicBySlug(idOrSlug);
                return ResponseEntity.ok(topic);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Topic not found with ID or slug: " + idOrSlug));
        }
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getTopicBySlug(@PathVariable String slug) {
        try {
            // Check for null or invalid slug
            if (slug == null || slug.equals("null") || slug.equals("undefined") || slug.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Topic not found: Invalid slug"));
            }
            
            Topic topic = topicService.getTopicBySlug(slug);
            return ResponseEntity.ok(topic);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Topic not found with slug: " + slug));
        }
    }
    
    @PostMapping("/{id}/view")
    public ResponseEntity<Topic> incrementViewCount(@PathVariable String id) {
        try {
            Topic topic = topicService.incrementViewCount(id);
            return ResponseEntity.ok(topic);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createTopic(@Valid @RequestBody Map<String, Object> requestBody) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Authentication required to create a topic"));
            }
            
            if (!(authentication.getPrincipal() instanceof User)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid authentication type"));
            }
            
            User currentUser = (User) authentication.getPrincipal();
            
            // Extract data from request
            String title = (String) requestBody.get("title");
            String content = (String) requestBody.get("content");
            String categoryId = (String) requestBody.get("categoryId");
            List<String> tags = (List<String>) requestBody.get("tags");
            
            if (title == null || content == null || categoryId == null) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Title, content, and categoryId are required"));
            }
            
            // Fetch the category
            Category category;
            try {
                category = categoryService.getCategoryById(categoryId);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Category not found with ID: " + categoryId));
            }
            
            // Create Topic
            Topic topic = new Topic();
            topic.setTitle(title);
            topic.setContent(content);
            topic.setCategory(category);
            if (tags != null) {
                topic.setTags(tags);
            }
            
            Topic createdTopic = topicService.createTopic(topic, currentUser);
            
            return new ResponseEntity<>(createdTopic, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Failed to create topic: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Topic> updateTopic(@PathVariable String id, @Valid @RequestBody Topic topic) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if the user is the author or an admin/teacher
        Topic existingTopic = topicService.getTopicById(id);
        if (!existingTopic.getAuthor().getId().equals(currentUser.getId()) && 
                !("admin".equals(currentUser.getRole()) || "teacher".equals(currentUser.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Topic updatedTopic = topicService.updateTopic(id, topic);
        return ResponseEntity.ok(updatedTopic);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTopic(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if the user is the author or an admin/teacher
        Topic existingTopic = topicService.getTopicById(id);
        if (!existingTopic.getAuthor().getId().equals(currentUser.getId()) && 
                !("admin".equals(currentUser.getRole()) || "teacher".equals(currentUser.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        topicService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }
} 
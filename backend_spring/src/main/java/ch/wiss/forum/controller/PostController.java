package ch.wiss.forum.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.wiss.forum.model.Post;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;
import ch.wiss.forum.service.PostService;
import ch.wiss.forum.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, maxAge = 3600)
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    
    private static final Logger logger = LoggerFactory.getLogger(PostController.class);
    
    private final PostService postService;
    private final TopicService topicService;
    
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<Page<Post>> getPostsByTopic(
            @PathVariable String topicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            // Log that we're starting to fetch posts
            logger.info("Fetching posts for topic with ID: {}", topicId);
            
            // Create pageable with ascending sort by createdAt
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
            
            // Get the Topic object
            Topic topic = topicService.getTopicById(topicId);
            logger.debug("Found topic: {} with title: {}", topic.getId(), topic.getTitle());
            
            // Fetch posts for the topic
            Page<Post> posts = postService.getPostsByTopic(topic, pageable);
            logger.info("Found {} posts for topic {}", posts.getContent().size(), topicId);
            
            // Log results for debugging
            if (posts.isEmpty()) {
                logger.warn("No posts found for topic {}", topicId);
            } else {
                logger.debug("First post ID: {}", posts.getContent().get(0).getId());
            }
            
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error fetching posts for topic {}: {}", topicId, e.getMessage());
            throw new RuntimeException("Failed to fetch posts for topic: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        Post post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createPost(@Valid @RequestBody Map<String, Object> requestBody) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            
            // Get data from request
            String content = (String) requestBody.get("content");
            String topicId = (String) requestBody.get("topicId");
            String replyToId = (String) requestBody.get("replyTo");
            
            if (content == null || topicId == null) {
                return ResponseEntity.badRequest().body("Content and topicId are required");
            }
            
            // Create a post object
            Post post = new Post();
            post.setContent(content);
            
            // Create a Topic object with just the ID set
            Topic topic = new Topic();
            topic.setId(topicId);
            post.setTopic(topic);
            
            // Set reply-to if provided
            if (replyToId != null) {
                Post replyTo = new Post();
                replyTo.setId(replyToId);
                post.setReplyTo(replyTo);
            }
            
            Post createdPost = postService.createPost(post, currentUser);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to create post: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @Valid @RequestBody Post post) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        try {
            Post updatedPost = postService.updatePost(id, post, currentUser);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        try {
            postService.deletePost(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Post> likePost(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        Post post = postService.likePost(id, currentUser);
        return ResponseEntity.ok(post);
    }
    
    @PostMapping("/{id}/unlike")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Post> unlikePost(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        Post post = postService.unlikePost(id, currentUser);
        return ResponseEntity.ok(post);
    }
}
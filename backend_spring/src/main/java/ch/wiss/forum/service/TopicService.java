package ch.wiss.forum.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ch.wiss.forum.model.Category;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;
import ch.wiss.forum.repository.TopicRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TopicService {
    
    private final TopicRepository topicRepository;
    private final CategoryService categoryService;
    
    public Page<Topic> getAllTopics(Pageable pageable) {
        return topicRepository.findAll(pageable);
    }
    
    public Page<Topic> getTopicsByCategory(String categoryId, Pageable pageable) {
        Category category = categoryService.getCategoryById(categoryId);
        return topicRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
    }
    
    public Page<Topic> getTopicsByAuthor(User author, Pageable pageable) {
        return topicRepository.findByAuthorOrderByCreatedAtDesc(author, pageable);
    }
    
    public Topic getTopicById(String id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + id));
    }
    
    public Topic getTopicBySlug(String slug) {
        return topicRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Topic not found with slug: " + slug));
    }
    
    public Topic createTopic(Topic topic, User currentUser) {
        // Set creation metadata
        topic.setAuthor(currentUser);
        topic.setCreatedAt(LocalDateTime.now());
        topic.setUpdatedAt(LocalDateTime.now());
        topic.setViewCount(0);
        topic.setReplyCount(0);
        
        // Generate a slug if not provided
        if (topic.getSlug() == null || topic.getSlug().isEmpty()) {
            String baseSlug = topic.getTitle().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // Remove special characters
                .replaceAll("\\s+", "-")         // Replace spaces with hyphens
                .replaceAll("-+", "-")           // Replace multiple hyphens with single one
                .trim();                         // Trim spaces
            
            // Add timestamp to ensure uniqueness
            String uniqueSlug = baseSlug + "-" + System.currentTimeMillis();
            topic.setSlug(uniqueSlug);
        }
        
        // Ensure slug is unique - only check if slug is non-null
        if (topic.getSlug() != null && topicRepository.existsBySlug(topic.getSlug())) {
            // Make it unique by adding timestamp
            topic.setSlug(topic.getSlug() + "-" + System.currentTimeMillis());
        }
        
        return topicRepository.save(topic);
    }
    
    public Topic updateTopic(String id, Topic topicDetails) {
        Topic topic = getTopicById(id);
        
        topic.setTitle(topicDetails.getTitle());
        topic.setContent(topicDetails.getContent());
        topic.setSlug(topicDetails.getSlug());
        topic.setTags(topicDetails.getTags());
        topic.setUpdatedAt(LocalDateTime.now());
        
        // Ensure slug is unique (unless it's the same slug as before)
        if (!topic.getSlug().equals(topicDetails.getSlug()) && 
                topicRepository.existsBySlug(topicDetails.getSlug())) {
            throw new IllegalArgumentException("Topic with slug '" + topicDetails.getSlug() + "' already exists");
        }
        
        return topicRepository.save(topic);
    }
    
    public void deleteTopic(String id) {
        Topic topic = getTopicById(id);
        topicRepository.delete(topic);
    }
    
    public Topic incrementViewCount(String id) {
        Topic topic = getTopicById(id);
        topic.setViewCount(topic.getViewCount() + 1);
        return topicRepository.save(topic);
    }
    
    public List<Topic> getRecentTopics() {
        return topicRepository.findTop5ByOrderByLastPostAtDesc();
    }
    
    public Page<Topic> searchTopics(String searchTerm, Pageable pageable) {
        return topicRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(searchTerm, pageable);
    }
} 
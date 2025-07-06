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
import ch.wiss.forum.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final CategoryRepository categoryRepository;
    private final GamificationService gamificationService;
    
    public Page<Topic> getAllTopics(Pageable pageable) {
        return topicRepository.findAll(pageable);
    }
    
    public Page<Topic> getTopicsByCategory(String categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
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
    
    public Topic getTopicByIdOrSlug(String idOrSlug) {
        return topicRepository.findById(idOrSlug)
                .or(() -> topicRepository.findBySlug(idOrSlug))
                .orElseThrow(() -> new RuntimeException("Topic not found with ID or slug: " + idOrSlug));
    }
    
    public Topic createTopic(Topic topic, User currentUser) {
        // set creation metadata
        topic.setAuthor(currentUser);
        topic.setCreatedAt(LocalDateTime.now());
        topic.setUpdatedAt(LocalDateTime.now());
        topic.setViewCount(0);
        topic.setReplyCount(0);
        
        // generate a slug if not provided
        if (topic.getSlug() == null || topic.getSlug().isEmpty()) {
            String baseSlug = topic.getTitle().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // remove special characters
                .replaceAll("\\s+", "-")         // replace spaces with hyphens
                .replaceAll("-+", "-")           // replace multiple hyphens with single one
                .trim();                         // trim spaces
            
            // add timestamp to ensure uniqueness
            String uniqueSlug = baseSlug + "-" + System.currentTimeMillis();
            topic.setSlug(uniqueSlug);
        }
        
        // ensure slug is unique - only check if slug is non-null
        if (topic.getSlug() != null && topicRepository.existsBySlug(topic.getSlug())) {
            // make it unique by adding timestamp
            topic.setSlug(topic.getSlug() + "-" + System.currentTimeMillis());
        }
        
        Topic savedTopic = topicRepository.save(topic);
        
        // update gamification stats
        gamificationService.updateUserStatsOnTopicCreated(currentUser);
        
        return savedTopic;
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
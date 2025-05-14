package ch.wiss.forum.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import ch.wiss.forum.model.Category;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;
import ch.wiss.forum.repository.CategoryRepository;
import ch.wiss.forum.service.TopicService;

@Service
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private TopicService topicService;
    
    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    
    @Autowired
    public void setTopicService(TopicService topicService) {
        this.topicService = topicService;
    }
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByOrderAsc();
    }
    
    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }
    
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug: " + slug));
    }
    
    public Category createCategory(Category category, User currentUser) {
        // Set creation metadata
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        category.setCreatedBy(currentUser);
        
        // Generate a slug if not provided
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            String baseSlug = category.getName().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // Remove special characters
                .replaceAll("\\s+", "-")         // Replace spaces with hyphens
                .replaceAll("-+", "-")           // Replace multiple hyphens with single one
                .trim();                         // Trim spaces
            
            category.setSlug(baseSlug);
        }
        
        // Ensure slug is unique
        if (categoryRepository.existsBySlug(category.getSlug())) {
            // Make it unique by adding timestamp
            category.setSlug(category.getSlug() + "-" + System.currentTimeMillis());
        }
        
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(String id, Category categoryDetails) {
        Category category = getCategoryById(id);
        
        // Update fields
        if (categoryDetails.getName() != null) {
            category.setName(categoryDetails.getName());
        }
        
        if (categoryDetails.getDescription() != null) {
            category.setDescription(categoryDetails.getDescription());
        }
        
        if (categoryDetails.getSlug() != null) {
            // Ensure slug is unique (unless it's the same slug as before)
            if (!category.getSlug().equals(categoryDetails.getSlug()) && 
                    categoryRepository.existsBySlug(categoryDetails.getSlug())) {
                throw new RuntimeException("Category with slug '" + categoryDetails.getSlug() + "' already exists");
            }
            category.setSlug(categoryDetails.getSlug());
        }
        
        // Order is a primitive int, so we can't check for null directly
        category.setOrder(categoryDetails.getOrder());
        
        // isActive is a primitive boolean
        category.setActive(categoryDetails.isActive());
        
        category.setUpdatedAt(LocalDateTime.now());
        
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(String id) {
        Category category = getCategoryById(id);
        
        // Check if the category has any topics
        Page<Topic> topics = topicService.getTopicsByCategory(id, PageRequest.of(0, 1));
        if (topics.getTotalElements() > 0) {
            throw new RuntimeException("Cannot delete category that contains topics. Please remove all topics first.");
        }
        
        categoryRepository.delete(category);
    }
} 
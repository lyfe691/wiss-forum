package ch.wiss.forum.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import ch.wiss.forum.model.Category;
import ch.wiss.forum.model.User;
import ch.wiss.forum.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
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
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        category.setCreatedBy(currentUser);
        
        // Ensure slug is unique
        if (categoryRepository.existsBySlug(category.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + category.getSlug() + "' already exists");
        }
        
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(String id, Category categoryDetails) {
        Category category = getCategoryById(id);
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setSlug(categoryDetails.getSlug());
        category.setOrder(categoryDetails.getOrder());
        category.setActive(categoryDetails.isActive());
        category.setUpdatedAt(LocalDateTime.now());
        
        // Ensure slug is unique (unless it's the same slug as before)
        if (!category.getSlug().equals(categoryDetails.getSlug()) && 
                categoryRepository.existsBySlug(categoryDetails.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + categoryDetails.getSlug() + "' already exists");
        }
        
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(String id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
} 
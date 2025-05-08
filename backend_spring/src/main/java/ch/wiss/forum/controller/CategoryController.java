package ch.wiss.forum.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import ch.wiss.forum.model.Category;
import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.response.MessageResponse;
import ch.wiss.forum.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, maxAge = 3600)
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable String id) {
        try {
            Category category = categoryService.getCategoryById(id);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            // Check if it's a "not found" exception
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                // Try to find by slug instead
                try {
                    Category category = categoryService.getCategoryBySlug(id);
                    return ResponseEntity.ok(category);
                } catch (RuntimeException slugEx) {
                    // Return 404 if neither ID nor slug was found
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new MessageResponse("Category not found: " + id));
                }
            }
            // For other errors, return 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getCategoryBySlug(@PathVariable String slug) {
        try {
            Category category = categoryService.getCategoryBySlug(slug);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            // Return 404 if slug was not found
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Category not found with slug: " + slug));
            }
            // For other errors, return 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_TEACHER')")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        Category createdCategory = categoryService.createCategory(category, currentUser);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_TEACHER')")
    public ResponseEntity<Category> updateCategory(@PathVariable String id, @Valid @RequestBody Category category) {
        Category updatedCategory = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(updatedCategory);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
} 
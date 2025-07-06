package ch.wiss.forum.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import ch.wiss.forum.model.Category;
import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.response.MessageResponse;
import ch.wiss.forum.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    
    // get all categories
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // This method handles fetching a category by its ID or slug.
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryByIdOrSlug(@PathVariable String id) {
        try {
            Category category = categoryService.getCategoryByIdOrSlug(id);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    // get category by slug
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getCategoryBySlug(@PathVariable String slug) {
        try {
            Category category = categoryService.getCategoryBySlug(slug);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Category not found with slug: " + slug));
        }
    }
    
    // create category
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_TEACHER')")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        Category createdCategory = categoryService.createCategory(category, currentUser);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    // update category
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_TEACHER')")
    public ResponseEntity<Category> updateCategory(@PathVariable String id, @Valid @RequestBody Category category) {
        Category updatedCategory = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(updatedCategory);
    }

    // delete category
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_TEACHER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
} 
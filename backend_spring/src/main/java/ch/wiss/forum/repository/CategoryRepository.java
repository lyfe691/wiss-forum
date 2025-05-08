package ch.wiss.forum.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import ch.wiss.forum.model.Category;

public interface CategoryRepository extends MongoRepository<Category, String> {
    
    Optional<Category> findBySlug(String slug);
    
    List<Category> findAllByOrderByOrderAsc();
    
    boolean existsBySlug(String slug);
} 
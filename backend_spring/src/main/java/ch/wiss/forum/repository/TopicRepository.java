package ch.wiss.forum.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import ch.wiss.forum.model.Category;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;

public interface TopicRepository extends MongoRepository<Topic, String> {
    
    Optional<Topic> findBySlug(String slug);
    
    Page<Topic> findByCategoryOrderByCreatedAtDesc(Category category, Pageable pageable);
    
    Page<Topic> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);
    
    Page<Topic> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String searchTerm, Pageable pageable);
    
    boolean existsBySlug(String slug);
    
    List<Topic> findTop5ByOrderByLastPostAtDesc();
} 
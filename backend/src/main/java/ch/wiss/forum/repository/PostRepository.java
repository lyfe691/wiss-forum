package ch.wiss.forum.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import ch.wiss.forum.model.Post;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;

// post repository

public interface PostRepository extends MongoRepository<Post, String> {
    
    Page<Post> findByTopicOrderByCreatedAtAsc(Topic topic, Pageable pageable);
    
    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);
    
    List<Post> findByTopicAndReplyToIsNullOrderByCreatedAtAsc(Topic topic);
    
    List<Post> findByReplyTo(Post post);
    
    long countByTopic(Topic topic);
} 
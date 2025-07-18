package ch.wiss.forum.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ch.wiss.forum.model.Post;
import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;
import ch.wiss.forum.repository.PostRepository;
import ch.wiss.forum.repository.TopicRepository;
import ch.wiss.forum.security.PermissionUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
    
    private final PostRepository postRepository;
    private final TopicRepository topicRepository;
    private final TopicService topicService;
    private final GamificationService gamificationService;
    
    public Page<Post> getPostsByTopic(String topicId, Pageable pageable) {
        Topic topic = topicService.getTopicById(topicId);
        return postRepository.findByTopicOrderByCreatedAtAsc(topic, pageable);
    }
    
    public Page<Post> getPostsByTopic(Topic topic, Pageable pageable) {
        return postRepository.findByTopicOrderByCreatedAtAsc(topic, pageable);
    }
    
    public Page<Post> getPostsByUser(User user, Pageable pageable) {
        return postRepository.findByAuthorOrderByCreatedAtDesc(user, pageable);
    }
    
    public Post getPostById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }
    
    @Transactional
    public Post createPost(Post post, User currentUser) {
        String topicId = post.getTopic().getId();
        Topic topic = topicService.getTopicById(topicId);
        
        // set metadata
        post.setAuthor(currentUser);
        post.setTopic(topic);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        post.setEdited(false);
        
        // save the post
        Post savedPost = postRepository.save(post);
        
        // update the topic's reply count and last post info
        topic.setReplyCount(topic.getReplyCount() + 1);
        topic.setLastPost(savedPost);
        topic.setLastPostAt(LocalDateTime.now());
        topicRepository.save(topic);
        
        // Update gamification stats
        gamificationService.updateUserStatsOnPostCreated(currentUser);
        
        return savedPost;
    }
    
    @Transactional
    public Post updatePost(String id, Post postDetails, User currentUser) {
        Post post = getPostById(id);
        
        // check if the user is authorized to update the post
        if (!PermissionUtils.canModifyContent(currentUser, post.getAuthor().getId())) {
            throw new RuntimeException("Not authorized to update this post");
        }
        
        post.setContent(postDetails.getContent());
        post.setUpdatedAt(LocalDateTime.now());
        post.setEdited(true);
        post.setLastEditedAt(LocalDateTime.now());
        
        return postRepository.save(post);
    }
    
    @Transactional
    public void deletePost(String id, User currentUser) {
        Post post = getPostById(id);
        
        // check if the user is authorized to delete the post
        if (!PermissionUtils.canModifyContent(currentUser, post.getAuthor().getId())) {
            throw new RuntimeException("Not authorized to delete this post");
        }
        
        // update topic's reply count
        Topic topic = post.getTopic();
        topic.setReplyCount(topic.getReplyCount() - 1);
        
        // if this was the last post, update the last post info
        if (topic.getLastPost() != null && topic.getLastPost().getId().equals(post.getId())) {
            // find the new latest post for this topic
            List<Post> topicPosts = postRepository.findByTopicAndReplyToIsNullOrderByCreatedAtAsc(topic);
            if (!topicPosts.isEmpty()) {
                Post latestPost = topicPosts.get(topicPosts.size() - 1);
                if (!latestPost.getId().equals(post.getId())) {
                    topic.setLastPost(latestPost);
                    topic.setLastPostAt(latestPost.getCreatedAt());
                } else {
                    topic.setLastPost(null);
                    topic.setLastPostAt(null);
                }
            } else {
                topic.setLastPost(null);
                topic.setLastPostAt(null);
            }
        }
        
        topicRepository.save(topic);
        
        // delete replies to this post first
        List<Post> replies = postRepository.findByReplyTo(post);
        postRepository.deleteAll(replies);
        
        // delete the post
        postRepository.delete(post);
    }
    
    public Post likePost(String id, User currentUser) {
        Post post = getPostById(id);
        
        if (!post.getLikes().contains(currentUser.getId())) {
            post.getLikes().add(currentUser.getId());
            Post savedPost = postRepository.save(post);
            
            // Update gamification stats for the post author (not the current user who liked it)
            gamificationService.updateUserStatsOnLikeReceived(post.getAuthor());
            
            return savedPost;
        }
        
        return post;
    }
    
    public Post unlikePost(String id, User currentUser) {
        Post post = getPostById(id);
        
        post.getLikes().remove(currentUser.getId());
        Post savedPost = postRepository.save(post);
        
        // Update gamification stats for the post author (decrease their score)
        gamificationService.updateUserStatsOnLikeRemoved(post.getAuthor());
        
        return savedPost;
    }
    
    public long getPostCountByTopic(Topic topic) {
        return postRepository.countByTopic(topic);
    }
    

} 
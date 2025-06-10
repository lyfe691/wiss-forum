package ch.wiss.forum.service;

import ch.wiss.forum.model.User;
import ch.wiss.forum.model.Post;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {
    
    private final UserRepository userRepository;
    
    // score values
    private static final int TOPIC_CREATED_POINTS = 10;
    private static final int POST_CREATED_POINTS = 5;
    private static final int LIKE_RECEIVED_POINTS = 2;

    private static final int DAILY_STREAK_BONUS = 3;
    
    // level thresholds
    private static final int[] LEVEL_THRESHOLDS = {
        0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000, 4000, 5500, 7500, 10000
    };
    
    // achievement definitions
    private static final Map<String, String> ACHIEVEMENTS = Map.of(
        "FIRST_POST", "Made your first post",
        "FIRST_TOPIC", "Created your first topic",
        "POPULAR_POSTER", "Received 50 likes total",
        "DISCUSSION_STARTER", "Created 10 topics",
        "ACTIVE_PARTICIPANT", "Made 100 posts",
        "STREAK_MASTER", "Maintained a 7-day activity streak",
        "KNOWLEDGE_SHARER", "Created 5 topics in different categories",
        "COMMUNITY_FAVORITE", "Received 100 likes total"
    );
    
    @Transactional
    public void updateUserStatsOnTopicCreated(User user) {
        try {
            User dbUser = userRepository.findById(user.getId()).orElse(user);
            
            dbUser.setTopicsCreated(dbUser.getTopicsCreated() + 1);
            dbUser.setTotalScore(dbUser.getTotalScore() + TOPIC_CREATED_POINTS);
            
            updateActivity(dbUser);
            checkAchievements(dbUser);
            updateLevel(dbUser);
            
            userRepository.save(dbUser);
            log.info("Updated user {} stats for topic creation", user.getUsername());
        } catch (Exception e) {
            log.error("Error updating user stats for topic creation: ", e);
        }
    }
    
    @Transactional
    public void updateUserStatsOnPostCreated(User user) {
        try {
            User dbUser = userRepository.findById(user.getId()).orElse(user);
            
            dbUser.setPostsCreated(dbUser.getPostsCreated() + 1);
            dbUser.setTotalScore(dbUser.getTotalScore() + POST_CREATED_POINTS);
            
            updateActivity(dbUser);
            checkAchievements(dbUser);
            updateLevel(dbUser);
            
            userRepository.save(dbUser);
            log.info("Updated user {} stats for post creation", user.getUsername());
        } catch (Exception e) {
            log.error("Error updating user stats for post creation: ", e);
        }
    }
    
    @Transactional
    public void updateUserStatsOnLikeReceived(User user) {
        try {
            User dbUser = userRepository.findById(user.getId()).orElse(user);
            
            dbUser.setLikesReceived(dbUser.getLikesReceived() + 1);
            dbUser.setTotalScore(dbUser.getTotalScore() + LIKE_RECEIVED_POINTS);
            
            checkAchievements(dbUser);
            updateLevel(dbUser);
            
            userRepository.save(dbUser);
            log.info("Updated user {} stats for like received", user.getUsername());
        } catch (Exception e) {
            log.error("Error updating user stats for like received: ", e);
        }
    }
    
    @Transactional
    public void updateUserStatsOnLikeRemoved(User user) {
        try {
            User dbUser = userRepository.findById(user.getId()).orElse(user);
            
            dbUser.setLikesReceived(Math.max(0, dbUser.getLikesReceived() - 1));
            dbUser.setTotalScore(Math.max(0, dbUser.getTotalScore() - LIKE_RECEIVED_POINTS));
            
            updateLevel(dbUser);
            
            userRepository.save(dbUser);
            log.info("Updated user {} stats for like removed", user.getUsername());
        } catch (Exception e) {
            log.error("Error updating user stats for like removed: ", e);
        }
    }
    

    
    private void updateActivity(User user) {
        LocalDateTime today = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        LocalDateTime lastActivity = user.getLastActivityDate();
        
        if (lastActivity == null) {
            // first activity
            user.setCurrentStreak(1);
            user.setLongestStreak(1);
            user.setLastActivityDate(today);
            user.setTotalScore(user.getTotalScore() + DAILY_STREAK_BONUS);
        } else {
            LocalDateTime lastActivityDay = lastActivity.truncatedTo(ChronoUnit.DAYS);
            long daysBetween = ChronoUnit.DAYS.between(lastActivityDay, today);
            
            if (daysBetween == 0) {
                // same day, no streak change
                return;
            } else if (daysBetween == 1) {
                // consecutive day, extend streak
                user.setCurrentStreak(user.getCurrentStreak() + 1);
                user.setLongestStreak(Math.max(user.getLongestStreak(), user.getCurrentStreak()));
                user.setTotalScore(user.getTotalScore() + DAILY_STREAK_BONUS);
            } else {
                // streak broken, reset
                user.setCurrentStreak(1);
                user.setTotalScore(user.getTotalScore() + DAILY_STREAK_BONUS);
            }
            
            user.setLastActivityDate(today);
        }
    }
    
    private void checkAchievements(User user) {
        List<String> achievements = user.getAchievements();
        if (achievements == null) {
            achievements = new ArrayList<>();
            user.setAchievements(achievements);
        }
        
        // first post
        if (user.getPostsCreated() >= 1 && !achievements.contains("FIRST_POST")) {
            achievements.add("FIRST_POST");
        }
        
        // first topic
        if (user.getTopicsCreated() >= 1 && !achievements.contains("FIRST_TOPIC")) {
            achievements.add("FIRST_TOPIC");
        }
        

        
        // popular poster
        if (user.getLikesReceived() >= 50 && !achievements.contains("POPULAR_POSTER")) {
            achievements.add("POPULAR_POSTER");
        }
        
        // discussion starter
        if (user.getTopicsCreated() >= 10 && !achievements.contains("DISCUSSION_STARTER")) {
            achievements.add("DISCUSSION_STARTER");
        }
        
        // active participant
        if (user.getPostsCreated() >= 50 && !achievements.contains("ACTIVE_PARTICIPANT")) {
            achievements.add("ACTIVE_PARTICIPANT");
        }
        
        // streak master
        if (user.getLongestStreak() >= 7 && !achievements.contains("STREAK_MASTER")) {
            achievements.add("STREAK_MASTER");
        }
        
        // knowledge sharer
        if (user.getTopicsCreated() >= 25 && !achievements.contains("KNOWLEDGE_SHARER")) {
            achievements.add("KNOWLEDGE_SHARER");
        }
        
        // community favorite
        if (user.getLikesReceived() >= 100 && !achievements.contains("COMMUNITY_FAVORITE")) {
            achievements.add("COMMUNITY_FAVORITE");
        }
        

    }
    
    private void updateLevel(User user) {
        int currentLevel = user.getLevel();
        int newLevel = calculateLevel(user.getTotalScore());
        
        if (newLevel > currentLevel) {
            user.setLevel(newLevel);
            
            // update badges
            List<String> badges = user.getBadges();
            if (badges == null) {
                badges = new ArrayList<>();
                user.setBadges(badges);
            }
            
            String levelBadge = "LEVEL_" + newLevel;
            if (!badges.contains(levelBadge)) {
                badges.add(levelBadge);
            }
            
            log.info("User {} leveled up to level {}", user.getUsername(), newLevel);
        }
    }
    
    private int calculateLevel(int totalScore) {
        for (int i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (totalScore >= LEVEL_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    }
    
    public List<Map<String, Object>> getEnhancedLeaderboard() {
        List<User> users = userRepository.findTop50ByOrderByTotalScoreDesc();
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        
        int rank = 1;
        for (User user : users) {
            Map<String, Object> userStats = new HashMap<>();
            userStats.put("rank", rank++);
            userStats.put("username", user.getUsername());
            userStats.put("displayName", user.getDisplayName());
            userStats.put("avatar", user.getAvatar());
            userStats.put("role", user.getRole());
            userStats.put("totalScore", user.getTotalScore());
            userStats.put("level", user.getLevel());
            userStats.put("topicsCreated", user.getTopicsCreated());
            userStats.put("postsCreated", user.getPostsCreated());
            userStats.put("likesReceived", user.getLikesReceived());

            userStats.put("currentStreak", user.getCurrentStreak());
            userStats.put("achievements", user.getAchievements() != null ? user.getAchievements().size() : 0);
            
            leaderboard.add(userStats);
        }
        
        return leaderboard;
    }
    
    public Map<String, Object> getUserGamificationStats(User user) {
        User dbUser = userRepository.findById(user.getId()).orElse(user);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalScore", dbUser.getTotalScore());
        stats.put("level", dbUser.getLevel());
        stats.put("topicsCreated", dbUser.getTopicsCreated());
        stats.put("postsCreated", dbUser.getPostsCreated());
        stats.put("likesReceived", dbUser.getLikesReceived());

        stats.put("currentStreak", dbUser.getCurrentStreak());
        stats.put("longestStreak", dbUser.getLongestStreak());
        stats.put("badges", dbUser.getBadges() != null ? dbUser.getBadges() : new ArrayList<>());
        stats.put("achievements", dbUser.getAchievements() != null ? dbUser.getAchievements() : new ArrayList<>());
        
        // Calculate level progress
        int currentLevel = dbUser.getLevel();
        int currentScore = dbUser.getTotalScore();
        
        if (currentLevel < LEVEL_THRESHOLDS.length) {
            int currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
            int nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel];
            
            int scoreInCurrentLevel = currentScore - currentLevelThreshold;
            int scoreNeededForLevel = nextLevelThreshold - currentLevelThreshold;
            
            double progress = (double) scoreInCurrentLevel / scoreNeededForLevel;
            stats.put("levelProgress", Math.min(1.0, Math.max(0.0, progress)));
            stats.put("pointsToNextLevel", nextLevelThreshold - currentScore);
        } else {
            stats.put("levelProgress", 1.0);
            stats.put("pointsToNextLevel", 0);
        }
        
        return stats;
    }
    
    @Transactional
    public void updateAllUserStreaks() {
        List<User> users = userRepository.findAll();
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1).truncatedTo(ChronoUnit.DAYS);
        
        for (User user : users) {
            if (user.getLastActivityDate() != null) {
                LocalDateTime lastActivity = user.getLastActivityDate().truncatedTo(ChronoUnit.DAYS);
                long daysSinceActivity = ChronoUnit.DAYS.between(lastActivity, LocalDateTime.now().truncatedTo(ChronoUnit.DAYS));
                
                if (daysSinceActivity > 1) {
                    // reset streak if no activity for more than 1 day
                    user.setCurrentStreak(0);
                    userRepository.save(user);
                }
            }
        }
        
        log.info("Updated streaks for all users");
    }
} 
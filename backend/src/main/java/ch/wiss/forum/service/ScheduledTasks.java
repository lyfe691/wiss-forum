package ch.wiss.forum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {
    
    private final GamificationService gamificationService;
    
    // update user streaks daily at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void updateUserStreaks() {
        log.info("Starting daily user streak update...");
        try {
            gamificationService.updateAllUserStreaks();
            log.info("Daily user streak update completed successfully");
        } catch (Exception e) {
            log.error("Error updating user streaks: ", e);
        }
    }
} 
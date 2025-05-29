package ch.wiss.forum.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import ch.wiss.forum.model.PasswordResetToken;
import ch.wiss.forum.model.User;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);
} 
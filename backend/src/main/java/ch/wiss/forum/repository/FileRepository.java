package ch.wiss.forum.repository;

import ch.wiss.forum.model.FileEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends MongoRepository<FileEntity, String> {
    Optional<FileEntity> findByFilename(String filename);
    List<FileEntity> findByUploadedBy(String uploadedBy);
    List<FileEntity> findByContentTypeStartingWith(String contentTypePrefix);
} 
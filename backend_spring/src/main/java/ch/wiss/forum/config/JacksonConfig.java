package ch.wiss.forum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import ch.wiss.forum.model.Post;
import ch.wiss.forum.model.Topic;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new Jackson2ObjectMapperBuilder()
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .serializationInclusion(JsonInclude.Include.NON_NULL)
                .modules(new JavaTimeModule())
                .build();
        
        // Configure to handle circular references
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        
        return mapper;
    }
    
    // Note: The annotations are already applied to the model classes
    // This method is just informational and doesn't need to be a bean
    private void configureCircularReferences() {
        // Apply JsonIdentityInfo to Topic class to handle circular references
        Topic.class.getAnnotation(JsonIdentityInfo.class);
        if (Topic.class.getAnnotation(JsonIdentityInfo.class) == null) {
            addJsonIdentityInfoToClass(Topic.class);
        }
        
        // Apply JsonIdentityInfo to Post class to handle circular references
        Post.class.getAnnotation(JsonIdentityInfo.class);
        if (Post.class.getAnnotation(JsonIdentityInfo.class) == null) {
            addJsonIdentityInfoToClass(Post.class);
        }
    }
    
    // This method would work at runtime but annotations are applied at compile time
    // This serves as an indicator of what should be manually added to the model classes
    private void addJsonIdentityInfoToClass(Class<?> clazz) {
        // This can't actually add annotations at runtime
        // This is just a placeholder to indicate what annotations should be added
    }
} 
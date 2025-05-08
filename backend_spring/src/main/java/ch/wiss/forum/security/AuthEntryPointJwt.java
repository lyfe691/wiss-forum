package ch.wiss.forum.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
        
        log.error("Unauthorized error: {}", authException.getMessage());
        log.debug("Request URI: {}", request.getRequestURI());
        
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        final String errorMessage = "You need to be logged in to access this resource";
        
        objectMapper.writeValue(response.getOutputStream(), 
                new ErrorResponse(HttpServletResponse.SC_UNAUTHORIZED, errorMessage, 
                                 request.getRequestURI(), System.currentTimeMillis()));
    }
    
    // Simple error response class
    private static class ErrorResponse {
        public int status;
        public String message;
        public String path;
        public long timestamp;
        
        public ErrorResponse(int status, String message, String path, long timestamp) {
            this.status = status;
            this.message = message;
            this.path = path;
            this.timestamp = timestamp;
        }
    }
} 
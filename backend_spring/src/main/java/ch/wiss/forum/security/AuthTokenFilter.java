package ch.wiss.forum.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import ch.wiss.forum.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AuthTokenFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Log the request URI for debugging
            String requestUri = request.getRequestURI();
            log.debug("Processing request: {}", requestUri);
            
            // For public endpoints, don't try to authenticate
            if (isPublicEndpoint(requestUri)) {
                log.debug("Public endpoint detected, skipping authentication: {}", requestUri);
                filterChain.doFilter(request, response);
                return;
            }
            
            String jwt = parseJwt(request);
            log.debug("JWT token found: {}", jwt != null);
            
            if (jwt != null) {
                try {
                    if (jwtUtils.validateJwtToken(jwt)) {
                        String username = jwtUtils.getUsernameFromJwtToken(jwt);
                        log.debug("JWT token is valid for user: {}", username);
                        
                        try {
                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            log.debug("User authenticated successfully: {}", username);
                        } catch (UsernameNotFoundException e) {
                            log.error("User not found for token: {}", e.getMessage());
                        }
                    } else {
                        log.debug("JWT token validation failed");
                    }
                } catch (Exception e) {
                    log.error("JWT token processing error: {}", e.getMessage());
                }
            } else {
                log.debug("No JWT token found in request");
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
    
    private boolean isPublicEndpoint(String uri) {
        return uri.contains("/api/auth/") || 
               uri.contains("/api/users/public") || 
               uri.contains("/api/categories") || 
               uri.contains("/api/topics") || 
               uri.contains("/api/posts");
    }
} 
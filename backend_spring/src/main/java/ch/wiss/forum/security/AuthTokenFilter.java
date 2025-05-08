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
            if (isPublicEndpoint(requestUri, request)) {
                log.debug("Public endpoint detected, skipping authentication: {}", requestUri);
                filterChain.doFilter(request, response);
                return;
            }
            
            // Handle special case for /auth/refresh-token and /auth/me
            boolean isAuthMeEndpoint = requestUri.contains("/api/auth/me");
            boolean isRefreshEndpoint = requestUri.contains("/api/auth/refresh-token");
            
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
                            if (isAuthMeEndpoint || isRefreshEndpoint) {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                response.getWriter().write("{\"message\":\"User not found\"}");
                                response.getWriter().flush();
                                return;
                            }
                        }
                    } else {
                        log.debug("JWT token validation failed");
                        if (isAuthMeEndpoint || isRefreshEndpoint) {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"message\":\"Token validation failed\"}");
                            response.getWriter().flush();
                            return;
                        }
                    }
                } catch (Exception e) {
                    log.error("JWT token processing error: {}", e.getMessage());
                    if (isAuthMeEndpoint || isRefreshEndpoint) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"message\":\"Token processing error\"}");
                        response.getWriter().flush();
                        return;
                    }
                }
            } else {
                log.debug("No JWT token found in request");
                if (isAuthMeEndpoint || isRefreshEndpoint) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"No authentication token found\"}");
                    response.getWriter().flush();
                    return;
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String parseJwt(HttpServletRequest request) {
        // Try to get from Authorization header first
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        // If no Authorization header, check for token parameter
        String tokenParam = request.getParameter("token");
        if (StringUtils.hasText(tokenParam)) {
            return tokenParam;
        }
        
        return null;
    }
    
    private boolean isPublicEndpoint(String uri, HttpServletRequest request) {
        String method = request.getMethod();
        
        // Public authentication endpoints
        if (uri.contains("/api/auth/login") || uri.contains("/api/auth/register")) {
            return true;
        }
        
        // Public user endpoints
        if (uri.contains("/api/users/public")) {
            return true;
        }
        
        // Special case for topics: only GET requests should be public
        if (uri.contains("/api/topics")) {
            return "GET".equals(method);
        }
        
        // Special case for posts: only GET requests should be public  
        if (uri.contains("/api/posts")) {
            return "GET".equals(method);
        }
               
        // Special case for categories: only GET requests should be public
        if (uri.contains("/api/categories")) {
            // Only GET requests to categories are public
            return "GET".equals(method);
        }
        
        return false;
    }
} 
package com.bff.filter;

import com.bff.client.AuthClient;
import com.bff.dto.request.AzureUserRequest;
import com.bff.dto.request.SessionRegistrationRequest;
import com.bff.dto.response.SessionHistoryResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class SessionRegistrationFilter extends OncePerRequestFilter {

    private final AuthClient authClient;

    public SessionRegistrationFilter(AuthClient authClient) {
        this.authClient = authClient;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Solo procesar si el usuario está autenticado con JWT (Azure AD)
        if (authentication != null && authentication instanceof JwtAuthenticationToken && authentication.isAuthenticated()) {
            try {
                String email = getEmailFromAuthentication(authentication);
                String name = getNameFromAuthentication(authentication);
                
                if (email != null && !email.isBlank()) {
                    // Autocrear usuario si no existe
                    try {
                        String role = getRoleFromAuthentication(authentication);
                        AzureUserRequest azureUserRequest = new AzureUserRequest();
                        azureUserRequest.setEmail(email);
                        azureUserRequest.setName(name != null ? name : email.split("@")[0]);
                        azureUserRequest.setRole(role != null ? role : "USER");
                        authClient.registerAzureUser(azureUserRequest);
                    } catch (Exception e) {
                        // Ignorar si el usuario ya existe
                        System.err.println("User may already exist: " + e.getMessage());
                    }
                    
                    // Verificar si ya existe una sesión actual para este email
                    List<SessionHistoryResponse> sessions = authClient.getUserSessions();
                    boolean hasCurrentSession = sessions.stream()
                            .anyMatch(session -> Boolean.TRUE.equals(session.current()));
                    
                    // Si no tiene sesión actual, registrar una nueva
                    if (!hasCurrentSession) {
                        String userAgent = request.getHeader("User-Agent");
                        SessionRegistrationRequest sessionRequest = new SessionRegistrationRequest();
                        sessionRequest.setDevice(extractDevice(userAgent));
                        sessionRequest.setBrowser(extractBrowser(userAgent));
                        sessionRequest.setLocation("Unknown");
                        sessionRequest.setIpAddress("Unknown");
                        
                        authClient.registerSession(sessionRequest);
                    }
                }
            } catch (Exception e) {
                // No fallar el request si el registro de sesión falla
                System.err.println("Failed to register session: " + e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private String getEmailFromAuthentication(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String email = jwtAuth.getToken().getClaimAsString("email");
            if (email == null || email.isBlank()) {
                email = jwtAuth.getToken().getClaimAsString("unique_name");
            }
            if (email == null || email.isBlank()) {
                email = jwtAuth.getToken().getClaimAsString("preferred_username");
            }
            return email;
        }
        return null;
    }

    private String getNameFromAuthentication(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String name = jwtAuth.getToken().getClaimAsString("name");
            if (name == null || name.isBlank()) {
                name = jwtAuth.getToken().getClaimAsString("given_name");
            }
            return name;
        }
        return null;
    }

    private String getRoleFromAuthentication(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            List<String> roles = jwtAuth.getToken().getClaimAsStringList("roles");
            if (roles != null && !roles.isEmpty()) {
                // Mapear roles de Azure a roles del sistema
                for (String role : roles) {
                    if ("Admin".equalsIgnoreCase(role)) return "ADMIN";
                    if ("ONG".equalsIgnoreCase(role)) return "COORDINATOR";
                    if ("User".equalsIgnoreCase(role)) return "USER";
                }
            }
            return "USER";
        }
        return null;
    }

    private String extractDevice(String userAgent) {
        if (userAgent == null) return "Unknown";
        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
            return "Mobile";
        } else if (userAgent.contains("tablet") || userAgent.contains("ipad")) {
            return "Tablet";
        } else {
            return "Desktop";
        }
    }

    private String extractBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";
        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("chrome")) return "Chrome";
        else if (userAgent.contains("firefox")) return "Firefox";
        else if (userAgent.contains("safari") && !userAgent.contains("chrome")) return "Safari";
        else if (userAgent.contains("edge")) return "Edge";
        else if (userAgent.contains("opera")) return "Opera";
        else return "Unknown";
    }
}
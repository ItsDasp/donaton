package com.bff.service;

import com.bff.client.AuthClient;
import com.bff.dto.request.AdminUserRequest;
import com.bff.dto.request.AuthRequest;
import com.bff.dto.request.ProfileUpdateRequest;
import com.bff.dto.request.RefreshRequest;
import com.bff.dto.request.RegisterRequest;
import com.bff.dto.request.RoleUpdateRequest;
import com.bff.dto.request.SessionRegistrationRequest;
import com.bff.dto.response.AuthResponse;
import com.bff.dto.response.UserSummaryResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private final AuthClient authClient;

    public AuthService(AuthClient authClient) {
        this.authClient = authClient;
    }

    public AuthResponse login(AuthRequest request) {
        AuthResponse authResponse = authClient.login(request);
        
        // Registrar sesión automáticamente después del login exitoso
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest httpRequest = attributes.getRequest();
                String userAgent = httpRequest.getHeader("User-Agent");
                
                SessionRegistrationRequest sessionRequest = new SessionRegistrationRequest();
                sessionRequest.setDevice(extractDevice(userAgent));
                sessionRequest.setBrowser(extractBrowser(userAgent));
                sessionRequest.setLocation("Unknown");
                sessionRequest.setIpAddress("Unknown");
                
                authClient.registerSession(sessionRequest);
            }
        } catch (Exception e) {
            // No fallar el login si el registro de sesión falla
            System.err.println("Failed to register session: " + e.getMessage());
        }
        
        return authResponse;
    }

    public AuthResponse loginTraditional(AuthRequest request) {
        AuthResponse authResponse = authClient.login(request);
        
        // Registrar sesión automáticamente después del login exitoso
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest httpRequest = attributes.getRequest();
                String userAgent = httpRequest.getHeader("User-Agent");
                
                SessionRegistrationRequest sessionRequest = new SessionRegistrationRequest();
                sessionRequest.setDevice(extractDevice(userAgent));
                sessionRequest.setBrowser(extractBrowser(userAgent));
                sessionRequest.setLocation("Unknown");
                sessionRequest.setIpAddress("Unknown");
                
                authClient.registerSession(sessionRequest);
            }
        } catch (Exception e) {
            // No fallar el login si el registro de sesión falla
            System.err.println("Failed to register session: " + e.getMessage());
        }
        
        return authResponse;
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

    public UserSummaryResponse register(RegisterRequest request) {
        return authClient.register(request);
    }

    public AuthResponse refresh(RefreshRequest request) {
        return authClient.refresh(request);
    }

    public List<UserSummaryResponse> listUsers() {
        return authClient.listUsers();
    }

    public UserSummaryResponse createUser(AdminUserRequest request) {
        return authClient.createUser(request);
    }

    public UserSummaryResponse updateRole(Long id, RoleUpdateRequest request) {
        return authClient.updateRole(id, request);
    }

    public void deleteUser(Long id) {
        authClient.deleteUser(id);
    }

    public List<com.bff.dto.response.SessionHistoryResponse> getUserSessions() {
        return authClient.getUserSessions();
    }

    public UserSummaryResponse updateProfile(String name) {
        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setName(name);
        return authClient.updateProfile(request);
    }

    public UserSummaryResponse updatePassword(String password) {
        com.bff.dto.request.PasswordUpdateRequest request = new com.bff.dto.request.PasswordUpdateRequest();
        request.setPassword(password);
        return authClient.updatePassword(request);
    }
}
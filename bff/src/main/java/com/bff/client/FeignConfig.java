package com.bff.client;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignConfig implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Propagar desde JWT si está disponible (modo Azure)
        if (authentication != null && authentication.getCredentials() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getCredentials();

            // Extract email from JWT claims
            String email = jwt.getClaimAsString("email");
            if (email == null || email.isBlank()) {
                email = jwt.getClaimAsString("unique_name");
            }
            if (email == null || email.isBlank()) {
                email = jwt.getClaimAsString("preferred_username");
            }

            // Extract roles from JWT claims
            java.util.List<String> roles = jwt.getClaimAsStringList("roles");
            String role = null;
            if (roles != null && !roles.isEmpty()) {
                role = roles.get(0).toUpperCase(); // Normalize to uppercase for Auth Service
            }

            if (email != null && !email.isBlank()) {
                template.header("X-User-Email", email);
            }

            if (role != null && !role.isBlank()) {
                template.header("X-User-Role", role);
            }

            // Forward the Authorization header (Bearer token) to downstream services
            template.header("Authorization", "Bearer " + jwt.getTokenValue());
            return; // No propagar headers del request en modo Azure
        }

        // Propagar headers X-User-* del request actual (modo desarrollo)
        // Esto permite que los headers agregados por el Gateway lleguen al Auth Service
        ServletRequestAttributes attributes =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();

            String email = request.getHeader("X-User-Email");
            String role = request.getHeader("X-User-Role");
            String authHeader = request.getHeader("Authorization");

            if (email != null && !email.isBlank()) {
                template.header("X-User-Email", email);
            }
            if (role != null && !role.isBlank()) {
                template.header("X-User-Role", role);
            }
            if (authHeader != null && !authHeader.isBlank()) {
                template.header("Authorization", authHeader);
            }
        }
    }
}

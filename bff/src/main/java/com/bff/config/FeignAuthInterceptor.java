package com.bff.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    private static final Logger log = LoggerFactory.getLogger(FeignAuthInterceptor.class);

    public FeignAuthInterceptor() {
    }

    @Override
    public void apply(RequestTemplate template) {
        String path = template.url();
        if (path != null && (path.startsWith("/auth/login")
                || path.startsWith("/auth/register")
                || path.startsWith("/auth/refresh"))) {
            log.debug("[FEIGN] Ruta pública - Sin headers de propagación: {}", path);
            return;
        }

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes == null ? null : attributes.getRequest();

        boolean hasEmailHeader = request != null
            && copyHeader(request, template, "X-User-Email");
        boolean hasRoleHeader = request != null
            && copyHeader(request, template, "X-User-Role");
        if (request != null) {
            copyHeader(request, template, "Authorization");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            log.debug("[FEIGN] Sin autenticación en SecurityContext");
            return;
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            if (!hasEmailHeader) {
                String email = extractEmail(jwtAuth);
                if (email != null) {
                    template.header("X-User-Email", email);
                    log.debug("[FEIGN] Propagando X-User-Email: {} a {}", email, path);
                }
            }

            if (!hasRoleHeader) {
                String role = extractRoleFromAuthorities(authentication);
                if (role != null) {
                    template.header("X-User-Role", role);
                    log.debug("[FEIGN] Propagando X-User-Role: {} a {}", role, path);
                }
            }
        }
    }

    private String extractEmail(JwtAuthenticationToken authentication) {
        String[] emailClaims = {"preferred_username", "email", "unique_name"};
        for (String claim : emailClaims) {
            String value = authentication.getToken().getClaimAsString(claim);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private boolean copyHeader(HttpServletRequest request, RequestTemplate template, String name) {
        String value = request.getHeader(name);
        if (value != null && !value.isBlank()) {
            template.header(name, value);
            return true;
        }
        return false;
    }

    private String extractRoleFromAuthorities(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .map(authority -> authority.getAuthority())
                .filter(auth -> auth != null && !auth.isBlank())
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> auth.substring(5))
                .filter(role -> !role.isBlank())
                .findFirst()
                .orElse(null);
    }
}

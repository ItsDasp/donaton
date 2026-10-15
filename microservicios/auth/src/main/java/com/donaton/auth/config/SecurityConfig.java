package com.donaton.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/login", "/register", "/refresh").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register", "/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/auth/profile").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/users").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/users").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/auth/users/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/auth/users/**").permitAll()
                .requestMatchers("/users/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())))
                .addFilterBefore(gatewayAuthFilter(), org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri("https://login.microsoftonline.com/6109d4ab-3dff-41c5-a7d7-a2cdc4fa7abd/discovery/v2.0/keys")
                .build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    public OncePerRequestFilter gatewayAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {
                String path = request.getRequestURI();
                String method = request.getMethod();

                String authHeader = request.getHeader("Authorization");
                String email = request.getHeader("X-User-Email");
                String role = request.getHeader("X-User-Role");

                if ("OPTIONS".equalsIgnoreCase(method) || isPublicAuthPath(path)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // Allow gateway auth without Bearer token if X-User-Email is present
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    if (email != null && !email.isBlank()) {
                        // Gateway auth without Bearer token
                        var authorities = role == null || role.isBlank()
                                ? java.util.List.<org.springframework.security.core.authority.SimpleGrantedAuthority>of()
                                : java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.trim()));

                        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(email, null, authorities)
                        );
                    }
                    filterChain.doFilter(request, response);
                    return;
                }

                filterChain.doFilter(request, response);
            }

            private boolean isPublicAuthPath(String path) {
                if (path == null || path.isBlank()) return false;
                String normalized = path.endsWith("/") && path.length() > 1
                        ? path.substring(0, path.length() - 1)
                        : path;

                return normalized.equals("/login")
                        || normalized.equals("/register")
                        || normalized.equals("/refresh")
                        || normalized.equals("/auth/login")
                        || normalized.equals("/auth/register")
                        || normalized.equals("/auth/refresh")
                        || normalized.equals("/auth/profile");
            }
        };
    }
}
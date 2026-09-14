package com.gateway.config;

import com.gateway.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Configuration 
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${AZURE_TENANT_ID:common}")
    private String tenantId;

    @Value("${AZURE_CLIENT_ID:test-client-id}")
    private String clientId;

    @Bean
    public SecurityWebFilterChain filterChain(ServerHttpSecurity http,
                                              JwtAuthenticationFilter jwtAuthenticationFilter) {
        boolean isAzureConfigured = !"common".equals(tenantId) && !"test-client-id".equals(clientId);

        System.out.println("Gateway Security Configuration - isAzureConfigured: " + isAzureConfigured);
        System.out.println("  Tenant ID: " + tenantId);
        System.out.println("  Client ID: " + clientId);

        http
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .addFilterBefore(loggingFilter(), SecurityWebFiltersOrder.FIRST);

        if (isAzureConfigured) {
            System.out.println("Using Azure token forwarding (BFF validates JWT)");
            http.authorizeExchange(authz -> authz
                    .pathMatchers("/api/v1/auth/login", "/api/v1/auth/login/traditional", "/api/v1/auth/register", "/api/v1/auth/refresh", "/api/v1/auth/profile").permitAll()
                    .pathMatchers("/api/v1/auth/users", "/api/v1/auth/sessions").permitAll()
                    .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(Customizer.withDefaults())
                    )
                .addFilterAfter(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION);
        } else {
            System.out.println("Using development authentication");
            http.authorizeExchange(authz -> authz
                    .pathMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                    .pathMatchers(
                            "/auth/**",
                            "/api/auth/**",
                            "/api/v1/auth/**",
                            "/health",
                            "/actuator/health",
                            "/swagger-ui/**",
                            "/v3/api-docs/**"
                    ).permitAll()
                    .anyExchange().authenticated()
                )
                .addFilterBefore(devAuthFilter(), SecurityWebFiltersOrder.AUTHENTICATION);
        }

        http.securityContextRepository(NoOpServerSecurityContextRepository.getInstance());
        return http.build();
    }

    @Bean
    public org.springframework.web.server.WebFilter loggingFilter() {
        return (exchange, chain) -> {
            System.out.println("Gateway Request: " + exchange.getRequest().getMethod() + " " + exchange.getRequest().getPath());
            var headers = exchange.getRequest().getHeaders();
            var safeHeaders = new java.util.LinkedHashMap<String, String>();
            headers.forEach((key, values) -> {
                if (key.equalsIgnoreCase("Authorization") || key.equalsIgnoreCase("Cookie")) {
                    safeHeaders.put(key, "[REDACTED]");
                } else {
                    safeHeaders.put(key, String.join(", ", values));
                }
            });
            System.out.println("  Headers: " + safeHeaders);
            return chain.filter(exchange);
        };
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    private org.springframework.web.server.WebFilter devAuthFilter() {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().toString();
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

            System.out.println("DevAuthFilter - Path: " + path + ", AuthHeader: " + (authHeader != null ? "present" : "missing"));

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String email = exchange.getRequest().getHeaders().getFirst("X-User-Email");
                String role = exchange.getRequest().getHeaders().getFirst("X-User-Role");

                System.out.println("DevAuthFilter - Email: " + email + ", Role: " + role);

                var authorities = role == null || role.isBlank()
                        ? java.util.Collections.<org.springframework.security.core.GrantedAuthority>emptyList()
                        : java.util.Collections.singletonList(
                            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.trim())
                        );

                var authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        email != null ? email : "dev-user",
                        null,
                        authorities
                );

                return chain.filter(exchange).contextWrite(
                    org.springframework.security.core.context.ReactiveSecurityContextHolder.withAuthentication(authentication)
                );
            }

            return chain.filter(exchange);
        };
    }
}
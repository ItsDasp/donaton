package com.bff.security;

import com.bff.filter.SessionRegistrationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${AZURE_TENANT_ID:common}")
    private String tenantId;

    @Value("${AZURE_CLIENT_ID:test-client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    @Value("${azure.ad.audience}")
    private String audience;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SessionRegistrationFilter sessionRegistrationFilter) throws Exception {
        boolean isAzureConfigured = !"common".equals(tenantId) && !"test-client-id".equals(clientId);

        System.out.println("BFF SecurityFilterChain - isAzureConfigured: " + isAzureConfigured);

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/login",
                                "/auth/login/traditional",
                                "/auth/register",
                                "/auth/refresh",
                                "/auth/profile",
                                "/actuator/health"
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        if (isAzureConfigured) {
            http.oauth2ResourceServer(oauth2 -> oauth2
                    .jwt(jwt -> jwt
                            .decoder(jwtDecoder())
                            .jwtAuthenticationConverter(jwtAuthenticationConverter())
                    )
                );
            http.addFilterAfter(sessionRegistrationFilter, org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter.class);
        } else {
            http.addFilterBefore(devAuthFilter(), org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
        }

        http.exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, exception) ->
                                writeJsonError(response, 401, "Unauthorized"))
                        .accessDeniedHandler((request, response, exception) ->
                                writeJsonError(response, 403, "Forbidden"))
                );

        return http.build();
    }

    @Bean
    public SessionRegistrationFilter sessionRegistrationFilter(com.bff.client.AuthClient authClient) {
        return new SessionRegistrationFilter(authClient);
    }

    @Bean
    public NimbusJwtDecoder jwtDecoder() {
        System.out.println("BFF JWT Decoder Configuration:");
        System.out.println("  JWK Set URI: " + jwkSetUri);
        System.out.println("  Issuer URI: " + issuerUri);
        System.out.println("  Audience: " + audience);
        System.out.println("  Tenant ID: " + tenantId);
        System.out.println("  Client ID: " + clientId);

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        OAuth2TokenValidator<Jwt> loggingValidator = token -> {
            System.out.println("BFF JWT Token received:");
            System.out.println("  Issuer: " + token.getIssuer());
            System.out.println("  Subject: " + token.getSubject());
            System.out.println("  Audience: " + token.getAudience());
            System.out.println("  Expiration: " + token.getExpiresAt());
            System.out.println("  Claims: " + token.getClaims());
            return OAuth2TokenValidatorResult.success();
        };

        OAuth2TokenValidator<Jwt> issuerValidator = JwtValidators.createDefaultWithIssuer(issuerUri);
        OAuth2TokenValidator<Jwt> audienceValidator = token -> {
            boolean audienceValid = token.getAudience() != null && token.getAudience().contains(audience);
            System.out.println("BFF JWT - Audience validation: " + audienceValid + " (token has: " + token.getAudience() + ", expected: " + audience + ")");
            if (!audienceValid) {
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "Invalid audience. Expected: " + audience + ", got: " + token.getAudience(), null));
            }
            return OAuth2TokenValidatorResult.success();
        };

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(loggingValidator, issuerValidator, audienceValidator));
        return decoder;
    }

    private Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> roles = jwt.getClaimAsStringList("roles");
            return roles == null ? List.<GrantedAuthority>of() : roles.stream()
                    .map(role -> (GrantedAuthority) new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role))
                    .toList();
        });
        converter.setPrincipalClaimName("preferred_username");
        return converter;
    }

    private void writeJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"status\":" + status + ",\"error\":\"" + message + "\"}");
    }

    private OncePerRequestFilter devAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {
                String path = request.getRequestURI();
                String authHeader = request.getHeader("Authorization");
                String email = request.getHeader("X-User-Email");
                String role = request.getHeader("X-User-Role");

                System.out.println("BFF DevAuthFilter - Path: " + path + ", Email: " + email + ", Role: " + role);

                // Allow public paths without authentication
                if (path.startsWith("/auth/login") ||
                    path.startsWith("/auth/register") ||
                    path.startsWith("/auth/refresh") ||
                    path.startsWith("/auth/profile") ||
                    path.startsWith("/actuator/health")) {
                    filterChain.doFilter(request, response);
                    return;
                }

                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    var authorities = role == null || role.isBlank()
                            ? List.<GrantedAuthority>of()
                            : List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.trim()));

                    var authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            email != null ? email : "dev-user",
                            null,
                            authorities
                    );

                    org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // No authentication - request will be rejected by Spring Security for protected endpoints
                    System.out.println("BFF DevAuthFilter - No authentication provided for path: " + path);
                }

                filterChain.doFilter(request, response);
            }
        };
    }
}

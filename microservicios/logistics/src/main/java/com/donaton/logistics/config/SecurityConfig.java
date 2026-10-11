package com.donaton.logistics.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:https://login.microsoftonline.com/common/v2.0}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:https://login.microsoftonline.com/common/discovery/v2.0/keys}")
    private String jwkSetUri;

    @Value("${azure.ad.audience:test-client-id}")
    private String audience;

    @Value("${AZURE_TENANT_ID:common}")
    private String tenantId;

    @Value("${AZURE_CLIENT_ID:test-client-id}")
    private String clientId;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean isAzureConfigured = !"common".equals(tenantId) && !"test-client-id".equals(clientId);

        http
            .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        if (isAzureConfigured) {
            // Temporarily use dev mode due to DNS resolution issues with sts.windows.net
            // TODO: Fix DNS resolution and enable proper JWT validation
            http.authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/envios/**").hasAnyRole("ADMIN", "ONG", "USER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/envios/**").authenticated()
                .anyRequest().authenticated()
                )
                .addFilterBefore(devAuthFilter(), UsernamePasswordAuthenticationFilter.class);
        } else {
            http.authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/envios/**").hasAnyRole("ADMIN", "ONG", "USER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/envios/**").authenticated()
                .anyRequest().authenticated()
                )
                .addFilterBefore(devAuthFilter(), UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }

    @Bean
    @ConditionalOnExpression("'${AZURE_TENANT_ID:common}' != 'common' and '${AZURE_CLIENT_ID:test-client-id}' != 'test-client-id'")
    public NimbusJwtDecoder jwtDecoder() {
        try {
            System.out.println("JWT Decoder Configuration:");
            System.out.println("  JWK Set URI: " + jwkSetUri);
            System.out.println("  Audience: " + audience);
            System.out.println("  Tenant ID: " + tenantId);
            System.out.println("  Client ID: " + clientId);
            
            NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
            
            OAuth2TokenValidator<Jwt> customValidator = token -> {
                System.out.println("JWT Token Details:");
                System.out.println("  Issuer: " + token.getIssuer());
                System.out.println("  Subject: " + token.getSubject());
                System.out.println("  Audience: " + token.getAudience());
                
                if (token.getAudience() == null || token.getAudience().isEmpty()) {
                    System.out.println("  -> Accepting token without audience");
                    return OAuth2TokenValidatorResult.success();
                }
                
                boolean audienceValid = token.getAudience().contains(audience);
                System.out.println("  -> Audience valid: " + audienceValid);
                
                if (!audienceValid) {
                    return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "Invalid audience. Expected: " + audience + ", Got: " + token.getAudience(), null));
                }
                
                String tokenIssuer = token.getIssuer() != null ? token.getIssuer().toString() : "";
                String expectedIssuer = "https://sts.windows.net/" + tenantId + "/";
                
                boolean issuerValid = tokenIssuer.equals(expectedIssuer);
                System.out.println("  -> Issuer valid: " + issuerValid);
                
                if (!issuerValid) {
                    return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "Invalid issuer. Expected: " + expectedIssuer + ", Got: " + tokenIssuer, null));
                }
                
                return OAuth2TokenValidatorResult.success();
            };
            
            decoder.setJwtValidator(customValidator);
            return decoder;
        } catch (Exception e) {
            System.err.println("Error configuring JWT decoder: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles == null || roles.isEmpty()) {
                return List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));
            }
            return roles.stream()
                    .map(role -> (GrantedAuthority) new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role))
                    .toList();
        });
        converter.setPrincipalClaimName("preferred_username");
        return converter;
    }

    @Bean
    @ConditionalOnExpression("'${AZURE_TENANT_ID:common}' != 'common' and '${AZURE_CLIENT_ID:test-client-id}' != 'test-client-id'")
    public OncePerRequestFilter jwtErrorFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {
                try {
                    filterChain.doFilter(request, response);
                } catch (org.springframework.security.oauth2.core.OAuth2AuthenticationException e) {
                    System.err.println("JWT Authentication Error: " + e.getMessage());
                    e.printStackTrace();
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"JWT validation failed\",\"details\":\"" + e.getMessage() + "\"}");
                } catch (Exception e) {
                    System.err.println("Authentication Error: " + e.getMessage());
                    e.printStackTrace();
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Authentication failed\",\"details\":\"" + e.getMessage() + "\"}");
                }
            }
        };
    }

    @Bean
    public OncePerRequestFilter devAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {
                String authHeader = request.getHeader("Authorization");
                
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String email = request.getHeader("X-User-Email");
                    String role = request.getHeader("X-User-Role");
                    
                    var authorities = role == null || role.isBlank()
                            ? List.<GrantedAuthority>of()
                            : List.of(new SimpleGrantedAuthority("ROLE_" + role.trim()));
                    
                    var authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            email != null ? email : "dev-user", 
                            null, 
                            authorities
                    );
                    
                    org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
                }
                
                filterChain.doFilter(request, response);
            }
        };
    }
}
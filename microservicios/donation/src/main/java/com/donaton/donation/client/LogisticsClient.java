package com.donaton.donation.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class LogisticsClient {

    private static final String INTERNAL_EMAIL = "donation@donaton.internal";
    private static final String INTERNAL_ROLE = "ADMIN";

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public LogisticsClient(@Value("${logistics.base-url:http://logistics:8080}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restTemplate = new RestTemplate();
    }

    public void crearEnvio(Long donacionId, String email, String role) {
        String url = baseUrl + "/envios";
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-User-Email", INTERNAL_EMAIL);
        headers.add("X-User-Role", INTERNAL_ROLE);
        headers.add("Content-Type", "application/json");
        copyIncomingAuthorization(headers);

        Map<String, Object> request = Map.of("donacionId", donacionId);
        restTemplate.postForObject(url, new HttpEntity<>(request, headers), String.class);
    }

    private void copyIncomingAuthorization(HttpHeaders headers) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return;
        }

        String authorization = attributes.getRequest().getHeader("Authorization");
        if (authorization != null && !authorization.isBlank()) {
            headers.set("Authorization", authorization);
        }
    }
}

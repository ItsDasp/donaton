package com.donaton.logistics.client;

import com.donaton.logistics.dto.NeedDTO;
import com.donaton.logistics.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class NeedsClient {

    private static final Logger log = LoggerFactory.getLogger(NeedsClient.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public NeedsClient(@Value("${needs.base-url:http://needs:8080}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restTemplate = new RestTemplate();
    }

    public NeedDTO getNeedById(String needId, String email, String role) {
        String url = baseUrl + "/needs/" + needId;
        try {
            ResponseEntity<NeedDTO> res = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(buildHeaders(email, role)),
                NeedDTO.class
            );
            return res.getBody();
        } catch (HttpClientErrorException exception) {
            log.error("Error HTTP {} consultando needId={} en {}: {}",
                exception.getStatusCode().value(), needId, url,
                exception.getResponseBodyAsString(), exception);
            throw new BadRequestException("No se pudo validar la necesidad");
        } catch (RestClientException exception) {
            log.error("Error de comunicación consultando needId={} en {}",
                needId, url, exception);
            throw new BadRequestException("No se pudo validar la necesidad");
        }
    }

    public void rollbackReceive(String needId, Double amount) {
        String url = baseUrl + "/needs/" + needId + "/rollback?amount=" + amount;
        restTemplate.exchange(
                url,
                HttpMethod.PUT,
                new HttpEntity<>(serviceHeaders()),
                Void.class
        );
    }

    private HttpHeaders buildHeaders(String email, String role) {
        HttpHeaders headers = new HttpHeaders();
        addHeaderIfPresent(headers, "X-User-Email", email);
        addHeaderIfPresent(headers, "X-User-Role", role);

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            var request = attributes.getRequest();
            copyHeader(request, headers, HttpHeaders.AUTHORIZATION);
            copyHeader(request, headers, "X-User-Email");
            copyHeader(request, headers, "X-User-Role");
        }

        return headers;
    }

    private HttpHeaders serviceHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-User-Email", "logistics@donaton.internal");
        headers.add("X-User-Role", "ADMIN");
        copyIncomingHeader(headers, HttpHeaders.AUTHORIZATION);
        return headers;
    }

    private void copyIncomingHeader(HttpHeaders target, String name) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            copyHeader(attributes.getRequest(), target, name);
        }
    }

    private void copyHeader(jakarta.servlet.http.HttpServletRequest request,
                            HttpHeaders target,
                            String name) {
        addHeaderIfPresent(target, name, request.getHeader(name));
    }

    private void addHeaderIfPresent(HttpHeaders headers, String name, String value) {
        if (value != null && !value.isBlank()) {
            headers.set(name, value);
        }
    }
}

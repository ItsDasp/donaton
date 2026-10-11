package com.donaton.donation.controller;

import com.donaton.donation.dto.DonationRequestDTO;
import com.donaton.donation.dto.DonationResponseDTO;
import com.donaton.donation.mapper.DonationMapper;
import com.donaton.donation.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/donations")
public class DonationController {

    private final DonationService service;

    public DonationController(DonationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DonationResponseDTO crear(
            @Valid @RequestBody DonationRequestDTO request,
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            Authentication authentication
    ) {
        if (email == null || email.isBlank()) {
            email = extractEmail(authentication);
        }
        role = resolveRole(role, authentication);
        if (role == null) {
            role = "USER";
        }

        return DonationMapper.toResponse(
                service.crear(DonationMapper.toModel(request), email, role)
        );
    }

    private String extractEmail(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String[] emailClaims = {"preferred_username", "email", "unique_name"};
            for (String claim : emailClaims) {
                String email = jwtAuth.getToken().getClaimAsString(claim);
                if (email != null && !email.isBlank()) {
                    return email;
                }
            }
        }
        return null;
    }

    private String resolveRole(String headerRole, Authentication authentication) {
        String role = normalizeRole(headerRole);
        if (role != null) {
            return role;
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            Object rolesClaim = jwt.getClaims().get("roles");

            if (rolesClaim instanceof Collection<?> roles) {
                for (Object candidate : roles) {
                    role = normalizeRole(String.valueOf(candidate));
                    if (role != null) {
                        return role;
                    }
                }
            } else {
                role = normalizeRole(String.valueOf(rolesClaim));
                if (role != null && !"NULL".equals(role)) {
                    return role;
                }
            }

            role = normalizeRole(jwt.getClaimAsString("role"));
            if (role != null) {
                return role;
            }
        }

        if (authentication != null) {
            for (var authority : authentication.getAuthorities()) {
                role = normalizeRole(authority.getAuthority());
                if (role != null) {
                    return role;
                }
            }
        }
        return null;
    }

    private String normalizeRole(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        for (String candidate : value.split(",")) {
            String role = candidate.trim();
            if (role.startsWith("ROLE_")) {
                role = role.substring("ROLE_".length());
            }

            if ("USER".equalsIgnoreCase(role)
                    || "ADMIN".equalsIgnoreCase(role)
                    || "ONG".equalsIgnoreCase(role)) {
                return role.toUpperCase();
            }
        }
        return null;
    }

    @GetMapping
    public List<DonationResponseDTO> listar() {
        return service.listar().stream().map(DonationMapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    public DonationResponseDTO buscar(@PathVariable Long id) {
        return DonationMapper.toResponse(service.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public DonationResponseDTO actualizar(
            @PathVariable Long id,
            @Valid @RequestBody DonationRequestDTO request
    ) {
        return DonationMapper.toResponse(
                service.actualizar(id, DonationMapper.toModel(request))
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}

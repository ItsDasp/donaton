package com.donaton.auth.service;

import com.donaton.auth.dto.RoleUpdateRequestDTO;
import com.donaton.auth.dto.TokenResponseDTO;
import com.donaton.auth.dto.UserSummaryDTO;
import com.donaton.auth.messaging.RabbitEventPublisher;
import com.donaton.auth.model.User;
import com.donaton.auth.repository.UserRepositoryPattern;
import com.donaton.auth.security.JwtService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepositoryPattern repository;
    private final JwtService jwtService;
    private final RabbitEventPublisher eventPublisher;

    public UserService(UserRepositoryPattern repository, JwtService jwtService,
                       RabbitEventPublisher eventPublisher) {
        this.repository = repository;
        this.jwtService = jwtService;
        this.eventPublisher = eventPublisher;
    }

    public UserSummaryDTO registrarPublic(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Credenciales inválidas");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Credenciales inválidas");
        }

        user.setEmail(user.getEmail().trim().toLowerCase());
        if (repository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        if (user.getName() != null) user.setName(user.getName().trim());
        if (user.getPhone() != null) user.setPhone(user.getPhone().trim());
        user.setRole(com.donaton.auth.model.Role.USER);
        User saved = repository.save(user);
        eventPublisher.publish("user.registered", userEventData(saved));
        return toSummary(saved);
    }

    public UserSummaryDTO registrarAzureUser(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Credenciales inválidas");
        }

        user.setEmail(user.getEmail().trim().toLowerCase());
        
        // Si el usuario ya existe, devolver el existente
        if (repository.findByEmail(user.getEmail()).isPresent()) {
            return toSummary(repository.findByEmail(user.getEmail()).get());
        }

        if (user.getName() != null) user.setName(user.getName().trim());
        if (user.getPhone() != null) user.setPhone(user.getPhone().trim());
        user.setRole(com.donaton.auth.model.Role.USER);
        User saved = repository.save(user);
        eventPublisher.publish("user.registered", userEventData(saved));
        return toSummary(saved);
    }

    public List<UserSummaryDTO> listarUsuarios(String role) {
        requireAdmin(role);
        return repository.findAll().stream().map(this::toSummary).toList();
    }

    public UserSummaryDTO crearUsuario(String role, User user) {
        requireAdmin(role);
        validateNewUser(user);
        user.setEmail(user.getEmail().trim().toLowerCase());
        if (user.getName() != null) user.setName(user.getName().trim());
        if (user.getPhone() != null) user.setPhone(user.getPhone().trim());
        if (user.getRole() == null) user.setRole(com.donaton.auth.model.Role.USER);
        User saved = repository.save(user);
        eventPublisher.publish("user.registered", userEventData(saved));
        return toSummary(saved);
    }

    public UserSummaryDTO cambiarRol(Long id, RoleUpdateRequestDTO request, String role, String email) {
        requireAdmin(role);
        if (request == null || request.role() == null || request.role().isBlank()) {
            throw new RuntimeException("Rol inválido");
        }

        User currentUser = repository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuario actual no encontrado"));
        
        User targetUser = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Los admins no pueden cambiar el rol de otros admins (solo el admin principal ID 1 puede)
        if (targetUser.getRole() == com.donaton.auth.model.Role.ADMIN && !currentUser.getId().equals(1L)) {
            throw new RuntimeException("No puedes cambiar el rol de otros administradores");
        }

        targetUser.setRole(com.donaton.auth.model.Role.valueOf(request.role().trim().toUpperCase()));
        User saved = repository.save(targetUser);
        eventPublisher.publish("user.role_changed", userEventData(saved));
        return toSummary(saved);
    }

    public void eliminarUsuario(Long id, String role) {
        requireAdmin(role);
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        repository.delete(user);
        eventPublisher.publish("user.deleted", userEventData(user));
    }

    public UserSummaryDTO updateProfile(String email, String name) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        
        User saved = repository.save(user);
        eventPublisher.publish("user.updated", userEventData(saved));
        return toSummary(saved);
    }

    public UserSummaryDTO updatePassword(String email, String password) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (password == null || password.isBlank()) {
            throw new RuntimeException("La contraseña es requerida");
        }
        
        user.setPassword(password.trim());
        return toSummary(repository.save(user));
    }

    public TokenResponseDTO login(String email, String password) {

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole().name());

        return TokenResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .accessExpiresIn(900000L)
                .refreshExpiresIn(604800000L)
                .build();
    }

    public TokenResponseDTO refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token no proporcionado");
        }

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Token de refresco inválido");
        }

        String email = jwtService.extractEmail(refreshToken);
        String role = jwtService.extractRole(refreshToken);

        String newAccessToken = jwtService.generateAccessToken(email, role);

        return TokenResponseDTO.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .accessExpiresIn(900000L)
                .refreshExpiresIn(604800000L)
                .build();
    }

    private void validateNewUser(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Credenciales inválidas");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Credenciales inválidas");
        }
        user.setEmail(user.getEmail().trim().toLowerCase());
        if (repository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }
    }

    private void requireAdmin(String role) {
        if (role == null || !role.toUpperCase().contains("ADMIN")) {
            throw new RuntimeException("Solo un administrador puede realizar esta acción");
        }
    }

    private UserSummaryDTO toSummary(User user) {
        return new UserSummaryDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole() == null ? null : user.getRole().name()
        );
    }

    private Map<String, Object> userEventData(User user) {
        return Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "name", user.getName() == null ? "" : user.getName(),
                "role", user.getRole() == null ? "" : user.getRole().name()
        );
    }
}
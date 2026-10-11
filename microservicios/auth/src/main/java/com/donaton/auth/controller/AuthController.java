package com.donaton.auth.controller;

import com.donaton.auth.dto.AdminUserRequestDTO;
import com.donaton.auth.dto.AuthDTO;
import com.donaton.auth.dto.ProfileUpdateRequestDTO;
import com.donaton.auth.dto.RefreshTokenDTO;
import com.donaton.auth.dto.RegisterRequestDTO;
import com.donaton.auth.dto.RoleUpdateRequestDTO;
import com.donaton.auth.dto.SessionHistoryDTO;
import com.donaton.auth.dto.SessionRegistrationRequest;
import com.donaton.auth.dto.TokenResponseDTO;
import com.donaton.auth.dto.UserSummaryDTO;
import com.donaton.auth.model.User;
import com.donaton.auth.service.SessionHistoryService;
import com.donaton.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService service;
    private final SessionHistoryService sessionHistoryService;

    public AuthController(UserService service, SessionHistoryService sessionHistoryService) {
        this.service = service;
        this.sessionHistoryService = sessionHistoryService;
    }

    @PostMapping("/register")
    public UserSummaryDTO register(@Valid @RequestBody RegisterRequestDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPassword(dto.getPassword());
        return service.registrarPublic(user);
    }

    @PostMapping("/register/azure")
    public UserSummaryDTO registerAzureUser(@Valid @RequestBody com.donaton.auth.dto.AzureUserRequest dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword("azure-auth-" + dto.getEmail()); // Placeholder password
        user.setRole(dto.getRole() != null ? com.donaton.auth.model.Role.valueOf(dto.getRole().toUpperCase()) : com.donaton.auth.model.Role.USER);
        return service.registrarAzureUser(user);
    }

    @GetMapping("/users")
    public List<UserSummaryDTO> listarUsuarios(@RequestHeader("X-User-Role") String role) {
        return service.listarUsuarios(role);
    }

    @PostMapping("/users")
    public UserSummaryDTO crearUsuario(
            @Valid @RequestBody AdminUserRequestDTO dto,
            @RequestHeader("X-User-Role") String role
    ) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole());
        return service.crearUsuario(role, user);
    }

    @PutMapping("/users/{id}/role")
    public UserSummaryDTO cambiarRol(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequestDTO request,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Email") String email
    ) {
        return service.cambiarRol(id, request, role, email);
    }

    @DeleteMapping("/users/{id}")
    public void eliminarUsuario(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String role
    ) {
        service.eliminarUsuario(id, role);
    }

    @PostMapping("/login")
    public TokenResponseDTO login(@Valid @RequestBody AuthDTO dto) {
        return service.login(dto.getEmail(), dto.getPassword());
    }

    @PostMapping("/refresh")
    public TokenResponseDTO refresh(@Valid @RequestBody RefreshTokenDTO dto) {
        return service.refresh(dto.getRefreshToken());
    }

    @GetMapping("/sessions")
    public List<SessionHistoryDTO> getUserSessions(@RequestHeader("X-User-Email") String email) {
        return sessionHistoryService.getUserSessions(email);
    }

    @PostMapping("/sessions/register")
    public SessionHistoryDTO registerSession(
            @RequestHeader("X-User-Email") String email,
            @RequestBody SessionRegistrationRequest request
    ) {
        return sessionHistoryService.registerSession(
                email,
                request.device(),
                request.browser(),
                request.location(),
                request.ipAddress()
        );
    }

    @DeleteMapping("/sessions/{id}")
    public void revokeSession(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String email
    ) {
        sessionHistoryService.revokeSession(id, email);
    }

    @DeleteMapping("/sessions")
    public void revokeAllSessions(@RequestHeader("X-User-Email") String email) {
        sessionHistoryService.revokeAllSessions(email);
    }

    @PutMapping("/profile")
    public UserSummaryDTO updateProfile(
            @Valid @RequestBody ProfileUpdateRequestDTO request,
            @RequestHeader("X-User-Email") String email
    ) {
        return service.updateProfile(email, request.getName());
    }

    @PutMapping("/profile/password")
    public UserSummaryDTO updatePassword(
            @Valid @RequestBody com.donaton.auth.dto.PasswordUpdateRequest request,
            @RequestHeader("X-User-Email") String email
    ) {
        return service.updatePassword(email, request.getPassword());
    }
}

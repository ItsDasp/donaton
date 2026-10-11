package com.bff.controller;

import com.bff.dto.request.AdminUserRequest;
import com.bff.dto.request.AuthRequest;
import com.bff.dto.request.ProfileUpdateRequest;
import com.bff.dto.request.RefreshRequest;
import com.bff.dto.request.RegisterRequest;
import com.bff.dto.request.RoleUpdateRequest;
import com.bff.dto.response.AuthResponse;
import com.bff.dto.response.UserSummaryResponse;
import com.bff.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/login/traditional")
    public AuthResponse loginTraditional(@Valid @RequestBody AuthRequest request) {
        return authService.loginTraditional(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummaryResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request);
    }

    @GetMapping("/users")
    public List<UserSummaryResponse> listUsers() {
        return authService.listUsers();
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummaryResponse createUser(
            @Valid @RequestBody AdminUserRequest request
    ) {
        return authService.createUser(request);
    }

    @PutMapping("/users/{id}/role")
    public UserSummaryResponse updateRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request
    ) {
        return authService.updateRole(id, request);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
    }

    @GetMapping("/sessions")
    public List<com.bff.dto.response.SessionHistoryResponse> getUserSessions() {
        return authService.getUserSessions();
    }

    @PutMapping("/profile")
    public UserSummaryResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return authService.updateProfile(request.getName());
    }

    @PutMapping("/profile/password")
    public UserSummaryResponse updatePassword(@Valid @RequestBody com.bff.dto.request.PasswordUpdateRequest request) {
        return authService.updatePassword(request.getPassword());
    }
}
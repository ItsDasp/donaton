package com.bff.client;

import com.bff.dto.request.AdminUserRequest;
import com.bff.dto.request.AuthRequest;
import com.bff.dto.request.RefreshRequest;
import com.bff.dto.request.RegisterRequest;
import com.bff.dto.request.RoleUpdateRequest;
import com.bff.dto.response.AuthResponse;
import com.bff.dto.response.UserSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "auth-service", configuration = FeignConfig.class)
public interface AuthClient {

    @PostMapping("/auth/login")
    AuthResponse login(@RequestBody AuthRequest request);

    @PostMapping("/auth/register")
    UserSummaryResponse register(@RequestBody RegisterRequest request);

    @PostMapping("/auth/refresh")
    AuthResponse refresh(@RequestBody RefreshRequest request);

    @GetMapping("/auth/users")
    List<UserSummaryResponse> listUsers();

    @PostMapping("/auth/users")
    UserSummaryResponse createUser(@RequestBody AdminUserRequest request);

    @PutMapping("/auth/users/{id}/role")
    UserSummaryResponse updateRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request
    );

    @DeleteMapping("/auth/users/{id}")
    void deleteUser(@PathVariable Long id);

    @GetMapping("/auth/sessions")
    List<com.bff.dto.response.SessionHistoryResponse> getUserSessions();

    @PostMapping("/auth/sessions/register")
    com.bff.dto.response.SessionHistoryResponse registerSession(@RequestBody com.bff.dto.request.SessionRegistrationRequest request);

    @PutMapping("/auth/profile")
    UserSummaryResponse updateProfile(@RequestBody com.bff.dto.request.ProfileUpdateRequest request);

    @PutMapping("/auth/profile/password")
    UserSummaryResponse updatePassword(@RequestBody com.bff.dto.request.PasswordUpdateRequest request);

    @PostMapping("/auth/register/azure")
    UserSummaryResponse registerAzureUser(@RequestBody com.bff.dto.request.AzureUserRequest request);
}
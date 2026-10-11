package com.donaton.auth.repository;

import com.donaton.auth.model.Role;
import com.donaton.auth.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryPattern {
    User save(User entity);
    Optional<User> findById(Long id);
    List<User> findAll();
    void deleteById(Long id);
    void delete(User entity);
    long count();
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    boolean existsByEmail(String email);
    List<User> findByNameContainingIgnoreCase(String name);
    long countByRole(Role role);
    List<User> findAllOrderByEmailAsc();
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
    long getTotalUserCount();
    List<User> findByEmailOrPhone(String email, String phone);
}

package com.donaton.auth.repository;

import com.donaton.auth.model.Role;
import com.donaton.auth.model.User;

import java.util.List;
import java.util.Optional;

public class UserRepositoryAdapter implements UserRepositoryPattern {
    private final UserRepository jpaRepository;

    public UserRepositoryAdapter(UserRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public User save(User entity) {
        return jpaRepository.save(entity);
    }

    @Override
    public Optional<User> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<User> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void delete(User entity) {
        jpaRepository.delete(entity);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email);
    }

    @Override
    public List<User> findByRole(Role role) {
        return jpaRepository.findByRole(role);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    @Override
    public List<User> findByNameContainingIgnoreCase(String name) {
        return jpaRepository.findByNameContainingIgnoreCase(name);
    }

    @Override
    public long countByRole(Role role) {
        return jpaRepository.countByRole(role);
    }

    @Override
    public List<User> findAllOrderByEmailAsc() {
        return jpaRepository.findAllOrderByEmailAsc();
    }

    @Override
    public Optional<User> findByPhone(String phone) {
        return jpaRepository.findByPhone(phone);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return jpaRepository.existsByPhone(phone);
    }

    @Override
    public long getTotalUserCount() {
        return jpaRepository.getTotalUserCount();
    }

    @Override
    public List<User> findByEmailOrPhone(String email, String phone) {
        return jpaRepository.findByEmailOrPhone(email, phone);
    }
}

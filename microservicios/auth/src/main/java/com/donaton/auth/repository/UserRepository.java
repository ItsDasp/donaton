package com.donaton.auth.repository;

import com.donaton.auth.model.Role;
import com.donaton.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    
    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    
    boolean existsByEmail(String email);

  
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> findByNameContainingIgnoreCase(@Param("name") String name);

  
    long countByRole(Role role);

   
    @Query("SELECT u FROM User u ORDER BY u.email ASC")
    List<User> findAllOrderByEmailAsc();

   
    Optional<User> findByPhone(String phone);

   
    boolean existsByPhone(String phone);

   
    @Query("SELECT COUNT(u) FROM User u")
    long getTotalUserCount();

  
    @Query("SELECT u FROM User u WHERE u.email = :email OR u.phone = :phone")
    List<User> findByEmailOrPhone(
            @Param("email") String email,
            @Param("phone") String phone
    );
}
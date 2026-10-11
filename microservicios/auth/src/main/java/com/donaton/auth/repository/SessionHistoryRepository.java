package com.donaton.auth.repository;

import com.donaton.auth.model.SessionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionHistoryRepository extends JpaRepository<SessionHistory, Long> {

    List<SessionHistory> findByEmail(String email);

    Optional<SessionHistory> findByEmailAndCurrentTrue(String email);

    void deleteByEmail(String email);

    void deleteByEmailAndCurrentFalse(String email);

    List<SessionHistory> findByEmailOrderByLastActiveDesc(String email);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}

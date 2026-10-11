package com.donaton.auth.service;

import com.donaton.auth.dto.SessionHistoryDTO;
import com.donaton.auth.model.SessionHistory;
import com.donaton.auth.repository.SessionHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionHistoryService {

    private final SessionHistoryRepository repository;

    public SessionHistoryService(SessionHistoryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SessionHistoryDTO registerSession(String email, String device, String browser, String location, String ipAddress) {
        repository.findByEmailAndCurrentTrue(email).ifPresent(session -> {
            session.setCurrent(false);
            repository.save(session);
        });

        SessionHistory newSession = new SessionHistory();
        newSession.setEmail(email);
        newSession.setDevice(device);
        newSession.setBrowser(browser);
        newSession.setLocation(location);
        newSession.setIpAddress(ipAddress);
        newSession.setCreatedAt(LocalDateTime.now());
        newSession.setLastActive(LocalDateTime.now());
        newSession.setCurrent(true);
        newSession.setExpiresAt(LocalDateTime.now().plusDays(30));

        SessionHistory saved = repository.save(newSession);
        return SessionHistoryDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionHistoryDTO> getUserSessions(String email) {
        return repository.findByEmailOrderByLastActiveDesc(email)
                .stream()
                .map(SessionHistoryDTO::fromEntity)
                .toList();
    }

    @Transactional
    public void updateLastActive(String email) {
        repository.findByEmailAndCurrentTrue(email).ifPresent(session -> {
            session.setLastActive(LocalDateTime.now());
            repository.save(session);
        });
    }

    @Transactional
    public void revokeSession(Long sessionId, String email) {
        repository.findById(sessionId).ifPresent(session -> {
            if (session.getEmail().equals(email)) {
                repository.delete(session);
            }
        });
    }

    @Transactional
    public void revokeAllSessions(String email) {
        repository.deleteByEmail(email);
    }

    @Transactional
    public void cleanupExpiredSessions() {
        repository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}

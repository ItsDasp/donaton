package com.donaton.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "session_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SessionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    private String device;

    private String browser;

    private String location;

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime lastActive;

    @Column(nullable = false)
    private Boolean current;

    @Column(nullable = false)
    private LocalDateTime expiresAt;
}

-- Create session_history table
CREATE TABLE IF NOT EXISTS session_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    device VARCHAR(100),
    browser VARCHAR(100),
    location VARCHAR(255),
    ip_address VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    last_active TIMESTAMP NOT NULL,
    current BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_email (email),
    INDEX idx_current (current),
    INDEX idx_expires_at (expires_at)
);

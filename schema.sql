-- schema.sql - Medication Reminders Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(255) PRIMARY KEY,
    discord_id VARCHAR(255) UNIQUE,
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_via VARCHAR(20) NOT NULL CHECK (created_via IN ('discord', 'pwa')),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on discord_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(255) PRIMARY KEY,
    uid VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Create index on uid and expires_at for faster session validation
CREATE INDEX IF NOT EXISTS idx_sessions_uid ON sessions(uid);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    time VARCHAR(5) NOT NULL, -- HH:MM format
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'every-2-days', 'weekly', 'bi-weekly', 'monthly')),
    dose VARCHAR(255),
    amount VARCHAR(255),
    instructions TEXT,
    taken BOOLEAN NOT NULL DEFAULT 0,
    reminder_sent BOOLEAN NOT NULL DEFAULT 0,
    last_taken TIMESTAMP,
    next_due TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
    UNIQUE(uid, name)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_medications_uid ON medications(uid);
CREATE INDEX IF NOT EXISTS idx_medications_uid_name ON medications(uid, name);
CREATE INDEX IF NOT EXISTS idx_medications_frequency ON medications(frequency);
CREATE INDEX IF NOT EXISTS idx_medications_taken ON medications(taken);
CREATE INDEX IF NOT EXISTS idx_medications_reminder_sent ON medications(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_medications_next_due ON medications(next_due);

-- Trigger to update updated_at on users table
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE uid = NEW.uid;
END;

-- Trigger to update updated_at on medications table
CREATE TRIGGER IF NOT EXISTS update_medications_updated_at 
AFTER UPDATE ON medications
FOR EACH ROW
BEGIN
    UPDATE medications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- View for medications with user info (useful for debugging)
CREATE VIEW IF NOT EXISTS medications_with_users AS
SELECT 
    m.id,
    m.uid,
    u.discord_id,
    u.timezone,
    m.name,
    m.time,
    m.frequency,
    m.dose,
    m.amount,
    m.instructions,
    m.taken,
    m.reminder_sent,
    m.last_taken,
    m.next_due,
    m.created_at,
    m.updated_at
FROM medications m
JOIN users u ON m.uid = u.uid;
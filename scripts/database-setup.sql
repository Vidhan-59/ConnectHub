-- Create database
CREATE DATABASE connecthub;
USE connecthub;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id VARCHAR(36) PRIMARY KEY,
    content TEXT NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert demo user
INSERT INTO users (id, name, email, password, bio) VALUES 
('1', 'Demo User', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Full Stack Developer passionate about creating amazing user experiences.');

-- Insert demo post
INSERT INTO posts (id, content, author_id) VALUES 
('1', 'Welcome to ConnectHub! This is a demo post to show how the platform works. Feel free to create your own posts and connect with other professionals.', '1');

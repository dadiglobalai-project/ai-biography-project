CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    profile_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_photo TEXT,
    bio TEXT,
    CONSTRAINT fk_user_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE biography_websites (
    website_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    website_name VARCHAR(255) NOT NULL,
    theme VARCHAR(100),
    privacy_status VARCHAR(50) DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_biography_websites_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE pages (
    page_id CHAR(36) PRIMARY KEY,
    website_id CHAR(36) NOT NULL,
    page_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    UNIQUE KEY uk_pages_website_slug (website_id, slug),
    CONSTRAINT fk_pages_website
        FOREIGN KEY (website_id)
        REFERENCES biography_websites(website_id)
        ON DELETE CASCADE
);

CREATE TABLE media_files (
    media_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_files_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE content_blocks (
    block_id CHAR(36) PRIMARY KEY,
    page_id CHAR(36) NOT NULL,
    media_id CHAR(36) NULL,
    block_type VARCHAR(50) NOT NULL,
    block_content TEXT,
    display_order INT DEFAULT 0,
    CONSTRAINT fk_content_blocks_page
        FOREIGN KEY (page_id)
        REFERENCES pages(page_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_content_blocks_media
        FOREIGN KEY (media_id)
        REFERENCES media_files(media_id)
        ON DELETE SET NULL
);

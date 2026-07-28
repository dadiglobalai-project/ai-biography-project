CREATE TABLE templates (
    template_id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    thumbnail_url VARCHAR(500),
    layout_key VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    is_premium BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);
CREATE TABLE website_sections (
    section_id CHAR(36) PRIMARY KEY,
    website_id CHAR(36) NOT NULL,
    section_type VARCHAR(50) NOT NULL,
    title VARCHAR(150),
    content TEXT,
    display_order INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,

    CONSTRAINT fk_sections_website
        FOREIGN KEY (website_id)
        REFERENCES biography_websites(website_id)
        ON DELETE CASCADE
);
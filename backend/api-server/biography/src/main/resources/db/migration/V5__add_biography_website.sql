CREATE TABLE biography_websites (
    website_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    template_id CHAR(36) NOT NULL,
    subject_type VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,

    CONSTRAINT fk_biography_websites_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_biography_websites_template
        FOREIGN KEY (template_id)
        REFERENCES templates(template_id)
);  
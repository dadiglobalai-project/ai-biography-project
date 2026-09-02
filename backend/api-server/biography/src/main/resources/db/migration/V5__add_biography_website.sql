ALTER TABLE biography_websites
    CHANGE COLUMN website_name title VARCHAR(150) NOT NULL,
    MODIFY COLUMN subdomain VARCHAR(100) NULL,
    DROP COLUMN theme,
    CHANGE COLUMN privacy_status status VARCHAR(50) NOT NULL,
    ADD COLUMN template_id CHAR(36) NULL AFTER subdomain,
    ADD COLUMN subject_type VARCHAR(50) NULL AFTER template_id,
    ADD COLUMN updated_at DATETIME NULL AFTER created_at;

ALTER TABLE biography_websites
    ADD CONSTRAINT fk_biography_websites_template
        FOREIGN KEY (template_id)
        REFERENCES templates(template_id);
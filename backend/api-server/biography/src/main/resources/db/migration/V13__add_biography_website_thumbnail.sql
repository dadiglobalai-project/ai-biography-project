ALTER TABLE biography_websites
    ADD COLUMN thumbnail_url VARCHAR(500) NULL AFTER status,
    ADD COLUMN thumbnail_generated_at DATETIME NULL AFTER thumbnail_url;

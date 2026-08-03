DROP PROCEDURE IF EXISTS add_media_column_if_missing;
DROP PROCEDURE IF EXISTS add_media_constraint_if_missing;
DROP PROCEDURE IF EXISTS add_media_index_if_missing;

DELIMITER $$

CREATE PROCEDURE add_media_column_if_missing(
    IN column_name_to_add VARCHAR(64),
    IN ddl_statement TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'website_media_assets'
          AND column_name = column_name_to_add
    ) THEN
        SET @ddl = ddl_statement;
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

CREATE PROCEDURE add_media_constraint_if_missing(
    IN constraint_name_to_add VARCHAR(64),
    IN ddl_statement TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = DATABASE()
          AND table_name = 'website_media_assets'
          AND constraint_name = constraint_name_to_add
    ) THEN
        SET @ddl = ddl_statement;
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

CREATE PROCEDURE add_media_index_if_missing(
    IN index_name_to_add VARCHAR(64),
    IN ddl_statement TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'website_media_assets'
          AND index_name = index_name_to_add
    ) THEN
        SET @ddl = ddl_statement;
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

CALL add_media_column_if_missing(
    'storage_provider',
    'ALTER TABLE website_media_assets ADD COLUMN storage_provider VARCHAR(50) NOT NULL DEFAULT ''SUPABASE'' AFTER original_file_name'
);

CALL add_media_column_if_missing(
    'bucket_name',
    'ALTER TABLE website_media_assets ADD COLUMN bucket_name VARCHAR(255) NOT NULL DEFAULT ''biography-images'' AFTER storage_provider'
);

CALL add_media_column_if_missing(
    'uploaded_by_user_id',
    'ALTER TABLE website_media_assets ADD COLUMN uploaded_by_user_id CHAR(36) NULL AFTER public_url'
);

CALL add_media_column_if_missing(
    'usage_type',
    'ALTER TABLE website_media_assets ADD COLUMN usage_type VARCHAR(50) NOT NULL DEFAULT ''OTHER'' AFTER uploaded_by_user_id'
);

CALL add_media_constraint_if_missing(
    'fk_media_asset_uploaded_by_user',
    'ALTER TABLE website_media_assets ADD CONSTRAINT fk_media_asset_uploaded_by_user FOREIGN KEY (uploaded_by_user_id) REFERENCES users (user_id) ON DELETE SET NULL'
);

CALL add_media_index_if_missing(
    'uq_media_asset_bucket_storage_key',
    'CREATE UNIQUE INDEX uq_media_asset_bucket_storage_key ON website_media_assets (bucket_name, storage_key(512))'
);

CALL add_media_index_if_missing(
    'idx_media_asset_uploaded_by_user',
    'CREATE INDEX idx_media_asset_uploaded_by_user ON website_media_assets (uploaded_by_user_id)'
);

CALL add_media_index_if_missing(
    'idx_media_asset_usage_type',
    'CREATE INDEX idx_media_asset_usage_type ON website_media_assets (usage_type)'
);

DROP PROCEDURE IF EXISTS add_media_column_if_missing;
DROP PROCEDURE IF EXISTS add_media_constraint_if_missing;
DROP PROCEDURE IF EXISTS add_media_index_if_missing;

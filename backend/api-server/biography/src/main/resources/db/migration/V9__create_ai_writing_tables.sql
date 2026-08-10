-- =========================================================
-- V9__create_ai_writing_tables.sql
-- =========================================================

-- =========================================================
-- AI Writing Requests
-- Stores each request sent to the AI provider.
-- =========================================================

CREATE TABLE ai_writing_requests (
    request_id CHAR(36) NOT NULL,

    user_id CHAR(36) NOT NULL,
    website_id CHAR(36) NULL,
    section_id CHAR(36) NULL,

    action_type VARCHAR(50) NOT NULL,
    source_text TEXT NULL,
    user_instruction TEXT NULL,
    tone VARCHAR(50) NULL,
    language VARCHAR(20) NOT NULL,

    provider VARCHAR(50) NOT NULL DEFAULT 'DEEPSEEK',
    model_name VARCHAR(100) NOT NULL DEFAULT 'deepseek-v4-flash',

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    error_message TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (request_id),

    CONSTRAINT fk_ai_writing_requests_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ai_writing_requests_website
        FOREIGN KEY (website_id)
        REFERENCES biography_websites(website_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_ai_writing_requests_section
        FOREIGN KEY (section_id)
        REFERENCES website_sections(section_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_ai_request_action
        CHECK (
            action_type IN (
                'GENERATE',
                'REWRITE',
                'IMPROVE_GRAMMAR',
                'EXPAND',
                'SHORTEN',
                'SUMMARIZE',
                'CHANGE_TONE',
                'TRANSLATE'
            )
        ),

    CONSTRAINT chk_ai_request_status
        CHECK (
            status IN (
                'PENDING',
                'PROCESSING',
                'COMPLETED',
                'FAILED',
                'CANCELLED'
            )
        ),

    CONSTRAINT chk_ai_request_language
        CHECK (
            language IN (
                'ENGLISH',
                'CHINESE',
                'MIXED'
            )
        ),

    CONSTRAINT chk_ai_request_completed_at
        CHECK (
            completed_at IS NULL
            OR completed_at >= created_at
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;


-- =========================================================
-- AI Writing Outputs
-- Stores generated responses and API usage.
-- =========================================================

CREATE TABLE ai_writing_outputs (
    output_id CHAR(36) NOT NULL,
    request_id CHAR(36) NOT NULL,

    generated_text LONGTEXT NOT NULL,

    english_word_count INT NOT NULL DEFAULT 0,
    chinese_character_count INT NOT NULL DEFAULT 0,

    input_tokens INT NULL,
    output_tokens INT NULL,
    total_tokens INT NULL,

    is_selected BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (output_id),

    CONSTRAINT fk_ai_writing_outputs_request
        FOREIGN KEY (request_id)
        REFERENCES ai_writing_requests(request_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_ai_output_english_words
        CHECK (english_word_count >= 0),

    CONSTRAINT chk_ai_output_chinese_characters
        CHECK (chinese_character_count >= 0),

    CONSTRAINT chk_ai_output_input_tokens
        CHECK (
            input_tokens IS NULL
            OR input_tokens >= 0
        ),

    CONSTRAINT chk_ai_output_output_tokens
        CHECK (
            output_tokens IS NULL
            OR output_tokens >= 0
        ),

    CONSTRAINT chk_ai_output_total_tokens
        CHECK (
            total_tokens IS NULL
            OR total_tokens >= 0
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;


-- =========================================================
-- User AI Usage
-- Stores accumulated usage and optional limits.
-- =========================================================

CREATE TABLE user_ai_usage (
    user_id CHAR(36) NOT NULL,

    english_words_used BIGINT NOT NULL DEFAULT 0,
    chinese_characters_used BIGINT NOT NULL DEFAULT 0,

    english_word_limit BIGINT NOT NULL DEFAULT 100000,
    chinese_character_limit BIGINT NOT NULL DEFAULT 200000,

    limit_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    period_start TIMESTAMP NULL DEFAULT NULL,
    period_end TIMESTAMP NULL DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),

    CONSTRAINT fk_user_ai_usage_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_ai_usage_english
        CHECK (english_words_used >= 0),

    CONSTRAINT chk_ai_usage_chinese
        CHECK (chinese_characters_used >= 0),

    CONSTRAINT chk_ai_usage_english_limit
        CHECK (english_word_limit >= 0),

    CONSTRAINT chk_ai_usage_chinese_limit
        CHECK (chinese_character_limit >= 0),

    CONSTRAINT chk_ai_usage_period
        CHECK (
            period_end IS NULL
            OR period_start IS NULL
            OR period_end > period_start
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;


-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX idx_ai_writing_requests_user_created
    ON ai_writing_requests(user_id, created_at);

CREATE INDEX idx_ai_writing_requests_website_created
    ON ai_writing_requests(website_id, created_at);

CREATE INDEX idx_ai_writing_requests_section_created
    ON ai_writing_requests(section_id, created_at);
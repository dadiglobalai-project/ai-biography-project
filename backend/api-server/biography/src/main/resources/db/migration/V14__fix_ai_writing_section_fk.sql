-- Align AI writing section references with the current biography_sections architecture.
-- Values that cannot be validated against biography_sections are preserved as AI history
-- but detached from a section before replacing the foreign key.

UPDATE ai_writing_requests r
LEFT JOIN biography_sections s
    ON s.section_id = r.section_id
SET r.section_id = NULL
WHERE r.section_id IS NOT NULL
  AND s.section_id IS NULL;

ALTER TABLE ai_writing_requests
DROP FOREIGN KEY fk_ai_writing_requests_section;

ALTER TABLE ai_writing_requests
ADD CONSTRAINT fk_ai_writing_requests_section
    FOREIGN KEY (section_id)
    REFERENCES biography_sections(section_id)
    ON DELETE SET NULL;

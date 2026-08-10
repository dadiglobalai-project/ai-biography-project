package com.AI.biography.aiwriting.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "ai_writing_outputs")
public class AiWritingOutput {
    @Id
    @Column(name = "output_id", columnDefinition = "CHAR(36)", length = 36)
    private String outputId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false, columnDefinition = "CHAR(36)")
    @JsonBackReference
    private AiWritingRequest request;

    @Lob
    @Column(name = "generated_text", nullable = false, columnDefinition = "LONGTEXT")
    private String generatedText;

    @Column(name = "english_word_count", nullable = false)
    private Integer englishWordCount;

    @Column(name = "chinese_character_count", nullable = false)
    private Integer chineseCharacterCount;

    @Column(name = "input_tokens")
    private Integer inputTokens;

    @Column(name = "output_tokens")
    private Integer outputTokens;

    @Column(name = "total_tokens")
    private Integer totalTokens;

    @Column(name = "is_selected", nullable = false)
    private Boolean selected;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (outputId == null) {
            outputId = UUID.randomUUID().toString();
        }
        if (englishWordCount == null) {
            englishWordCount = 0;
        }
        if (chineseCharacterCount == null) {
            chineseCharacterCount = 0;
        }
        if (selected == null) {
            selected = false;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public String getOutputId() { return outputId; }
    public void setOutputId(String outputId) { this.outputId = outputId; }
    public AiWritingRequest getRequest() { return request; }
    public void setRequest(AiWritingRequest request) { this.request = request; }
    public String getGeneratedText() { return generatedText; }
    public void setGeneratedText(String generatedText) { this.generatedText = generatedText; }
    public Integer getEnglishWordCount() { return englishWordCount; }
    public void setEnglishWordCount(Integer englishWordCount) { this.englishWordCount = englishWordCount; }
    public Integer getChineseCharacterCount() { return chineseCharacterCount; }
    public void setChineseCharacterCount(Integer chineseCharacterCount) { this.chineseCharacterCount = chineseCharacterCount; }
    public Integer getInputTokens() { return inputTokens; }
    public void setInputTokens(Integer inputTokens) { this.inputTokens = inputTokens; }
    public Integer getOutputTokens() { return outputTokens; }
    public void setOutputTokens(Integer outputTokens) { this.outputTokens = outputTokens; }
    public Integer getTotalTokens() { return totalTokens; }
    public void setTotalTokens(Integer totalTokens) { this.totalTokens = totalTokens; }
    public Boolean getSelected() { return selected; }
    public void setSelected(Boolean selected) { this.selected = selected; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AiWritingOutput that)) {
            return false;
        }
        return outputId != null && Objects.equals(outputId, that.outputId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

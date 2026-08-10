package com.AI.biography.aiwriting.entity;

import com.AI.biography.user.User;
import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "user_ai_usage")
public class UserAiUsage implements Persistable<String> {
    @Id
    @Column(name = "user_id", columnDefinition = "CHAR(36)", length = 36)
    private String userId;

    @Transient
    private boolean isNew = true;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private User user;

    @Column(name = "english_words_used", nullable = false)
    private Long englishWordsUsed;

    @Column(name = "chinese_characters_used", nullable = false)
    private Long chineseCharactersUsed;

    @Column(name = "english_word_limit", nullable = false)
    private Long englishWordLimit;

    @Column(name = "chinese_character_limit", nullable = false)
    private Long chineseCharacterLimit;

    @Column(name = "limit_enabled", nullable = false)
    private Boolean limitEnabled;

    @Column(name = "period_start")
    private LocalDateTime periodStart;

    @Column(name = "period_end")
    private LocalDateTime periodEnd;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (englishWordsUsed == null) {
            englishWordsUsed = 0L;
        }
        if (chineseCharactersUsed == null) {
            chineseCharactersUsed = 0L;
        }
        if (englishWordLimit == null) {
            englishWordLimit = 100000L;
        }
        if (chineseCharacterLimit == null) {
            chineseCharacterLimit = 200000L;
        }
        if (limitEnabled == null) {
            limitEnabled = false;
        }
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PostPersist
    @PostLoad
    public void markNotNew() {
        isNew = false;
    }

    @Override
    public String getId() {
        return userId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Long getEnglishWordsUsed() { return englishWordsUsed; }
    public void setEnglishWordsUsed(Long englishWordsUsed) { this.englishWordsUsed = englishWordsUsed; }
    public Long getChineseCharactersUsed() { return chineseCharactersUsed; }
    public void setChineseCharactersUsed(Long chineseCharactersUsed) { this.chineseCharactersUsed = chineseCharactersUsed; }
    public Long getEnglishWordLimit() { return englishWordLimit; }
    public void setEnglishWordLimit(Long englishWordLimit) { this.englishWordLimit = englishWordLimit; }
    public Long getChineseCharacterLimit() { return chineseCharacterLimit; }
    public void setChineseCharacterLimit(Long chineseCharacterLimit) { this.chineseCharacterLimit = chineseCharacterLimit; }
    public Boolean getLimitEnabled() { return limitEnabled; }
    public void setLimitEnabled(Boolean limitEnabled) { this.limitEnabled = limitEnabled; }
    public LocalDateTime getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDateTime periodStart) { this.periodStart = periodStart; }
    public LocalDateTime getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDateTime periodEnd) { this.periodEnd = periodEnd; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserAiUsage that)) {
            return false;
        }
        return userId != null && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

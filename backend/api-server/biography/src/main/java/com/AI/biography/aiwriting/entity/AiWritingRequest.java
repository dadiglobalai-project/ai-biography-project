package com.AI.biography.aiwriting.entity;

import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import com.AI.biography.aiwriting.enums.AiWritingStatus;
import com.AI.biography.section.entity.BiographySection;
import com.AI.biography.user.User;
import com.AI.biography.website.BiographyWebsite;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "ai_writing_requests")
public class AiWritingRequest {
    private static final String DEFAULT_PROVIDER = "DEEPSEEK";
    private static final String DEFAULT_MODEL_NAME = "deepseek-v4-flash";

    @Id
    @Column(name = "request_id", columnDefinition = "CHAR(36)", length = 36)
    private String requestId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id", columnDefinition = "CHAR(36)")
    private BiographyWebsite website;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", columnDefinition = "CHAR(36)")
    private BiographySection section;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50)
    private AiWritingAction actionType;

    @Lob
    @Column(name = "source_text", columnDefinition = "TEXT")
    private String sourceText;

    @Lob
    @Column(name = "user_instruction", columnDefinition = "TEXT")
    private String userInstruction;

    @Column(name = "tone", length = 50)
    private String tone;

    @Enumerated(EnumType.STRING)
    @Column(name = "language", nullable = false, length = 20)
    private AiLanguage language;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private AiWritingStatus status;

    @Lob
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<AiWritingOutput> outputs = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (requestId == null) {
            requestId = UUID.randomUUID().toString();
        }
        if (provider == null) {
            provider = DEFAULT_PROVIDER;
        }
        if (modelName == null) {
            modelName = DEFAULT_MODEL_NAME;
        }
        if (status == null) {
            status = AiWritingStatus.PENDING;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public void addOutput(AiWritingOutput output) {
        outputs.add(output);
        output.setRequest(this);
    }

    public void removeOutput(AiWritingOutput output) {
        outputs.remove(output);
        output.setRequest(null);
    }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public BiographyWebsite getWebsite() { return website; }
    public void setWebsite(BiographyWebsite website) { this.website = website; }
    public BiographySection getSection() { return section; }
    public void setSection(BiographySection section) { this.section = section; }
    public AiWritingAction getActionType() { return actionType; }
    public void setActionType(AiWritingAction actionType) { this.actionType = actionType; }
    public String getSourceText() { return sourceText; }
    public void setSourceText(String sourceText) { this.sourceText = sourceText; }
    public String getUserInstruction() { return userInstruction; }
    public void setUserInstruction(String userInstruction) { this.userInstruction = userInstruction; }
    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }
    public AiLanguage getLanguage() { return language; }
    public void setLanguage(AiLanguage language) { this.language = language; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public AiWritingStatus getStatus() { return status; }
    public void setStatus(AiWritingStatus status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public List<AiWritingOutput> getOutputs() { return outputs; }
    public void setOutputs(List<AiWritingOutput> outputs) { this.outputs = outputs; }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AiWritingRequest that)) {
            return false;
        }
        return requestId != null && Objects.equals(requestId, that.requestId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

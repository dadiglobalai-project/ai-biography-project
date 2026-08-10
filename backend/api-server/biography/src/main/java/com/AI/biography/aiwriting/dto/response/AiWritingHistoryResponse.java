package com.AI.biography.aiwriting.dto.response;

import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import com.AI.biography.aiwriting.enums.AiWritingStatus;
import java.time.LocalDateTime;
import java.util.List;

public class AiWritingHistoryResponse {
    public String requestId;
    public String websiteId;
    public String sectionId;
    public AiWritingAction actionType;
    public AiWritingStatus status;
    public AiLanguage language;
    public String tone;
    public LocalDateTime createdAt;
    public LocalDateTime completedAt;
    public List<AiWritingOutputResponse> outputs;
}

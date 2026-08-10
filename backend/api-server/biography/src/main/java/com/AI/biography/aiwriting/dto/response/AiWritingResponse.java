package com.AI.biography.aiwriting.dto.response;

import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import java.time.LocalDateTime;

public class AiWritingResponse {
    public String requestId;
    public String outputId;
    public AiWritingAction actionType;
    public String generatedText;
    public AiLanguage language;
    public Integer englishWordCount;
    public Integer chineseCharacterCount;
    public Integer inputTokens;
    public Integer outputTokens;
    public Integer totalTokens;
    public LocalDateTime createdAt;
}

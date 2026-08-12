package com.AI.biography.aiwriting.dto.response;

import java.time.LocalDateTime;

public class AiWritingOutputResponse {
    public String outputId;
    public String generatedText;
    public Integer englishWordCount;
    public Integer chineseCharacterCount;
    public Integer inputTokens;
    public Integer outputTokens;
    public Integer totalTokens;
    public Boolean selected;
    public LocalDateTime createdAt;
}

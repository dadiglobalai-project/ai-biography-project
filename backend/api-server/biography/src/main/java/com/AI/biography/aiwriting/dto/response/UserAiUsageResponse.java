package com.AI.biography.aiwriting.dto.response;

import java.time.LocalDateTime;

public class UserAiUsageResponse {
    public Long englishWordsUsed;
    public Long englishWordLimit;
    public Long chineseCharactersUsed;
    public Long chineseCharacterLimit;
    public Boolean limitEnabled;
    public LocalDateTime periodStart;
    public LocalDateTime periodEnd;
    public Long englishWordsRemaining;
    public Long chineseCharactersRemaining;
}

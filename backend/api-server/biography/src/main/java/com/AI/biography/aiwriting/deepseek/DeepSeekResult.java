package com.AI.biography.aiwriting.deepseek;

public record DeepSeekResult(
        String generatedText,
        Integer inputTokens,
        Integer outputTokens,
        Integer totalTokens
) {
}

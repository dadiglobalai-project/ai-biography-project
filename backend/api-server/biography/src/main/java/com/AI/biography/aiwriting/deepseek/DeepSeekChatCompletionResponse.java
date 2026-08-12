package com.AI.biography.aiwriting.deepseek;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

record DeepSeekChatCompletionResponse(
        List<Choice> choices,
        Usage usage
) {
    record Choice(Message message) {
    }

    record Message(String role, String content) {
    }

    record Usage(
            @JsonProperty("prompt_tokens")
            Integer promptTokens,
            @JsonProperty("completion_tokens")
            Integer completionTokens,
            @JsonProperty("total_tokens")
            Integer totalTokens
    ) {
    }
}

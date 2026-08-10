package com.AI.biography.aiwriting.deepseek;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
record DeepSeekChatCompletionRequest(
        String model,
        List<DeepSeekMessage> messages,
        Double temperature,
        @JsonProperty("max_tokens")
        Integer maxTokens
) {
}

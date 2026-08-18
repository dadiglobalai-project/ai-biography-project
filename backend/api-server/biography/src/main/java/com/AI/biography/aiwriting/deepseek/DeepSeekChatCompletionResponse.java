package com.AI.biography.aiwriting.deepseek;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
record DeepSeekChatCompletionResponse(
        List<Choice> choices,
        Usage usage
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    record Choice(Message message) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Message(String role, String content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Usage(
            @JsonProperty("prompt_tokens")
            Integer promptTokens,
            @JsonProperty("completion_tokens")
            Integer completionTokens,
            @JsonProperty("total_tokens")
            Integer totalTokens,
            @JsonProperty("prompt_cache_hit_tokens")
            Integer promptCacheHitTokens,
            @JsonProperty("prompt_cache_miss_tokens")
            Integer promptCacheMissTokens,
            @JsonProperty("completion_tokens_details")
            CompletionTokensDetails completionTokensDetails
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record CompletionTokensDetails(
            @JsonProperty("reasoning_tokens")
            Integer reasoningTokens
    ) {
    }
}

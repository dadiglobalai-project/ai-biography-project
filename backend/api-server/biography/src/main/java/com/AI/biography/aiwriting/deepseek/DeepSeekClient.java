package com.AI.biography.aiwriting.deepseek;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Service
public class DeepSeekClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(DeepSeekClient.class);
    private static final String CHAT_COMPLETIONS_PATH = "/chat/completions";

    private final DeepSeekProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    public DeepSeekClient(DeepSeekProperties properties,
                          RestClient.Builder restClientBuilder,
                          ObjectMapper objectMapper,
                          Environment environment) {
        this.properties = properties;
        this.restClient = restClientBuilder.baseUrl(cleanBaseUrl(properties.getBaseUrl())).build();
        this.objectMapper = objectMapper;
        this.environment = environment;
    }

    public DeepSeekResult createChatCompletion(List<DeepSeekMessage> messages) {
        return createChatCompletion(messages, 0.7, null);
    }

    public DeepSeekResult createChatCompletion(List<DeepSeekMessage> messages, Double temperature, Integer maxTokens) {
        requireConfigured();
        if (messages == null || messages.isEmpty()) {
            throw new DeepSeekApiException("DeepSeek request messages must not be empty");
        }

        DeepSeekChatCompletionRequest request = new DeepSeekChatCompletionRequest(
                properties.getModel(),
                messages,
                temperature,
                maxTokens
        );

        try {
            DeepSeekChatCompletionResponse response = restClient.post()
                    .uri(CHAT_COMPLETIONS_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiKey())
                    .body(request)
                    .exchange((httpRequest, httpResponse) -> parseResponse(httpResponse, request));

            return toResult(response);
        } catch (DeepSeekApiException e) {
            throw e;
        } catch (RestClientException e) {
            throw new DeepSeekApiException("DeepSeek request failed due to a network or client error", e);
        }
    }

    private DeepSeekChatCompletionResponse parseResponse(ClientHttpResponse response,
                                                         DeepSeekChatCompletionRequest request) throws IOException {
        String body = new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
        if (response.getStatusCode().isError()) {
            throw apiException(response.getStatusCode().value(), body);
        }
        if (!StringUtils.hasText(body)) {
            throw new DeepSeekApiException("DeepSeek returned an empty response");
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            DeepSeekChatCompletionResponse mappedResponse = objectMapper.treeToValue(root, DeepSeekChatCompletionResponse.class);
            logDevelopmentUsageDiagnostics(root, mappedResponse, request);
            return mappedResponse;
        } catch (JsonProcessingException e) {
            throw new DeepSeekApiException("DeepSeek returned a malformed response", e);
        }
    }

    private DeepSeekResult toResult(DeepSeekChatCompletionResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new DeepSeekApiException("DeepSeek returned no generated content");
        }

        DeepSeekChatCompletionResponse.Message message = response.choices().getFirst().message();
        if (message == null || !StringUtils.hasText(message.content())) {
            throw new DeepSeekApiException("DeepSeek returned empty generated content");
        }

        DeepSeekChatCompletionResponse.Usage usage = response.usage();
        return new DeepSeekResult(
                message.content(),
                usage == null ? null : usage.promptTokens(),
                usage == null ? null : usage.completionTokens(),
                usage == null ? null : usage.totalTokens()
        );
    }

    private DeepSeekApiException apiException(int statusCode, String responseBody) {
        String message = switch (statusCode) {
            case 401, 403 -> "DeepSeek authentication failed";
            case 429 -> "DeepSeek rate limit exceeded";
            default -> statusCode >= 500
                    ? "DeepSeek service is temporarily unavailable"
                    : "DeepSeek request failed with status " + statusCode;
        };
        if (StringUtils.hasText(responseBody)) {
            return new DeepSeekApiException(message + ": " + safeResponseSnippet(responseBody));
        }
        return new DeepSeekApiException(message);
    }

    private String safeResponseSnippet(String value) {
        String cleaned = value.replaceAll("(?i)bearer\\s+[A-Za-z0-9._~+/=-]+", "Bearer [redacted]");
        return cleaned.length() > 300 ? cleaned.substring(0, 300) : cleaned;
    }

    private void requireConfigured() {
        if (!StringUtils.hasText(properties.getBaseUrl()) || !StringUtils.hasText(properties.getModel())) {
            throw new DeepSeekApiException("DeepSeek is not configured");
        }
        if (!StringUtils.hasText(properties.getApiKey())) {
            throw new DeepSeekApiException("DeepSeek API key is not configured");
        }
    }

    private String cleanBaseUrl(String baseUrl) {
        return baseUrl == null ? "" : baseUrl.replaceAll("/+$", "");
    }

    private void logDevelopmentUsageDiagnostics(JsonNode root,
                                                DeepSeekChatCompletionResponse response,
                                                DeepSeekChatCompletionRequest request) {
        if (!isDevelopmentProfileActive()) {
            return;
        }
        JsonNode usage = root.path("usage");
        if (usage.isMissingNode() || usage.isNull()) {
            LOGGER.info(
                    "DeepSeek usage diagnostics model={} thinking={} promptTokens={} completionTokens={} reasoningTokens={} visibleCompletionTokens={} totalTokens={} promptCacheHitTokens={} promptCacheMissTokens={} rawUsage=null",
                    root.path("model").asText(request.model()),
                    thinkingSetting(),
                    null,
                    null,
                    "not_provided",
                    "unknown",
                    null,
                    null,
                    null
            );
            return;
        }
        DeepSeekChatCompletionResponse.Usage mappedUsage = response == null ? null : response.usage();
        Integer promptTokens = mappedUsage == null ? null : mappedUsage.promptTokens();
        Integer completionTokens = mappedUsage == null ? null : mappedUsage.completionTokens();
        Integer totalTokens = mappedUsage == null ? null : mappedUsage.totalTokens();
        Integer reasoningTokens = reasoningTokens(mappedUsage);
        Object visibleCompletionTokens = completionTokens != null && reasoningTokens != null
                ? completionTokens - reasoningTokens
                : "unknown";

        LOGGER.info(
                "DeepSeek usage diagnostics model={} thinking={} promptTokens={} completionTokens={} reasoningTokens={} visibleCompletionTokens={} totalTokens={} promptCacheHitTokens={} promptCacheMissTokens={} rawUsage={}",
                root.path("model").asText(request.model()),
                thinkingSetting(),
                promptTokens,
                completionTokens,
                reasoningTokens == null ? "not_provided" : reasoningTokens,
                visibleCompletionTokens,
                totalTokens,
                mappedUsage == null ? null : mappedUsage.promptCacheHitTokens(),
                mappedUsage == null ? null : mappedUsage.promptCacheMissTokens(),
                usage
        );
    }

    private Integer reasoningTokens(DeepSeekChatCompletionResponse.Usage usage) {
        if (usage == null || usage.completionTokensDetails() == null) {
            return null;
        }
        return usage.completionTokensDetails().reasoningTokens();
    }

    private String thinkingSetting() {
        return "omitted";
    }

    private boolean isDevelopmentProfileActive() {
        return Arrays.stream(environment.getActiveProfiles())
                .map(String::toLowerCase)
                .anyMatch(profile -> profile.equals("dev")
                        || profile.equals("development")
                        || profile.equals("local"));
    }
}

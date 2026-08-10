package com.AI.biography.aiwriting.deepseek;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class DeepSeekClientTest {
    private MockRestServiceServer server;
    private DeepSeekClient client;

    @BeforeEach
    void setUp() {
        DeepSeekProperties properties = new DeepSeekProperties();
        properties.setBaseUrl("https://api.deepseek.test");
        properties.setApiKey("test-api-key");
        properties.setModel("deepseek-v4-flash");

        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new DeepSeekClient(properties, builder, new ObjectMapper());
    }

    @Test
    void createChatCompletionReturnsGeneratedTextAndTokenUsage() {
        server.expect(once(), requestTo("https://api.deepseek.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer test-api-key"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                          "model": "deepseek-v4-flash",
                          "messages": [
                            {
                              "role": "user",
                              "content": "Write a biography intro."
                            }
                          ],
                          "temperature": 0.7
                        }
                        """))
                .andRespond(withSuccess("""
                        {
                          "choices": [
                            {
                              "message": {
                                "role": "assistant",
                                "content": "Generated biography content."
                              }
                            }
                          ],
                          "usage": {
                            "prompt_tokens": 12,
                            "completion_tokens": 34,
                            "total_tokens": 46
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        DeepSeekResult result = client.createChatCompletion(List.of(
                new DeepSeekMessage("user", "Write a biography intro.")
        ));

        assertThat(result.generatedText()).isEqualTo("Generated biography content.");
        assertThat(result.inputTokens()).isEqualTo(12);
        assertThat(result.outputTokens()).isEqualTo(34);
        assertThat(result.totalTokens()).isEqualTo(46);
        server.verify();
    }

    @Test
    void createChatCompletionRejectsEmptyDeepSeekResponse() {
        server.expect(once(), requestTo("https://api.deepseek.test/chat/completions"))
                .andRespond(withSuccess("", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.createChatCompletion(List.of(new DeepSeekMessage("user", "Hello"))))
                .isInstanceOf(DeepSeekApiException.class)
                .hasMessageContaining("empty response");

        server.verify();
    }

    @Test
    void createChatCompletionConvertsAuthenticationErrors() {
        server.expect(once(), requestTo("https://api.deepseek.test/chat/completions"))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":{\"message\":\"invalid api key\"}}"));

        assertThatThrownBy(() -> client.createChatCompletion(List.of(new DeepSeekMessage("user", "Hello"))))
                .isInstanceOf(DeepSeekApiException.class)
                .hasMessageContaining("authentication failed")
                .hasMessageNotContaining("test-api-key");

        server.verify();
    }

    @Test
    void createChatCompletionRejectsMissingGeneratedContent() {
        server.expect(once(), requestTo("https://api.deepseek.test/chat/completions"))
                .andRespond(withSuccess("""
                        {
                          "choices": [
                            {
                              "message": {
                                "role": "assistant",
                                "content": ""
                              }
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.createChatCompletion(List.of(new DeepSeekMessage("user", "Hello"))))
                .isInstanceOf(DeepSeekApiException.class)
                .hasMessageContaining("empty generated content");

        server.verify();
    }
}

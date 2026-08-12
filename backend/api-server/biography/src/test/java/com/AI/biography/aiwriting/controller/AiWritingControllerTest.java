package com.AI.biography.aiwriting.controller;

import com.AI.biography.aiwriting.deepseek.DeepSeekApiException;
import com.AI.biography.aiwriting.dto.request.AiWritingGenerateRequest;
import com.AI.biography.aiwriting.dto.response.AiWritingResponse;
import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import com.AI.biography.aiwriting.exception.AiWritingExceptionHandler;
import com.AI.biography.aiwriting.service.AiWritingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AiWritingControllerTest {
    private AiWritingService aiWritingService;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        aiWritingService = mock(AiWritingService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new AiWritingController(aiWritingService))
                .setControllerAdvice(new AiWritingExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void generateReturnsSuccessWhenServiceSucceeds() throws Exception {
        AiWritingResponse response = new AiWritingResponse();
        response.requestId = "request-1";
        response.outputId = "output-1";
        response.actionType = AiWritingAction.GENERATE;
        response.generatedText = "Generated content";
        response.language = AiLanguage.ENGLISH;
        response.englishWordCount = 2;
        response.chineseCharacterCount = 0;
        response.inputTokens = 10;
        response.outputTokens = 20;
        response.totalTokens = 30;
        response.createdAt = LocalDateTime.of(2026, 8, 7, 10, 0);
        when(aiWritingService.generate(any(AiWritingGenerateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/ai-writing/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(generateRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value("request-1"))
                .andExpect(jsonPath("$.outputId").value("output-1"))
                .andExpect(jsonPath("$.generatedText").value("Generated content"))
                .andExpect(jsonPath("$.englishWordCount").value(2));

        verify(aiWritingService).generate(any(AiWritingGenerateRequest.class));
    }

    @Test
    void invalidRequestBodyReturnsBadRequest() throws Exception {
        AiWritingGenerateRequest request = generateRequest();
        request.actionType = null;

        mockMvc.perform(post("/api/ai-writing/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void providerFailureMapsToBadGateway() throws Exception {
        when(aiWritingService.generate(any(AiWritingGenerateRequest.class)))
                .thenThrow(new DeepSeekApiException("DeepSeek authentication failed"));

        mockMvc.perform(post("/api/ai-writing/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(generateRequest())))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.message").value("AI writing provider request failed"));
    }

    private AiWritingGenerateRequest generateRequest() {
        AiWritingGenerateRequest request = new AiWritingGenerateRequest();
        request.websiteId = "website-1";
        request.sectionId = "section-1";
        request.actionType = AiWritingAction.GENERATE;
        request.userInstruction = "Write an intro.";
        request.language = AiLanguage.ENGLISH;
        return request;
    }
}

package com.AI.biography.aiwriting.service;

import com.AI.biography.aiwriting.deepseek.DeepSeekApiException;
import com.AI.biography.aiwriting.deepseek.DeepSeekClient;
import com.AI.biography.aiwriting.deepseek.DeepSeekMessage;
import com.AI.biography.aiwriting.deepseek.DeepSeekProperties;
import com.AI.biography.aiwriting.deepseek.DeepSeekResult;
import com.AI.biography.aiwriting.dto.request.AiWritingGenerateRequest;
import com.AI.biography.aiwriting.dto.response.AiWritingResponse;
import com.AI.biography.aiwriting.entity.AiWritingOutput;
import com.AI.biography.aiwriting.entity.AiWritingRequest;
import com.AI.biography.aiwriting.entity.UserAiUsage;
import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import com.AI.biography.aiwriting.enums.AiWritingStatus;
import com.AI.biography.aiwriting.prompt.AiWritingPromptBuilder;
import com.AI.biography.aiwriting.repository.AiWritingOutputRepository;
import com.AI.biography.aiwriting.repository.AiWritingRequestRepository;
import com.AI.biography.aiwriting.repository.UserAiUsageRepository;
import com.AI.biography.section.entity.BiographySection;
import com.AI.biography.section.exception.BadRequestException;
import com.AI.biography.section.exception.NotFoundException;
import com.AI.biography.section.repository.BiographySectionRepository;
import com.AI.biography.user.User;
import com.AI.biography.user.UserRepository;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiWritingServiceTest {
    private static final String USER_ID = "user-1";
    private static final String WEBSITE_ID = "website-1";
    private static final String SECTION_ID = "section-1";

    @Mock
    private AiWritingRequestRepository requestRepository;
    @Mock
    private AiWritingOutputRepository outputRepository;
    @Mock
    private UserAiUsageRepository usageRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BiographyWebsiteRepository websiteRepository;
    @Mock
    private BiographySectionRepository sectionRepository;
    @Mock
    private AiWritingPromptBuilder promptBuilder;
    @Mock
    private DeepSeekClient deepSeekClient;
    @Mock
    private PlatformTransactionManager transactionManager;

    private AiWritingService service;
    private User user;
    private BiographyWebsite website;
    private BiographySection section;
    private AtomicReference<AiWritingRequest> savedRequest;

    @BeforeEach
    void setUp() {
        DeepSeekProperties properties = new DeepSeekProperties();
        properties.setModel("deepseek-v4-flash");
        service = new AiWritingService(
                requestRepository,
                outputRepository,
                usageRepository,
                userRepository,
                websiteRepository,
                sectionRepository,
                promptBuilder,
                deepSeekClient,
                properties,
                new AiWritingUsageCounter(),
                transactionManager
        );

        user = new User();
        user.setUserId(USER_ID);
        user.setEmail("user@example.com");

        website = new BiographyWebsite();
        website.setWebsiteId(WEBSITE_ID);
        website.setUserId(USER_ID);

        section = new BiographySection();
        section.setSectionId(SECTION_ID);
        section.setWebsite(website);

        savedRequest = new AtomicReference<>();
        lenient().when(requestRepository.save(any(AiWritingRequest.class))).thenAnswer(invocation -> {
            AiWritingRequest request = invocation.getArgument(0);
            request.prePersist();
            savedRequest.set(request);
            return request;
        });
        lenient().when(outputRepository.save(any(AiWritingOutput.class))).thenAnswer(invocation -> {
            AiWritingOutput output = invocation.getArgument(0);
            output.prePersist();
            return output;
        });
        lenient().when(transactionManager.getTransaction(any())).thenReturn(new SimpleTransactionStatus());
    }

    @Test
    void generateCompletesGenerateRequest() {
        AiWritingGenerateRequest request = generateRequest();
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.empty());
        when(usageRepository.findWithLockByUserId(USER_ID)).thenReturn(Optional.of(existingUsage(false, 0, 0, 1, 1)));
        when(promptBuilder.buildPrompt(request)).thenReturn("prompt");
        when(deepSeekClient.createChatCompletion(any())).thenReturn(new DeepSeekResult("A graceful biography intro.", 3, 4, 7));

        AiWritingResponse response = service.generate(USER_ID, request);

        assertThat(response.generatedText).isEqualTo("A graceful biography intro.");
        assertThat(response.englishWordCount).isEqualTo(4);
        assertThat(response.chineseCharacterCount).isZero();
        assertThat(savedRequest.get().getStatus()).isEqualTo(AiWritingStatus.COMPLETED);
        assertThat(savedRequest.get().getCompletedAt()).isNotNull();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<DeepSeekMessage>> messagesCaptor = ArgumentCaptor.forClass(List.class);
        verify(deepSeekClient).createChatCompletion(messagesCaptor.capture());
        assertThat(messagesCaptor.getValue())
                .extracting(DeepSeekMessage::role)
                .containsExactly("system", "user");
        assertThat(messagesCaptor.getValue().get(0).content())
                .contains("Factual accuracy and no invented biography facts")
                .contains("Preserve narrative perspective and pronouns")
                .contains("The additional direction and tone must not change narrative perspective unless they explicitly request a perspective change")
                .contains("The length and detail of the generated response must be proportional to the amount of factual information provided")
                .contains("Do not infer a person's internal state")
                .contains("Return only the final biography text intended for the editor");
        assertThat(messagesCaptor.getValue().get(1).content()).isEqualTo("prompt");
    }

    @Test
    void rewriteRequiresAndUsesSourceText() {
        AiWritingGenerateRequest request = rewriteRequest("Original sentence.");
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.empty());
        when(usageRepository.findWithLockByUserId(USER_ID)).thenReturn(Optional.of(existingUsage(false, 0, 0, 1, 1)));
        when(promptBuilder.buildPrompt(request)).thenReturn("rewrite prompt");
        when(deepSeekClient.createChatCompletion(any())).thenReturn(new DeepSeekResult("Rewritten sentence.", null, null, null));

        AiWritingResponse response = service.generate(USER_ID, request);

        assertThat(response.actionType).isEqualTo(AiWritingAction.REWRITE);
        assertThat(response.generatedText).isEqualTo("Rewritten sentence.");
        assertThat(savedRequest.get().getSourceText()).isEqualTo("Original sentence.");
    }

    @Test
    void generatedTextRemovesForbiddenMetaCommentaryBeforeReturning() {
        AiWritingGenerateRequest request = generateRequest();
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.empty());
        when(usageRepository.findWithLockByUserId(USER_ID)).thenReturn(Optional.of(existingUsage(false, 0, 0, 1, 1)));
        when(promptBuilder.buildPrompt(request)).thenReturn("prompt");
        when(deepSeekClient.createChatCompletion(any())).thenReturn(new DeepSeekResult("""
                Her story began in a home filled with patience and care.
                Additional direction applied: Make it warmer in tone
                A second sentence. This can introduce the story with warmth, context, and a clear sense of legacy.
                This detail adds depth to the biography by showing her character.
                """, null, null, null));

        AiWritingResponse response = service.generate(USER_ID, request);

        assertThat(response.generatedText)
                .isEqualTo("Her story began in a home filled with patience and care.")
                .doesNotContain("Additional direction applied:")
                .doesNotContain("Make it warmer in tone")
                .doesNotContain("This can introduce")
                .doesNotContain("This detail adds depth");
    }

    @Test
    void sourceTextIsRequiredForRewrite() {
        AiWritingGenerateRequest request = rewriteRequest("");

        assertThatThrownBy(() -> service.generate(USER_ID, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Source text is required");

        verify(requestRepository, never()).save(any());
        verify(deepSeekClient, never()).createChatCompletion(any());
    }

    @Test
    void rejectsWebsiteNotOwnedByUser() {
        AiWritingGenerateRequest request = generateRequest();
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.generate(USER_ID, request))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Website not found");

        verify(requestRepository, never()).save(any());
        verify(deepSeekClient, never()).createChatCompletion(any());
    }

    @Test
    void deepSeekFailureMarksRequestFailed() {
        AiWritingGenerateRequest request = generateRequest();
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.empty());
        when(promptBuilder.buildPrompt(request)).thenReturn("prompt");
        when(deepSeekClient.createChatCompletion(any())).thenThrow(new DeepSeekApiException("DeepSeek rate limit exceeded"));
        when(requestRepository.findById(any())).thenAnswer(invocation -> Optional.of(savedRequest.get()));

        assertThatThrownBy(() -> service.generate(USER_ID, request))
                .isInstanceOf(DeepSeekApiException.class);

        assertThat(savedRequest.get().getStatus()).isEqualTo(AiWritingStatus.FAILED);
        assertThat(savedRequest.get().getErrorMessage()).contains("rate limit");
        assertThat(savedRequest.get().getCompletedAt()).isNotNull();
    }

    @Test
    void failedGenerationDoesNotIncrementUsage() {
        AiWritingGenerateRequest request = generateRequest();
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.empty());
        when(promptBuilder.buildPrompt(request)).thenReturn("prompt");
        when(deepSeekClient.createChatCompletion(any())).thenThrow(new DeepSeekApiException("DeepSeek authentication failed"));
        when(requestRepository.findById(any())).thenAnswer(invocation -> Optional.of(savedRequest.get()));

        assertThatThrownBy(() -> service.generate(USER_ID, request))
                .isInstanceOf(DeepSeekApiException.class);

        verify(usageRepository, never()).findWithLockByUserId(USER_ID);
        verify(usageRepository, never()).save(any(UserAiUsage.class));
    }

    @Test
    void successfulGenerationIncrementsUsage() {
        AiWritingGenerateRequest request = generateRequest();
        UserAiUsage usage = existingUsage(false, 10, 2, 100000, 200000);
        usage.markNotNew();
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.of(usage));
        when(usageRepository.findWithLockByUserId(USER_ID)).thenReturn(Optional.of(usage));
        when(promptBuilder.buildPrompt(request)).thenReturn("prompt");
        when(deepSeekClient.createChatCompletion(any())).thenReturn(new DeepSeekResult("Four English words here 中文", null, null, null));

        service.generate(USER_ID, request);

        assertThat(usage.getEnglishWordsUsed()).isEqualTo(14);
        assertThat(usage.getChineseCharactersUsed()).isEqualTo(4);
        assertThat(usage.isNew()).isFalse();
        verify(usageRepository).findWithLockByUserId(USER_ID);
        verify(usageRepository).save(usage);
    }

    @Test
    void createsUsageWhenMissing() {
        AiWritingGenerateRequest request = generateRequest();
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.empty());
        when(usageRepository.findWithLockByUserId(USER_ID)).thenReturn(Optional.empty());
        when(promptBuilder.buildPrompt(request)).thenReturn("prompt");
        when(deepSeekClient.createChatCompletion(any())).thenReturn(new DeepSeekResult("Two words", null, null, null));

        service.generate(USER_ID, request);

        ArgumentCaptor<UserAiUsage> captor = ArgumentCaptor.forClass(UserAiUsage.class);
        verify(usageRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(USER_ID);
        assertThat(captor.getValue().isNew()).isTrue();
        assertThat(captor.getValue().getEnglishWordsUsed()).isEqualTo(2);
        assertThat(captor.getValue().getChineseCharactersUsed()).isZero();
        assertThat(captor.getValue().getEnglishWordLimit()).isEqualTo(100000);
        assertThat(captor.getValue().getChineseCharacterLimit()).isEqualTo(200000);
        assertThat(captor.getValue().getLimitEnabled()).isFalse();
    }

    @Test
    void limitDisabledAllowsGenerationDespiteQuotaValues() {
        AiWritingGenerateRequest request = generateRequest();
        UserAiUsage usage = existingUsage(false, 100000, 200000, 100000, 200000);
        usage.markNotNew();
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.of(usage));
        when(usageRepository.findWithLockByUserId(USER_ID)).thenReturn(Optional.of(usage));
        when(promptBuilder.buildPrompt(request)).thenReturn("prompt");
        when(deepSeekClient.createChatCompletion(any())).thenReturn(new DeepSeekResult("Still allowed", null, null, null));

        AiWritingResponse response = service.generate(USER_ID, request);

        assertThat(response.generatedText).isEqualTo("Still allowed");
    }

    @Test
    void usageUpdateUsesPessimisticLockBeforeSavingCounters() {
        AiWritingGenerateRequest request = generateRequest();
        UserAiUsage usage = existingUsage(false, 1, 1, 100000, 200000);
        usage.markNotNew();
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.of(usage));
        when(usageRepository.findWithLockByUserId(USER_ID)).thenReturn(Optional.of(usage));
        when(promptBuilder.buildPrompt(request)).thenReturn("prompt");
        when(deepSeekClient.createChatCompletion(any())).thenReturn(new DeepSeekResult("Three more words", null, null, null));

        service.generate(USER_ID, request);

        verify(usageRepository).findWithLockByUserId(USER_ID);
        verify(usageRepository).save(usage);
        assertThat(usage.getEnglishWordsUsed()).isEqualTo(4);
    }

    @Test
    void limitEnabledRejectsAlreadyExhaustedQuotaBeforeDeepSeekCall() {
        AiWritingGenerateRequest request = generateRequest();
        UserAiUsage usage = existingUsage(true, 100000, 0, 100000, 200000);
        arrangeOwnedWebsiteAndSection();
        when(usageRepository.findById(USER_ID)).thenReturn(Optional.of(usage));

        assertThatThrownBy(() -> service.generate(USER_ID, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("quota exhausted");

        verify(requestRepository, never()).save(any());
        verify(deepSeekClient, never()).createChatCompletion(any());
    }

    private void arrangeOwnedWebsiteAndSection() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(websiteRepository.findByWebsiteIdAndUserId(WEBSITE_ID, USER_ID)).thenReturn(Optional.of(website));
        when(sectionRepository.findBySectionIdAndWebsiteWebsiteId(SECTION_ID, WEBSITE_ID)).thenReturn(Optional.of(section));
    }

    private AiWritingGenerateRequest generateRequest() {
        AiWritingGenerateRequest request = new AiWritingGenerateRequest();
        request.websiteId = WEBSITE_ID;
        request.sectionId = SECTION_ID;
        request.actionType = AiWritingAction.GENERATE;
        request.userInstruction = "Write an intro.";
        request.language = AiLanguage.ENGLISH;
        return request;
    }

    private AiWritingGenerateRequest rewriteRequest(String sourceText) {
        AiWritingGenerateRequest request = generateRequest();
        request.actionType = AiWritingAction.REWRITE;
        request.sourceText = sourceText;
        return request;
    }

    private UserAiUsage existingUsage(boolean limitEnabled,
                                      long englishWordsUsed,
                                      long chineseCharactersUsed,
                                      long englishWordLimit,
                                      long chineseCharacterLimit) {
        UserAiUsage usage = new UserAiUsage();
        usage.setUserId(USER_ID);
        usage.setUser(user);
        usage.setEnglishWordsUsed(englishWordsUsed);
        usage.setChineseCharactersUsed(chineseCharactersUsed);
        usage.setEnglishWordLimit(englishWordLimit);
        usage.setChineseCharacterLimit(chineseCharacterLimit);
        usage.setLimitEnabled(limitEnabled);
        return usage;
    }
}

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
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class AiWritingService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AiWritingService.class);
    private static final String DEEPSEEK_PROVIDER = "DEEPSEEK";
    private static final Pattern FORBIDDEN_META_LINE = Pattern.compile(
            "(?i)(Additional direction applied:|This can introduce\\b|This detail adds depth\\b|In this chapter\\b)"
    );

    private final AiWritingRequestRepository requestRepository;
    private final AiWritingOutputRepository outputRepository;
    private final UserAiUsageRepository usageRepository;
    private final UserRepository userRepository;
    private final BiographyWebsiteRepository websiteRepository;
    private final BiographySectionRepository sectionRepository;
    private final AiWritingPromptBuilder promptBuilder;
    private final DeepSeekClient deepSeekClient;
    private final DeepSeekProperties deepSeekProperties;
    private final AiWritingUsageCounter usageCounter;
    private final TransactionTemplate transactionTemplate;

    public AiWritingService(AiWritingRequestRepository requestRepository,
                            AiWritingOutputRepository outputRepository,
                            UserAiUsageRepository usageRepository,
                            UserRepository userRepository,
                            BiographyWebsiteRepository websiteRepository,
                            BiographySectionRepository sectionRepository,
                            AiWritingPromptBuilder promptBuilder,
                            DeepSeekClient deepSeekClient,
                            DeepSeekProperties deepSeekProperties,
                            AiWritingUsageCounter usageCounter,
                            PlatformTransactionManager transactionManager) {
        this.requestRepository = requestRepository;
        this.outputRepository = outputRepository;
        this.usageRepository = usageRepository;
        this.userRepository = userRepository;
        this.websiteRepository = websiteRepository;
        this.sectionRepository = sectionRepository;
        this.promptBuilder = promptBuilder;
        this.deepSeekClient = deepSeekClient;
        this.deepSeekProperties = deepSeekProperties;
        this.usageCounter = usageCounter;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    public AiWritingResponse generate(AiWritingGenerateRequest request) {
        return generate(currentUserId(), request);
    }

    public AiWritingResponse generate(String userId, AiWritingGenerateRequest request) {
        requireAuthenticated(userId);
        validateRequest(request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        BiographyWebsite website = resolveWebsite(userId, request.websiteId);
        BiographySection section = resolveSection(website, request.sectionId);

        rejectIfQuotaAlreadyExhausted(user.getUserId(), request.language);

        AiWritingRequest aiRequest = createRequest(user, website, section, request);
        aiRequest = requestRepository.save(aiRequest);
        String requestId = aiRequest.getRequestId();

        try {
            aiRequest.setStatus(AiWritingStatus.PROCESSING);
            aiRequest = requestRepository.save(aiRequest);

            String prompt = promptBuilder.buildPrompt(request);
            DeepSeekResult result = deepSeekClient.createChatCompletion(List.of(
                    new DeepSeekMessage("system", AiWritingPromptBuilder.SYSTEM_PROMPT),
                    new DeepSeekMessage("user", prompt)
            ));
            String generatedText = requireGeneratedText(result);
            AiWritingUsageCounter.UsageCount usage = usageCounter.count(generatedText);

            incrementUsage(user, usage);

            AiWritingOutput output = createOutput(aiRequest, result, generatedText, usage);
            output = outputRepository.save(output);

            aiRequest.setStatus(AiWritingStatus.COMPLETED);
            aiRequest.setCompletedAt(LocalDateTime.now());
            requestRepository.save(aiRequest);

            return mapResponse(aiRequest, output);
        } catch (DeepSeekApiException e) {
            markFailed(requestId, safeProviderMessage(e));
            throw e;
        } catch (RuntimeException e) {
            markFailed(requestId, safeApplicationMessage(e));
            throw e;
        }
    }

    private void requireAuthenticated(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new BadRequestException("Unauthorized request");
        }
    }

    private String currentUserId() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            throw new BadRequestException("Unauthorized request");
        }
        HttpServletRequest request = attributes.getRequest();
        Object userId = request.getAttribute("userId");
        if (!(userId instanceof String value) || !StringUtils.hasText(value)) {
            throw new BadRequestException("Unauthorized request");
        }
        return value;
    }

    private void validateRequest(AiWritingGenerateRequest request) {
        if (request == null) {
            throw new BadRequestException("AI writing request is required");
        }
        if (request.actionType == null) {
            throw new BadRequestException("AI writing action is required");
        }
        if (request.language == null) {
            throw new BadRequestException("AI writing language is required");
        }
        if (requiresSourceText(request.actionType) && !StringUtils.hasText(request.sourceText)) {
            throw new BadRequestException("Source text is required for " + request.actionType);
        }
        if (request.actionType == AiWritingAction.CHANGE_TONE && !StringUtils.hasText(request.tone)) {
            throw new BadRequestException("Tone is required for CHANGE_TONE");
        }
        if (request.actionType == AiWritingAction.GENERATE
                && !StringUtils.hasText(request.userInstruction)
                && !StringUtils.hasText(request.sourceText)) {
            throw new BadRequestException("User instruction or source text is required for GENERATE");
        }
    }

    private boolean requiresSourceText(AiWritingAction actionType) {
        return switch (actionType) {
            case REWRITE, IMPROVE_GRAMMAR, EXPAND, SHORTEN, SUMMARIZE, CHANGE_TONE, TRANSLATE -> true;
            case GENERATE -> false;
        };
    }

    private BiographyWebsite resolveWebsite(String userId, String websiteId) {
        if (!StringUtils.hasText(websiteId)) {
            return null;
        }
        return websiteRepository.findByWebsiteIdAndUserId(websiteId, userId)
                .orElseThrow(() -> new NotFoundException("Website not found"));
    }

    private BiographySection resolveSection(BiographyWebsite website, String sectionId) {
        if (!StringUtils.hasText(sectionId)) {
            return null;
        }
        if (website == null) {
            throw new BadRequestException("websiteId is required when sectionId is provided");
        }
        return sectionRepository.findBySectionIdAndWebsiteWebsiteId(sectionId, website.getWebsiteId())
                .orElseThrow(() -> new NotFoundException("Section not found"));
    }

    private AiWritingRequest createRequest(User user,
                                           BiographyWebsite website,
                                           BiographySection section,
                                           AiWritingGenerateRequest request) {
        AiWritingRequest aiRequest = new AiWritingRequest();
        aiRequest.setUser(user);
        aiRequest.setWebsite(website);
        aiRequest.setSection(section);
        aiRequest.setActionType(request.actionType);
        aiRequest.setSourceText(request.sourceText);
        aiRequest.setUserInstruction(request.userInstruction);
        aiRequest.setTone(request.tone);
        aiRequest.setLanguage(request.language);
        aiRequest.setProvider(DEEPSEEK_PROVIDER);
        aiRequest.setModelName(deepSeekProperties.getModel());
        aiRequest.setStatus(AiWritingStatus.PENDING);
        return aiRequest;
    }

    private String requireGeneratedText(DeepSeekResult result) {
        if (result == null || !StringUtils.hasText(result.generatedText())) {
            throw new DeepSeekApiException("DeepSeek returned empty generated content");
        }
        String generatedText = removeForbiddenMetaLines(result.generatedText());
        if (!StringUtils.hasText(generatedText)) {
            throw new DeepSeekApiException("DeepSeek returned empty generated content");
        }
        return generatedText;
    }

    private String removeForbiddenMetaLines(String generatedText) {
        return Arrays.stream(generatedText.strip().split("\\R"))
                .filter(line -> !FORBIDDEN_META_LINE.matcher(line).find())
                .reduce((first, second) -> first + System.lineSeparator() + second)
                .orElse("")
                .trim();
    }

    private AiWritingOutput createOutput(AiWritingRequest aiRequest,
                                         DeepSeekResult result,
                                         String generatedText,
                                         AiWritingUsageCounter.UsageCount usage) {
        AiWritingOutput output = new AiWritingOutput();
        output.setRequest(aiRequest);
        output.setGeneratedText(generatedText);
        output.setEnglishWordCount(usage.englishWordCount());
        output.setChineseCharacterCount(usage.chineseCharacterCount());
        output.setInputTokens(result.inputTokens());
        output.setOutputTokens(result.outputTokens());
        output.setTotalTokens(result.totalTokens());
        output.setSelected(true);
        return output;
    }

    private void rejectIfQuotaAlreadyExhausted(String userId, AiLanguage language) {
        usageRepository.findById(userId).ifPresent(usage -> {
            if (!Boolean.TRUE.equals(usage.getLimitEnabled())) {
                return;
            }
            if ((language == AiLanguage.ENGLISH || language == AiLanguage.MIXED)
                    && usage.getEnglishWordsUsed() >= usage.getEnglishWordLimit()) {
                throw new BadRequestException("English AI writing quota exhausted");
            }
            if ((language == AiLanguage.CHINESE || language == AiLanguage.MIXED)
                    && usage.getChineseCharactersUsed() >= usage.getChineseCharacterLimit()) {
                throw new BadRequestException("Chinese AI writing quota exhausted");
            }
        });
    }

    private void incrementUsage(User user, AiWritingUsageCounter.UsageCount count) {
        try {
            doIncrementUsage(user, count);
        } catch (DataIntegrityViolationException e) {
            doIncrementUsage(user, count);
        }
    }

    private void doIncrementUsage(User user, AiWritingUsageCounter.UsageCount count) {
        transactionTemplate.executeWithoutResult(status -> {
            UserAiUsage usage = usageRepository.findWithLockByUserId(user.getUserId())
                    .orElseGet(() -> newUsage(user));
            long englishWordsUsed = usage.getEnglishWordsUsed() + count.englishWordCount();
            long chineseCharactersUsed = usage.getChineseCharactersUsed() + count.chineseCharacterCount();

            if (Boolean.TRUE.equals(usage.getLimitEnabled())) {
                validateQuota(usage, englishWordsUsed, chineseCharactersUsed);
            }

            usage.setEnglishWordsUsed(englishWordsUsed);
            usage.setChineseCharactersUsed(chineseCharactersUsed);
            usageRepository.save(usage);
        });
    }

    private UserAiUsage newUsage(User user) {
        UserAiUsage usage = new UserAiUsage();
        usage.setUserId(user.getUserId());
        usage.setUser(user);
        usage.setEnglishWordsUsed(0L);
        usage.setChineseCharactersUsed(0L);
        usage.setEnglishWordLimit(100000L);
        usage.setChineseCharacterLimit(200000L);
        usage.setLimitEnabled(false);
        return usage;
    }

    private void validateQuota(UserAiUsage usage, long englishWordsUsed, long chineseCharactersUsed) {
        if (englishWordsUsed > usage.getEnglishWordLimit()) {
            throw new BadRequestException("English AI writing quota exceeded");
        }
        if (chineseCharactersUsed > usage.getChineseCharacterLimit()) {
            throw new BadRequestException("Chinese AI writing quota exceeded");
        }
    }

    private void markFailed(String requestId, String message) {
        try {
            requestRepository.findById(requestId).ifPresent(aiRequest -> {
                aiRequest.setStatus(AiWritingStatus.FAILED);
                aiRequest.setErrorMessage(message);
                aiRequest.setCompletedAt(LocalDateTime.now());
                requestRepository.save(aiRequest);
            });
        } catch (RuntimeException persistenceFailure) {
            LOGGER.warn("Failed to persist AI writing failure status requestId={}", requestId, persistenceFailure);
        }
    }

    private String safeProviderMessage(DeepSeekApiException e) {
        return StringUtils.hasText(e.getMessage()) ? e.getMessage() : "AI provider request failed";
    }

    private String safeApplicationMessage(RuntimeException e) {
        if (e instanceof BadRequestException || e instanceof NotFoundException) {
            return e.getMessage();
        }
        return "AI writing generation failed";
    }

    private AiWritingResponse mapResponse(AiWritingRequest request, AiWritingOutput output) {
        AiWritingResponse response = new AiWritingResponse();
        response.requestId = request.getRequestId();
        response.outputId = output.getOutputId();
        response.actionType = request.getActionType();
        response.generatedText = output.getGeneratedText();
        response.language = request.getLanguage();
        response.englishWordCount = output.getEnglishWordCount();
        response.chineseCharacterCount = output.getChineseCharacterCount();
        response.inputTokens = output.getInputTokens();
        response.outputTokens = output.getOutputTokens();
        response.totalTokens = output.getTotalTokens();
        response.createdAt = output.getCreatedAt();
        return response;
    }
}

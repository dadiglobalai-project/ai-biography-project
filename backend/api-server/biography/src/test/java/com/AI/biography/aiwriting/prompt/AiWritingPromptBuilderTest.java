package com.AI.biography.aiwriting.prompt;

import com.AI.biography.aiwriting.dto.request.AiWritingGenerateRequest;
import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiWritingPromptBuilderTest {
    private final AiWritingPromptBuilder promptBuilder = new AiWritingPromptBuilder();

    @Test
    void buildPromptForGenerateUsesInstructionWithoutInventingFacts() {
        AiWritingGenerateRequest request = new AiWritingGenerateRequest();
        request.actionType = AiWritingAction.GENERATE;
        request.language = AiLanguage.ENGLISH;
        request.userInstruction = "Write a warm intro for Ada Lovelace based on provided facts.";
        request.tone = "Warm";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Write in English.")
                .contains("Do not invent biography facts")
                .contains("Write a warm intro for Ada Lovelace")
                .contains("Tone:\nWarm")
                .contains("Return only the generated content");
    }

    @Test
    void buildPromptForRewriteWorksOnlyFromSourceText() {
        AiWritingGenerateRequest request = new AiWritingGenerateRequest();
        request.actionType = AiWritingAction.REWRITE;
        request.language = AiLanguage.MIXED;
        request.sourceText = "Original biography paragraph.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Use a natural mix of English and Chinese")
                .contains("Work only from the provided source text")
                .contains("Source text:\nOriginal biography paragraph.")
                .contains("Return only the rewritten content");
    }

    @Test
    void buildPromptForTranslateUsesTargetLanguageInstruction() {
        AiWritingGenerateRequest request = new AiWritingGenerateRequest();
        request.actionType = AiWritingAction.TRANSLATE;
        request.language = AiLanguage.CHINESE;
        request.sourceText = "A concise biography paragraph.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Translate the following biography content")
                .contains("Write in Chinese.")
                .contains("Return only the translated content");
    }
}

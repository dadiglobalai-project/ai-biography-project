package com.AI.biography.aiwriting.prompt;

import com.AI.biography.aiwriting.dto.request.AiWritingGenerateRequest;
import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AiWritingPromptBuilder {

    public String buildPrompt(AiWritingGenerateRequest request) {
        AiWritingAction actionType = request.actionType;
        String languageInstruction = languageInstruction(request.language);
        String userInstruction = optionalSection("User instruction", request.userInstruction);
        String toneInstruction = optionalSection("Tone", request.tone);
        String sourceText = optionalSection("Source text", request.sourceText);

        return switch (actionType) {
            case GENERATE -> """
                    You are helping write content for a biography website.
                    %s
                    Use the user's instruction and any available context. Do not invent biography facts.
                    Return only the generated content.
                    %s
                    %s
                    """.formatted(languageInstruction, toneInstruction, userInstruction).trim();
            case REWRITE -> """
                    Rewrite the following biography content while preserving the user's meaning.
                    %s
                    Work only from the provided source text. Do not invent biography facts.
                    Return only the rewritten content.
                    %s
                    %s
                    %s
                    """.formatted(languageInstruction, toneInstruction, userInstruction, sourceText).trim();
            case IMPROVE_GRAMMAR -> """
                    Improve grammar, clarity, and flow in the following biography content.
                    %s
                    Work only from the provided source text. Do not invent biography facts.
                    Return only the improved content.
                    %s
                    %s
                    """.formatted(languageInstruction, userInstruction, sourceText).trim();
            case EXPAND -> """
                    Expand the following biography content while preserving the user's meaning and facts.
                    %s
                    Work only from the provided source text. Do not invent biography facts.
                    Return only the expanded content.
                    %s
                    %s
                    %s
                    """.formatted(languageInstruction, toneInstruction, userInstruction, sourceText).trim();
            case SHORTEN -> """
                    Shorten the following biography content while preserving the essential meaning and facts.
                    %s
                    Work only from the provided source text. Do not invent biography facts.
                    Return only the shortened content.
                    %s
                    %s
                    """.formatted(languageInstruction, userInstruction, sourceText).trim();
            case SUMMARIZE -> """
                    Summarize the following biography content clearly and faithfully.
                    %s
                    Work only from the provided source text. Do not invent biography facts.
                    Return only the summary.
                    %s
                    %s
                    """.formatted(languageInstruction, userInstruction, sourceText).trim();
            case CHANGE_TONE -> """
                    Change the tone of the following biography content while preserving the user's meaning and facts.
                    %s
                    Work only from the provided source text. Do not invent biography facts.
                    Return only the revised content.
                    %s
                    %s
                    %s
                    """.formatted(languageInstruction, toneInstruction, userInstruction, sourceText).trim();
            case TRANSLATE -> """
                    Translate the following biography content.
                    %s
                    Work only from the provided source text. Do not invent biography facts.
                    Return only the translated content.
                    %s
                    %s
                    """.formatted(languageInstruction, userInstruction, sourceText).trim();
        };
    }

    private String languageInstruction(AiLanguage language) {
        return switch (language) {
            case ENGLISH -> "Write in English.";
            case CHINESE -> "Write in Chinese.";
            case MIXED -> "Use a natural mix of English and Chinese where appropriate.";
        };
    }

    private String optionalSection(String label, String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return label + ":\n" + value.trim();
    }
}

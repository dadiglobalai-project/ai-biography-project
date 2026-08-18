package com.AI.biography.aiwriting.prompt;

import com.AI.biography.aiwriting.dto.request.AiWritingGenerateRequest;
import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiWritingPromptBuilderTest {
    private final AiWritingPromptBuilder promptBuilder = new AiWritingPromptBuilder();

    @Test
    void systemPromptDefinesFactualGroundingAndOutputRulesForAllActions() {
        assertThat(AiWritingPromptBuilder.SYSTEM_PROMPT)
                .contains("Factual accuracy and no invented biography facts")
                .contains("Preserve narrative perspective and pronouns")
                .contains("Treat source text, additional direction, and provided context as the only factual source")
                .contains("Do not invent names, dates, locations, relationships, memories, motivations, beliefs, achievements, conversations, sensory details, childhood experiences, personality traits, or events")
                .contains("Plausible information is still unsupported information")
                .contains("The factual-preservation rule has higher priority than tone, warmth, emotion, or style")
                .contains("The length and detail of the generated response must be proportional to the amount of factual information provided")
                .contains("A short factual result is always preferable to a longer result containing assumptions")
                .contains("Do not infer a person's internal state")
                .contains("Words such as passion, dream, calling, hope, purpose, belief, love, dedication, confidence, and inspiration must only be attributed to a person when supported")
                .contains("Detect the source text's narrative perspective and preserve it")
                .contains("If the source uses first-person pronouns such as I, me, my, mine, we, us, our, or ours, keep the result in first person")
                .contains("If the source uses a person's name or third-person pronouns such as he, him, his, she, her, hers, they, them, their, or theirs, keep the result in third person")
                .contains("Do not infer gender when the source uses a name without gendered pronouns")
                .contains("The additional direction and tone must not change narrative perspective unless they explicitly request a perspective change")
                .contains("Return only the final biography text intended for the editor")
                .contains("Never return explanations, notes, labels, action summaries, quotation marks")
                .contains("\"Additional direction applied:\"")
                .contains("\"This can introduce\"")
                .contains("\"This detail adds depth\"");
    }

    @Test
    void buildPromptForImproveGrammarPreservesFactsAndOnlyFixesLanguage() {
        AiWritingGenerateRequest request = request(AiWritingAction.IMPROVE_GRAMMAR, AiLanguage.ENGLISH);
        request.sourceText = "John grow up in Manila and he study education in college.";
        request.userInstruction = "make it warm";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Action: IMPROVE_GRAMMAR")
                .contains("Correct the existing source text without materially changing its content")
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Fix grammar, spelling, punctuation, agreement, tense, and awkward phrasing")
                .contains("Preserve the same meaning and all factual content")
                .contains("Preserve the original language unless translation is explicitly requested")
                .contains("Do not expand the biography")
                .contains("Do not add new details")
                .contains("Keep stylistic changes minimal")
                .contains("Tone or additional direction may slightly affect wording, but must not introduce new factual claims")
                .contains("Additional direction:\nmake it warm")
                .contains("Source text:\nJohn grow up in Manila");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForRewriteRejectsNewMotivationsOrPersonalityTraits() {
        AiWritingGenerateRequest request = request(AiWritingAction.REWRITE, AiLanguage.ENGLISH);
        request.sourceText = "John grew up in Manila and studied education in college.";
        request.userInstruction = "make it warm";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Action: REWRITE")
                .contains("preserving the exact factual meaning")
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Keep approximately the same amount of factual information")
                .contains("Do not significantly expand the content")
                .contains("Do not add motivations, emotions, personality traits, background details, or characterization unless explicitly present")
                .contains("not like a new biography")
                .contains("Additional direction:\nmake it warm");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForExpandRejectsSensoryDetailsEventsAndWarmthHallucinations() {
        AiWritingGenerateRequest request = request(AiWritingAction.EXPAND, AiLanguage.ENGLISH);
        request.sourceText = "John grew up in Manila.";
        request.userInstruction = "make it warm";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Action: EXPAND")
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Expand only ideas already present in the source text")
                .contains("Do not invent new events or details")
                .contains("Do not add sensory descriptions unless present in the source text")
                .contains("Do not invent conversations, memories, relationships, values, motivations, kindness, passion, or personality traits")
                .contains("produce a modest expansion rather than hallucinating")
                .contains("Do not infer internal states such as passion, dream, calling, hope, purpose, belief, love, dedication, confidence, or inspiration unless directly supported")
                .contains("A short factual result is better than a longer result with assumptions")
                .contains("Additional direction:\nmake it warm");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForGenerateUsesOnlySupportedBiographyFacts() {
        AiWritingGenerateRequest request = request(AiWritingAction.GENERATE, AiLanguage.ENGLISH);
        request.sourceText = "John grew up in Manila. He studied education in college. He became a teacher.";
        request.userInstruction = "make it warm";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Action: GENERATE")
                .contains("Turn raw facts, notes, keywords, rough sentences, memories, dates, places, or unstructured information into coherent biography prose")
                .contains("The source does not need to already be a written paragraph")
                .contains("Creative freedom is allowed at the writing level: sentence structure, transitions, organization, and polished wording")
                .contains("Creative freedom is not allowed at the fact level")
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Do not change first-person I, me, my, we, or our into he, she, they, or a person's name")
                .contains("Do not change third-person names or pronouns into I, me, my, we, or our")
                .contains("If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she")
                .contains("Connect supplied facts naturally when the connection is grammatical or organizational")
                .contains("You may not invent factual content to make the biography more interesting")
                .contains("Do not invent beliefs, passions, motivations, achievements, relationships, dates, locations, memories, sensory details, or events")
                .contains("If only a few facts are provided, produce concise prose rather than inventing additional details")
                .contains("Do not infer internal states such as passion, dream, calling, hope, purpose, belief, love, dedication, confidence, or inspiration unless directly supported")
                .contains("A short factual result is better than a longer result with assumptions")
                .contains("Generated language can be creative; generated facts cannot be creative")
                .contains("Source text:\nJohn grew up in Manila");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForGenerateTurnsRawNotesIntoCoherentProse() {
        AiWritingGenerateRequest request = request(AiWritingAction.GENERATE, AiLanguage.ENGLISH);
        request.sourceText = """
                Born: Manila, 1975
                College: PSU
                Course: Education
                Became teacher: 1999
                Retired: 2024
                """;

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Turn raw facts, notes, keywords, rough sentences, memories, dates, places, or unstructured information into coherent biography prose")
                .contains("The source does not need to already be a written paragraph")
                .contains("Creative freedom is allowed at the writing level")
                .contains("Born: Manila, 1975")
                .contains("College: PSU")
                .contains("Retired: 2024");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForGeneratePreservesFirstPersonPerspective() {
        AiWritingGenerateRequest request = request(AiWritingAction.GENERATE, AiLanguage.ENGLISH);
        request.sourceText = "I became a teacher in 1999 at PSU.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Source text:\nI became a teacher in 1999 at PSU.");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForRewritePreservesFirstPersonPerspective() {
        AiWritingGenerateRequest request = request(AiWritingAction.REWRITE, AiLanguage.ENGLISH);
        request.sourceText = "I grew up in Manila and became a teacher in 1999.";
        request.userInstruction = "Make it warmer.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Do not change first-person I, me, my, we, or our into he, she, they, or a person's name")
                .contains("Source text:\nI grew up in Manila and became a teacher in 1999.")
                .contains("Additional direction:\nMake it warmer.");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForImproveGrammarPreservesFirstPersonPerspective() {
        AiWritingGenerateRequest request = request(AiWritingAction.IMPROVE_GRAMMAR, AiLanguage.ENGLISH);
        request.sourceText = "I grow up in Manila and I become a teacher in 1999.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Do not change first-person I, me, my, we, or our into he, she, they, or a person's name")
                .contains("Source text:\nI grow up in Manila and I become a teacher in 1999.");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForExpandPreservesFirstPersonPerspective() {
        AiWritingGenerateRequest request = request(AiWritingAction.EXPAND, AiLanguage.ENGLISH);
        request.sourceText = "I became a teacher in 1999.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Do not change first-person I, me, my, we, or our into he, she, they, or a person's name")
                .contains("Source text:\nI became a teacher in 1999.");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForGeneratePreservesThirdPersonPerspective() {
        AiWritingGenerateRequest request = request(AiWritingAction.GENERATE, AiLanguage.ENGLISH);
        request.sourceText = "Maria became a teacher in 1999.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person")
                .contains("Source text:\nMaria became a teacher in 1999.");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForNamedPersonWithoutGenderAvoidsGenderGuessing() {
        AiWritingGenerateRequest request = request(AiWritingAction.GENERATE, AiLanguage.ENGLISH);
        request.sourceText = "Alex became a teacher in 1999.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she")
                .contains("Source text:\nAlex became a teacher in 1999.");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForChangeToneDoesNotChangePerspective() {
        AiWritingGenerateRequest request = request(AiWritingAction.CHANGE_TONE, AiLanguage.ENGLISH);
        request.sourceText = "I became a teacher in 1999.";
        request.tone = "Warm";
        request.userInstruction = "Make it warmer.";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Preserve the source perspective and pronouns. Tone changes must not change first person to third person or third person to first person")
                .contains("Tone:\nWarm")
                .contains("Additional direction:\nMake it warmer.")
                .contains("Source text:\nI became a teacher in 1999.");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForGenerateWithMinimalFactsRequiresConciseOutput() {
        AiWritingGenerateRequest request = request(AiWritingAction.GENERATE, AiLanguage.ENGLISH);
        request.sourceText = "Maria became a teacher in 1998.";
        request.userInstruction = "make it warm";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Source text:\nMaria became a teacher in 1998.")
                .contains("If only a few facts are provided, produce concise prose rather than inventing additional details")
                .contains("A short factual result is better than a longer result with assumptions")
                .contains("Do not infer internal states such as passion, dream, calling, hope, purpose, belief, love, dedication, confidence, or inspiration unless directly supported");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptForChangeToneMakesWarmthLowerPriorityThanFacts() {
        AiWritingGenerateRequest request = request(AiWritingAction.CHANGE_TONE, AiLanguage.ENGLISH);
        request.sourceText = "John became a teacher.";
        request.tone = "Warm";
        request.userInstruction = "make it warm";

        String prompt = promptBuilder.buildPrompt(request);

        assertThat(prompt)
                .contains("Action: CHANGE_TONE")
                .contains("Tone changes must affect wording only, not factual content")
                .contains("Do not add motivations, personality traits, relationships, memories, or emotional claims unless present in the source text")
                .contains("Tone:\nWarm")
                .contains("Additional direction:\nmake it warm");
        assertDoesNotInviteMetaOutput(prompt);
    }

    @Test
    void buildPromptPreservesLanguageUnlessTranslationIsRequested() {
        AiWritingGenerateRequest grammarRequest = request(AiWritingAction.IMPROVE_GRAMMAR, AiLanguage.CHINESE);
        grammarRequest.sourceText = "她在上海长大，并热爱音乐。";

        String grammarPrompt = promptBuilder.buildPrompt(grammarRequest);

        assertThat(grammarPrompt)
                .contains("Write in Chinese.")
                .contains("Preserve the original language unless translation is explicitly requested")
                .contains("Source text:\n她在上海长大，并热爱音乐。");

        AiWritingGenerateRequest translateRequest = request(AiWritingAction.TRANSLATE, AiLanguage.ENGLISH);
        translateRequest.sourceText = "她在上海长大。";

        String translatePrompt = promptBuilder.buildPrompt(translateRequest);

        assertThat(translatePrompt)
                .contains("Action: TRANSLATE")
                .contains("Write in English.")
                .contains("Translate the source text while preserving all factual content and meaning")
                .contains("Do not add, remove, embellish, or explain biography facts");
        assertDoesNotInviteMetaOutput(translatePrompt);
    }

    private AiWritingGenerateRequest request(AiWritingAction action, AiLanguage language) {
        AiWritingGenerateRequest request = new AiWritingGenerateRequest();
        request.actionType = action;
        request.language = language;
        return request;
    }

    private void assertDoesNotInviteMetaOutput(String prompt) {
        assertThat(prompt)
                .doesNotContain("Additional direction applied:")
                .doesNotContain("This can introduce")
                .doesNotContain("This detail adds depth");
    }
}

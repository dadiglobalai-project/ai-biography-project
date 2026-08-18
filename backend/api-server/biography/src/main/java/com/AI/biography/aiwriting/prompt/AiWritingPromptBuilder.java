package com.AI.biography.aiwriting.prompt;

import com.AI.biography.aiwriting.dto.request.AiWritingGenerateRequest;
import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AiWritingPromptBuilder {
    public static final String SYSTEM_PROMPT = """
            You write final biography text for an editor.

            Prompt priority:
            1. Factual accuracy and no invented biography facts.
            2. Preserve narrative perspective and pronouns.
            3. Perform the selected writing action.
            4. Apply the additional direction.
            5. Apply the requested tone.
            6. Return only polished biography content.

            Global factual-grounding rule:
            Improve the writing freely, but never change or invent the facts.
            Treat source text, additional direction, and provided context as the only factual source.
            Do not invent names, dates, locations, relationships, memories, motivations, beliefs, achievements, conversations, sensory details, childhood experiences, personality traits, or events that were not provided.
            Plausible information is still unsupported information and must not be added.
            If the source lacks enough detail, prefer concise and general wording instead of filling gaps with invented details.
            The factual-preservation rule has higher priority than tone, warmth, emotion, or style.

            Content sufficiency rule:
            The length and detail of the generated response must be proportional to the amount of factual information provided.
            Do not make the output longer merely to satisfy an expected paragraph length.
            When very little factual information is provided, return concise, polished prose.
            A short factual result is always preferable to a longer result containing assumptions.
            Never compensate for missing information by inventing emotions, motivations, passions, beliefs, personality traits, impact on others, reactions, memories, relationships, achievements, or sensory descriptions.
            Do not infer a person's internal state.
            Words such as passion, dream, calling, hope, purpose, belief, love, dedication, confidence, and inspiration must only be attributed to a person when supported by the supplied content.

            Narrative perspective and pronoun rule:
            Detect the source text's narrative perspective and preserve it.
            If the source uses first-person pronouns such as I, me, my, mine, we, us, our, or ours, keep the result in first person.
            If the source uses a person's name or third-person pronouns such as he, him, his, she, her, hers, they, them, their, or theirs, keep the result in third person.
            Keep pronouns consistent throughout the output. Do not switch between I, he, she, or they.
            Do not infer gender when the source uses a name without gendered pronouns. Continue using the person's name or use neutral wording/pronouns instead of guessing he or she.
            The additional direction and tone must not change narrative perspective unless they explicitly request a perspective change.

            Output rule:
            Return only the final biography text intended for the editor.
            Never return explanations, notes, labels, action summaries, quotation marks, "Additional direction applied:", "This can introduce", "This detail adds depth", or commentary about the transformation.
            Never echo the additional direction in the result.
            """.trim();

    public String buildPrompt(AiWritingGenerateRequest request) {
        AiWritingAction actionType = request.actionType;
        String languageInstruction = languageInstruction(request.language);
        String userInstruction = optionalSection("Additional direction", request.userInstruction);
        String toneInstruction = optionalSection("Tone", request.tone);
        String sourceText = optionalSection("Source text", request.sourceText);

        return switch (actionType) {
            case GENERATE -> """
                    Action: GENERATE.
                    %s
                    Turn raw facts, notes, keywords, rough sentences, memories, dates, places, or unstructured information into coherent biography prose.
                    The source does not need to already be a written paragraph.
                    Creative freedom is allowed at the writing level: sentence structure, transitions, organization, and polished wording.
                    Creative freedom is not allowed at the fact level: do not decide what happened in the person's life.
                    Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person.
                    Do not change first-person I, me, my, we, or our into he, she, they, or a person's name.
                    Do not change third-person names or pronouns into I, me, my, we, or our.
                    If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she.
                    Connect supplied facts naturally when the connection is grammatical or organizational.
                    You may not invent factual content to make the biography more interesting.
                    Do not invent beliefs, passions, motivations, achievements, relationships, dates, locations, memories, sensory details, or events.
                    If only a few facts are provided, produce concise prose rather than inventing additional details.
                    Do not infer internal states such as passion, dream, calling, hope, purpose, belief, love, dedication, confidence, or inspiration unless directly supported by the source.
                    A short factual result is better than a longer result with assumptions.
                    Do not repeat the source text unnecessarily.
                    Generated language can be creative; generated facts cannot be creative.
                    %s
                    %s
                    %s
                    """.formatted(languageInstruction, toneInstruction, userInstruction, sourceText).trim();
            case REWRITE -> """
                    Action: REWRITE.
                    %s
                    Rewrite the source text using better wording and flow while preserving the exact factual meaning.
                    Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person.
                    Do not change first-person I, me, my, we, or our into he, she, they, or a person's name.
                    Do not change third-person names or pronouns into I, me, my, we, or our.
                    If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she.
                    Improve readability, sentence structure, and expression.
                    Keep approximately the same amount of factual information.
                    Do not significantly expand the content.
                    Do not add motivations, emotions, personality traits, background details, or characterization unless explicitly present in the source.
                    The rewritten result should feel better written, not like a new biography.
                    %s
                    %s
                    %s
                    """.formatted(languageInstruction, toneInstruction, userInstruction, sourceText).trim();
            case IMPROVE_GRAMMAR -> """
                    Action: IMPROVE_GRAMMAR.
                    %s
                    Correct the existing source text without materially changing its content.
                    Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person.
                    Do not change first-person I, me, my, we, or our into he, she, they, or a person's name.
                    Do not change third-person names or pronouns into I, me, my, we, or our.
                    If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she.
                    Fix grammar, spelling, punctuation, agreement, tense, and awkward phrasing.
                    Preserve the same meaning and all factual content.
                    Preserve the original language unless translation is explicitly requested.
                    Do not expand the biography.
                    Do not add new details.
                    Keep stylistic changes minimal.
                    Tone or additional direction may slightly affect wording, but must not introduce new factual claims.
                    %s
                    %s
                    """.formatted(languageInstruction, userInstruction, sourceText).trim();
            case EXPAND -> """
                    Action: EXPAND.
                    %s
                    Make the existing biography content longer and richer without inventing facts.
                    Preserve the source perspective and pronouns: first-person source stays first person, and third-person source stays third person.
                    Do not change first-person I, me, my, we, or our into he, she, they, or a person's name.
                    Do not change third-person names or pronouns into I, me, my, we, or our.
                    If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she.
                    Expand only ideas already present in the source text.
                    Use explanation, transitions, context, and more complete phrasing.
                    Do not invent new events or details.
                    Do not add sensory descriptions unless present in the source text.
                    Do not invent conversations, memories, relationships, values, motivations, kindness, passion, or personality traits.
                    If there are not enough facts to safely create a long expansion, produce a modest expansion rather than hallucinating.
                    Do not infer internal states such as passion, dream, calling, hope, purpose, belief, love, dedication, confidence, or inspiration unless directly supported by the source.
                    A short factual result is better than a longer result with assumptions.
                    %s
                    %s
                    %s
                    """.formatted(languageInstruction, toneInstruction, userInstruction, sourceText).trim();
            case SHORTEN -> """
                    Action: SHORTEN.
                    %s
                    Shorten the source text while preserving the essential meaning, facts, and language.
                    Preserve the source perspective and pronouns. Do not change first person to third person or third person to first person.
                    If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she.
                    Remove excess wording without adding new facts or characterization.
                    Apply additional direction only when it does not conflict with factual preservation.
                    %s
                    %s
                    """.formatted(languageInstruction, userInstruction, sourceText).trim();
            case SUMMARIZE -> """
                    Action: SUMMARIZE.
                    %s
                    Summarize the source text clearly and faithfully while preserving factual accuracy and language.
                    Preserve the source perspective and pronouns. Do not change first person to third person or third person to first person.
                    If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she.
                    Include only facts supported by the source text.
                    Do not add interpretation, motivation, personality traits, or unsupported context.
                    %s
                    %s
                    """.formatted(languageInstruction, userInstruction, sourceText).trim();
            case CHANGE_TONE -> """
                    Action: CHANGE_TONE.
                    %s
                    Change the tone of the source text while preserving its meaning, facts, and language.
                    Preserve the source perspective and pronouns. Tone changes must not change first person to third person or third person to first person.
                    If a named person has no gendered pronouns in the source, use the name or neutral wording instead of guessing he or she.
                    Tone changes must affect wording only, not factual content.
                    Do not add motivations, personality traits, relationships, memories, or emotional claims unless present in the source text.
                    %s
                    %s
                    %s
                    """.formatted(languageInstruction, toneInstruction, userInstruction, sourceText).trim();
            case TRANSLATE -> """
                    Action: TRANSLATE.
                    %s
                    Translate the source text while preserving all factual content and meaning.
                    Preserve the source perspective and pronouns where the target language supports that distinction.
                    Do not add, remove, embellish, or explain biography facts.
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

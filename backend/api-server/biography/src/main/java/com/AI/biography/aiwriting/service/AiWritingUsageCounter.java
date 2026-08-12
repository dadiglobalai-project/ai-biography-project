package com.AI.biography.aiwriting.service;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AiWritingUsageCounter {
    private static final Pattern ENGLISH_WORD_PATTERN = Pattern.compile("[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*");

    public UsageCount count(String text) {
        if (!StringUtils.hasText(text)) {
            return new UsageCount(0, 0);
        }

        int englishWords = 0;
        Matcher matcher = ENGLISH_WORD_PATTERN.matcher(text);
        while (matcher.find()) {
            englishWords++;
        }

        int chineseCharacters = 0;
        for (int i = 0; i < text.length(); i++) {
            if (isChineseCharacter(text.charAt(i))) {
                chineseCharacters++;
            }
        }

        return new UsageCount(englishWords, chineseCharacters);
    }

    private boolean isChineseCharacter(char value) {
        Character.UnicodeScript script = Character.UnicodeScript.of(value);
        return script == Character.UnicodeScript.HAN;
    }

    public record UsageCount(Integer englishWordCount, Integer chineseCharacterCount) {
    }
}

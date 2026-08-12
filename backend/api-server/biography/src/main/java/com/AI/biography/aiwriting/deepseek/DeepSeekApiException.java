package com.AI.biography.aiwriting.deepseek;

public class DeepSeekApiException extends RuntimeException {
    public DeepSeekApiException(String message) {
        super(message);
    }

    public DeepSeekApiException(String message, Throwable cause) {
        super(message, cause);
    }
}

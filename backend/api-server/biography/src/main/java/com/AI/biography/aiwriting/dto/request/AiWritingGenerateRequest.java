package com.AI.biography.aiwriting.dto.request;

import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AiWritingGenerateRequest {
    @Size(max = 36)
    public String websiteId;

    @Size(max = 36)
    public String sectionId;

    @NotNull
    public AiWritingAction actionType;

    @Size(max = 65535)
    public String sourceText;

    @Size(max = 65535)
    public String userInstruction;

    @Size(max = 50)
    public String tone;

    @NotNull
    public AiLanguage language;
}

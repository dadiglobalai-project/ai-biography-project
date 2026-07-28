package com.AI.biography.section.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class SectionSettingsRequest {
    @NotNull
    public Boolean isVisible;

    @NotNull
    @Min(0)
    public Integer sortOrder;
}

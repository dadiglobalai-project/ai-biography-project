package com.AI.biography.section.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class HeroSectionRequest {
    @NotBlank
    public String fullName;
    public String designation;
    public String tagline;
    public String shortDescription;
    public String profileImageId;
    public String backgroundImageId;
    @NotNull
    @Min(0)
    public Integer sortOrder;
    @NotNull
    public Boolean isVisible;
}

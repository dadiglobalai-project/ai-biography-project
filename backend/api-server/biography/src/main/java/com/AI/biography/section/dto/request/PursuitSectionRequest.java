package com.AI.biography.section.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class PursuitSectionRequest {
    public String sectionLabel;
    @Valid
    public List<PursuitItemRequest> items = new ArrayList<>();
    @NotNull
    @Min(0)
    public Integer sortOrder;
    @NotNull
    public Boolean isVisible;

    public static class PursuitItemRequest {
        public String id;
        public String imageId;
        public String icon;
        @NotBlank
        public String title;
        public String description;
        @NotNull
        @Min(0)
        public Integer sortOrder;
    }
}

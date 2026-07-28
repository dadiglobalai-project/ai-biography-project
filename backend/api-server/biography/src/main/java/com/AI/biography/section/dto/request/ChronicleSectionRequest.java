package com.AI.biography.section.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class ChronicleSectionRequest {
    public String sectionLabel;
    @NotBlank
    public String sectionTitle;
    public String sectionDescription;
    @Valid
    public JournalRequest journal;
    @Valid
    public BeliefsRequest beliefs;
    @NotNull
    @Min(0)
    public Integer sortOrder;
    @NotNull
    public Boolean isVisible;

    public static class JournalRequest {
        public String cardLabel;
        public String storyTitle;
        public String storyContent;
        public String quote;
    }

    public static class BeliefsRequest {
        public String cardLabel;
        @Valid
        public List<BeliefItemRequest> items = new ArrayList<>();
    }

    public static class BeliefItemRequest {
        public String id;
        public String icon;
        @NotBlank
        public String title;
        public String description;
        @NotNull
        @Min(0)
        public Integer sortOrder;
    }
}

package com.AI.biography.section.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class TimelineSectionRequest {
    public String sectionLabel;
    @NotBlank
    public String sectionTitle;
    public String sectionDescription;
    @Valid
    public List<TimelineEventRequest> timelineEvents = new ArrayList<>();
    @NotNull
    @Min(0)
    public Integer sortOrder;
    @NotNull
    public Boolean isVisible;

    public static class TimelineEventRequest {
        public String id;
        public String timePeriod;
        @NotBlank
        public String title;
        public String location;
        public String quote;
        public String imageId;
        public String imageAltText;
        public String imageCaption;
        @NotNull
        @Min(0)
        public Integer sortOrder;
        @Valid
        public List<TimelineHighlightRequest> highlights = new ArrayList<>();
    }

    public static class TimelineHighlightRequest {
        public String id;
        @NotBlank
        public String highlightText;
        @NotNull
        @Min(0)
        public Integer sortOrder;
    }
}

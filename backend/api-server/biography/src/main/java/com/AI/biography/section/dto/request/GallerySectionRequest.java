package com.AI.biography.section.dto.request;

import com.AI.biography.section.enums.GalleryMediaType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class GallerySectionRequest {
    public String sectionLabel;
    @NotBlank
    public String sectionTitle;
    public String sectionDescription;
    @Valid
    public List<GalleryItemRequest> items = new ArrayList<>();
    @NotNull
    @Min(0)
    public Integer sortOrder;
    @NotNull
    public Boolean isVisible;

    public static class GalleryItemRequest {
        public String id;
        public String mediaAssetId;
        public String thumbnailAssetId;
        @NotNull
        public GalleryMediaType mediaType;
        public String category;
        public String recordLabel;
        public String displayYear;
        @NotBlank
        public String title;
        public String description;
        public String altText;
        @NotNull
        @Min(0)
        public Integer sortOrder;
    }
}

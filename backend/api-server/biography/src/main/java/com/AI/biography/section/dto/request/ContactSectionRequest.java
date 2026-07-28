package com.AI.biography.section.dto.request;

import com.AI.biography.section.enums.SocialPlatform;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class ContactSectionRequest {
    public String sectionLabel;
    @NotBlank
    public String sectionTitle;
    public String sectionDescription;
    @Valid
    public ContactInfoRequest contactInfo;
    @Valid
    public List<SocialLinkRequest> socialLinks = new ArrayList<>();
    @Valid
    public ContactFormSettingsRequest formSettings;
    @NotNull
    @Min(0)
    public Integer sortOrder;
    @NotNull
    public Boolean isVisible;

    public static class ContactInfoRequest {
        public String label;
        @Email
        public String email;
    }

    public static class SocialLinkRequest {
        public String id;
        @NotNull
        public SocialPlatform platform;
        public String displayName;
        public String profileUrl;
        public String icon;
        @NotNull
        @Min(0)
        public Integer sortOrder;
    }

    public static class ContactFormSettingsRequest {
        public String title;
        public String namePlaceholder;
        public String emailPlaceholder;
        public String subjectPlaceholder;
        public String messagePlaceholder;
        public String submitButtonText;
        public String successMessage;
        public String errorMessage;
    }
}

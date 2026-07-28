package com.AI.biography.section.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contact_sections")
public class ContactSection {
    @Id
    @Column(name = "section_id", columnDefinition = "CHAR(36)", length = 36)
    private String sectionId;
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "section_id", columnDefinition = "CHAR(36)")
    private BiographySection section;
    @Column(name = "section_label")
    private String sectionLabel;
    @Column(name = "section_title", nullable = false)
    private String sectionTitle;
    @Column(name = "section_description")
    private String sectionDescription;
    @Column(name = "contact_label")
    private String contactLabel;
    @Column(name = "contact_email", length = 320)
    private String contactEmail;
    @OneToMany(mappedBy = "contactSection", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<SocialLink> socialLinks = new ArrayList<>();
    @OneToOne(mappedBy = "contactSection", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ContactFormSettings formSettings;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    public BiographySection getSection() { return section; }
    public void setSection(BiographySection section) { this.section = section; }
    public String getSectionLabel() { return sectionLabel; }
    public void setSectionLabel(String sectionLabel) { this.sectionLabel = sectionLabel; }
    public String getSectionTitle() { return sectionTitle; }
    public void setSectionTitle(String sectionTitle) { this.sectionTitle = sectionTitle; }
    public String getSectionDescription() { return sectionDescription; }
    public void setSectionDescription(String sectionDescription) { this.sectionDescription = sectionDescription; }
    public String getContactLabel() { return contactLabel; }
    public void setContactLabel(String contactLabel) { this.contactLabel = contactLabel; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public List<SocialLink> getSocialLinks() { return socialLinks; }
    public void setSocialLinks(List<SocialLink> socialLinks) { this.socialLinks = socialLinks; }
    public ContactFormSettings getFormSettings() { return formSettings; }
    public void setFormSettings(ContactFormSettings formSettings) { this.formSettings = formSettings; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

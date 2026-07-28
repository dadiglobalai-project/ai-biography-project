package com.AI.biography.section.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_form_settings")
public class ContactFormSettings {
    @Id
    @Column(name = "section_id", columnDefinition = "CHAR(36)", length = 36)
    private String sectionId;
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "section_id", columnDefinition = "CHAR(36)")
    private ContactSection contactSection;
    @Column(name = "form_title")
    private String title;
    @Column(name = "name_placeholder")
    private String namePlaceholder;
    @Column(name = "email_placeholder")
    private String emailPlaceholder;
    @Column(name = "subject_placeholder", length = 500)
    private String subjectPlaceholder;
    @Column(name = "message_placeholder", length = 500)
    private String messagePlaceholder;
    @Column(name = "submit_button_text", length = 100)
    private String submitButtonText;
    @Column(name = "success_message", length = 500)
    private String successMessage;
    @Column(name = "error_message", length = 500)
    private String errorMessage;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    public ContactSection getContactSection() { return contactSection; }
    public void setContactSection(ContactSection contactSection) { this.contactSection = contactSection; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getNamePlaceholder() { return namePlaceholder; }
    public void setNamePlaceholder(String namePlaceholder) { this.namePlaceholder = namePlaceholder; }
    public String getEmailPlaceholder() { return emailPlaceholder; }
    public void setEmailPlaceholder(String emailPlaceholder) { this.emailPlaceholder = emailPlaceholder; }
    public String getSubjectPlaceholder() { return subjectPlaceholder; }
    public void setSubjectPlaceholder(String subjectPlaceholder) { this.subjectPlaceholder = subjectPlaceholder; }
    public String getMessagePlaceholder() { return messagePlaceholder; }
    public void setMessagePlaceholder(String messagePlaceholder) { this.messagePlaceholder = messagePlaceholder; }
    public String getSubmitButtonText() { return submitButtonText; }
    public void setSubmitButtonText(String submitButtonText) { this.submitButtonText = submitButtonText; }
    public String getSuccessMessage() { return successMessage; }
    public void setSuccessMessage(String successMessage) { this.successMessage = successMessage; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

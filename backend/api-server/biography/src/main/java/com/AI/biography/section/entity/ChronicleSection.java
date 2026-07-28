package com.AI.biography.section.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chronicle_sections")
public class ChronicleSection {
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
    @Column(name = "journal_card_label")
    private String journalCardLabel;
    @Column(name = "journal_story_title")
    private String journalStoryTitle;
    @Column(name = "journal_story_content")
    private String journalStoryContent;
    @Column(name = "journal_quote")
    private String journalQuote;
    @Column(name = "beliefs_card_label")
    private String beliefsCardLabel;

    @OneToMany(mappedBy = "chronicleSection", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<BeliefItem> beliefItems = new ArrayList<>();

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
    public String getJournalCardLabel() { return journalCardLabel; }
    public void setJournalCardLabel(String journalCardLabel) { this.journalCardLabel = journalCardLabel; }
    public String getJournalStoryTitle() { return journalStoryTitle; }
    public void setJournalStoryTitle(String journalStoryTitle) { this.journalStoryTitle = journalStoryTitle; }
    public String getJournalStoryContent() { return journalStoryContent; }
    public void setJournalStoryContent(String journalStoryContent) { this.journalStoryContent = journalStoryContent; }
    public String getJournalQuote() { return journalQuote; }
    public void setJournalQuote(String journalQuote) { this.journalQuote = journalQuote; }
    public String getBeliefsCardLabel() { return beliefsCardLabel; }
    public void setBeliefsCardLabel(String beliefsCardLabel) { this.beliefsCardLabel = beliefsCardLabel; }
    public List<BeliefItem> getBeliefItems() { return beliefItems; }
    public void setBeliefItems(List<BeliefItem> beliefItems) { this.beliefItems = beliefItems; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

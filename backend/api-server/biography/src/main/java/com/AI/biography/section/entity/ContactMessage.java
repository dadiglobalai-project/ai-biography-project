package com.AI.biography.section.entity;

import com.AI.biography.section.enums.ContactMessageStatus;
import com.AI.biography.website.BiographyWebsite;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
public class ContactMessage {
    @Id
    @Column(name = "contact_message_id", columnDefinition = "CHAR(36)", length = 36)
    private String contactMessageId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id", nullable = false, columnDefinition = "CHAR(36)")
    private BiographyWebsite website;
    @Column(name = "sender_name", nullable = false)
    private String senderName;
    @Column(name = "sender_email", nullable = false, length = 320)
    private String senderEmail;
    @Column(name = "subject", length = 500)
    private String subject;
    @Column(name = "message", nullable = false)
    private String message;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ContactMessageStatus status;
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    @Column(name = "read_at")
    private LocalDateTime readAt;
    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    public String getContactMessageId() { return contactMessageId; }
    public void setContactMessageId(String contactMessageId) { this.contactMessageId = contactMessageId; }
    public BiographyWebsite getWebsite() { return website; }
    public void setWebsite(BiographyWebsite website) { this.website = website; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public ContactMessageStatus getStatus() { return status; }
    public void setStatus(ContactMessageStatus status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public LocalDateTime getRepliedAt() { return repliedAt; }
    public void setRepliedAt(LocalDateTime repliedAt) { this.repliedAt = repliedAt; }
}

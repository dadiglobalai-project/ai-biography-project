package com.AI.biography.section.repository;

import com.AI.biography.section.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, String> {
    List<ContactMessage> findByWebsiteWebsiteIdOrderBySubmittedAtDesc(String websiteId);
    Optional<ContactMessage> findByContactMessageIdAndWebsiteWebsiteId(String contactMessageId, String websiteId);
}

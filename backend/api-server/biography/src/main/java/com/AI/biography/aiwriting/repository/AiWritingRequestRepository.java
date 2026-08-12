package com.AI.biography.aiwriting.repository;

import com.AI.biography.aiwriting.entity.AiWritingRequest;
import com.AI.biography.aiwriting.enums.AiWritingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiWritingRequestRepository extends JpaRepository<AiWritingRequest, String> {

    List<AiWritingRequest> findByUserUserIdOrderByCreatedAtDesc(String userId);

    List<AiWritingRequest> findByWebsiteWebsiteIdOrderByCreatedAtDesc(String websiteId);

    List<AiWritingRequest> findBySectionSectionIdOrderByCreatedAtDesc(String sectionId);

    List<AiWritingRequest> findByStatus(AiWritingStatus status);

    long countByUserUserId(String userId);
}

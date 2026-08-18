package com.AI.biography.aiwriting.repository;

import com.AI.biography.aiwriting.entity.AiWritingOutput;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiWritingOutputRepository extends JpaRepository<AiWritingOutput, String> {

    List<AiWritingOutput> findByRequestRequestIdOrderByCreatedAtAsc(String requestId);

    Optional<AiWritingOutput> findByRequestRequestIdAndSelectedTrue(String requestId);

    List<AiWritingOutput> findByRequestRequestIdAndSelected(String requestId, Boolean selected);

    long countByRequestRequestId(String requestId);
    
}

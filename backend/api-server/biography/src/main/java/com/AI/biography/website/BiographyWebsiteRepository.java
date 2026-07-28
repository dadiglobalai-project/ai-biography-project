package com.AI.biography.website;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BiographyWebsiteRepository extends JpaRepository<BiographyWebsite, String> {

    List<BiographyWebsite> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<BiographyWebsite> findByWebsiteIdAndUserId(String websiteId, String userId);

    boolean existsBySubdomain(String subdomain);
}
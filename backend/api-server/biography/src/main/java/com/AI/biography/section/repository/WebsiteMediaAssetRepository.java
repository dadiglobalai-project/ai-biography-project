package com.AI.biography.section.repository;

import com.AI.biography.section.entity.WebsiteMediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WebsiteMediaAssetRepository extends JpaRepository<WebsiteMediaAsset, String> {
    List<WebsiteMediaAsset> findByWebsiteWebsiteIdOrderByCreatedAtDesc(String websiteId);

    List<WebsiteMediaAsset> findByWebsiteWebsiteIdAndWebsiteUserIdOrderByCreatedAtDesc(String websiteId, String userId);

    Optional<WebsiteMediaAsset> findByMediaAssetIdAndWebsiteWebsiteId(String mediaAssetId, String websiteId);

    Optional<WebsiteMediaAsset> findByMediaAssetIdAndWebsiteWebsiteIdAndWebsiteUserId(
            String mediaAssetId,
            String websiteId,
            String userId
    );

    boolean existsByMediaAssetIdAndWebsiteWebsiteIdAndWebsiteUserId(String mediaAssetId, String websiteId, String userId);
}

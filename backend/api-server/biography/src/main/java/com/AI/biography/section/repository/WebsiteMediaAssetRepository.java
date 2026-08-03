package com.AI.biography.section.repository;

import com.AI.biography.section.entity.WebsiteMediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query(value = """
            SELECT (
                (SELECT COUNT(*) FROM hero_sections
                    WHERE profile_image_id = :mediaAssetId OR background_image_id = :mediaAssetId)
                + (SELECT COUNT(*) FROM pursuit_items
                    WHERE image_id = :mediaAssetId)
                + (SELECT COUNT(*) FROM timeline_events
                    WHERE image_id = :mediaAssetId)
                + (SELECT COUNT(*) FROM gallery_items
                    WHERE media_asset_id = :mediaAssetId OR thumbnail_asset_id = :mediaAssetId)
            )
            """, nativeQuery = true)
    long countSectionReferences(@Param("mediaAssetId") String mediaAssetId);
}

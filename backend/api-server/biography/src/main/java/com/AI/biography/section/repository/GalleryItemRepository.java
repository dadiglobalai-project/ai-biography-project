package com.AI.biography.section.repository;

import com.AI.biography.section.entity.GalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GalleryItemRepository extends JpaRepository<GalleryItem, String> {
    Optional<GalleryItem> findByGalleryItemIdAndGallerySectionSectionId(String galleryItemId, String sectionId);
}

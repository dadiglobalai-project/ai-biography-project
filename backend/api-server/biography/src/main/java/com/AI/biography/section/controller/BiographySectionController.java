package com.AI.biography.section.controller;

import com.AI.biography.section.dto.request.*;
import com.AI.biography.section.dto.response.SectionResponse;
import com.AI.biography.section.dto.response.SectionsResponse;
import com.AI.biography.section.service.BiographySectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/websites/{websiteId}/sections")
@CrossOrigin(origins = "*")
public class BiographySectionController {
    private final BiographySectionService sectionService;

    public BiographySectionController(BiographySectionService sectionService) {
        this.sectionService = sectionService;
    }

    @GetMapping
    public SectionsResponse getSections(@PathVariable String websiteId) {
        return sectionService.getSections(websiteId);
    }

    @GetMapping("/{sectionId}")
    public SectionResponse getSection(@PathVariable String websiteId, @PathVariable String sectionId) {
        return sectionService.getSection(websiteId, sectionId);
    }

    @PatchMapping("/{sectionId}/settings")
    public SectionResponse updateSettings(@PathVariable String websiteId,
                                          @PathVariable String sectionId,
                                          @Valid @RequestBody SectionSettingsRequest request) {
        return sectionService.updateSettings(websiteId, sectionId, request);
    }

    @DeleteMapping("/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable String websiteId, @PathVariable String sectionId) {
        sectionService.deleteSection(websiteId, sectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/hero")
    public ResponseEntity<SectionResponse> createHero(@PathVariable String websiteId,
                                                      @Valid @RequestBody HeroSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createHero(websiteId, request));
    }

    @PutMapping("/{sectionId}/hero")
    public SectionResponse updateHero(@PathVariable String websiteId,
                                      @PathVariable String sectionId,
                                      @Valid @RequestBody HeroSectionRequest request) {
        return sectionService.updateHero(websiteId, sectionId, request);
    }

    @PostMapping("/chronicle")
    public ResponseEntity<SectionResponse> createChronicle(@PathVariable String websiteId,
                                                           @Valid @RequestBody ChronicleSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createChronicle(websiteId, request));
    }

    @PutMapping("/{sectionId}/chronicle")
    public SectionResponse updateChronicle(@PathVariable String websiteId,
                                           @PathVariable String sectionId,
                                           @Valid @RequestBody ChronicleSectionRequest request) {
        return sectionService.updateChronicle(websiteId, sectionId, request);
    }

    @PostMapping("/pursuits")
    public ResponseEntity<SectionResponse> createPursuits(@PathVariable String websiteId,
                                                          @Valid @RequestBody PursuitSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createPursuits(websiteId, request));
    }

    @PutMapping("/{sectionId}/pursuits")
    public SectionResponse updatePursuits(@PathVariable String websiteId,
                                          @PathVariable String sectionId,
                                          @Valid @RequestBody PursuitSectionRequest request) {
        return sectionService.updatePursuits(websiteId, sectionId, request);
    }

    @PostMapping("/timeline")
    public ResponseEntity<SectionResponse> createTimeline(@PathVariable String websiteId,
                                                          @Valid @RequestBody TimelineSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createTimeline(websiteId, request));
    }

    @PutMapping("/{sectionId}/timeline")
    public SectionResponse updateTimeline(@PathVariable String websiteId,
                                          @PathVariable String sectionId,
                                          @Valid @RequestBody TimelineSectionRequest request) {
        return sectionService.updateTimeline(websiteId, sectionId, request);
    }

    @PostMapping("/gallery")
    public ResponseEntity<SectionResponse> createGallery(@PathVariable String websiteId,
                                                         @Valid @RequestBody GallerySectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createGallery(websiteId, request));
    }

    @PutMapping("/{sectionId}/gallery")
    public SectionResponse updateGallery(@PathVariable String websiteId,
                                         @PathVariable String sectionId,
                                         @Valid @RequestBody GallerySectionRequest request) {
        return sectionService.updateGallery(websiteId, sectionId, request);
    }

    @PostMapping("/contact")
    public ResponseEntity<SectionResponse> createContact(@PathVariable String websiteId,
                                                         @Valid @RequestBody ContactSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createContact(websiteId, request));
    }

    @PutMapping("/{sectionId}/contact")
    public SectionResponse updateContact(@PathVariable String websiteId,
                                         @PathVariable String sectionId,
                                         @Valid @RequestBody ContactSectionRequest request) {
        return sectionService.updateContact(websiteId, sectionId, request);
    }
}

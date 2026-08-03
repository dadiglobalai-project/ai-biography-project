package com.AI.biography.section.controller;

import com.AI.biography.section.dto.request.*;
import com.AI.biography.section.dto.response.SectionResponse;
import com.AI.biography.section.dto.response.SectionsResponse;
import com.AI.biography.section.service.BiographySectionService;
import jakarta.servlet.http.HttpServletRequest;
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
    public SectionsResponse getSections(@PathVariable String websiteId, HttpServletRequest httpRequest) {
        return sectionService.getSections(userId(httpRequest), websiteId);
    }

    @GetMapping("/{sectionId}")
    public SectionResponse getSection(@PathVariable String websiteId,
                                      @PathVariable String sectionId,
                                      HttpServletRequest httpRequest) {
        return sectionService.getSection(userId(httpRequest), websiteId, sectionId);
    }

    @PatchMapping("/{sectionId}/settings")
    public SectionResponse updateSettings(@PathVariable String websiteId,
                                          @PathVariable String sectionId,
                                          @Valid @RequestBody SectionSettingsRequest request,
                                          HttpServletRequest httpRequest) {
        return sectionService.updateSettings(userId(httpRequest), websiteId, sectionId, request);
    }

    @DeleteMapping("/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable String websiteId,
                                              @PathVariable String sectionId,
                                              HttpServletRequest httpRequest) {
        sectionService.deleteSection(userId(httpRequest), websiteId, sectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/hero")
    public ResponseEntity<SectionResponse> createHero(@PathVariable String websiteId,
                                                      @Valid @RequestBody HeroSectionRequest request,
                                                      HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createHero(userId(httpRequest), websiteId, request));
    }

    @PutMapping("/{sectionId}/hero")
    public SectionResponse updateHero(@PathVariable String websiteId,
                                      @PathVariable String sectionId,
                                      @Valid @RequestBody HeroSectionRequest request,
                                      HttpServletRequest httpRequest) {
        return sectionService.updateHero(userId(httpRequest), websiteId, sectionId, request);
    }

    @PostMapping("/chronicle")
    public ResponseEntity<SectionResponse> createChronicle(@PathVariable String websiteId,
                                                           @Valid @RequestBody ChronicleSectionRequest request,
                                                           HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createChronicle(userId(httpRequest), websiteId, request));
    }

    @PutMapping("/{sectionId}/chronicle")
    public SectionResponse updateChronicle(@PathVariable String websiteId,
                                           @PathVariable String sectionId,
                                           @Valid @RequestBody ChronicleSectionRequest request,
                                           HttpServletRequest httpRequest) {
        return sectionService.updateChronicle(userId(httpRequest), websiteId, sectionId, request);
    }

    @PostMapping("/pursuits")
    public ResponseEntity<SectionResponse> createPursuits(@PathVariable String websiteId,
                                                          @Valid @RequestBody PursuitSectionRequest request,
                                                          HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createPursuits(userId(httpRequest), websiteId, request));
    }

    @PutMapping("/{sectionId}/pursuits")
    public SectionResponse updatePursuits(@PathVariable String websiteId,
                                          @PathVariable String sectionId,
                                          @Valid @RequestBody PursuitSectionRequest request,
                                          HttpServletRequest httpRequest) {
        return sectionService.updatePursuits(userId(httpRequest), websiteId, sectionId, request);
    }

    @PostMapping("/timeline")
    public ResponseEntity<SectionResponse> createTimeline(@PathVariable String websiteId,
                                                          @Valid @RequestBody TimelineSectionRequest request,
                                                          HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createTimeline(userId(httpRequest), websiteId, request));
    }

    @PutMapping("/{sectionId}/timeline")
    public SectionResponse updateTimeline(@PathVariable String websiteId,
                                          @PathVariable String sectionId,
                                          @Valid @RequestBody TimelineSectionRequest request,
                                          HttpServletRequest httpRequest) {
        return sectionService.updateTimeline(userId(httpRequest), websiteId, sectionId, request);
    }

    @PostMapping("/gallery")
    public ResponseEntity<SectionResponse> createGallery(@PathVariable String websiteId,
                                                         @Valid @RequestBody GallerySectionRequest request,
                                                         HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createGallery(userId(httpRequest), websiteId, request));
    }

    @PutMapping("/{sectionId}/gallery")
    public SectionResponse updateGallery(@PathVariable String websiteId,
                                         @PathVariable String sectionId,
                                         @Valid @RequestBody GallerySectionRequest request,
                                         HttpServletRequest httpRequest) {
        return sectionService.updateGallery(userId(httpRequest), websiteId, sectionId, request);
    }

    @PostMapping("/contact")
    public ResponseEntity<SectionResponse> createContact(@PathVariable String websiteId,
                                                         @Valid @RequestBody ContactSectionRequest request,
                                                         HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.createContact(userId(httpRequest), websiteId, request));
    }

    @PutMapping("/{sectionId}/contact")
    public SectionResponse updateContact(@PathVariable String websiteId,
                                         @PathVariable String sectionId,
                                         @Valid @RequestBody ContactSectionRequest request,
                                         HttpServletRequest httpRequest) {
        return sectionService.updateContact(userId(httpRequest), websiteId, sectionId, request);
    }

    private String userId(HttpServletRequest request) {
        return (String) request.getAttribute("userId");
    }
}

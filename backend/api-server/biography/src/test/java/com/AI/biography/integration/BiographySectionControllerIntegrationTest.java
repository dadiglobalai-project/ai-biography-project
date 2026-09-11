package com.AI.biography.integration;

import com.AI.biography.section.dto.request.*;
import com.AI.biography.section.entity.WebsiteMediaAsset;
import com.AI.biography.section.enums.SocialPlatform;
import com.AI.biography.section.repository.WebsiteMediaAssetRepository;
import com.AI.biography.template.TemplateRepository;
import com.AI.biography.user.UserRepository;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BiographySectionControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TemplateRepository templateRepository;

    @Autowired
    private BiographyWebsiteRepository websiteRepository;

    @Autowired
    private WebsiteMediaAssetRepository mediaRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Test
    void heroEndpointsCreateGetPatchAndDeleteSection() throws Exception {
        Fixture fixture = fixture();

        MvcResult create = mockMvc.perform(post("/api/websites/{websiteId}/sections/hero", fixture.websiteId())
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(TestDataFactory.hero(fixture.mediaId()))))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.sectionId").isNotEmpty())
                .andExpect(jsonPath("$.content.fullName").value("Ada Lovelace"))
                .andReturn();
        String sectionId = read(create).get("sectionId").asText();

        assertThat(count("hero_sections", "section_id", sectionId)).isEqualTo(1);

        mockMvc.perform(get("/api/websites/{websiteId}/sections/{sectionId}", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sectionId").value(sectionId))
                .andExpect(jsonPath("$.content.profileImageId").value(fixture.mediaId()));

        SectionSettingsRequest settings = new SectionSettingsRequest();
        settings.isVisible = false;
        settings.sortOrder = 12;

        mockMvc.perform(patch("/api/websites/{websiteId}/sections/{sectionId}/settings", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(settings)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sortOrder").value(12))
                .andExpect(jsonPath("$.isVisible").value(false))
                .andExpect(jsonPath("$.content.fullName").value("Ada Lovelace"));

        mockMvc.perform(delete("/api/websites/{websiteId}/sections/{sectionId}", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId()))
                .andExpect(status().isNoContent());

        assertThat(count("biography_sections", "section_id", sectionId)).isZero();
        assertThat(count("hero_sections", "section_id", sectionId)).isZero();

        mockMvc.perform(delete("/api/websites/{websiteId}/sections/{sectionId}", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void sectionsEndpointReturnsSectionsInSortOrder() throws Exception {
        Fixture fixture = fixture();
        mockMvc.perform(post("/api/websites/{websiteId}/sections/hero", fixture.websiteId())
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(TestDataFactory.hero(fixture.mediaId()))))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/websites/{websiteId}/sections/chronicle", fixture.websiteId())
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(TestDataFactory.chronicle())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/websites/{websiteId}/sections", fixture.websiteId())
                        .requestAttr("userId", fixture.userId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.websiteId").value(fixture.websiteId()))
                .andExpect(jsonPath("$.sections[0].sortOrder").value(2))
                .andExpect(jsonPath("$.sections[1].sortOrder").value(3));
    }

    @Test
    void chroniclePostAndPutUpdatesAddsAndRemovesBeliefs() throws Exception {
        Fixture fixture = fixture();
        MvcResult create = postSection(fixture, "chronicle", TestDataFactory.chronicle());
        JsonNode created = read(create);
        String sectionId = created.get("sectionId").asText();
        String keptBeliefId = created.at("/content/beliefs/items/0/id").asText();

        ChronicleSectionRequest update = TestDataFactory.chronicle();
        update.sectionTitle = "Updated Values";
        update.beliefs.items = List.of(
                TestDataFactory.belief(keptBeliefId, "Updated curiosity", 4),
                TestDataFactory.belief(null, "New courage", 5));

        mockMvc.perform(put("/api/websites/{websiteId}/sections/{sectionId}/chronicle", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.sectionTitle").value("Updated Values"))
                .andExpect(jsonPath("$.content.beliefs.items.length()").value(2))
                .andExpect(jsonPath("$.content.beliefs.items[0].sortOrder").value(4));

        assertThat(count("belief_items", "section_id", sectionId)).isEqualTo(2);
    }

    @Test
    void pursuitsPostAndPutUpdatesAddsAndRemovesItems() throws Exception {
        Fixture fixture = fixture();
        MvcResult create = postSection(fixture, "pursuits", TestDataFactory.pursuits(fixture.mediaId()));
        JsonNode created = read(create);
        String sectionId = created.get("sectionId").asText();
        String keptItemId = created.at("/content/items/0/id").asText();

        PursuitSectionRequest update = TestDataFactory.pursuits(fixture.mediaId());
        update.items = List.of(
                TestDataFactory.pursuit(keptItemId, "Updated computing", fixture.mediaId(), 3),
                TestDataFactory.pursuit(null, "New lecturing", null, 4));

        mockMvc.perform(put("/api/websites/{websiteId}/sections/{sectionId}/pursuits", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.items.length()").value(2))
                .andExpect(jsonPath("$.content.items[0].title").value("Updated computing"))
                .andExpect(jsonPath("$.content.items[0].imageId").value(fixture.mediaId()));

        assertThat(count("pursuit_items", "section_id", sectionId)).isEqualTo(2);
    }

    @Test
    void timelinePostAndPutUpdatesAddsAndRemovesEventsAndHighlights() throws Exception {
        Fixture fixture = fixture();
        TimelineSectionRequest createRequest = TestDataFactory.timeline(fixture.mediaId());
        createRequest.timelineEvents = List.of(
                TestDataFactory.event(null, "First note", fixture.mediaId(), 1),
                TestDataFactory.event(null, "Removed event", null, 2));
        MvcResult create = postSection(fixture, "timeline", createRequest);
        JsonNode created = read(create);
        String sectionId = created.get("sectionId").asText();
        String keptEventId = created.at("/content/timelineEvents/0/id").asText();
        String keptHighlightId = created.at("/content/timelineEvents/0/highlights/0/id").asText();

        TimelineSectionRequest update = TestDataFactory.timeline(fixture.mediaId());
        TimelineSectionRequest.TimelineEventRequest updatedEvent =
                TestDataFactory.event(keptEventId, "Updated first note", fixture.mediaId(), 7);
        updatedEvent.highlights = List.of(
                TestDataFactory.highlight(keptHighlightId, "Updated highlight", 8),
                TestDataFactory.highlight(null, "New highlight", 9));
        update.timelineEvents = List.of(
                updatedEvent,
                TestDataFactory.event(null, "New public lecture", null, 10));

        Statistics statistics = hibernateStatistics();
        statistics.clear();
        long startedAt = System.nanoTime();

        mockMvc.perform(put("/api/websites/{websiteId}/sections/{sectionId}/timeline", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.timelineEvents.length()").value(2))
                .andExpect(jsonPath("$.content.timelineEvents[0].sortOrder").value(7))
                .andExpect(jsonPath("$.content.timelineEvents[0].highlights.length()").value(2))
                .andExpect(jsonPath("$.content.timelineEvents[0].highlights[0].sortOrder").value(8));
        long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
        System.out.printf(
                "Timeline PUT diagnostics: elapsedMs=%d, preparedStatements=%d, entityFetches=%d, collectionFetches=%d%n",
                elapsedMs,
                statistics.getPrepareStatementCount(),
                statistics.getEntityFetchCount(),
                statistics.getCollectionFetchCount());

        assertThat(count("timeline_events", "section_id", sectionId)).isEqualTo(2);
        assertThat(jdbcTemplate.queryForObject("""
                select count(*) from timeline_highlights h
                join timeline_events e on e.timeline_event_id = h.timeline_event_id
                where e.section_id = ?
                """, Integer.class, sectionId)).isEqualTo(4);
    }

    @Test
    void timelinePutRejectsAnotherUsersSection() throws Exception {
        Fixture fixture = fixture();
        Fixture other = fixture();
        MvcResult create = postSection(fixture, "timeline", TestDataFactory.timeline(fixture.mediaId()));
        String sectionId = read(create).get("sectionId").asText();

        mockMvc.perform(put("/api/websites/{websiteId}/sections/{sectionId}/timeline", fixture.websiteId(), sectionId)
                        .requestAttr("userId", other.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(TestDataFactory.timeline(fixture.mediaId()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void galleryPostAndPutUpdatesAddsAndRemovesItems() throws Exception {
        Fixture fixture = fixture();
        MvcResult create = postSection(fixture, "gallery", TestDataFactory.gallery(fixture.mediaId()));
        JsonNode created = read(create);
        String sectionId = created.get("sectionId").asText();
        String keptItemId = created.at("/content/items/0/id").asText();

        GallerySectionRequest update = TestDataFactory.gallery(fixture.mediaId());
        update.items = List.of(
                TestDataFactory.galleryItem(keptItemId, "Updated portrait", fixture.mediaId(), 5),
                TestDataFactory.galleryItem(null, "New diagram", null, 6));

        mockMvc.perform(put("/api/websites/{websiteId}/sections/{sectionId}/gallery", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.items.length()").value(2))
                .andExpect(jsonPath("$.content.items[0].title").value("Updated portrait"))
                .andExpect(jsonPath("$.content.items[0].mediaAssetId").value(fixture.mediaId()));

        assertThat(count("gallery_items", "section_id", sectionId)).isEqualTo(2);
    }

    @Test
    void contactPostAndPutUpdatesAddsAndRemovesSocialLinks() throws Exception {
        Fixture fixture = fixture();
        MvcResult create = postSection(fixture, "contact", TestDataFactory.contact());
        JsonNode created = read(create);
        String sectionId = created.get("sectionId").asText();
        String keptLinkId = created.at("/content/socialLinks/0/id").asText();

        ContactSectionRequest update = TestDataFactory.contact();
        update.sectionTitle = "Updated Contact";
        update.socialLinks = List.of(
                TestDataFactory.social(keptLinkId, SocialPlatform.LINKEDIN, 3),
                TestDataFactory.social(null, SocialPlatform.EMAIL, 4));

        mockMvc.perform(put("/api/websites/{websiteId}/sections/{sectionId}/contact", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.sectionTitle").value("Updated Contact"))
                .andExpect(jsonPath("$.content.socialLinks.length()").value(2))
                .andExpect(jsonPath("$.content.socialLinks[0].sortOrder").value(3));

        assertThat(count("social_links", "section_id", sectionId)).isEqualTo(2);
        assertThat(count("contact_form_settings", "section_id", sectionId)).isEqualTo(1);
    }

    @Test
    void validationOwnershipAndDuplicateErrorsUseCurrentProjectBehavior() throws Exception {
        Fixture fixture = fixture();
        Fixture other = fixture();

        HeroSectionRequest invalidHero = TestDataFactory.hero(fixture.mediaId());
        invalidHero.fullName = "";
        mockMvc.perform(post("/api/websites/{websiteId}/sections/hero", fixture.websiteId())
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(invalidHero)))
                .andExpect(status().isBadRequest());

        MvcResult hero = postSection(fixture, "hero", TestDataFactory.hero(fixture.mediaId()));
        String sectionId = read(hero).get("sectionId").asText();

        mockMvc.perform(post("/api/websites/{websiteId}/sections/hero", fixture.websiteId())
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(TestDataFactory.hero(fixture.mediaId()))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/websites/{websiteId}/sections/{sectionId}", other.websiteId(), sectionId)
                        .requestAttr("userId", other.userId()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/websites/{websiteId}/sections", fixture.websiteId())
                        .requestAttr("userId", other.userId()))
                .andExpect(status().isNotFound());

        HeroSectionRequest wrongMedia = TestDataFactory.hero(other.mediaId());
        mockMvc.perform(put("/api/websites/{websiteId}/sections/{sectionId}/hero", fixture.websiteId(), sectionId)
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(wrongMedia)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/websites/{websiteId}/sections", "not-a-uuid")
                        .requestAttr("userId", fixture.userId()))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/websites/{websiteId}/sections/gallery", fixture.websiteId())
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"sectionTitle":"Gallery","sortOrder":1,"isVisible":true,
                                 "items":[{"mediaType":"NOT_REAL","title":"Bad","sortOrder":1}]}
                                """))
                .andExpect(status().isBadRequest());
    }

    private MvcResult postSection(Fixture fixture, String endpoint, Object request) throws Exception {
        return mockMvc.perform(post("/api/websites/{websiteId}/sections/" + endpoint, fixture.websiteId())
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(request)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.sectionId").isNotEmpty())
                .andReturn();
    }

    private Fixture fixture() {
        var user = userRepository.saveAndFlush(TestDataFactory.user());
        var template = templateRepository.saveAndFlush(TestDataFactory.template());
        BiographyWebsite website = websiteRepository.saveAndFlush(TestDataFactory.website(user, template));
        WebsiteMediaAsset media = mediaRepository.saveAndFlush(TestDataFactory.media(website));
        return new Fixture(user.getUserId(), website.getWebsiteId(), media.getMediaAssetId());
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    private JsonNode read(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private int count(String table, String column, String value) {
        entityManager.flush();
        return jdbcTemplate.queryForObject("select count(*) from " + table + " where " + column + " = ?",
                Integer.class, value);
    }

    private Statistics hibernateStatistics() {
        Statistics statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.setStatisticsEnabled(true);
        return statistics;
    }

    private record Fixture(String userId, String websiteId, String mediaId) {
    }
}

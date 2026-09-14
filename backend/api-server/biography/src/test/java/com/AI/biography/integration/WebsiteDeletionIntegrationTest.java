package com.AI.biography.integration;

import com.AI.biography.aiwriting.entity.AiWritingOutput;
import com.AI.biography.aiwriting.entity.AiWritingRequest;
import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import com.AI.biography.aiwriting.enums.AiWritingStatus;
import com.AI.biography.aiwriting.repository.AiWritingOutputRepository;
import com.AI.biography.aiwriting.repository.AiWritingRequestRepository;
import com.AI.biography.section.entity.ContactMessage;
import com.AI.biography.section.entity.WebsiteMediaAsset;
import com.AI.biography.section.enums.ContactMessageStatus;
import com.AI.biography.section.repository.BiographySectionRepository;
import com.AI.biography.section.repository.ContactMessageRepository;
import com.AI.biography.section.repository.WebsiteMediaAssetRepository;
import com.AI.biography.template.Template;
import com.AI.biography.template.TemplateRepository;
import com.AI.biography.user.User;
import com.AI.biography.user.UserRepository;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class WebsiteDeletionIntegrationTest {
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
    private BiographySectionRepository sectionRepository;

    @Autowired
    private WebsiteMediaAssetRepository mediaRepository;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private AiWritingRequestRepository aiWritingRequestRepository;

    @Autowired
    private AiWritingOutputRepository aiWritingOutputRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void ownerCanDeleteWebsiteAndDatabaseCascadesOwnedDataWhilePreservingAiHistory() throws Exception {
        Fixture fixture = fixture();
        MvcResult timeline = mockMvc.perform(post("/api/websites/{websiteId}/sections/timeline", fixture.websiteId())
                        .requestAttr("userId", fixture.userId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestDataFactory.timeline(fixture.mediaId()))))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode timelineJson = objectMapper.readTree(timeline.getResponse().getContentAsString());
        String sectionId = timelineJson.get("sectionId").asText();
        String eventId = timelineJson.at("/content/timelineEvents/0/id").asText();
        String highlightId = timelineJson.at("/content/timelineEvents/0/highlights/0/id").asText();
        ContactMessage contactMessage = contactMessageRepository.saveAndFlush(contactMessage(fixture.website()));
        AiWritingRequest aiRequest = aiWritingRequestRepository.saveAndFlush(
                aiRequest(fixture.user(), fixture.website(), sectionRepository.getReferenceById(sectionId))
        );
        AiWritingOutput aiOutput = aiWritingOutputRepository.saveAndFlush(aiOutput(aiRequest));
        entityManager.flush();

        mockMvc.perform(delete("/api/websites/{websiteId}", fixture.websiteId())
                        .requestAttr("userId", fixture.userId()))
                .andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();

        assertThat(count("biography_websites", "website_id", fixture.websiteId())).isZero();
        assertThat(count("biography_sections", "section_id", sectionId)).isZero();
        assertThat(count("timeline_sections", "section_id", sectionId)).isZero();
        assertThat(count("timeline_events", "timeline_event_id", eventId)).isZero();
        assertThat(count("timeline_highlights", "timeline_highlight_id", highlightId)).isZero();
        assertThat(count("website_media_assets", "media_asset_id", fixture.mediaId())).isZero();
        assertThat(count("contact_messages", "contact_message_id", contactMessage.getContactMessageId())).isZero();
        assertThat(count("templates", "template_id", fixture.templateId())).isEqualTo(1);
        assertThat(count("users", "user_id", fixture.userId())).isEqualTo(1);
        assertThat(count("ai_writing_requests", "request_id", aiRequest.getRequestId())).isEqualTo(1);
        assertThat(count("ai_writing_outputs", "output_id", aiOutput.getOutputId())).isEqualTo(1);
        assertThat(aiWritingWebsiteId(aiRequest.getRequestId())).isNull();
        assertThat(aiWritingSectionId(aiRequest.getRequestId())).isNull();
    }

    @Test
    void anotherUserCannotDeleteWebsite() throws Exception {
        Fixture fixture = fixture();
        Fixture other = fixture();

        mockMvc.perform(delete("/api/websites/{websiteId}", fixture.websiteId())
                        .requestAttr("userId", other.userId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Website not found"));

        entityManager.flush();
        assertThat(count("biography_websites", "website_id", fixture.websiteId())).isEqualTo(1);
    }

    @Test
    void missingWebsiteReturnsNotFound() throws Exception {
        Fixture fixture = fixture();

        mockMvc.perform(delete("/api/websites/{websiteId}", TestDataFactory.uuid())
                        .requestAttr("userId", fixture.userId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Website not found"));
    }

    private Fixture fixture() {
        User user = userRepository.saveAndFlush(TestDataFactory.user());
        Template template = templateRepository.saveAndFlush(TestDataFactory.template());
        BiographyWebsite website = websiteRepository.saveAndFlush(TestDataFactory.website(user, template));
        WebsiteMediaAsset media = mediaRepository.saveAndFlush(TestDataFactory.media(website));
        return new Fixture(user, website, media.getMediaAssetId(), template.getTemplateId());
    }

    private ContactMessage contactMessage(BiographyWebsite website) {
        ContactMessage message = new ContactMessage();
        message.setContactMessageId(TestDataFactory.uuid());
        message.setWebsite(website);
        message.setSenderName("Grace Hopper");
        message.setSenderEmail("grace@example.com");
        message.setSubject("Hello");
        message.setMessage("A thoughtful note.");
        message.setStatus(ContactMessageStatus.NEW);
        message.setSubmittedAt(LocalDateTime.now());
        return message;
    }

    private AiWritingRequest aiRequest(User user, BiographyWebsite website, com.AI.biography.section.entity.BiographySection section) {
        AiWritingRequest request = new AiWritingRequest();
        request.setUser(user);
        request.setWebsite(website);
        request.setSection(section);
        request.setActionType(AiWritingAction.GENERATE);
        request.setUserInstruction("Write a short intro.");
        request.setLanguage(AiLanguage.ENGLISH);
        request.setProvider("DEEPSEEK");
        request.setModelName("deepseek-v4-flash");
        request.setStatus(AiWritingStatus.COMPLETED);
        request.setCreatedAt(LocalDateTime.now());
        request.setCompletedAt(LocalDateTime.now());
        return request;
    }

    private AiWritingOutput aiOutput(AiWritingRequest request) {
        AiWritingOutput output = new AiWritingOutput();
        output.setRequest(request);
        output.setGeneratedText("Generated biography content.");
        output.setEnglishWordCount(3);
        output.setChineseCharacterCount(0);
        output.setSelected(true);
        output.setCreatedAt(LocalDateTime.now());
        return output;
    }

    private int count(String table, String column, String value) {
        return jdbcTemplate.queryForObject(
                "select count(*) from " + table + " where " + column + " = ?",
                Integer.class,
                value
        );
    }

    private String aiWritingWebsiteId(String requestId) {
        return jdbcTemplate.queryForObject(
                "select website_id from ai_writing_requests where request_id = ?",
                String.class,
                requestId
        );
    }

    private String aiWritingSectionId(String requestId) {
        return jdbcTemplate.queryForObject(
                "select section_id from ai_writing_requests where request_id = ?",
                String.class,
                requestId
        );
    }

    private record Fixture(User user, BiographyWebsite website, String mediaId, String templateId) {
        String userId() {
            return user.getUserId();
        }

        String websiteId() {
            return website.getWebsiteId();
        }
    }
}

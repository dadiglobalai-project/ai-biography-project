package com.AI.biography.integration;

import com.AI.biography.section.dto.request.ContactMessageStatusRequest;
import com.AI.biography.section.entity.WebsiteMediaAsset;
import com.AI.biography.section.enums.ContactMessageStatus;
import com.AI.biography.section.repository.ContactMessageRepository;
import com.AI.biography.section.repository.WebsiteMediaAssetRepository;
import com.AI.biography.template.TemplateRepository;
import com.AI.biography.user.UserRepository;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ContactMessageControllerIntegrationTest {
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
    private ContactMessageRepository contactMessageRepository;

    @Test
    void publicSubmissionAndAdministrativeEndpointsWorkThroughMockMvc() throws Exception {
        Fixture fixture = fixture();

        MvcResult create = mockMvc.perform(post("/api/public/websites/{websiteId}/contact-messages", fixture.websiteId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(TestDataFactory.contactMessage())))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.contactMessageId").isNotEmpty())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andReturn();
        String messageId = read(create).get("contactMessageId").asText();

        assertThat(contactMessageRepository.findById(messageId)).isPresent();

        mockMvc.perform(get("/api/websites/{websiteId}/contact-messages", fixture.websiteId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].contactMessageId").value(messageId))
                .andExpect(jsonPath("$[0].senderEmail").value("grace@example.com"));

        mockMvc.perform(get("/api/websites/{websiteId}/contact-messages/{messageId}", fixture.websiteId(), messageId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.websiteId").value(fixture.websiteId()))
                .andExpect(jsonPath("$.contactMessageId").value(messageId));

        ContactMessageStatusRequest readRequest = new ContactMessageStatusRequest();
        readRequest.status = ContactMessageStatus.READ;
        mockMvc.perform(patch("/api/websites/{websiteId}/contact-messages/{messageId}/status", fixture.websiteId(), messageId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(readRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"))
                .andExpect(jsonPath("$.readAt").isNotEmpty());

        ContactMessageStatusRequest repliedRequest = new ContactMessageStatusRequest();
        repliedRequest.status = ContactMessageStatus.REPLIED;
        mockMvc.perform(patch("/api/websites/{websiteId}/contact-messages/{messageId}/status", fixture.websiteId(), messageId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(repliedRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REPLIED"))
                .andExpect(jsonPath("$.repliedAt").isNotEmpty());

        mockMvc.perform(delete("/api/websites/{websiteId}/contact-messages/{messageId}", fixture.websiteId(), messageId))
                .andExpect(status().isNoContent());

        assertThat(contactMessageRepository.findById(messageId)).isEmpty();

        mockMvc.perform(delete("/api/websites/{websiteId}/contact-messages/{messageId}", fixture.websiteId(), messageId))
                .andExpect(status().isNotFound());
    }

    @Test
    void validationOwnershipAndUnknownWebsiteErrorsUseCurrentProjectBehavior() throws Exception {
        Fixture fixture = fixture();
        Fixture other = fixture();

        var invalidEmail = TestDataFactory.contactMessage();
        invalidEmail.senderEmail = "not-an-email";
        mockMvc.perform(post("/api/public/websites/{websiteId}/contact-messages", fixture.websiteId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(invalidEmail)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/public/websites/{websiteId}/contact-messages", TestDataFactory.uuid())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(TestDataFactory.contactMessage())))
                .andExpect(status().isNotFound());

        MvcResult create = mockMvc.perform(post("/api/public/websites/{websiteId}/contact-messages", fixture.websiteId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(TestDataFactory.contactMessage())))
                .andExpect(status().isCreated())
                .andReturn();
        String messageId = read(create).get("contactMessageId").asText();

        mockMvc.perform(get("/api/websites/{websiteId}/contact-messages/{messageId}", other.websiteId(), messageId))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/websites/{websiteId}/contact-messages/{messageId}/status", fixture.websiteId(), messageId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"NOT_REAL\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void currentSecurityConfigurationLeavesAdminEndpointsPublic() throws Exception {
        Fixture fixture = fixture();

        mockMvc.perform(get("/api/websites/{websiteId}/contact-messages", fixture.websiteId()))
                .andExpect(status().isOk());
    }

    private Fixture fixture() {
        var user = userRepository.saveAndFlush(TestDataFactory.user());
        var template = templateRepository.saveAndFlush(TestDataFactory.template());
        BiographyWebsite website = websiteRepository.saveAndFlush(TestDataFactory.website(user, template));
        WebsiteMediaAsset media = mediaRepository.saveAndFlush(TestDataFactory.media(website));
        return new Fixture(website.getWebsiteId(), media.getMediaAssetId());
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    private JsonNode read(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private record Fixture(String websiteId, String mediaId) {
    }
}

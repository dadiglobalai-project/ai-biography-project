package com.AI.biography.integration;

import com.AI.biography.aiwriting.entity.AiWritingOutput;
import com.AI.biography.aiwriting.entity.AiWritingRequest;
import com.AI.biography.aiwriting.enums.AiLanguage;
import com.AI.biography.aiwriting.enums.AiWritingAction;
import com.AI.biography.aiwriting.enums.AiWritingStatus;
import com.AI.biography.aiwriting.repository.AiWritingOutputRepository;
import com.AI.biography.aiwriting.repository.AiWritingRequestRepository;
import com.AI.biography.section.entity.BiographySection;
import com.AI.biography.section.enums.SectionType;
import com.AI.biography.section.repository.BiographySectionRepository;
import com.AI.biography.template.TemplateRepository;
import com.AI.biography.user.User;
import com.AI.biography.user.UserRepository;
import com.AI.biography.website.BiographyWebsite;
import com.AI.biography.website.BiographyWebsiteRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AiWritingSectionForeignKeyIntegrationTest {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TemplateRepository templateRepository;

    @Autowired
    private BiographyWebsiteRepository websiteRepository;

    @Autowired
    private BiographySectionRepository sectionRepository;

    @Autowired
    private AiWritingRequestRepository requestRepository;

    @Autowired
    private AiWritingOutputRepository outputRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void aiWritingRequestReferencesBiographySectionAndIsPreservedWhenSectionIsDeleted() {
        User user = userRepository.saveAndFlush(TestDataFactory.user());
        BiographyWebsite website = websiteRepository.saveAndFlush(
                TestDataFactory.website(user, templateRepository.saveAndFlush(TestDataFactory.template()))
        );
        BiographySection section = sectionRepository.saveAndFlush(section(website));

        AiWritingRequest request = requestRepository.saveAndFlush(request(user, website, section));
        AiWritingOutput output = outputRepository.saveAndFlush(output(request));

        assertThat(sectionIdFor(request.getRequestId())).isEqualTo(section.getSectionId());

        sectionRepository.delete(section);
        sectionRepository.flush();

        assertThat(sectionIdFor(request.getRequestId())).isNull();
        assertThat(count("ai_writing_requests", "request_id", request.getRequestId())).isEqualTo(1);
        assertThat(count("ai_writing_outputs", "output_id", output.getOutputId())).isEqualTo(1);
    }

    private BiographySection section(BiographyWebsite website) {
        BiographySection section = new BiographySection();
        section.setSectionId(TestDataFactory.uuid());
        section.setWebsite(website);
        section.setSectionType(SectionType.HERO);
        section.setSectionKey("hero");
        section.setSortOrder(1);
        section.setVisible(true);
        section.setCreatedAt(LocalDateTime.now());
        section.setUpdatedAt(LocalDateTime.now());
        return section;
    }

    private AiWritingRequest request(User user, BiographyWebsite website, BiographySection section) {
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

    private AiWritingOutput output(AiWritingRequest request) {
        AiWritingOutput output = new AiWritingOutput();
        output.setRequest(request);
        output.setGeneratedText("Generated biography content.");
        output.setEnglishWordCount(3);
        output.setChineseCharacterCount(0);
        output.setSelected(true);
        output.setCreatedAt(LocalDateTime.now());
        return output;
    }

    private String sectionIdFor(String requestId) {
        return jdbcTemplate.queryForObject(
                "select section_id from ai_writing_requests where request_id = ?",
                String.class,
                requestId
        );
    }

    private int count(String table, String column, String value) {
        return jdbcTemplate.queryForObject(
                "select count(*) from " + table + " where " + column + " = ?",
                Integer.class,
                value
        );
    }
}

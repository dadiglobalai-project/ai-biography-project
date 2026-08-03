package com.AI.biography.media.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class SupabaseMediaStorageServiceTest {
    private static final String STORAGE_KEY = "websites/website-1/gallery/media-1.png";
    private static final String SERVICE_ROLE_KEY = "service-role-key";

    private MockRestServiceServer server;
    private SupabaseMediaStorageService service;

    @BeforeEach
    void setUp() {
        SupabaseStorageProperties properties = new SupabaseStorageProperties();
        properties.setUrl("https://project.supabase.co");
        properties.setServiceRoleKey(SERVICE_ROLE_KEY);
        properties.setBucket("biography-images");

        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        service = new SupabaseMediaStorageService(properties, builder);
    }

    @Test
    void deleteSendsSupabaseRemoveRequestWithJsonBody() {
        server.expect(once(), requestTo("https://project.supabase.co/storage/v1/object/biography-images"))
                .andExpect(method(HttpMethod.DELETE))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ROLE_KEY))
                .andExpect(header("apikey", SERVICE_ROLE_KEY))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                          "prefixes": ["websites/website-1/gallery/media-1.png"]
                        }
                        """))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        service.delete(STORAGE_KEY);

        server.verify();
    }

    @Test
    void deleteIncludesSupabaseStatusAndBodyWhenStorageRejectsRequest() {
        server.expect(once(), requestTo("https://project.supabase.co/storage/v1/object/biography-images"))
                .andExpect(method(HttpMethod.DELETE))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"message\":\"prefixes is required\"}"));

        assertThatThrownBy(() -> service.delete(STORAGE_KEY))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("status=400")
                .hasMessageContaining("prefixes is required");

        server.verify();
    }
}

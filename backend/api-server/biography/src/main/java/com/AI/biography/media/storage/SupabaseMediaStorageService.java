package com.AI.biography.media.storage;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class SupabaseMediaStorageService implements MediaStorageService {
    private static final Logger LOGGER = LoggerFactory.getLogger(SupabaseMediaStorageService.class);

    private final SupabaseStorageProperties properties;
    private final RestClient restClient;

    public SupabaseMediaStorageService(SupabaseStorageProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public StoredMedia upload(String storageKey, MultipartFile file) {
        requireConfigured();
        try {
            restClient.post()
                    .uri(objectUrl(storageKey))
                    .contentType(MediaType.parseMediaType(file.getContentType()))
                    .header("Authorization", "Bearer " + properties.getServiceRoleKey())
                    .header("apikey", properties.getServiceRoleKey())
                    .header("x-upsert", "false")
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();
            return new StoredMedia(properties.getBucket(), storageKey);
        } catch (IOException e) {
            throw new StorageException("Unable to read upload file", e);
        } catch (RuntimeException e) {
            throw new StorageException("Failed to upload media to storage", e);
        }
    }

    @Override
    public void delete(String storageKey) {
        requireConfigured();
        String bucket = cleanBucket();
        String requestUrl = deleteObjectsUrl();
        try {
            restClient.method(HttpMethod.DELETE)
                    .uri(requestUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.getServiceRoleKey())
                    .header("apikey", properties.getServiceRoleKey())
                    .body(Map.of("prefixes", List.of(storageKey)))
                    .exchange((request, response) -> {
                        String responseBody = responseBody(response);
                        LOGGER.info(
                                "Supabase storage delete response requestUrl={} bucket={} storageKey={} httpStatus={} responseBody={}",
                                requestUrl,
                                bucket,
                                storageKey,
                                response.getStatusCode().value(),
                                responseBody
                        );
                        if (response.getStatusCode().isError()) {
                            throw new StorageException("Failed to delete media from storage: Supabase returned status=%s body=%s"
                                    .formatted(response.getStatusCode().value(), responseBody));
                        }
                        return null;
                    });
        } catch (StorageException e) {
            LOGGER.warn(
                    "Supabase storage delete failed requestUrl={} bucket={} storageKey={} exception={}",
                    requestUrl,
                    bucket,
                    storageKey,
                    e.getMessage(),
                    e
            );
            throw e;
        } catch (RestClientResponseException e) {
            LOGGER.warn(
                    "Supabase storage delete failed requestUrl={} bucket={} storageKey={} httpStatus={} responseBody={} exception={}",
                    requestUrl,
                    bucket,
                    storageKey,
                    e.getStatusCode().value(),
                    e.getResponseBodyAsString(),
                    e.getMessage(),
                    e
            );
            throw new StorageException("Failed to delete media from storage: Supabase returned status=%s body=%s"
                    .formatted(e.getStatusCode().value(), e.getResponseBodyAsString()), e);
        } catch (RuntimeException e) {
            LOGGER.warn(
                    "Supabase storage delete failed requestUrl={} bucket={} storageKey={} exception={}",
                    requestUrl,
                    bucket,
                    storageKey,
                    e.getMessage(),
                    e
            );
            throw new StorageException("Failed to delete media from storage", e);
        }
    }

    @Override
    public String createAccessUrl(String storageKey) {
        requireConfigured();
        try {
            JsonNode response = restClient.post()
                    .uri(signUrl(storageKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.getServiceRoleKey())
                    .header("apikey", properties.getServiceRoleKey())
                    .body(Map.of("expiresIn", properties.getSignedUrlTtlSeconds()))
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                throw new StorageException("Storage did not return a signed URL");
            }

            JsonNode signedUrl = response.get("signedURL");
            if (signedUrl == null) {
                signedUrl = response.get("signedUrl");
            }
            if (signedUrl == null || signedUrl.asText().isBlank()) {
                throw new StorageException("Storage did not return a signed URL");
            }

            String value = signedUrl.asText();
            if (value.startsWith("http://") || value.startsWith("https://")) {
                return value;
            }
            return storageEndpoint() + value;
        } catch (RuntimeException e) {
            if (e instanceof StorageException) {
                throw e;
            }
            throw new StorageException("Failed to create media access URL", e);
        }
    }

    private String objectUrl(String storageKey) {
        return storageEndpoint() + "/object/" + cleanBucket() + "/" + storageKey;
    }

    private String deleteObjectsUrl() {
        return storageEndpoint() + "/object/" + cleanBucket();
    }

    private String signUrl(String storageKey) {
        return storageEndpoint() + "/object/sign/" + cleanBucket() + "/" + storageKey;
    }

    private String responseBody(ClientHttpResponse response) throws IOException {
        return new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private String storageEndpoint() {
        if (StringUtils.hasText(properties.getEndpoint())) {
            return trimTrailingSlash(properties.getEndpoint());
        }
        return trimTrailingSlash(properties.getUrl()) + "/storage/v1";
    }

    private String cleanBucket() {
        return properties.getBucket().trim();
    }

    private void requireConfigured() {
        if ((!StringUtils.hasText(properties.getEndpoint()) && !StringUtils.hasText(properties.getUrl()))
                || !StringUtils.hasText(properties.getServiceRoleKey())
                || !StringUtils.hasText(properties.getBucket())) {
            throw new StorageException("Supabase storage is not configured");
        }
        if (!storageEndpoint().startsWith("http://") && !storageEndpoint().startsWith("https://")) {
            throw new StorageException("Supabase storage endpoint is not configured");
        }
    }

    private String trimTrailingSlash(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }
}

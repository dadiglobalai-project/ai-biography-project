package com.AI.biography.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpClient.Redirect;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpHeaders;
import java.security.Security;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.net.ssl.SSLSession;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MembershipPaymentSmokeIT {
    private static final String DEFAULT_API_BASE_URL = "http://localhost:8080";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(90);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(REQUEST_TIMEOUT)
            .followRedirects(Redirect.NORMAL)
            .version(HttpClient.Version.HTTP_1_1)
            .build();
    private final String apiBaseUrl = apiBaseUrl();
    private final String runId = Instant.now().toEpochMilli() + "-" + UUID.randomUUID();
    private final List<SmokeResult> results = new ArrayList<>();

    public static void main(String[] args) throws Exception {
        MembershipPaymentSmokeIT smoke = new MembershipPaymentSmokeIT();
        try {
            smoke.userSidePaymentMembershipAndForbiddenAdminChecks();
        } finally {
            smoke.printReport();
        }
    }

    @AfterEach
    void printSmokeReport() {
        printReport();
    }

    @Test
    void userSidePaymentMembershipAndForbiddenAdminChecks() throws Exception {
        printHttpDiagnostics();
        assertStatus("GET", "/api/membership/plans",
                get("/api/membership/plans", null), 200);

        SmokeUser user = registerSmokeUser("user-a");

        assertStatus("GET", "/api/membership/current", get("/api/membership/current", user.token()), 204);

        HttpResponse<String> plansResponse = assertStatus("GET", "/api/membership/plans",
                get("/api/membership/plans", user.token()), 200);
        JsonNode plans = json(plansResponse).path("plans");
        if (!plans.isArray() || plans.size() == 0) {
            markLastResultFailed("response=" + plansResponse.body());
        }
        assertThat(plans.isArray()).as("membership plans response should contain a plans array").isTrue();
        assertThat(plans.size()).as("staging must have at least one active membership plan").isGreaterThan(0);
        String planId = plans.get(0).path("planId").asText();
        assertThat(planId).as("first active plan should have a planId").isNotBlank();

        HttpResponse<String> paymentResponse = assertStatus("POST", "/api/payments",
                post("/api/payments", user.token(), createPaymentJson(planId)), 201);
        JsonNode payment = json(paymentResponse);
        String paymentId = payment.path("paymentId").asText();
        assertThat(paymentId).as("created payment should have a paymentId").isNotBlank();
        assertThat(payment.path("status").asText()).isEqualTo("PENDING");
        assertThat(payment.path("paymentReference").asText()).startsWith("PAY-");

        HttpResponse<String> currentPaymentResponse = assertStatus("GET", "/api/payments/current",
                get("/api/payments/current", user.token()), 200);
        assertThat(json(currentPaymentResponse).path("paymentId").asText()).isEqualTo(paymentId);

        HttpResponse<String> paymentByIdResponse = assertStatus("GET", "/api/payments/" + paymentId,
                get("/api/payments/" + paymentId, user.token()), 200);
        assertThat(json(paymentByIdResponse).path("paymentId").asText()).isEqualTo(paymentId);

        assertStatus("POST", "/api/payments", post("/api/payments", user.token(), createPaymentJson(planId)), 409);

        assertStatus("GET", "/api/admin/payments", get("/api/admin/payments", user.token()), 403);
        assertStatus("GET", "/api/admin/payments/" + paymentId,
                get("/api/admin/payments/" + paymentId, user.token(), "X-Role", "ADMIN"), 403);
        assertStatus("PATCH", "/api/admin/payments/" + paymentId + "/confirm",
                patch("/api/admin/payments/" + paymentId + "/confirm", user.token(), "{}"), 403);
        assertStatus("PATCH", "/api/admin/payments/" + paymentId + "/reject",
                patch("/api/admin/payments/" + paymentId + "/reject", user.token(), null), 403);
        assertStatus("GET", "/api/admin/refunds", get("/api/admin/refunds", user.token()), 403);
        String approveRefundEndpoint = "/api/admin/refunds/" + UUID.randomUUID() + "/approve";
        assertStatus("PATCH", approveRefundEndpoint, patch(approveRefundEndpoint, user.token(), null), 403);
        String rejectRefundEndpoint = "/api/admin/refunds/" + UUID.randomUUID() + "/reject";
        assertStatus("PATCH", rejectRefundEndpoint, patch(rejectRefundEndpoint, user.token(), null), 403);
        String completeRefundEndpoint = "/api/admin/refunds/" + UUID.randomUUID() + "/complete";
        assertStatus("PATCH", completeRefundEndpoint, patch(completeRefundEndpoint, user.token(), completeRefundJson()), 403);
        String adminMembershipEndpoint = "/api/admin/users/" + UUID.randomUUID() + "/membership";
        assertStatus("GET", adminMembershipEndpoint, get(adminMembershipEndpoint, user.token()), 403);

        assertAllSmokeResultsPassed();
    }

    private SmokeUser registerSmokeUser(String label) throws Exception {
        String email = "smoke-" + shortRunId() + "-" + label + "@example.com";
        String password = "SmokeTest123!";
        String endpoint = "/api/auth/register";
        String body = """
                {
                  "fullName": "Smoke Test %s",
                  "email": "%s",
                  "password": "%s",
                  "confirmPassword": "%s",
                  "agreedToTerms": true
                }
                """.formatted(label, email, password, password);
        HttpResponse<String> response = post(endpoint, null, body);
        String registrationFailureDetails = "request=" + redactSensitiveFields(body)
                + " response=" + response.body();
        response = assertStatus("POST", endpoint, response, 200, registrationFailureDetails);
        assertThat(response.statusCode())
                .as("registration must succeed before dependent membership/payment smoke checks can continue")
                .isEqualTo(200);
        String token = json(response).path("token").asText();
        assertThat(token).as("registration should return a JWT token").isNotBlank();
        return new SmokeUser(email, token);
    }

    private HttpResponse<String> assertStatus(String method,
                                              String endpoint,
                                              HttpResponse<String> response,
                                              int expectedStatus) {
        boolean passed = response.statusCode() == expectedStatus;
        results.add(new SmokeResult(method, endpoint, response.statusCode(), passed, sanitizeResponseBody(response.body())));
        return response;
    }

    private HttpResponse<String> assertStatus(String method,
                                              String endpoint,
                                              HttpResponse<String> response,
                                              int expectedStatus,
                                              String failureDetails) {
        boolean passed = response.statusCode() == expectedStatus;
        String details = passed ? sanitizeResponseBody(response.body()) : failureDetails;
        results.add(new SmokeResult(method, endpoint, response.statusCode(), passed, details));
        return response;
    }

    private HttpResponse<String> get(String endpoint, String token, String... headers) throws IOException, InterruptedException {
        HttpRequest.Builder builder = request(endpoint).GET();
        addToken(builder, token);
        addHeaders(builder, headers);
        return send(builder.build());
    }

    private HttpResponse<String> post(String endpoint, String token, String body) throws IOException, InterruptedException {
        HttpRequest.Builder builder = request(endpoint)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        addToken(builder, token);
        return send(builder.build());
    }

    private HttpResponse<String> patch(String endpoint, String token, String body) throws IOException, InterruptedException {
        HttpRequest.BodyPublisher publisher = body == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body);
        HttpRequest.Builder builder = request(endpoint)
                .header("Content-Type", "application/json")
                .method("PATCH", publisher);
        addToken(builder, token);
        return send(builder.build());
    }

    private HttpRequest.Builder request(String endpoint) {
        return HttpRequest.newBuilder(URI.create(apiBaseUrl + endpoint))
                .timeout(REQUEST_TIMEOUT)
                .version(HttpClient.Version.HTTP_1_1)
                .header("Accept", "application/json");
    }

    private HttpResponse<String> send(HttpRequest request) throws IOException, InterruptedException {
        IOException lastException = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            Instant startedAt = Instant.now();
            try {
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                printResponseDiagnostics(request, response, attempt, Duration.between(startedAt, Instant.now()));
                return response;
            } catch (InterruptedException exception) {
                results.add(new SmokeResult(request.method(), request.uri().getPath(), 0, false,
                        exceptionDetails(exception)));
                throw exception;
            } catch (IOException exception) {
                lastException = exception;
                Duration elapsed = Duration.between(startedAt, Instant.now());
                System.out.printf(Locale.ROOT,
                        "HTTP %s %s -> attempt=%d elapsed=%s exception=%s%n",
                        request.method(),
                        request.uri(),
                        attempt,
                        elapsed,
                        exceptionDetails(exception));
                if (attempt == 2 || !isConnectChannelFailure(exception)) {
                    return failedResponse(request, exceptionDetails(exception));
                }
                System.out.println("Retrying once after Java HttpClient connect/channel failure");
            }
        }
        return failedResponse(request, exceptionDetails(lastException));
    }

    private JsonNode json(HttpResponse<String> response) throws IOException {
        return OBJECT_MAPPER.readTree(response.body());
    }

    private String createPaymentJson(String planId) {
        return """
                {
                  "planId": "%s",
                  "paymentMethod": "WECHAT",
                  "paymentRemark": "smoke-test-%s",
                  "autoRenew": true
                }
                """.formatted(planId, runId);
    }

    private String completeRefundJson() {
        return """
                {
                  "refundMethod": "WECHAT",
                  "externalRefundReference": "SMOKE-REFUND-%s"
                }
                """.formatted(runId);
    }

    private static void addToken(HttpRequest.Builder builder, String token) {
        if (token != null && !token.isBlank()) {
            builder.header("Authorization", "Bearer " + token);
        }
    }

    private static void addHeaders(HttpRequest.Builder builder, String... headers) {
        if (headers.length % 2 != 0) {
            throw new IllegalArgumentException("Headers must be name/value pairs");
        }
        for (int i = 0; i < headers.length; i += 2) {
            builder.header(headers[i], headers[i + 1]);
        }
    }

    private void printReport() {
        System.out.println();
        System.out.println("Payment/Membership smoke report");
        System.out.println("API_BASE_URL: " + apiBaseUrl);
        System.out.println("runId: " + runId);
        System.out.printf("%-7s %-64s %-6s %-6s %s%n", "method", "endpoint", "status", "result", "details");
        for (SmokeResult result : results) {
            System.out.printf(Locale.ROOT, "%-7s %-64s %-6s %-6s %s%n",
                    result.method(),
                    result.endpoint(),
                    result.status() == 0 ? "ERROR" : result.status(),
                    result.passed() ? "PASS" : "FAIL",
                    result.passed() ? trim(result.details()) : normalize(result.details()));
        }
    }

    private void assertAllSmokeResultsPassed() {
        List<String> failures = results.stream()
                .filter(result -> !result.passed())
                .map(result -> "%s %s expected successful smoke assertion but got %s: %s".formatted(
                        result.method(),
                        result.endpoint(),
                        result.status() == 0 ? "ERROR" : result.status(),
                        normalize(result.details())))
                .toList();
        assertThat(failures)
                .as("Smoke endpoint failures")
                .isEmpty();
    }

    private void printHttpDiagnostics() {
        System.out.println();
        System.out.println("Java HttpClient diagnostics");
        System.out.println("java.version: " + System.getProperty("java.version"));
        System.out.println("java.vendor: " + System.getProperty("java.vendor"));
        System.out.println("API_BASE_URL: " + apiBaseUrl);
        System.out.println("client.connectTimeout: " + httpClient.connectTimeout().map(Duration::toString).orElse("<default>"));
        System.out.println("client.followRedirects: " + httpClient.followRedirects());
        System.out.println("client.version: " + httpClient.version());
        System.out.println("client.proxy: " + httpClient.proxy().map(Object::toString).orElse("<default>"));
        System.out.println("request.timeout: " + REQUEST_TIMEOUT);
        System.out.println("https.protocols: " + property("https.protocols"));
        System.out.println("jdk.tls.client.protocols: " + property("jdk.tls.client.protocols"));
        System.out.println("http.proxyHost: " + property("http.proxyHost"));
        System.out.println("http.proxyPort: " + property("http.proxyPort"));
        System.out.println("https.proxyHost: " + property("https.proxyHost"));
        System.out.println("https.proxyPort: " + property("https.proxyPort"));
        System.out.println("java.net.useSystemProxies: " + property("java.net.useSystemProxies"));
        System.out.println("networkaddress.cache.ttl: " + Optional.ofNullable(Security.getProperty("networkaddress.cache.ttl")).orElse("<unset>"));
    }

    private void printResponseDiagnostics(HttpRequest request,
                                          HttpResponse<String> response,
                                          int attempt,
                                          Duration elapsed) {
        System.out.printf(Locale.ROOT,
                "HTTP %s %s -> attempt=%d status=%d version=%s finalUri=%s timeout=%s elapsed=%s sslProtocol=%s cipherSuite=%s%n",
                request.method(),
                request.uri(),
                attempt,
                response.statusCode(),
                response.version(),
                response.uri(),
                request.timeout().map(Duration::toString).orElse("<default>"),
                elapsed,
                response.sslSession().map(session -> session.getProtocol()).orElse("<none>"),
                response.sslSession().map(session -> session.getCipherSuite()).orElse("<none>"));
    }

    private static boolean isConnectChannelFailure(Throwable exception) {
        Throwable current = exception;
        while (current != null) {
            String className = current.getClass().getName();
            if ("java.net.ConnectException".equals(className)
                    || "java.nio.channels.ClosedChannelException".equals(className)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private static String exceptionDetails(Throwable exception) {
        List<String> chain = new ArrayList<>();
        Throwable current = exception;
        while (current != null) {
            String message = current.getMessage();
            chain.add(current.getClass().getName() + (message == null ? "" : ": " + message));
            current = current.getCause();
        }
        return String.join(" <- caused by ", chain);
    }

    private static HttpResponse<String> failedResponse(HttpRequest request, String body) {
        return new FailedHttpResponse(request, body);
    }

    private void markLastResultFailed(String details) {
        int lastIndex = results.size() - 1;
        SmokeResult last = results.get(lastIndex);
        results.set(lastIndex, new SmokeResult(last.method(), last.endpoint(), last.status(), false, sanitizeResponseBody(details)));
    }

    private static String apiBaseUrl() {
        String configured = System.getenv("API_BASE_URL");
        String value = configured == null || configured.isBlank() ? DEFAULT_API_BASE_URL : configured;
        return value.replaceAll("/+$", "");
    }

    private static String property(String name) {
        return Optional.ofNullable(System.getProperty(name)).orElse("<unset>");
    }

    private static String trim(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String normalized = normalize(value);
        return normalized.length() <= 180 ? normalized : normalized.substring(0, 177) + "...";
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.replaceAll("\\s+", " ").trim();
    }

    private static String redactSensitiveFields(String json) {
        return json
                .replaceAll("(\"password\"\\s*:\\s*\")[^\"]*(\")", "$1<redacted>$2")
                .replaceAll("(\"confirmPassword\"\\s*:\\s*\")[^\"]*(\")", "$1<redacted>$2");
    }

    private static String sanitizeResponseBody(String value) {
        if (value == null) {
            return null;
        }
        return value.replaceAll("(\"token\"\\s*:\\s*\")[^\"]*(\")", "$1<redacted>$2");
    }

    private String shortRunId() {
        return runId.replaceAll("[^A-Za-z0-9]", "").substring(0, 20);
    }

    private record SmokeUser(String email, String token) {
    }

    private record SmokeResult(String method, String endpoint, int status, boolean passed, String details) {
    }

    private record FailedHttpResponse(HttpRequest request, String body) implements HttpResponse<String> {
        @Override
        public int statusCode() {
            return 0;
        }

        @Override
        public HttpRequest request() {
            return request;
        }

        @Override
        public Optional<HttpResponse<String>> previousResponse() {
            return Optional.empty();
        }

        @Override
        public HttpHeaders headers() {
            return HttpHeaders.of(Map.of(), (name, value) -> true);
        }

        @Override
        public String body() {
            return body;
        }

        @Override
        public Optional<SSLSession> sslSession() {
            return Optional.empty();
        }

        @Override
        public URI uri() {
            return request.uri();
        }

        @Override
        public HttpClient.Version version() {
            return request.version().orElse(HttpClient.Version.HTTP_1_1);
        }
    }
}

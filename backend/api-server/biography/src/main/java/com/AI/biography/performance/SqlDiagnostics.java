package com.AI.biography.performance;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public final class SqlDiagnostics {
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final ThreadLocal<SqlStats> CURRENT = new ThreadLocal<>();

    private SqlDiagnostics() {
    }

    public static void start() {
        CURRENT.set(new SqlStats());
    }

    public static void inspect(String sql) {
        SqlStats stats = CURRENT.get();
        if (stats == null || sql == null || sql.isBlank()) {
            return;
        }
        stats.record(sql);
    }

    public static SqlSummary finish() {
        SqlStats stats = CURRENT.get();
        CURRENT.remove();
        return stats == null ? SqlSummary.empty() : stats.summary();
    }

    public record SqlSummary(
            int total,
            int selectCount,
            int insertCount,
            int updateCount,
            int deleteCount,
            int otherCount,
            Map<String, Integer> topRepeatedSql
    ) {
        static SqlSummary empty() {
            return new SqlSummary(0, 0, 0, 0, 0, 0, Map.of());
        }
    }

    private static final class SqlStats {
        private final AtomicInteger total = new AtomicInteger();
        private final AtomicInteger selectCount = new AtomicInteger();
        private final AtomicInteger insertCount = new AtomicInteger();
        private final AtomicInteger updateCount = new AtomicInteger();
        private final AtomicInteger deleteCount = new AtomicInteger();
        private final AtomicInteger otherCount = new AtomicInteger();
        private final Map<String, AtomicInteger> fingerprints = new LinkedHashMap<>();

        private void record(String sql) {
            total.incrementAndGet();
            String normalized = normalize(sql);
            String lower = normalized.toLowerCase(Locale.ROOT);
            if (lower.startsWith("select")) {
                selectCount.incrementAndGet();
            } else if (lower.startsWith("insert")) {
                insertCount.incrementAndGet();
            } else if (lower.startsWith("update")) {
                updateCount.incrementAndGet();
            } else if (lower.startsWith("delete")) {
                deleteCount.incrementAndGet();
            } else {
                otherCount.incrementAndGet();
            }
            fingerprints.computeIfAbsent(normalized, ignored -> new AtomicInteger()).incrementAndGet();
        }

        private SqlSummary summary() {
            Map<String, Integer> topRepeated = fingerprints.entrySet()
                    .stream()
                    .sorted(Map.Entry.<String, AtomicInteger>comparingByValue(
                            Comparator.comparingInt(AtomicInteger::get)
                    ).reversed())
                    .limit(5)
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            entry -> entry.getValue().get(),
                            (left, right) -> left,
                            LinkedHashMap::new
                    ));
            return new SqlSummary(
                    total.get(),
                    selectCount.get(),
                    insertCount.get(),
                    updateCount.get(),
                    deleteCount.get(),
                    otherCount.get(),
                    topRepeated
            );
        }

        private String normalize(String sql) {
            String normalized = WHITESPACE.matcher(sql.trim()).replaceAll(" ");
            return normalized.length() <= 500 ? normalized : normalized.substring(0, 500) + "...";
        }
    }
}

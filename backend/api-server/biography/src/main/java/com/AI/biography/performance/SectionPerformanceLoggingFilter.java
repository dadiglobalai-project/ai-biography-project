package com.AI.biography.performance;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class SectionPerformanceLoggingFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(SectionPerformanceLoggingFilter.class);
    private static final Pattern SECTION_WRITE_PATH = Pattern.compile(
            "^/api/websites/[^/]+/sections(/[^/]+)?/(timeline|gallery|contact)$"
    );

    private final ObjectProvider<HikariDataSource> hikariDataSourceProvider;

    public SectionPerformanceLoggingFilter(ObjectProvider<HikariDataSource> hikariDataSourceProvider) {
        this.hikariDataSourceProvider = hikariDataSourceProvider;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String method = request.getMethod();
        if (!"PUT".equalsIgnoreCase(method) && !"POST".equalsIgnoreCase(method)) {
            return true;
        }
        return !SECTION_WRITE_PATH.matcher(request.getRequestURI()).matches();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long startNanos = System.nanoTime();
        String label = request.getMethod() + " " + request.getRequestURI();
        SqlDiagnostics.start();
        LOGGER.info("[PERF] Section request START method={} path={} hikari={}", request.getMethod(), request.getRequestURI(), hikariSnapshot());
        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsedMs = elapsedMs(startNanos);
            SqlDiagnostics.SqlSummary sql = SqlDiagnostics.finish();
            LOGGER.info(
                    "[PERF] Section request END label=\"{}\" status={} total={} ms sqlTotal={} select={} insert={} update={} delete={} other={} hikari={}",
                    label,
                    response.getStatus(),
                    elapsedMs,
                    sql.total(),
                    sql.selectCount(),
                    sql.insertCount(),
                    sql.updateCount(),
                    sql.deleteCount(),
                    sql.otherCount(),
                    hikariSnapshot()
            );
            if (!sql.topRepeatedSql().isEmpty()) {
                for (Map.Entry<String, Integer> entry : sql.topRepeatedSql().entrySet()) {
                    LOGGER.info("[PERF] SQL fingerprint count={} sql=\"{}\"", entry.getValue(), entry.getKey());
                }
            }
        }
    }

    private String hikariSnapshot() {
        HikariDataSource dataSource = hikariDataSourceProvider.getIfAvailable();
        if (dataSource == null) {
            return "unavailable";
        }
        HikariPoolMXBean pool = dataSource.getHikariPoolMXBean();
        if (pool == null) {
            return "poolUnavailable";
        }
        return "active=%d idle=%d total=%d waiting=%d max=%d minIdle=%d connectionTimeoutMs=%d"
                .formatted(
                        pool.getActiveConnections(),
                        pool.getIdleConnections(),
                        pool.getTotalConnections(),
                        pool.getThreadsAwaitingConnection(),
                        dataSource.getMaximumPoolSize(),
                        dataSource.getMinimumIdle(),
                        dataSource.getConnectionTimeout()
                );
    }

    private long elapsedMs(long startNanos) {
        return (System.nanoTime() - startNanos) / 1_000_000;
    }
}

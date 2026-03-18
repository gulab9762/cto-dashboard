package com.ctodashboard.apigateway.service;

import com.ctodashboard.apigateway.model.AnalyticData;
import com.ctodashboard.apigateway.model.Event;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class AnalyticsService {

    @Autowired
    @Qualifier("clickHouseJdbcTemplate")
    private JdbcTemplate clickHouseJdbcTemplate;

    @SuppressWarnings("null")
    public List<Event> getRecentEvents(String orgId, int limit) {

        String query = String.format("""
        SELECT id, type, source, actor, timestamp AS ts, repo, metadata
        FROM events
        WHERE orgId = '%s'
        ORDER BY timestamp DESC
        LIMIT %d
        """, orgId, limit);

        return clickHouseJdbcTemplate.query(query, (rs, rowNum) -> {
            java.sql.Timestamp tsValue = rs.getTimestamp("ts");
            String ts = (tsValue != null) ? tsValue.toInstant().toString() : "";
            
            String eventType = rs.getString("type") != null ? rs.getString("type") : "";
            String repo = rs.getString("repo") != null ? rs.getString("repo") : "";
            String actor = rs.getString("actor") != null ? rs.getString("actor") : "";
            String metadata = rs.getString("metadata") != null ? rs.getString("metadata") : "{}";
            
            String url = "";
            if (eventType.contains("COMMIT")) {
                // Simplified extraction for demo - in production use a JSON library
                String sha = metadata.contains("commitSha\":\"") ? 
                    metadata.split("commitSha\":\"")[1].split("\"")[0] : "";
                if (!sha.isEmpty()) {
                    url = String.format("https://github.com/%s/%s/commit/%s", actor, repo, sha);
                }
            } else if (eventType.contains("PR")) {
                String prNum = metadata.contains("prNumber\":") ? 
                    metadata.split("prNumber\":")[1].split("[,}]")[0] : "";
                if (!prNum.isEmpty()) {
                    url = String.format("https://github.com/%s/%s/pull/%s", actor, repo, prNum);
                }
            }
            
            // Fallback to repo URL if specific link not found
            if (url.isEmpty() && !repo.isEmpty()) {
                url = String.format("https://github.com/%s/%s", actor, repo);
            }

            return new Event(
                rs.getString("id") != null ? rs.getString("id") : "",
                eventType,
                rs.getString("source") != null ? rs.getString("source") : "",
                actor,
                ts,
                repo,
                url
            );
        });
    }

    public List<AnalyticData> getMetricTrends(String orgId, String metricType) {
        String query = "SELECT toString(date) as dt, SUM(value) as val FROM metrics " +
                       "WHERE orgId = ? AND metricType = ? GROUP BY date ORDER BY date DESC LIMIT 30";

        return clickHouseJdbcTemplate.query(query, (rs, rowNum) -> new AnalyticData(
                rs.getString("dt"),
                rs.getDouble("val")
        ), orgId, metricType);
    }
}

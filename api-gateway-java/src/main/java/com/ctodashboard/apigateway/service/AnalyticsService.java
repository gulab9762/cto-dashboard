package com.ctodashboard.apigateway.service;

import com.ctodashboard.apigateway.model.AnalyticData;
import com.ctodashboard.apigateway.model.Event;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class AnalyticsService {

    private final JdbcTemplate clickHouseJdbcTemplate;

    public AnalyticsService(@Qualifier("clickHouseJdbcTemplate") JdbcTemplate clickHouseJdbcTemplate) {
        this.clickHouseJdbcTemplate = clickHouseJdbcTemplate;
    }

    public List<Event> getRecentEvents(String orgId, int limit) {

        String query = String.format("""
        SELECT id, type, source, actor, timestamp AS ts, repo
        FROM events
        WHERE orgId = '%s'
        ORDER BY timestamp DESC
        LIMIT %d
        """, orgId, limit);

        return clickHouseJdbcTemplate.query(query, (rs, rowNum) -> new Event(
                rs.getString("id"),
                rs.getString("type"),
                rs.getString("source"),
                rs.getString("actor"),
                rs.getTimestamp("ts").toInstant().toString(),
                rs.getString("repo")
        ));
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

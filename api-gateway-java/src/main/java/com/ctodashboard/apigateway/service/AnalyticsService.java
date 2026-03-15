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
        String query = "SELECT id, type, source, actor, toString(timestamp) as ts, repo FROM events " +
                       "WHERE orgId = ? ORDER BY timestamp DESC LIMIT ?";

        return clickHouseJdbcTemplate.query(query, (rs, rowNum) -> new Event(
                rs.getString("id"),
                rs.getString("type"),
                rs.getString("source"),
                rs.getString("actor"),
                rs.getString("ts"),
                rs.getString("repo")
        ), orgId, limit);
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

package com.ctodashboard.apigateway.controller;

import com.ctodashboard.apigateway.model.AnalyticData;
import com.ctodashboard.apigateway.model.Event;
import com.ctodashboard.apigateway.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @QueryMapping
    public List<Event> recentEvents(@Argument String orgId, @Argument Integer limit) {
        return analyticsService.getRecentEvents(orgId, limit != null ? limit : 50);
    }

    @QueryMapping
    public List<AnalyticData> metricTrends(@Argument String orgId, @Argument String metricType) {
        return analyticsService.getMetricTrends(orgId, metricType);
    }
}

package com.ctodashboard.apigateway.controller;

import com.ctodashboard.apigateway.model.Deployment;
import com.ctodashboard.apigateway.model.Incident;
import com.ctodashboard.apigateway.model.Metrics;
import com.ctodashboard.apigateway.model.Organization;
import com.ctodashboard.apigateway.service.MetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class MetricsController {

    @Autowired
    private MetricsService metricsService;

    @QueryMapping
    public Organization organization(@Argument String id) {
        return new Organization(id);
    }

    @SchemaMapping(typeName = "Organization", field = "metrics")
    public Metrics getMetrics(Organization organization, @Argument Integer days) {
        return metricsService.getMetrics(organization.getId(), days != null ? days : 30);
    }

    @QueryMapping
    public List<Deployment> deployments(@Argument String orgId, @Argument String period) {
        return metricsService.getDeployments(orgId, period);
    }

    @QueryMapping
    public List<Incident> incidents(@Argument String orgId) {
        return metricsService.getIncidents(orgId);
    }
}

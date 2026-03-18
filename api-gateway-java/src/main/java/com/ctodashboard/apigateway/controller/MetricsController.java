package com.ctodashboard.apigateway.controller;

import com.ctodashboard.apigateway.model.Deployment;
import com.ctodashboard.apigateway.model.Incident;
import com.ctodashboard.apigateway.model.Metrics;
import com.ctodashboard.apigateway.model.Organization;
import com.ctodashboard.apigateway.service.MetricsService;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolvers for engineering metrics.
 *
 * <p>Authorization strategy:</p>
 * <ul>
 *   <li>All resolvers require a valid JWT ({@code isAuthenticated()}).</li>
 *   <li>Sensitive resolvers (incidents, cross-org data) require ADMIN role.</li>
 *   <li>Per-org scoping is enforced by reading {@code orgId} from the JWT claim
 *       injected by {@link com.ctodashboard.apigateway.config.JwtGraphQlInterceptor},
 *       so users cannot query data outside their own org even if they craft a
 *       request with a different org ID argument.</li>
 * </ul>
 */
@Controller
public class MetricsController {

    @Autowired
    private MetricsService metricsService;

    /** Any authenticated user can look up their own organization. */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Organization organization(@Argument String id, DataFetchingEnvironment env) {
        // Enforce multi-tenant scoping: override the requested id with the
        // caller's own orgId from the JWT, unless they are an ADMIN.
        String jwtOrgId = env.getGraphQlContext().get("orgId");
        List<String> roles = env.getGraphQlContext().get("roles");
        boolean isAdmin = roles != null && roles.contains("ADMIN");

        String resolvedOrgId = isAdmin ? id : (jwtOrgId != null ? jwtOrgId : id);
        return new Organization(resolvedOrgId);
    }

    /** Metrics are available to any authenticated member of the organization. */
    @SchemaMapping(typeName = "Organization", field = "metrics")
    @PreAuthorize("isAuthenticated()")
    public Metrics getMetrics(Organization organization, @Argument Integer days) {
        return metricsService.getMetrics(organization.getId(), days != null ? days : 30);
    }

    /** Deployment data is available to all authenticated users. */
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Deployment> deployments(@Argument String orgId, @Argument String period) {
        return metricsService.getDeployments(orgId, period);
    }

    /**
     * Incident data is restricted to ADMINs – it can contain sensitive operational
     * details such as on-call contacts and post-mortem notes.
     */
    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Incident> incidents(@Argument String orgId) {
        return metricsService.getIncidents(orgId);
    }
}


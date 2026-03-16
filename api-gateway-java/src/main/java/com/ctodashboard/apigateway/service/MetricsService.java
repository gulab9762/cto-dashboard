package com.ctodashboard.apigateway.service;

import com.ctodashboard.apigateway.entity.EngineeringEventEntity;
import com.ctodashboard.apigateway.entity.EventMetricEntity;
import com.ctodashboard.apigateway.model.CorrelatedEvent;
import com.ctodashboard.apigateway.model.Deployment;
import com.ctodashboard.apigateway.model.Incident;
import com.ctodashboard.apigateway.model.Metrics;
import com.ctodashboard.apigateway.repository.EngineeringEventRepository;
import com.ctodashboard.apigateway.repository.EventMetricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MetricsService {

    @Autowired
    private EventMetricRepository eventMetricRepository;

    @Autowired
    private EngineeringEventRepository engineeringEventRepository;

    public Metrics getMetrics(String orgId, int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);

        List<EventMetricEntity> metricsList = eventMetricRepository.findByOrgIdAndDateAfter(orgId, startDate);

        int prsMerged = 0;
        int reviewCount = 0;
        int commitCount = 0;

        for (EventMetricEntity m : metricsList) {
            if ("pr_merged".equalsIgnoreCase(m.getMetricType())) {
                prsMerged += m.getValue();
            } else if ("pr_reviewed".equalsIgnoreCase(m.getMetricType())) {
                reviewCount += m.getValue();
            } else if ("commit_created".equalsIgnoreCase(m.getMetricType())) {
                commitCount += m.getValue();
            }
        }

        // Simplified cycle time calculation for demo purposes
        double averageCycleTime = prsMerged > 0 ? 24.5 : 0.0;

        return new Metrics(prsMerged, averageCycleTime, reviewCount, commitCount);
    }

    public List<Deployment> getDeployments(String orgId, String period) {
        // period handling can be daily, weekly, monthly. We'll simplify and return
        // recent.
        LocalDate startDate = LocalDate.now().minusDays(7);
        List<EventMetricEntity> metricsList = eventMetricRepository.findByOrgIdAndMetricTypeAndDateBetween(
                orgId, "deployment_finished", startDate, LocalDate.now());

        return metricsList.stream().map(m -> new Deployment(
                m.getDate().toString(),
                m.getValue().intValue(),
                0.95 // Mock success rate for now as it would require multi-metric correlation
        )).collect(Collectors.toList());
    }

    public List<Incident> getIncidents(String orgId) {
        long startDate = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000L);
        List<EngineeringEventEntity> incidentEvents = engineeringEventRepository.findByOrgIdAndTypeAndTimestampAfter(
                orgId, "INCIDENT_REPORTED", startDate);

        // Group by day for simple incident display
        Map<LocalDate, List<EngineeringEventEntity>> grouped = incidentEvents.stream()
                .collect(Collectors.groupingBy(e -> LocalDate.ofEpochDay(e.getTimestamp() / (24 * 60 * 60 * 1000L))));

        List<Incident> results = new ArrayList<>();
        grouped.forEach((date, events) -> {
            List<CorrelatedEvent> correlated = events.stream()
                    .map(e -> new CorrelatedEvent(e.getType(), e.getActor()))
                    .collect(Collectors.toList());

            results.add(new Incident(date.toString(), events.size(), correlated));
        });

        return results;
    }
}

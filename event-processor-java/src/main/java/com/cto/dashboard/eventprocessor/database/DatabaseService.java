package com.cto.dashboard.eventprocessor.database;

import com.cto.dashboard.eventprocessor.model.EngineeringEvent;
import com.cto.dashboard.eventprocessor.model.EventMetric;
import com.cto.dashboard.eventprocessor.repository.EngineeringEventRepository;
import com.cto.dashboard.eventprocessor.repository.EventMetricRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DatabaseService {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseService.class);

    private final EngineeringEventRepository engineeringEventRepository;
    private final EventMetricRepository eventMetricRepository;

    public DatabaseService(EngineeringEventRepository engineeringEventRepository,
                           EventMetricRepository eventMetricRepository) {
        this.engineeringEventRepository = engineeringEventRepository;
        this.eventMetricRepository = eventMetricRepository;
    }

    @Transactional
    public void storeEvent(EngineeringEvent event) {
        try {
            // Store in PostgreSQL
            EngineeringEvent storedEvent = engineeringEventRepository.save(event);
            logger.info("✅ Event stored in PostgreSQL: {}", storedEvent.getId());

            // Update metrics
            updateEventMetrics(event);
        } catch (Exception e) {
            logger.error("❌ Failed to store event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store event", e);
        }
    }

    @Transactional
    public void updateEventMetrics(EngineeringEvent event) {
        try {
            LocalDate today = LocalDate.now();
            String metricType = getMetricType(event.getType());

            if (metricType != null) {
                Optional<EventMetric> metricOptional = eventMetricRepository.findByOrgIdAndMetricTypeAndDate(
                        event.getOrgId(), metricType, today);

                if (metricOptional.isPresent()) {
                    EventMetric metric = metricOptional.get();
                    metric.setValue(metric.getValue() + 1);
                    eventMetricRepository.save(metric);
                } else {
                    EventMetric newMetric = new EventMetric();
                    newMetric.setOrgId(event.getOrgId());
                    newMetric.setMetricType(metricType);
                    newMetric.setDate(today);
                    newMetric.setValue(1);
                    eventMetricRepository.save(newMetric);
                }

                logger.debug("📊 Metric updated: {}/{} on {}", event.getOrgId(), metricType, today);
            }
        } catch (Exception e) {
            logger.warn("⚠️  Failed to update metrics: {}", e.getMessage());
        }
    }

    private String getMetricType(String eventType) {
        if (eventType == null) return null;
        switch (eventType) {
            case "PR_CREATED": return "pr_created";
            case "PR_MERGED": return "pr_merged";
            case "PR_REVIEWED": return "pr_reviewed";
            case "COMMIT_CREATED": return "commit_created";
            case "REQUIREMENT_CREATED": return "requirement_created";
            case "REQUIREMENT_UPDATED": return "requirement_updated";
            case "BUILD_FINISHED": return "build_completed";
            case "DEPLOYMENT_FINISHED": return "deployment_completed";
            case "INCIDENT_CREATED": return "incident_created";
            case "INCIDENT_RESOLVED": return "incident_resolved";
            default: return null;
        }
    }

    public List<EventMetric> getMetricsByOrg(String orgId, int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        return eventMetricRepository.findByOrgIdAndDateGreaterThanEqualOrderByDateAsc(orgId, startDate);
    }

    public List<EngineeringEvent> getEventsByOrg(String orgId, int limit, int offset) {
        // Find by org id, ordered by timestamp desc via pageable. But using standard Jpa queries.
        // Or simply returning a basic page without exact offset.
        // Standard spring data jpa logic here. For exact offset/limit we use Pageable:
        return engineeringEventRepository.findByOrgIdOrderByTimestampDesc(orgId)
                .stream()
                .skip(offset)
                .limit(limit)
                .toList(); // Simplified since offset could be large, typically PageRequest is better but this works for basic.
    }
}

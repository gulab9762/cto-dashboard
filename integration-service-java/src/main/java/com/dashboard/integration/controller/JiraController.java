package com.dashboard.integration.controller;

import com.dashboard.integration.dto.WebhookResponseDto;
import com.dashboard.integration.schema.EngineeringEvent;
import com.dashboard.integration.schema.EventType;
import com.dashboard.integration.service.KafkaProducerService;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/jira")
public class JiraController {

    private static final Logger log = LoggerFactory.getLogger(JiraController.class);

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Value("${KAFKA_TOPIC:engineering-events}")
    private String kafkaTopic;

    @PostMapping("/webhook")
    public ResponseEntity<WebhookResponseDto> webhook(@RequestBody JsonNode payload) {
        String webhookEvent = payload.path("webhookEvent").asText(null);
        log.info("Received Jira webhook: {}", webhookEvent);

        EngineeringEvent event = mapJiraEvent(payload);

        if (event != null) {
            try {
                kafkaProducerService.publish(kafkaTopic, event);
                log.info("Published event: {}", event.getType());
            } catch (Exception e) {
                log.error("❌ Failed to publish event: {}", e.getMessage());
                return ResponseEntity.internalServerError()
                        .body(new WebhookResponseDto("error", e.getMessage()));
            }
        }

        return ResponseEntity.ok(new WebhookResponseDto("ok", null));
    }

    private EngineeringEvent mapJiraEvent(JsonNode payload) {
        String webhookEvent = payload.path("webhookEvent").asText("");
        JsonNode issue = payload.path("issue");

        if (issue.isMissingNode() || !issue.has("key")) return null;

        String issueKey = issue.path("key").asText();
        JsonNode fields = issue.path("fields");

        String orgId = fields.path("project").path("key").asText("unknown");
        String repo = fields.path("project").path("name").asText(null);
        String actor = payload.path("user").path("name").asText("unknown");

        if ("jira:issue_created".equals(webhookEvent)) {
            if ("Story".equals(fields.path("issuetype").path("name").asText())) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("issueKey", issueKey);
                metadata.put("title", fields.path("summary").asText(""));
                
                List<String> labels = new ArrayList<>();
                JsonNode labelsNode = fields.path("labels");
                if (labelsNode.isArray()) {
                    for (JsonNode label : labelsNode) {
                        labels.add(label.asText());
                    }
                }
                metadata.put("labels", labels);

                return createEvent(EventType.REQUIREMENT_CREATED, orgId, repo, actor, 
                        parseTime(fields.path("created").asText()), metadata);
            }
        } 
        else if ("jira:issue_updated".equals(webhookEvent)) {
            JsonNode histories = issue.path("changelog").path("histories");
            if (histories.isArray() && !histories.isEmpty()) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("issueKey", issueKey);
                metadata.put("title", fields.path("summary").asText(""));
                
                List<JsonNode> changes = new ArrayList<>();
                for (JsonNode history : histories) {
                    JsonNode items = history.path("items");
                    if (items.isArray()) {
                        for (JsonNode item : items) {
                            changes.add(item);
                        }
                    }
                }
                metadata.put("changes", changes);

                return createEvent(EventType.REQUIREMENT_UPDATED, orgId, repo, actor, 
                        parseTime(fields.path("updated").asText()), metadata);
            }
        }

        return null;
    }

    private EngineeringEvent createEvent(EventType type, String orgId, String repo, 
                                       String actor, long timestamp, Map<String, Object> metadata) {
        return EngineeringEvent.builder()
                .id(UUID.randomUUID().toString())
                .type(type)
                .source("jira")
                .orgId(orgId)
                .repo(repo)
                .actor(actor)
                .timestamp(timestamp)
                .metadata(metadata)
                .build();
    }

    private long parseTime(String isoTime) {
        if (isoTime == null || isoTime.isEmpty()) return System.currentTimeMillis();
        try {
            return java.time.format.DateTimeFormatter.ISO_DATE_TIME.parse(isoTime, java.time.Instant::from).toEpochMilli();
        } catch (Exception e) {
            try {
                // Try fallback matching default Jira time formats if necessary
                return java.time.ZonedDateTime.parse(isoTime.replaceAll("\\+", "+0")).toInstant().toEpochMilli();
            } catch (Exception e2) {
                return System.currentTimeMillis();
            }
        }
    }
}

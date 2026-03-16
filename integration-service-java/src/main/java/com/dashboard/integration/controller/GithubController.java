package com.dashboard.integration.controller;

import com.dashboard.integration.dto.WebhookResponseDto;
import com.dashboard.integration.schema.EngineeringEvent;
import com.dashboard.integration.service.GithubMapper;
import com.dashboard.integration.service.KafkaProducerService;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/github")
public class GithubController {

    private static final Logger log = LoggerFactory.getLogger(GithubController.class);

    @Autowired
    private GithubMapper mapper;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Value("${KAFKA_TOPIC:engineering-events}")
    private String kafkaTopic;

    @PostMapping("/webhook")
    public ResponseEntity<WebhookResponseDto> webhook(
            @RequestHeader("x-github-event") String eventType,
            @RequestBody JsonNode payload) {

        log.info("📨 Received GitHub webhook: {}", eventType);

        EngineeringEvent event = mapper.map(eventType, payload);

        if (event != null) {
            log.info("🔄 Mapping webhook to event: {}", event.getType());
            try {
                kafkaProducerService.publish(kafkaTopic, event);
            } catch (Exception e) {
                log.error("❌ Failed to queue event: {}", e.getMessage());
                return ResponseEntity.internalServerError()
                        .body(new WebhookResponseDto("error", e.getMessage()));
            }
        } else {
            log.warn("⚠️  Failed to map webhook event type: {}", eventType);
        }

        return ResponseEntity.ok(new WebhookResponseDto("ok", null));
    }
}

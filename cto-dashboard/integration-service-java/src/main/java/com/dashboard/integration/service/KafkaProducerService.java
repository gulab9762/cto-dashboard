package com.dashboard.integration.service;

import com.dashboard.integration.schema.EngineeringEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.concurrent.CompletableFuture;

@Service
public class KafkaProducerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducerService.class);

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Async
    @SuppressWarnings("null")
    public void publish(String topic, EngineeringEvent message) {
        log.info("📤 Publishing event to topic: {}", topic);
        
        String key = message.getOrgId() != null ? message.getOrgId() : "default";

        CompletableFuture<?> future = kafkaTemplate.send(Objects.requireNonNull(topic), key, message);
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("✅ Event published to Kafka: {}", message.getType());
            } else {
                log.error("❌ Failed to publish event: {}", ex.getMessage());
            }
        });
    }
}

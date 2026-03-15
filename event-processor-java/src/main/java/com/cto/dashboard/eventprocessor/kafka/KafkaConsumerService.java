package com.cto.dashboard.eventprocessor.kafka;

import com.cto.dashboard.eventprocessor.model.EngineeringEventDto;
import com.cto.dashboard.eventprocessor.processor.EventProcessingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);

    private final EventProcessingService eventProcessingService;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(EventProcessingService eventProcessingService, ObjectMapper objectMapper) {
        this.eventProcessingService = eventProcessingService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "${kafka.topic.events:engineering-events}", groupId = "${spring.kafka.consumer.group-id:event-processor-group}")
    public void consume(String message) {
        try {
            if (message == null || message.trim().isEmpty()) {
                logger.warn("Received empty message from Kafka");
                return;
            }

            EngineeringEventDto eventDto = objectMapper.readValue(message, EngineeringEventDto.class);
            logger.info("📬 Received event: {}", eventDto.getType());

            eventProcessingService.processAndStoreEvent(eventDto);
        } catch (Exception e) {
            logger.error("❌ Error processing message: {}", e.getMessage(), e);
        }
    }
}

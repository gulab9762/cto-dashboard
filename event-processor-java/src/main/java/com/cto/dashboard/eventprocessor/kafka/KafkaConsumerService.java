package com.cto.dashboard.eventprocessor.kafka;

import com.cto.dashboard.eventprocessor.model.EngineeringEventDto;
import com.cto.dashboard.eventprocessor.processor.EventProcessingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class KafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);

    @Autowired
    private EventProcessingService eventProcessingService;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topic.events:engineering-events}", groupId = "${spring.kafka.consumer.group-id:event-processor-group}")
    public void consume(List<String> messages) {
        try {
            if (messages == null || messages.isEmpty()) {
                return;
            }

            logger.info("📬 Received batch of {} messages from Kafka", messages.size());
            List<EngineeringEventDto> batch = new ArrayList<>();

            for (String message : messages) {
                try {
                    if (message != null && !message.trim().isEmpty()) {
                        batch.add(objectMapper.readValue(message, EngineeringEventDto.class));
                    }
                } catch (Exception e) {
                    logger.error("❌ Error parsing message: {}", e.getMessage());
                }
            }

            if (!batch.isEmpty()) {
                eventProcessingService.processAndStoreEvents(batch);
            }
        } catch (Exception e) {
            logger.error("❌ Error processing batch: {}", e.getMessage(), e);
        }
    }
}

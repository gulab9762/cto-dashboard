package com.cto.dashboard.eventprocessor.processor;

import com.cto.dashboard.eventprocessor.clickhouse.ClickHouseService;
import com.cto.dashboard.eventprocessor.database.DatabaseService;
import com.cto.dashboard.eventprocessor.model.EngineeringEvent;
import com.cto.dashboard.eventprocessor.model.EngineeringEventDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class EventProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(EventProcessingService.class);

    @Autowired
    private DatabaseService databaseService;

    @Autowired
    private ClickHouseService clickHouseService;

    public void processAndStoreEvent(EngineeringEventDto eventDto) {
        try {
            logger.info("Processing event: {} from {}", eventDto.getType(), eventDto.getSource());

            if (!validateEvent(eventDto)) {
                logger.warn("⚠️  Invalid event: {}", eventDto);
                return;
            }

            EngineeringEvent event = new EngineeringEvent();
            event.setId(UUID.randomUUID().toString());
            event.setEventId(eventDto.getId());
            event.setType(eventDto.getType());
            event.setSource(eventDto.getSource());
            event.setOrgId(eventDto.getOrgId());
            event.setRepo(eventDto.getRepo());
            event.setActor(eventDto.getActor());
            event.setTimestamp(eventDto.getTimestamp());
            event.setMetadata(eventDto.getMetadata());

            // Store in PostgreSQL
            databaseService.storeEvent(event);

            // Store in ClickHouse
            clickHouseService.storeEvent(event);

            logger.info("✅ Event processed: {} for org {}", event.getType(), event.getOrgId());
        } catch (Exception e) {
            logger.error("❌ Failed to process event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process event", e);
        }
    }

    private boolean validateEvent(EngineeringEventDto eventDto) {
        return eventDto.getId() != null &&
               eventDto.getType() != null &&
               eventDto.getSource() != null &&
               eventDto.getOrgId() != null &&
               eventDto.getTimestamp() != null &&
               eventDto.getMetadata() != null;
    }
}

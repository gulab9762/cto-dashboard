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
import java.util.List;

@Service
public class EventProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(EventProcessingService.class);

    @Autowired
    private DatabaseService databaseService;

    @Autowired
    private ClickHouseService clickHouseService;

    public void processAndStoreEvents(List<EngineeringEventDto> batch) {
        try {
            logger.info("🚀 Processing batch of {} events", batch.size());
            
            List<EngineeringEvent> events = batch.stream()
                    .filter(this::validateEvent)
                    .map(dto -> {
                        EngineeringEvent event = new EngineeringEvent();
                        event.setId(UUID.randomUUID().toString());
                        event.setEventId(dto.getId());
                        event.setType(dto.getType());
                        event.setSource(dto.getSource());
                        event.setOrgId(dto.getOrgId());
                        event.setRepo(dto.getRepo());
                        event.setActor(dto.getActor());
                        event.setTimestamp(dto.getTimestamp());
                        event.setMetadata(dto.getMetadata());
                        return event;
                    })
                    .toList();

            if (events.isEmpty()) return;

            // Store in PostgreSQL (Batch)
            databaseService.storeEvents(events);

            // Store in ClickHouse (Batch)
            clickHouseService.storeEvents(events);

            logger.info("✅ Batch of {} events processed successfully", events.size());
        } catch (Exception e) {
            logger.error("❌ Failed to process batch: {}", e.getMessage(), e);
        }
    }

    public void processAndStoreEvent(EngineeringEventDto eventDto) {
        processAndStoreEvents(java.util.Collections.singletonList(eventDto));
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

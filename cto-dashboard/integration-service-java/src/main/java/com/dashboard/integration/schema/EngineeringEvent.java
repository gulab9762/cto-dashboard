package com.dashboard.integration.schema;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EngineeringEvent {
    private String id;
    private EventType type;
    private String source;
    private String orgId;
    private String repo;
    private String actor;
    private long timestamp;
    private Map<String, Object> metadata;
}

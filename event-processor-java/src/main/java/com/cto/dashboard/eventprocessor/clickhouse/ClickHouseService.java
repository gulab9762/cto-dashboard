package com.cto.dashboard.eventprocessor.clickhouse;

import com.cto.dashboard.eventprocessor.model.EngineeringEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.annotation.PostConstruct;

@Service
public class ClickHouseService {

    private static final Logger logger = LoggerFactory.getLogger(ClickHouseService.class);

    private String baseUrl;

    @Value("${clickhouse.user}")
    private String user;

    @Value("${clickhouse.password}")
    private String password;

    @Value("${clickhouse.database}")
    private String database;

    private RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${clickhouse.host}")
    private String host;

    @Value("${clickhouse.port}")
    private String port;

    @PostConstruct
    public void init() {
        this.baseUrl = "http://" + host + ":" + port;
    }

    private String executeQuery(String query) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + "/")
                    .queryParam("user", user)
                    .queryParam("database", database);

            if (password != null && !password.isEmpty()) {
                builder.queryParam("password", password);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Type", "text/plain");

            HttpEntity<String> request = new HttpEntity<>(query, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(builder.toUriString(), request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("ClickHouse error: " + response.getStatusCode() + " - " + response.getBody());
            }

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute ClickHouse query: " + e.getMessage(), e);
        }
    }

    private String escape(Object val) {
        if (val == null) return "null";
        return "'" + String.valueOf(val).replace("'", "''") + "'";
    }

    public void ensureTablesExist() {
        try {
            executeQuery("CREATE TABLE IF NOT EXISTS " + database + ".events (" +
                    "id String, " +
                    "type LowCardinality(String), " +
                    "source LowCardinality(String), " +
                    "orgId String, " +
                    "repo Nullable(String), " +
                    "actor Nullable(String), " +
                    "timestamp DateTime64(3), " +
                    "metadata String, " +
                    "createdAt DateTime DEFAULT now()" +
                    ") ENGINE = MergeTree() " +
                    "PARTITION BY toYYYYMM(timestamp) " +
                    "ORDER BY (orgId, timestamp, type)");
            logger.info("✅ ClickHouse events table ready");

            executeQuery("CREATE TABLE IF NOT EXISTS " + database + ".metrics (" +
                    "orgId String, " +
                    "metricType LowCardinality(String), " +
                    "date Date, " +
                    "value Int32, " +
                    "createdAt DateTime DEFAULT now()" +
                    ") ENGINE = ReplacingMergeTree(createdAt) " +
                    "PARTITION BY toYYYYMM(date) " +
                    "ORDER BY (orgId, metricType, date)");
            logger.info("✅ ClickHouse metrics table ready");
        } catch (Exception e) {
            logger.error("⚠️ Error creating ClickHouse tables: {}", e.getMessage());
        }
    }

    public void storeEvent(EngineeringEvent event) {
        try {
            String metadataJson = event.getMetadata() != null ? objectMapper.writeValueAsString(event.getMetadata()) : "{}";

            String query = String.format("INSERT INTO %s.events (id, type, source, orgId, repo, actor, timestamp, metadata) VALUES (%s, %s, %s, %s, %s, %s, fromUnixTimestamp64Milli(%s), %s)",
                    database,
                    escape(event.getEventId()),
                    escape(event.getType()),
                    escape(event.getSource()),
                    escape(event.getOrgId()),
                    escape(event.getRepo()),
                    escape(event.getActor()),
                    event.getTimestamp() != null ? event.getTimestamp() : 0,
                    escape(metadataJson)
            );

            executeQuery(query);
            logger.debug("📊 Event stored in ClickHouse: {}", event.getId());
        } catch (JsonProcessingException e) {
            logger.warn("⚠️ Failed to parse metadata for ClickHouse: {}", e.getMessage());
        } catch (Exception e) {
            logger.warn("⚠️ Failed to store event in ClickHouse: {}", e.getMessage());
        }
    }
}

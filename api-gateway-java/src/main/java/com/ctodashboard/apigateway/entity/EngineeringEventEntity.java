package com.ctodashboard.apigateway.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "engineering_event")
@Data
@NoArgsConstructor
public class EngineeringEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "event_id", unique = true, nullable = false)
    private String eventId;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "org_id", nullable = false)
    private String orgId;

    @Column(name = "repo")
    private String repo;

    @Column(name = "actor")
    private String actor;

    @Column(name = "timestamp", nullable = false)
    private Long timestamp;

    @Column(name = "metadata", columnDefinition = "text")
    private String metadata; // We can use JSONB for Postgres in a future iteration

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}

package com.cto.dashboard.eventprocessor.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_metric", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"orgId", "metricType", "date"})
}, indexes = {
        @Index(name = "idx_eventmetric_orgid", columnList = "orgId"),
        @Index(name = "idx_eventmetric_date", columnList = "date")
})
public class EventMetric {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String orgId;

    @Column(nullable = false)
    private String metricType;

    @Column(nullable = false)
    private Integer value = 1;

    @Column(nullable = false)
    private LocalDate date;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public EventMetric() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOrgId() { return orgId; }
    public void setOrgId(String orgId) { this.orgId = orgId; }
    public String getMetricType() { return metricType; }
    public void setMetricType(String metricType) { this.metricType = metricType; }
    public Integer getValue() { return value; }
    public void setValue(Integer value) { this.value = value; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

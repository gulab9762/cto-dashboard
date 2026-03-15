package com.cto.dashboard.eventprocessor.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "\"EventProcessingStatus\"", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"topic", "partition"})
})
public class EventProcessingStatus {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private Integer partition;

    @Column(nullable = false)
    private Long offsetValue;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public EventProcessingStatus() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public Integer getPartition() { return partition; }
    public void setPartition(Integer partition) { this.partition = partition; }
    public Long getOffsetValue() { return offsetValue; }
    public void setOffsetValue(Long offsetValue) { this.offsetValue = offsetValue; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

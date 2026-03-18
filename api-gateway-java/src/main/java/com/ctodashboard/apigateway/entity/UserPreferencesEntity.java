package com.ctodashboard.apigateway.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences", indexes = {
        @Index(name = "idx_user_preferences_user_id", columnList = "user_id", unique = true)
})
@Data
@NoArgsConstructor
public class UserPreferencesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    /**
     * JSON array of widget IDs in the user's preferred order.
     * e.g. ["m1","m2","s1","t1","m3","m4"]
     */
    @Column(name = "layout_json", columnDefinition = "text")
    private String layoutJson;

    /**
     * JSON object with theme settings.
     * e.g. {"accentColor":"#8b5cf6","cardOpacity":0.7,"glowIntensity":"medium","dashboardBg":"default"}
     */
    @Column(name = "theme_json", columnDefinition = "text")
    private String themeJson;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    @PrePersist
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }
}

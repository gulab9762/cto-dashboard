package com.cto.dashboard.eventprocessor.repository;

import com.cto.dashboard.eventprocessor.model.EventMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventMetricRepository extends JpaRepository<EventMetric, String> {
    Optional<EventMetric> findByOrgIdAndMetricTypeAndDate(String orgId, String metricType, LocalDate date);
    List<EventMetric> findByOrgIdAndDateGreaterThanEqualOrderByDateAsc(String orgId, LocalDate date);
}

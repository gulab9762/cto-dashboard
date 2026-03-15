package com.ctodashboard.apigateway.repository;

import com.ctodashboard.apigateway.entity.EventMetricEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventMetricRepository extends JpaRepository<EventMetricEntity, String> {
    
    List<EventMetricEntity> findByOrgIdAndDateAfter(String orgId, LocalDate date);
    
    List<EventMetricEntity> findByOrgIdAndMetricTypeAndDateBetween(String orgId, String metricType, LocalDate startDate, LocalDate endDate);
}

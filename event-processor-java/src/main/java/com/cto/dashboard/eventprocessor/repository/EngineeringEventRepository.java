package com.cto.dashboard.eventprocessor.repository;

import com.cto.dashboard.eventprocessor.model.EngineeringEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EngineeringEventRepository extends JpaRepository<EngineeringEvent, String> {
    List<EngineeringEvent> findByOrgIdOrderByTimestampDesc(String orgId);
}

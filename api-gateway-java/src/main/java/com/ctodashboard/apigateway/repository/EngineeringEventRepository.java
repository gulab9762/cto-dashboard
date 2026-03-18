package com.ctodashboard.apigateway.repository;

import com.ctodashboard.apigateway.entity.EngineeringEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EngineeringEventRepository extends JpaRepository<EngineeringEventEntity, String> {

    List<EngineeringEventEntity> findByOrgIdAndTimestampAfter(String orgId, Long timestamp);

    List<EngineeringEventEntity> findByOrgIdAndTypeAndTimestampAfter(String orgId, String type, Long timestamp);
}

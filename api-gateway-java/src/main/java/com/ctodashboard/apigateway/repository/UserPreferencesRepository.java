package com.ctodashboard.apigateway.repository;

import com.ctodashboard.apigateway.entity.UserPreferencesEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferencesRepository extends CrudRepository<UserPreferencesEntity, String> {
    Optional<UserPreferencesEntity> findByUserId(String userId);
}

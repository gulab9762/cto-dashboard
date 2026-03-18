package com.ctodashboard.apigateway.service;

import com.ctodashboard.apigateway.entity.UserPreferencesEntity;
import com.ctodashboard.apigateway.repository.UserPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserPreferencesService {

    // Default layout: widget IDs ordered as they appear in DashboardContainer
    private static final String DEFAULT_LAYOUT =
            "[\"m1\",\"m2\",\"m3\",\"m4\",\"s1\",\"t1\"]";

    // Default theme: blue accent matching the existing design system
    private static final String DEFAULT_THEME =
            "{\"accentColor\":\"#60a5fa\",\"cardOpacity\":0.6,\"glowIntensity\":\"medium\",\"dashboardBg\":\"default\"}";

    @Autowired
    private UserPreferencesRepository repository;

    public UserPreferencesEntity getPreferences(String userId) {
        return repository.findByUserId(userId).orElseGet(() -> {
            UserPreferencesEntity defaults = new UserPreferencesEntity();
            defaults.setUserId(userId);
            defaults.setLayoutJson(DEFAULT_LAYOUT);
            defaults.setThemeJson(DEFAULT_THEME);
            return defaults;
        });
    }

    public UserPreferencesEntity savePreferences(String userId, String layoutJson, String themeJson) {
        UserPreferencesEntity entity = repository.findByUserId(userId)
                .orElseGet(() -> {
                    UserPreferencesEntity e = new UserPreferencesEntity();
                    e.setUserId(userId);
                    return e;
                });
        entity.setLayoutJson(layoutJson);
        entity.setThemeJson(themeJson);
        return repository.save(entity);
    }
}

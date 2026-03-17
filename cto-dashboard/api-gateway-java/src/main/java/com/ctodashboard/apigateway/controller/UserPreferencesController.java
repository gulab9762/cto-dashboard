package com.ctodashboard.apigateway.controller;

import com.ctodashboard.apigateway.entity.UserPreferencesEntity;
import com.ctodashboard.apigateway.service.UserPreferencesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class UserPreferencesController {

    @Autowired
    private UserPreferencesService service;

    @QueryMapping
    public UserPreferencesEntity userPreferences(@Argument String userId) {
        return service.getPreferences(userId);
    }

    @MutationMapping
    public UserPreferencesEntity saveUserPreferences(
            @Argument String userId,
            @Argument String layoutJson,
            @Argument String themeJson) {
        return service.savePreferences(userId, layoutJson, themeJson);
    }
}

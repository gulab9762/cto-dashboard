package com.cto.dashboard.eventprocessor.model;

public enum EventType {
    // Requirements
    REQUIREMENT_CREATED,
    REQUIREMENT_UPDATED,

    // Commits
    COMMIT_CREATED,

    // Pull Requests
    PR_CREATED,
    PR_REVIEW_REQUESTED,
    PR_REVIEWED,
    PR_MERGED,

    // Builds
    BUILD_STARTED,
    BUILD_FINISHED,

    // Deployments
    DEPLOYMENT_STARTED,
    DEPLOYMENT_FINISHED,

    // Incidents
    INCIDENT_CREATED,
    INCIDENT_RESOLVED
}

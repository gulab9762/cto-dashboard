package com.dashboard.integration.schema;

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
    PR_REVIEW_COMMENTED,
    PR_CHANGES_REQUESTED,
    PR_MERGED,
    PR_CLOSED,
    PR_REOPENED,
    PR_SYNCHRONIZED,

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

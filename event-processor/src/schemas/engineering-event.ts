export enum EventType {
  // Requirements
  REQUIREMENT_CREATED = "REQUIREMENT_CREATED",
  REQUIREMENT_UPDATED = "REQUIREMENT_UPDATED",

  // Commits
  COMMIT_CREATED = "COMMIT_CREATED",

  // Pull Requests
  PR_CREATED = "PR_CREATED",
  PR_REVIEW_REQUESTED = "PR_REVIEW_REQUESTED",
  PR_REVIEWED = "PR_REVIEWED",
  PR_MERGED = "PR_MERGED",

  // Builds
  BUILD_STARTED = "BUILD_STARTED",
  BUILD_FINISHED = "BUILD_FINISHED",

  // Deployments
  DEPLOYMENT_STARTED = "DEPLOYMENT_STARTED",
  DEPLOYMENT_FINISHED = "DEPLOYMENT_FINISHED",

  // Incidents
  INCIDENT_CREATED = "INCIDENT_CREATED",
  INCIDENT_RESOLVED = "INCIDENT_RESOLVED",
}

export interface EngineeringEvent {
  id: string;
  type: EventType;
  source: string;
  orgId: string;
  repo?: string;
  actor?: string;
  timestamp: number;
  metadata: Record<string, any>;
}

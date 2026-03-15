package com.dashboard.integration.service;

import com.dashboard.integration.schema.EngineeringEvent;
import com.dashboard.integration.schema.EventType;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GithubMapper {

    private static final Logger log = LoggerFactory.getLogger(GithubMapper.class);

    public EngineeringEvent map(String type, JsonNode payload) {
        return switch (type) {
            case "pull_request" -> mapPullRequest(payload);
            case "pull_request_review" -> mapPullRequestReview(payload);
            case "push" -> mapPush(payload);
            default -> null;
        };
    }

    private EngineeringEvent mapPullRequest(JsonNode payload) {
        String action = payload.path("action").asText(null);
        JsonNode pr = payload.path("pull_request");

        if (pr.isMissingNode() || pr.path("user").path("login").asText(null) == null) {
            log.warn("Invalid PR payload: missing required fields");
            return null;
        }

        String orgId = getOrgId(payload);
        String repo = getRepo(payload);
        String actor = pr.path("user").path("login").asText();

        if ("opened".equals(action)) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("prId", pr.path("id").asLong());
            metadata.put("prNumber", pr.path("number").asLong());
            metadata.put("branch", pr.path("head").path("ref").asText(null));
            metadata.put("title", pr.path("title").asText(null));

            return createEvent(EventType.PR_CREATED, orgId, repo, actor, 
                parseTime(pr.path("created_at").asText()), metadata);
        }

        if ("review_requested".equals(action)) {
            List<String> requestedReviewers = new ArrayList<>();
            JsonNode reviewersNode = pr.path("requested_reviewers");
            if (reviewersNode.isArray()) {
                for (JsonNode r : reviewersNode) {
                    requestedReviewers.add(r.path("login").asText());
                }
            }

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("prId", pr.path("id").asLong());
            metadata.put("prNumber", pr.path("number").asLong());
            metadata.put("requestedReviewers", requestedReviewers);

            return createEvent(EventType.PR_REVIEW_REQUESTED, orgId, repo, actor, 
                parseTime(pr.path("updated_at").asText()), metadata);
        }

        if ("closed".equals(action) && pr.path("merged").asBoolean(false)) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("prId", pr.path("id").asLong());
            metadata.put("prNumber", pr.path("number").asLong());
            metadata.put("mergedBy", pr.path("merged_by").path("login").asText(null));
            metadata.put("additions", pr.path("additions").asInt(0));
            metadata.put("deletions", pr.path("deletions").asInt(0));
            metadata.put("filesChanged", pr.path("changed_files").asInt(0));

            return createEvent(EventType.PR_MERGED, orgId, repo, actor, 
                parseTime(pr.path("merged_at").asText()), metadata);
        }

        return null;
    }

    private EngineeringEvent mapPullRequestReview(JsonNode payload) {
        String action = payload.path("action").asText(null);
        JsonNode review = payload.path("review");
        JsonNode pr = payload.path("pull_request");

        if (review.path("user").path("login").asText(null) == null || pr.isMissingNode()) {
            log.warn("Invalid PR review payload: missing required fields");
            return null;
        }

        String orgId = getOrgId(payload);
        String repo = getRepo(payload);
        String actor = review.path("user").path("login").asText();

        if ("submitted".equals(action)) {
            String state = review.path("state").asText("");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("prId", pr.path("id").asLong());
            metadata.put("prNumber", pr.path("number").asLong());
            metadata.put("comment", review.path("body").asText(""));
            
            long timestamp = parseTime(review.path("submitted_at").asText());

            if ("approved".equals(state)) {
                metadata.put("reviewState", state);
                return createEvent(EventType.PR_REVIEWED, orgId, repo, actor, timestamp, metadata);
            }

            if ("commented".equals(state)) {
                metadata.put("reviewId", review.path("id").asLong());
                return createEvent(EventType.PR_REVIEW_COMMENTED, orgId, repo, actor, timestamp, metadata);
            }

            if ("changes_requested".equals(state)) {
                metadata.put("reviewId", review.path("id").asLong());
                return createEvent(EventType.PR_CHANGES_REQUESTED, orgId, repo, actor, timestamp, metadata);
            }
        }

        return null;
    }

    private EngineeringEvent mapPush(JsonNode payload) {
        JsonNode commits = payload.path("commits");
        if (!commits.isArray() || commits.isEmpty()) {
            log.warn("Invalid push payload: no commits found");
            return null;
        }

        JsonNode commit = commits.get(0);
        String timestampStr = commit.path("timestamp").asText(null);
        if (timestampStr == null) {
            log.warn("Invalid commit: missing timestamp");
            return null;
        }

        String orgId = getOrgId(payload);
        String repo = getRepo(payload);
        String actor = payload.path("pusher").path("name").asText("unknown");

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("commitSha", commit.path("id").asText());
        metadata.put("message", commit.path("message").asText(""));
        
        String ref = payload.path("ref").asText("");
        metadata.put("branch", ref.replace("refs/heads/", ""));
        metadata.put("commitCount", commits.size());

        return createEvent(EventType.COMMIT_CREATED, orgId, repo, actor, parseTime(timestampStr), metadata);
    }

    private String getOrgId(JsonNode payload) {
        String orgLogin = payload.path("organization").path("login").asText(null);
        if (orgLogin != null) return orgLogin;
        
        String ownerLogin = payload.path("repository").path("owner").path("login").asText(null);
        return ownerLogin != null ? ownerLogin : "unknown";
    }

    private String getRepo(JsonNode payload) {
        String repoName = payload.path("repository").path("name").asText(null);
        return repoName != null ? repoName : "unknown";
    }

    private EngineeringEvent createEvent(EventType type, String orgId, String repo, 
                                       String actor, long timestamp, Map<String, Object> metadata) {
        return EngineeringEvent.builder()
                .id(UUID.randomUUID().toString())
                .type(type)
                .source("github")
                .orgId(orgId)
                .repo(repo)
                .actor(actor)
                .timestamp(timestamp)
                .metadata(metadata)
                .build();
    }

    private long parseTime(String isoTime) {
        if (isoTime == null || isoTime.isEmpty()) return System.currentTimeMillis();
        try {
            return java.time.Instant.parse(isoTime).toEpochMilli();
        } catch (Exception e) {
            return System.currentTimeMillis();
        }
    }
}

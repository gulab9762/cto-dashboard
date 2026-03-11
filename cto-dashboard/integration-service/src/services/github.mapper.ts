import { Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { EngineeringEvent, EventType } from "../schemas/engineering-event";

@Injectable()
export class GithubMapper {
  map(type: string, payload: any): EngineeringEvent | null {
    switch (type) {
      case "pull_request":
        return this.mapPullRequest(payload);

      case "pull_request_review":
        return this.mapPullRequestReview(payload);

      case "push":
        return this.mapPush(payload);

      default:
        return null;
    }
  }

  private mapPullRequest(payload: any): EngineeringEvent | null {
    const action = payload.action;
    const pr = payload.pull_request;

    if (!pr || !pr.user?.login) {
      console.warn("Invalid PR payload: missing required fields");
      return null;
    }

    const orgId =
      payload.organization?.login ||
      payload.repository?.owner?.login ||
      "unknown";

    const repo = payload.repository?.name || "unknown";

    if (action === "opened") {
      return {
        id: uuid(),
        type: EventType.PR_CREATED,
        source: "github",
        orgId,
        repo,
        actor: pr.user.login,
        timestamp: new Date(pr.created_at).getTime(),
        metadata: {
          prId: pr.id,
          prNumber: pr.number,
          branch: pr.head?.ref,
          title: pr.title,
        },
      };
    }

    if (action === "review_requested") {
      return {
        id: uuid(),
        type: EventType.PR_REVIEW_REQUESTED,
        source: "github",
        orgId,
        repo,
        actor: pr.user.login,
        timestamp: new Date(pr.updated_at).getTime(),
        metadata: {
          prId: pr.id,
          prNumber: pr.number,
          requestedReviewers:
            pr.requested_reviewers?.map((r: any) => r.login) || [],
        },
      };
    }

    if (action === "closed" && pr.merged) {
      return {
        id: uuid(),
        type: EventType.PR_MERGED,
        source: "github",
        orgId,
        repo,
        actor: pr.user.login,
        timestamp: new Date(pr.merged_at).getTime(),
        metadata: {
          prId: pr.id,
          prNumber: pr.number,
          mergedBy: pr.merged_by?.login,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          filesChanged: pr.changed_files || 0,
        },
      };
    }

    return null;
  }

  private mapPullRequestReview(payload: any): EngineeringEvent | null {
    const action = payload.action;
    const review = payload.review;
    const pr = payload.pull_request;

    if (!review?.user?.login || !pr) {
      console.warn("Invalid PR review payload: missing required fields");
      return null;
    }

    const orgId =
      payload.organization?.login ||
      payload.repository?.owner?.login ||
      "unknown";

    const repo = payload.repository?.name || "unknown";

    if (action === "submitted") {
      // APPROVED REVIEW
      if (review.state === "approved") {
        return {
          id: uuid(),
          type: EventType.PR_REVIEWED,
          source: "github",
          orgId,
          repo,
          actor: review.user.login,
          timestamp: new Date(review.submitted_at).getTime(),
          metadata: {
            prId: pr.id,
            prNumber: pr.number,
            reviewState: review.state,
            comments: review.body || "",
          },
        };
      }

      // COMMENTED REVIEW
      if (review.state === "commented") {
        return {
          id: uuid(),
          type: EventType.PR_REVIEW_COMMENTED,
          source: "github",
          orgId,
          repo,
          actor: review.user.login,
          timestamp: new Date(review.submitted_at).getTime(),
          metadata: {
            prId: pr.id,
            prNumber: pr.number,
            reviewId: review.id,
            comment: review.body || "",
          },
        };
      }

      // CHANGES REQUESTED
      if (review.state === "changes_requested") {
        return {
          id: uuid(),
          type: EventType.PR_CHANGES_REQUESTED,
          source: "github",
          orgId,
          repo,
          actor: review.user.login,
          timestamp: new Date(review.submitted_at).getTime(),
          metadata: {
            prId: pr.id,
            prNumber: pr.number,
            reviewId: review.id,
            comment: review.body || "",
          },
        };
      }
    }

    return null;
  }

  private mapPush(payload: any): EngineeringEvent | null {
    if (!payload.commits?.length) {
      console.warn("Invalid push payload: no commits found");
      return null;
    }

    const commit = payload.commits[0];

    if (!commit?.timestamp) {
      console.warn("Invalid commit: missing timestamp");
      return null;
    }

    return {
      id: uuid(),
      type: EventType.COMMIT_CREATED,
      source: "github",
      orgId:
        payload.organization?.login ||
        payload.repository?.owner?.login ||
        "unknown",
      repo: payload.repository?.name || "unknown",
      actor: payload.pusher?.name || "unknown",
      timestamp: new Date(commit.timestamp).getTime(),
      metadata: {
        commitSha: commit.id,
        message: commit.message || "",
        branch: payload.ref?.replace("refs/heads/", "") || "unknown",
        commitCount: payload.commits.length,
      },
    };
  }
}
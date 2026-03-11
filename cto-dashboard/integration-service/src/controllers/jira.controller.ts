import { Controller, Post, Body } from "@nestjs/common";
import { KafkaProducer } from "../services/kafka.producer";
import { EventType } from "../schemas/engineering-event";
import { v4 as uuid } from "uuid";

@Controller("jira")
export class JiraController {
  constructor(private kafka: KafkaProducer) {}

  @Post("webhook")
  async webhook(@Body() payload: any) {
    console.log(`Received Jira webhook: ${payload.webhookEvent}`);

    const event = this.mapJiraEvent(payload);

    if (event) {
      await this.kafka.publish(
        process.env.KAFKA_TOPIC || "engineering-events",
        event
      );
      console.log(`Published event: ${event.type}`);
    }

    return { status: "ok" };
  }

  private mapJiraEvent(payload: any) {
    const webhookEvent = payload.webhookEvent;
    const issue = payload.issue;

    if (!issue) return null;

    const projectKey = issue.key.split("-")[0];

    switch (webhookEvent) {
      case "jira:issue_created":
        if (issue.fields.issuetype.name === "Story") {
          return {
            id: uuid(),
            type: EventType.REQUIREMENT_CREATED,
            source: "jira",
            orgId: payload.issue.fields.project?.key || "unknown",
            repo: payload.issue.fields.project?.name,
            actor: payload.user?.name || "unknown",
            timestamp: new Date(issue.fields.created).getTime(),
            metadata: {
              issueKey: issue.key,
              title: issue.fields.summary,
              labels: issue.fields.labels || [],
            },
          };
        }
        break;

      case "jira:issue_updated":
        if (issue.changelog?.histories) {
          return {
            id: uuid(),
            type: EventType.REQUIREMENT_UPDATED,
            source: "jira",
            orgId: payload.issue.fields.project?.key || "unknown",
            repo: payload.issue.fields.project?.name,
            actor: payload.user?.name || "unknown",
            timestamp: new Date(issue.fields.updated).getTime(),
            metadata: {
              issueKey: issue.key,
              title: issue.fields.summary,
              changes: payload.issue.changelog.histories
                .map((h: any) => h.items)
                .flat(),
            },
          };
        }
        break;
    }

    return null;
  }
}

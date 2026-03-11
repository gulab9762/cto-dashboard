import { ApiProperty } from "@nestjs/swagger";

export class GithubWebhookDto {
  @ApiProperty({
    description: "GitHub webhook event type",
    example: "pull_request",
  })
  eventType!: string;

  @ApiProperty({
    description: "GitHub webhook payload",
    additionalProperties: true,
  })
  payload!: Record<string, any>;
}

export class JiraWebhookDto {
  @ApiProperty({
    description: "Jira webhook event type",
    example: "jira:issue_created",
  })
  webhookEvent!: string;

  @ApiProperty({
    description: "Jira issue data",
    additionalProperties: true,
  })
  issue!: Record<string, any>;
}

export class WebhookResponseDto {
  @ApiProperty({
    description: "Response status",
    example: "ok",
  })
  status!: string;
}

export class EngineeringEventDto {
  @ApiProperty({
    description: "Unique event identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id!: string;

  @ApiProperty({
    description: "Event type from the schema",
    example: "PR_CREATED",
  })
  type!: string;

  @ApiProperty({
    description: "Source system",
    example: "github",
  })
  source!: string;

  @ApiProperty({
    description: "Organization identifier",
    example: "my-org",
  })
  orgId!: string;

  @ApiProperty({
    description: "Repository name",
    example: "my-repo",
    required: false,
  })
  repo?: string;

  @ApiProperty({
    description: "Actor who triggered the event",
    example: "john-doe",
    required: false,
  })
  actor?: string;

  @ApiProperty({
    description: "Event timestamp in milliseconds",
    example: 1678627200000,
  })
  timestamp!: number;

  @ApiProperty({
    description: "Event-specific metadata",
    additionalProperties: true,
    example: {
      prId: 12345,
      branch: "main",
      title: "Fix deployment issue",
    },
  })
  metadata!: Record<string, any>;
}

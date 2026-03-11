import { Controller, Post, Headers, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiHeader, ApiBody, ApiResponse } from "@nestjs/swagger";
import { GithubMapper } from "../services/github.mapper";
import { KafkaProducer } from "../services/kafka.producer";
import { WebhookResponseDto, EngineeringEventDto } from "../dto/webhook.dto";

@ApiTags("github")
@Controller("github")
export class GithubController {
  constructor(
    private mapper: GithubMapper,
    private kafka: KafkaProducer
  ) {}

  @Post("webhook")
  @ApiOperation({
    summary: "Handle GitHub webhook",
    description:
      "Receives GitHub webhook events (push, pull_request, pull_request_review), transforms them into engineering events, and publishes to Kafka.",
  })
  @ApiHeader({
    name: "x-github-event",
    description: "GitHub event type (e.g., push, pull_request, pull_request_review)",
    required: true,
  })
  @ApiBody({
    description: "GitHub webhook payload",
    type: "object",
    schema: {
      example: {
        action: "opened",
        pull_request: {
          id: 1,
          number: 123,
          title: "Fix deployment issue",
          user: { login: "john-doe" },
          created_at: "2026-03-12T10:00:00Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Webhook processed successfully",
    type: WebhookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid webhook payload",
  })
  async webhook(
    @Headers("x-github-event") eventType: string,
    @Body() payload: any
  ) {
    console.log(`📨 Received GitHub webhook: ${eventType}`);

    const event = this.mapper.map(eventType, payload);

    if (event) {
      console.log(`🔄 Mapping webhook to event: ${event.type}`);
      try {
        await this.kafka.publish(
          process.env.KAFKA_TOPIC || "engineering-events",
          event
        );
        console.log(`✅ Successfully published event: ${event.type}`);
      } catch (error) {
        const err = error as Error;
        console.error(`❌ Failed to publish event: ${err.message}`);
        return { status: "error", message: err.message };
      }
    } else {
      console.warn(`⚠️  Failed to map webhook event type: ${eventType}`);
    }

    return { status: "ok" };
  }
}

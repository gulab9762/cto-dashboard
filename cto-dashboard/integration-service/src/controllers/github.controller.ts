import { Controller, Post, Headers, Body } from "@nestjs/common";
import { GithubMapper } from "../services/github.mapper";
import { KafkaProducer } from "../services/kafka.producer";

@Controller("github")
export class GithubController {
  constructor(
    private mapper: GithubMapper,
    private kafka: KafkaProducer
  ) {}

  @Post("webhook")
  async webhook(
    @Headers("x-github-event") eventType: string,
    @Body() payload: any
  ) {
    console.log(`Received GitHub webhook: ${eventType}`);

    const event = this.mapper.map(eventType, payload);

    if (event) {
      await this.kafka.publish(
        process.env.KAFKA_TOPIC || "engineering-events",
        event
      );
      console.log(`Published event: ${event.type}`);
    }

    return { status: "ok" };
  }
}

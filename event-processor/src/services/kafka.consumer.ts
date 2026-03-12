import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { Kafka, Consumer } from "kafkajs";
import { EventProcessingService } from "./event-processing.service";

@Injectable()
export class KafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private readonly logger = new Logger(KafkaConsumer.name);

  constructor(private eventProcessing: EventProcessingService) {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || "cto-event-processor",
      brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    });
    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || "event-processor-group",
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.logger.log("✅ Kafka consumer connected");

      const topic = process.env.KAFKA_TOPIC || "engineering-events";
      await this.consumer.subscribe({ topic, fromBeginning: false });
      this.logger.log(`📡 Subscribed to topic: ${topic}`);

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            if (!message.value) {
              this.logger.warn("Received message with no value");
              return;
            }
            const event = JSON.parse(message.value.toString());
            this.logger.log(`📬 Received event: ${event.type}`);

            // Process and store event
            await this.eventProcessing.processAndStoreEvent(event);
          } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : "";
            this.logger.error(
              `❌ Error processing message: ${errorMsg}`,
              errorStack
            );
          }
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error("Failed to start Kafka consumer", errorStack);
      // Continue startup, allow retry
      setTimeout(() => this.onModuleInit(), 5000);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log("Kafka consumer disconnected");
  }
}

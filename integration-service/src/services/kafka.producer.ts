import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || "cto-dashboard",
      brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log("Kafka producer connected");
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    console.log("Kafka producer disconnected");
  }

  async publish(topic: string, message: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  }
}

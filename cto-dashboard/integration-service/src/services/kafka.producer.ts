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
    try {
      await this.producer.connect();
      console.log("✅ Kafka producer connected");
    } catch (error) {
      const err = error as Error;
      console.warn("⚠️  Kafka connection failed, retrying in background", err.message);
      // Retry connection in background
      this.retryConnect();
    }
  }

  private async retryConnect() {
    const maxRetries = 5;
    let attempts = 0;
    
    const retry = async () => {
      try {
        await this.producer.connect();
        console.log("✅ Kafka producer connected (after retry)");
      } catch (error) {
        attempts++;
        if (attempts < maxRetries) {
          console.log(`⏳ Kafka retry ${attempts}/${maxRetries}...`);
          setTimeout(retry, 5000);
        }
      }
    };
    
    setTimeout(retry, 5000);
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

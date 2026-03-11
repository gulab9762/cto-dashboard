import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

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
      this.isConnected = true;
      console.log("✅ Kafka producer connected");
    } catch (error) {
      const err = error as Error;
      console.warn("⚠️  Kafka connection failed, retrying in background", err.message);
      // Retry connection in background
      this.retryConnect();
    }
  }

  private async retryConnect() {
    const maxRetries = 10;
    let attempts = 0;
    
    const retry = async () => {
      try {
        await this.producer.connect();
        this.isConnected = true;
        console.log("✅ Kafka producer connected (after retry)");
      } catch (error) {
        attempts++;
        if (attempts < maxRetries) {
          console.log(`⏳ Kafka retry ${attempts}/${maxRetries}...`);
          setTimeout(retry, 5000);
        } else {
          console.error("❌ Max Kafka retries reached");
        }
      }
    };
    
    setTimeout(retry, 5000);
  }

  private async ensureConnected(): Promise<void> {
    if (this.isConnected) {
      return;
    }
    
    // Wait up to 30 seconds for connection
    const startTime = Date.now();
    while (!this.isConnected && Date.now() - startTime < 30000) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (!this.isConnected) {
      throw new Error("Kafka producer failed to connect");
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    console.log("Kafka producer disconnected");
  }

  async publish(topic: string, message: any): Promise<void> {
    try {
      // Ensure producer is connected before publishing
      await this.ensureConnected();
      
      console.log(`📤 Publishing event to topic: ${topic}`);
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.orgId || "default",
            value: JSON.stringify(message),
          },
        ],
      });
      console.log(`✅ Event published to Kafka: ${message.type}`);
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Failed to publish event: ${err.message}`);
      throw error;
    }
  }
}

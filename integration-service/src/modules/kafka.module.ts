import { Module } from "@nestjs/common";
import { KafkaProducer } from "../services/kafka.producer";

@Module({
  providers: [KafkaProducer],
  exports: [KafkaProducer],
})
export class KafkaModule {}

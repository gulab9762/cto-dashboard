import { Module } from "@nestjs/common";
import { DatabaseService } from "../services/database.service";
import { ClickHouseService } from "../services/clickhouse.service";
import { EventProcessingService } from "../services/event-processing.service";
import { KafkaConsumer } from "../services/kafka.consumer";

@Module({
  providers: [
    DatabaseService,
    ClickHouseService,
    EventProcessingService,
    KafkaConsumer,
  ],
  exports: [
    DatabaseService,
    ClickHouseService,
    EventProcessingService,
  ],
})
export class EventModule {}

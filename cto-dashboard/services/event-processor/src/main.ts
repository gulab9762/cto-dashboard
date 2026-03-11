import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ClickHouseService } from "./services/clickhouse.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3001;

  // Initialize ClickHouse tables
  const clickhouseService = app.get(ClickHouseService);
  await clickhouseService.ensureTablesExist();

  await app.listen(port, () => {
    console.log(`✅ Event Processor running on port ${port}`);
    console.log(`📬 Listening for events from Kafka`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Event Processor", err);
  process.exit(1);
});

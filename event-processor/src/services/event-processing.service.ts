import { Injectable, Logger } from "@nestjs/common";
import { EngineeringEvent } from "../schemas/engineering-event";
import { DatabaseService } from "./database.service";
import { ClickHouseService } from "./clickhouse.service";

@Injectable()
export class EventProcessingService {
  private readonly logger = new Logger(EventProcessingService.name);

  constructor(
    private database: DatabaseService,
    private clickhouse: ClickHouseService
  ) {}

  async processAndStoreEvent(event: EngineeringEvent): Promise<void> {
    try {
      this.logger.log(`Processing event: ${event.type} from ${event.source}`);

      // Validate event
      if (!this.validateEvent(event)) {
        this.logger.warn(`⚠️  Invalid event: ${JSON.stringify(event)}`);
        return;
      }

      // Store in PostgreSQL (primary)
      await this.database.storeEvent(event);

      // Store in ClickHouse (analytics)
      await this.clickhouse.storeEvent(event);

      this.logger.log(
        `✅ Event processed: ${event.type} for org ${event.orgId}`
      );
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `❌ Failed to process event: ${errorMsg}`,
        errorStack
      );
      throw error;
    }
  }

  private validateEvent(event: any): event is EngineeringEvent {
    return (
      event.id &&
      event.type &&
      event.source &&
      event.orgId &&
      event.timestamp &&
      typeof event.metadata === "object"
    );
  }

  async getOrgMetrics(orgId: string): Promise<any> {
    return this.database.getMetricsByOrg(orgId, 30);
  }

  async getOrgEvents(orgId: string, limit: number = 100): Promise<any> {
    return this.database.getEventsByOrg(orgId, limit, 0);
  }
}

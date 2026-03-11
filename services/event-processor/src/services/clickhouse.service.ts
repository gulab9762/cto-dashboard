import { Injectable, Logger } from "@nestjs/common";
import { ClickHouse } from "clickhouse";
import { EngineeringEvent } from "../schemas/engineering-event";

@Injectable()
export class ClickHouseService {
  private clickhouse: ClickHouse;
  private readonly logger = new Logger(ClickHouseService.name);

  constructor() {
    this.clickhouse = new ClickHouse({
      host: process.env.CLICKHOUSE_HOST || "localhost",
      port: Number(process.env.CLICKHOUSE_PORT || 8123),
      database: process.env.CLICKHOUSE_DATABASE || "cto_dashboard",
      user: process.env.CLICKHOUSE_USER || "default",
      password: process.env.CLICKHOUSE_PASSWORD || "",
    });
  }

  async ensureTablesExist(): Promise<void> {
    try {
      // Create events table if not exists
      await this.clickhouse.querying(
        `
        CREATE TABLE IF NOT EXISTS cto_dashboard.events (
          id String,
          type String,
          source String,
          orgId String,
          repo Nullable(String),
          actor Nullable(String),
          timestamp DateTime,
          metadata String,
          createdAt DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (timestamp, orgId, type)
        `
      );

      this.logger.log("✅ ClickHouse events table ready");

      // Create metrics table if not exists
      await this.clickhouse.querying(
        `
        CREATE TABLE IF NOT EXISTS cto_dashboard.metrics (
          orgId String,
          metricType String,
          date Date,
          value Int32,
          createdAt DateTime DEFAULT now()
        ) ENGINE = ReplacingMergeTree(createdAt)
        PARTITION BY toYYYYMM(date)
        ORDER BY (orgId, metricType, date)
        `
      );

      this.logger.log("✅ ClickHouse metrics table ready");
    } catch (error) {
      this.logger.error(
        `⚠️  Error creating ClickHouse tables: ${error.message}`
      );
      // Continue anyway, table might already exist
    }
  }

  async storeEvent(event: EngineeringEvent): Promise<void> {
    try {
      const query = `
        INSERT INTO cto_dashboard.events 
        (id, type, source, orgId, repo, actor, timestamp, metadata)
        VALUES
      `;

      const values = [
        [
          event.id,
          event.type,
          event.source,
          event.orgId,
          event.repo || null,
          event.actor || null,
          new Date(event.timestamp),
          JSON.stringify(event.metadata),
        ],
      ];

      const formatted = values
        .map((row) =>
          `(${row
            .map((v) =>
              v === null ? "null" : `'${String(v).replace(/'/g, "''")}'`
            )
            .join(",")})`
        )
        .join(",");

      await this.clickhouse.querying(query + formatted);

      this.logger.debug(
        `📊 Event stored in ClickHouse: ${event.id}`
      );
    } catch (error) {
      this.logger.warn(
        `⚠️  Failed to store event in ClickHouse: ${error.message}`
      );
      // Don't throw - ClickHouse is for analytics, not critical
    }
  }

  async getEventMetrics(
    orgId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const query = `
        SELECT 
          toDate(timestamp) as date,
          type,
          count() as count
        FROM cto_dashboard.events
        WHERE orgId = '${orgId}' 
          AND timestamp >= '${startDate.toISOString()}'
          AND timestamp <= '${endDate.toISOString()}'
        GROUP BY toDate(timestamp), type
        ORDER BY date DESC
      `;

      const result = await this.clickhouse.querying(query);
      return result;
    } catch (error) {
      this.logger.warn(`⚠️  Failed to query metrics: ${error.message}`);
      return [];
    }
  }

  async getEventsByType(orgId: string, eventType: string): Promise<any> {
    try {
      const query = `
        SELECT *
        FROM cto_dashboard.events
        WHERE orgId = '${orgId}' AND type = '${eventType}'
        ORDER BY timestamp DESC
        LIMIT 100
      `;

      return await this.clickhouse.querying(query);
    } catch (error) {
      this.logger.warn(`⚠️  Failed to query events: ${error.message}`);
      return [];
    }
  }
}

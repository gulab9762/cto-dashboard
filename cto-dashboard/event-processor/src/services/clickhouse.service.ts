import { Injectable, Logger } from "@nestjs/common";
import { EngineeringEvent } from "../schemas/engineering-event";

@Injectable()
export class ClickHouseService {
  private readonly logger = new Logger(ClickHouseService.name);
  private readonly baseUrl: string;
  private readonly user: string;
  private readonly password: string;
  private readonly database: string;

  constructor() {
    const host = process.env.CLICKHOUSE_HOST || "localhost";
    const port = process.env.CLICKHOUSE_PORT || "8123";

    this.baseUrl = `http://${host}:${port}`;
    this.user = process.env.CLICKHOUSE_USER || "default";
    this.password = process.env.CLICKHOUSE_PASSWORD || "";
    this.database = process.env.CLICKHOUSE_DATABASE || "cto_dashboard";
  }

  private async executeQuery(query: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append("user", this.user);
      params.append("database", this.database);

      if (this.password) {
        params.append("password", this.password);
      }

      const response = await fetch(`${this.baseUrl}/?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`ClickHouse error: ${response.status} - ${text}`);
      }

      return response.text();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to execute ClickHouse query: ${msg}`);
    }
  }

  private escape(val: string | null | undefined): string {
    if (val === null || val === undefined) return "null";
    return `'${String(val).replace(/'/g, "''")}'`;
  }

  async ensureTablesExist(): Promise<void> {
    try {
      await this.executeQuery(`
        CREATE TABLE IF NOT EXISTS ${this.database}.events (
          id String,
          type LowCardinality(String),
          source LowCardinality(String),
          orgId String,
          repo Nullable(String),
          actor Nullable(String),
          timestamp DateTime64(3),
          metadata String,
          createdAt DateTime DEFAULT now()
        )
        ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (orgId, timestamp, type)
      `);

      this.logger.log("✅ ClickHouse events table ready");

      await this.executeQuery(`
        CREATE TABLE IF NOT EXISTS ${this.database}.metrics (
          orgId String,
          metricType LowCardinality(String),
          date Date,
          value Int32,
          createdAt DateTime DEFAULT now()
        )
        ENGINE = ReplacingMergeTree(createdAt)
        PARTITION BY toYYYYMM(date)
        ORDER BY (orgId, metricType, date)
      `);

      this.logger.log("✅ ClickHouse metrics table ready");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`⚠️ Error creating ClickHouse tables: ${msg}`);
    }
  }

  async storeEvent(event: EngineeringEvent): Promise<void> {
    try {
      const query = `
        INSERT INTO ${this.database}.events
        (id, type, source, orgId, repo, actor, timestamp, metadata)
        VALUES (
          ${this.escape(event.id)},
          ${this.escape(event.type)},
          ${this.escape(event.source)},
          ${this.escape(event.orgId)},
          ${this.escape(event.repo)},
          ${this.escape(event.actor)},
          fromUnixTimestamp64Milli(${event.timestamp}),
          ${this.escape(JSON.stringify(event.metadata))}
        )
      `;

      await this.executeQuery(query);

      this.logger.debug(`📊 Event stored in ClickHouse: ${event.id}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`⚠️ Failed to store event in ClickHouse: ${msg}`);
    }
  }

  async getEventMetrics(orgId: string, startDate: Date, endDate: Date) {
    try {
      const start = startDate.getTime();
      const end = endDate.getTime();

      const query = `
        SELECT
          toDate(timestamp) AS date,
          type,
          count() AS count
        FROM ${this.database}.events
        WHERE orgId = '${orgId}'
          AND timestamp >= fromUnixTimestamp64Milli(${start})
          AND timestamp <= fromUnixTimestamp64Milli(${end})
        GROUP BY date, type
        ORDER BY date DESC
        FORMAT JSON
      `;

      const result = await this.executeQuery(query);
      return JSON.parse(result).data || [];
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`⚠️ Failed to query metrics: ${msg}`);
      return [];
    }
  }

  async getEventsByType(orgId: string, eventType: string) {
    try {
      const query = `
        SELECT *
        FROM ${this.database}.events
        WHERE orgId = '${orgId}'
          AND type = '${eventType}'
        ORDER BY timestamp DESC
        LIMIT 100
        FORMAT JSON
      `;

      const result = await this.executeQuery(query);
      return JSON.parse(result).data || [];
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`⚠️ Failed to query events: ${msg}`);
      return [];
    }
  }
}
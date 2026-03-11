import { Injectable, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { EngineeringEvent, EventType } from "../schemas/engineering-event";

@Injectable()
export class DatabaseService {
  private prisma: PrismaClient;
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    this.prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async storeEvent(event: EngineeringEvent): Promise<void> {
    try {
      // Store in PostgreSQL
      const storedEvent = await this.prisma.engineeringEvent.create({
        data: {
          eventId: event.id,
          type: event.type,
          source: event.source,
          orgId: event.orgId,
          repo: event.repo,
          actor: event.actor,
          timestamp: BigInt(event.timestamp),
          metadata: event.metadata,
        },
      });

      this.logger.debug(`✅ Event stored in PostgreSQL: ${storedEvent.id}`);

      // Update metrics
      await this.updateEventMetrics(event);
    } catch (error) {
      this.logger.error(`❌ Failed to store event: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateEventMetrics(event: EngineeringEvent): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Map event type to metric type
      const metricType = this.getMetricType(event.type);

      if (metricType) {
        await this.prisma.eventMetric.upsert({
          where: {
            orgId_metricType_date: {
              orgId: event.orgId,
              metricType,
              date: today,
            },
          },
          update: {
            value: {
              increment: 1,
            },
          },
          create: {
            orgId: event.orgId,
            metricType,
            date: today,
            value: 1,
          },
        });

        this.logger.debug(
          `📊 Metric updated: ${event.orgId}/${metricType} on ${today.toISOString()}`
        );
      }
    } catch (error) {
      this.logger.warn(
        `⚠️  Failed to update metrics: ${error.message}`
      );
      // Don't throw - metrics are secondary
    }
  }

  private getMetricType(eventType: EventType): string | null {
    const metricMap: Partial<Record<EventType, string>> = {
      [EventType.PR_CREATED]: "pr_created",
      [EventType.PR_MERGED]: "pr_merged",
      [EventType.PR_REVIEWED]: "pr_reviewed",
      [EventType.COMMIT_CREATED]: "commit_created",
      [EventType.REQUIREMENT_CREATED]: "requirement_created",
      [EventType.REQUIREMENT_UPDATED]: "requirement_updated",
      [EventType.BUILD_FINISHED]: "build_completed",
      [EventType.DEPLOYMENT_FINISHED]: "deployment_completed",
      [EventType.INCIDENT_CREATED]: "incident_created",
      [EventType.INCIDENT_RESOLVED]: "incident_resolved",
    };

    return metricMap[eventType] || null;
  }

  async getMetricsByOrg(orgId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.eventMetric.findMany({
      where: {
        orgId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: "asc" },
    });
  }

  async getEventsByOrg(
    orgId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any> {
    return this.prisma.engineeringEvent.findMany({
      where: { orgId },
      take: limit,
      skip: offset,
      orderBy: { timestamp: "desc" },
    });
  }
}

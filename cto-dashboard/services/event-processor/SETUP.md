# Event Processor Setup Guide

## Overview

The Event Processor service:
- **Consumes** events from Kafka (topic: `engineering-events`)
- **Validates** event schema
- **Persists** to PostgreSQL (metrics & events)
- **Persists** to ClickHouse (analytics warehouse)
- **Aggregates** daily metrics per org

## Architecture

```
Integration Service
      ↓
   Kafka
      ↓
Event Processor
      ├→ PostgreSQL (OLTP)
      └→ ClickHouse (OLAP)
```

---

## Prerequisites

- PostgreSQL 15+ running
- ClickHouse 23.x running
- Kafka/Redpanda with `engineering-events` topic
- Node.js 18+

---

## Quick Start

### 1. Install Dependencies

```bash
cd services/event-processor
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Update .env with your database/Kafka credentials
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# View data (optional)
npm run prisma:studio
```

### 4. Start Service

```bash
npm run start:dev
```

Expected output:
```
✅ Event Processor running on port 3001
📬 Listening for events from Kafka
```

---

## Using Docker Compose

Start everything together:

```bash
# From project root
docker-compose up -d
```

This starts:
- Redpanda (port 9092)
- PostgreSQL (port 5432)
- ClickHouse (port 8123)
- Integration Service (port 3000)
- Event Processor (port 3001)

---

## Database Setup

### PostgreSQL Tables

**EngineeringEvent Table**
```sql
-- Stores raw events
SELECT 
  id, eventId, type, source, orgId, repo, 
  actor, timestamp, metadata, createdAt
FROM "EngineeringEvent"
WHERE orgId = 'my-org'
ORDER BY timestamp DESC
LIMIT 100;
```

**EventMetric Table**
```sql
-- Aggregated daily metrics
SELECT 
  orgId, metricType, date, value
FROM "EventMetric"
WHERE orgId = 'my-org'
  AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

### ClickHouse Tables

**events Table**
```sql
-- Time-series analytics
SELECT 
  toDate(timestamp) as date, type, count() as count
FROM cto_dashboard.events
WHERE orgId = 'my-org'
GROUP BY toDate(timestamp), type
ORDER BY date DESC;
```

**metrics Table**
```sql
-- Aggregated metrics
SELECT * FROM cto_dashboard.metrics
WHERE orgId = 'my-org'
ORDER BY date DESC;
```

---

## Data Flow

### Event Lifecycle

1. **Created** - GitHub/Jira webhook triggers
2. **Published** - Integration Service sends to Kafka
3. **Consumed** - Event Processor receives from Kafka
4. **Validated** - Schema and data checks
5. **Stored** - PostgreSQL (primary) + ClickHouse (analytics)
6. **Indexed** - Ready for queries and aggregations
7. **Aggregated** - Daily metrics updated

### Example: PR Merged

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "PR_MERGED",
  "source": "github",
  "orgId": "my-company",
  "repo": "backend-api",
  "actor": "john-doe",
  "timestamp": 1678627200000,
  "metadata": {
    "prId": 123,
    "prNumber": 45,
    "mergedBy": "jane-smith",
    "additions": 250,
    "deletions": 100,
    "filesChanged": 12
  }
}
```

**Stored as:**
- PostgreSQL `EngineeringEvent`: Full event + JSON metadata
- ClickHouse `events`: Same data, optimized for analytics
- PostgreSQL `EventMetric`: `pr_merged` count += 1 for the day

---

## Monitoring & Debugging

### Check Service Logs

```bash
# Development
npm run start:dev

# Watch logs in Docker
docker logs -f event-processor
```

Look for:
```
✅ Event Processor running on port 3001
✅ Kafka consumer connected
📬 Received event: PR_CREATED
✅ Event processed: PR_CREATED for org my-company
```

### Verify Event Storage

**PostgreSQL:**
```bash
npm run prisma:studio
# Open browser to http://localhost:5555
# Browse EngineeringEvent table
```

**ClickHouse:**
```bash
# Connect to ClickHouse
curl 'http://localhost:8123/' \
  --data "SELECT count() FROM cto_dashboard.events"
```

### Check Kafka Topic

```bash
# List topics
docker exec redpanda rpk topic list

# Consume messages
docker exec redpanda rpk topic consume engineering-events \
  --brokers localhost:9092 --format json
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **ECONNREFUSED: PostgreSQL** | Ensure PostgreSQL running on port 5432 |
| **ECONNREFUSED: ClickHouse** | Ensure ClickHouse running on port 8123 |
| **ECONNREFUSED: Kafka** | Ensure Kafka/Redpanda running on port 9092 |
| **No events appearing** | Check Integration Service is publishing to Kafka |
| **Prisma migration fails** | Ensure `DATABASE_URL` is correct and DB accessible |
| **Events not in DB** | Check service logs for validation/processing errors |

---

## Environment Variables

```env
# Service
NODE_ENV=development
PORT=3001

# Kafka Configuration
KAFKA_BROKERS=localhost:9092        # comma-separated
KAFKA_CLIENT_ID=cto-event-processor
KAFKA_TOPIC=engineering-events
KAFKA_GROUP_ID=event-processor-group

# PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cto_dashboard?schema=public"

# ClickHouse
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=cto_dashboard
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
```

---

## API Endpoints (Metrics)

The event processor doesn't expose HTTP endpoints currently, but the services are available:

```typescript
// EventProcessingService
getOrgMetrics(orgId: string)  // Last 30 days
getOrgEvents(orgId: string)   // Last 100 events
```

These will be exposed via GraphQL API gateway in the next phase.

---

## Next Steps

1. ✅ Consume events from Kafka
2. ✅ Persist to PostgreSQL
3. ✅ Persist to ClickHouse
4. 🔄 Build GraphQL API for metrics queries
5. 📊 Create metrics aggregation service
6. 🔔 Add alerting triggers

# Event Processor

Consumes engineering events from Kafka (Redpanda) and persists them to PostgreSQL (metrics) and ClickHouse (analytics).

## Architecture

```
Kafka/Redpanda (engineering-events topic)
     ↓
KafkaConsumer (subscribes to group)
     ↓
EventProcessingService (validates & orchestrates)
     ↓
    ├→ PostgreSQL (EngineeringEvent, EventMetric)
     └→ ClickHouse (analytics tables)
```

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- ClickHouse 23.x
- Kafka/Redpanda running on localhost:9092

## Installation

```bash
npm install
```

## Database Setup

### Initialize Prisma

```bash
# Generate Prisma client
npm run prisma:generate

# Create/migrate database
npm run prisma:migrate

# View/edit data in UI
npm run prisma:studio
```

This will:
- Create tables: `engineeringEvent`, `eventMetric`, `eventProcessingStatus`
- Set up indexes on common query fields

### ClickHouse Tables

Tables are created automatically on startup if they don't exist:
- `events` - Raw event data (partitioned by month)
- `metrics` - Aggregated metrics per org

## Running

**Development**
```bash
npm run start:dev
```

**Production**
```bash
npm run build
npm start
```

## Environment Variables

```env
NODE_ENV=development
PORT=3001

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=cto-event-processor
KAFKA_TOPIC=engineering-events
KAFKA_GROUP_ID=event-processor-group

# PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cto_dashboard?schema=public"

# ClickHouse
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=cto_dashboard
```

## Services

### EventProcessingService
- Validates incoming events
- Orchestrates storage to both databases
- Provides metrics queries

### DatabaseService
- Persists to PostgreSQL via Prisma
- Maintains event and metric tables
- Aggregates daily metrics

### ClickHouseService
- Persists to ClickHouse (analytics warehouse)
- Creates tables on first run
- Optimized for time-series queries

### KafkaConsumer
- Subscribes to engineering-events topic
- Handles consumer group coordination
- Auto-retries on connection failure

## Data Flow Example

**1. GitHub webhook triggers integration service**
```
GitHub: PR opened
  ↓
Integration Service: /github/webhook
  ↓
Publishes to Kafka: { type: "PR_CREATED", orgId: "my-org", ... }
```

**2. Event Processor consumes and stores**
```
Kafka: engineering-events topic
  ↓
Event Processor: receives message
  ↓
Validates event
  ↓
Stores in PostgreSQL: engineeringEvent table
  ├→ Metadata stored as JSON
  ├→ Timestamp indexed for queries
  └→ Updates daily metrics
  ↓
Stores in ClickHouse: events table
  ├→ Partitioned by month (timestamp)
  ├→ Optimized for analytics
  └→ Ready for aggregations
```

## Querying Events

### PostgreSQL (via Prisma)

```typescript
// Recent events for an org
const events = await database.getEventsByOrg("my-org", 50, 0);

// Metrics for last 30 days
const metrics = await database.getMetricsByOrg("my-org", 30);
```

### ClickHouse (Analytics)

```bash
# Events by type
SELECT type, count() as count
FROM cto_dashboard.events
WHERE orgId = 'my-org'
GROUP BY type
ORDER BY count DESC;

# Daily metrics
SELECT toDate(timestamp) as date, count() as event_count
FROM cto_dashboard.events
WHERE orgId = 'my-org'
GROUP BY toDate(timestamp)
ORDER BY date DESC;
```

## Monitoring

Check logs for:
```
✅ Event Processor running on port 3001
📬 Listening for events from Kafka
📬 Received event: PR_CREATED
✅ Event stored in PostgreSQL
📊 Event stored in ClickHouse
✅ Event processed: PR_CREATED for org my-org
```

## Database Schema

### EngineeringEvent (PostgreSQL)
- `id` - Primary key (cuid)
- `eventId` - UUID from integration service (unique)
- `type` - EventType enum
- `source` - "github", "jira", etc
- `orgId` - Org identifier
- `repo` - Repository name
- `actor` - User who triggered event
- `timestamp` - Unix timestamp (ms)
- `metadata` - JSON with event-specific data
- `createdAt` - Server timestamp
- `updatedAt` - Last update

### EventMetric (PostgreSQL)
- `orgId` - Organization
- `metricType` - "pr_created", "commit_created", etc
- `value` - Count for the day
- `date` - Date of metric

### events (ClickHouse)
- Optimized for time-series analytics
- Partitioned by month
- Optimized for large-scale aggregations

## Next Steps

1. ✅ Consume events from Kafka
2. ✅ Store in PostgreSQL (primary DB)
3. ✅ Store in ClickHouse (analytics)
4. 🔄 Build GraphQL API for metrics
5. 📊 Create dashboard for visualization
6. 🔔 Add alerting on key metrics

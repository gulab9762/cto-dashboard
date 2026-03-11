# Integration Service

Event ingestion service for the CTO Dashboard. Handles webhooks from GitHub and Jira, transforms them into standardized engineering events, and publishes to Redpanda (Kafka).

## Architecture

```
GitHub/Jira Webhooks
      │
      ↓
Integration Service
      │
      ↓
Redpanda/Kafka (engineering-events topic)
      │
      ↓
Event Processor (normalizes & correlates)
      │
      ↓
ClickHouse (analytics warehouse)
```

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for local dev)

## Installation

```bash
npm install
```

## Setup Local Environment

```bash
# Start Redpanda, PostgreSQL, ClickHouse
docker-compose up -d

# Create Kafka topic
docker exec -it redpanda rpk topic create engineering-events --brokers localhost:9092
```

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

Service will start on port 3000 (configurable via PORT env var).

## API Endpoints

### GitHub Webhook
```
POST /github/webhook
Headers: x-github-event: <event-type>
```

Supported events:
- `pull_request` (opened, closed+merged)
- `pull_request_review` (submitted with approval)
- `push`

**Setup Guide:** See [GITHUB_WEBHOOK_SETUP.md](GITHUB_WEBHOOK_SETUP.md)

### Jira Webhook
```
POST /jira/webhook
```

Supported events:
- `jira:issue_created`
- `jira:issue_updated`

**Setup Guide:** See [JIRA_WEBHOOK_SETUP.md](JIRA_WEBHOOK_SETUP.md)

## Environment Variables

```env
NODE_ENV=development
PORT=3000
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=cto-dashboard
KAFKA_TOPIC=engineering-events
```

## Event Schema

All events conform to the `EngineeringEvent` interface:

```typescript
{
  id: string;           // UUID
  type: EventType;      // PR_CREATED, PR_MERGED, BUILD_FINISHED, etc.
  source: string;       // "github" | "jira"
  orgId: string;        // Organization identifier
  repo?: string;        // Repository name
  actor?: string;       // User who triggered the event
  timestamp: number;    // Unix timestamp (ms)
  metadata: {};         // Event-specific data
}
```

## Next Steps

- Implement Event Processor service
- Add database models with Prisma
- Add GraphQL API Gateway
- Deploy to Kubernetes

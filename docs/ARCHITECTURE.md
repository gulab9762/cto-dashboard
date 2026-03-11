# CTO Dashboard - End-to-End Architecture

## System Overview

The CTO Dashboard is an event-driven platform that captures engineering metrics from GitHub, Jira, and other sources, processes them in real-time, and provides analytics and insights to CTOs and engineering leaders.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SYSTEMS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐             │
│  │   GitHub     │      │    Jira      │      │   Other      │             │
│  │  (Webhooks)  │      │  (Webhooks)  │      │  Services    │             │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘             │
│         │                     │                      │                     │
│         └─────────────────────┼──────────────────────┘                     │
│                               ↓                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │ INTEGRATION SERVICE   │
                    │ (Port 3000)           │
                    │                       │
                    │ • GitHub Controller   │
                    │ • Jira Controller     │
                    │ • Event Validation    │
                    │ • Kafka Producer      │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴──────────────────┐
                    │                              │
                    ↓                              ↓
            ┌─────────────────┐          ┌────────────────────┐
            │     KAFKA       │          │   SWAGGER DOCS     │
            │  (Redpanda)     │          │   (Port 3000/docs) │
            │ Topic:          │          │                    │
            │ engineering-    │          │ Interactive API    │
            │ events          │          │ Testing            │
            └────────┬────────┘          └────────────────────┘
                     │
                     │ (Subscription)
                     ↓
        ┌────────────────────────────┐
        │   EVENT PROCESSOR           │
        │   (Port 3001)               │
        │                             │
        │ • Kafka Consumer            │
        │ • Event Validation          │
        │ • Data Persistence          │
        │ • Metrics Aggregation       │
        └────────┬──────────┬─────────┘
                 │          │
        ┌────────┴┐    ┌────┴────────┐
        │         │    │             │
        ↓         ↓    ↓             ↓
    ┌──────────────────┐    ┌──────────────────┐
    │   PostgreSQL     │    │   ClickHouse     │
    │   (Port 5432)    │    │   (Port 8123)    │
    │                  │    │                  │
    │ OLTP Database    │    │ OLAP Warehouse   │
    │ • Events         │    │ • Events         │
    │ • Metrics        │    │ • Analytics      │
    │ • Dimensions     │    │ • Time-Series    │
    └──────────────────┘    └──────┬───────────┘
             │                      │
             │    ┌─────────────────┘
             │    │
             └────┼──────────────────────┐
                  │                      │
                  ↓                      ↓
        ┌──────────────────┐   ┌──────────────────┐
        │  Next: API       │   │  Next: Dashboard │
        │  Gateway         │   │  UI              │
        │  (GraphQL)       │   │  (React/Vue)     │
        │  Port 4000       │   │  Port 3000       │
        └──────────────────┘   └──────────────────┘
                  │                      │
                  └──────────┬───────────┘
                             │
                             ↓
                  ┌──────────────────────┐
                  │   CTO Dashboard      │
                  │   (Analytics UI)     │
                  │                      │
                  │ • PR Metrics         │
                  │ • Deployment Metrics │
                  │ • Team Analytics     │
                  │ • Incident Tracking  │
                  └──────────────────────┘
```

---

## Component Architecture

### Layer 1: External Systems
- **GitHub** - Source control, PR/commit webhooks
- **Jira** - Issue tracking, requirements webhooks
- **Other Sources** - Build systems, monitoring, incident management

### Layer 2: Ingestion (Integration Service)
**Location:** `services/integration-service`
- Receives HTTP webhooks from external systems
- Validates and transforms events
- Publishes to Kafka topic `engineering-events`
- Exposes Swagger documentation for testing

### Layer 3: Streaming (Kafka/Redpanda)
- Message queue for reliable event delivery
- Topic: `engineering-events`
- Decouples producers from consumers
- Enables multiple processors to consume events

### Layer 4: Processing (Event Processor)
**Location:** `services/event-processor`
- Consumes events from Kafka
- Validates event schema
- Aggregates metrics (daily rollups)
- Loads to both OLTP and OLAP databases

### Layer 5: Data Storage
**PostgreSQL (OLTP)**
- Event storage (raw events)
- Metric aggregations (daily)
- Real-time queries

**ClickHouse (OLAP)**
- Time-series analytics
- Partitioned by month
- Optimized for aggregations and reporting

### Layer 6: APIs (Next Phase)
- GraphQL API Gateway
- Query metrics and events
- Real-time subscriptions

### Layer 7: UI (Next Phase)
- React/Vue dashboard
- Visualizations
- Insights and alerts

---

## Data Flow

### Example: GitHub PR Merged Event

```
1. GitHub Event
   └─ PR#45 merged on branch main
   
2. Integration Service
   ├─ Receives webhook: POST /github/webhook
   ├─ Validates event type: pull_request (action: merged)
   ├─ Creates EngineeringEvent
   │  ├─ id: UUID
   │  ├─ type: PR_MERGED
   │  ├─ source: github
   │  ├─ orgId: company-org
   │  ├─ repo: backend-api
   │  ├─ actor: john-doe
   │  ├─ timestamp: 1678627200000
   │  └─ metadata: { prNumber: 45, additions: 250, deletions: 100, ... }
   └─ Publishes to Kafka
   
3. Kafka Topic: engineering-events
   └─ Message persists for subscribers
   
4. Event Processor
   ├─ Consumes message
   ├─ Validates EngineeringEvent schema
   ├─ Stores to PostgreSQL
   │  ├─ EngineeringEvent table (raw event)
   │  └─ EventMetric table (pr_merged count +1)
   └─ Stores to ClickHouse
      └─ events table (partitioned analytics)
      
5. Databases Ready
   ├─ PostgreSQL: Event queryable, metrics aggregated daily
   └─ ClickHouse: Optimized for time-series aggregations
   
6. API/Dashboard (Future)
   ├─ Query: "PRs merged this week"
   ├─ Query: "Deployment frequency by team"
   └─ Visualize: Trends and anomalies
```

---

## Service Interaction Map

```
┌──────────────────────────────────────────────────────────────┐
│                    Service Boundaries                        │
├──────────────────────────────────────────────────────────────┤

Integration Service (Core1)
├── Responsibility: Ingest external events
├── Input: HTTP webhooks
├── Output: Kafka messages
├── Dependencies: Kafka
└── Status: ✅ COMPLETE

    ↓
    
Event Processor (Core2)
├── Responsibility: Process and persist events
├── Input: Kafka messages
├── Output: PostgreSQL + ClickHouse
├── Dependencies: Kafka, PostgreSQL, ClickHouse
└── Status: ✅ COMPLETE

    ↓
    
API Gateway (Core3) - FUTURE
├── Responsibility: Query interface
├── Input: GraphQL queries
├── Output: JSON results
├── Dependencies: PostgreSQL, ClickHouse
└── Status: 🔄 TODO

    ↓
    
Dashboard UI (Core4) - FUTURE
├── Responsibility: Visualizations
├── Input: User interactions
├── Output: React components
├── Dependencies: API Gateway
└── Status: 🔄 TODO
```

---

## Event Flow by Type

### Pull Request Events

```
GitHub PR Event
    ↓
[PR_CREATED]        →  Added to tracking
[PR_REVIEW_REQUESTED] →  Awaiting review time
[PR_REVIEWED]       →  Review time captured
[PR_MERGED]         →  Cycle time calculated
    ↓
PostgreSQL: Track metrics (merge frequency, review count)
ClickHouse: Analyze trends (cycle time by team, week)
```

### Code Quality Events

```
GitHub Commit Event
    ↓
[COMMIT_CREATED]    →  Development activity
    ↓
PostgreSQL: Commit count per author
ClickHouse: Commit frequency trends
```

### Requirement Events

```
Jira Story Event
    ↓
[REQUIREMENT_CREATED]   →  Story entered
[REQUIREMENT_UPDATED]   →  Status changed
    ↓
PostgreSQL: Feature count, status distribution
ClickHouse: Feature velocity, cycle time
```

### Build & Deployment Events

```
Build System Events
    ↓
[BUILD_STARTED]     →  Build initiated
[BUILD_FINISHED]    →  Build succeeded/failed
[DEPLOYMENT_STARTED] →  Release process
[DEPLOYMENT_FINISHED] →  Live deployment
    ↓
PostgreSQL: Build frequency, deployment success rate
ClickHouse: Deployment frequency, mean time to recovery
```

---

## Database Schema Relationships

### PostgreSQL (Metrics)

```
EngineeringEvent (Raw Events)
├─ id (Primary Key)
├─ eventId (Unique - from integration service)
├─ type (EventType enum)
├─ source ("github", "jira", etc)
├─ orgId (Organization)
├─ repo (Repository)
├─ actor (User)
├─ timestamp (Event time)
├─ metadata (Event-specific JSON)
└─ createdAt, updatedAt

EventMetric (Aggregated Daily)
├─ id (Primary Key)
├─ orgId (Foreign reference)
├─ metricType ("pr_merged", "commit_created", etc)
├─ date (Date of metric)
├─ value (Count for the day)
└─ createdAt, updatedAt

EventProcessingStatus (Kafka offsets)
├─ id (Primary Key)
├─ topic (Kafka topic)
├─ partition (Topic partition)
├─ offset (Last processed message)
└─ updatedAt
```

### ClickHouse (Analytics)

```
events (Time-Series)
├─ id (Event UUID)
├─ type (EventType)
├─ source (System)
├─ orgId (Organization)
├─ repo (Repository)
├─ actor (User)
├─ timestamp (Event time - partition key)
├─ metadata (JSON)
└─ createdAt

metrics (Aggregated)
├─ orgId (Organization)
├─ metricType (Metric name)
├─ date (Metric date - partition key)
├─ value (Count)
└─ createdAt
```

---

## Deployment Architecture

### Development (Local)

```
docker-compose up -d

Services:
├── redpanda:9092        (Kafka)
├── postgres:5432        (PostgreSQL)
├── clickhouse:8123      (ClickHouse)
├── integration-service:3000
└── event-processor:3001
```

### Production (Kubernetes)

```
Deployments:
├── integration-service (replicas: 3)
├── event-processor (replicas: 3)
└── api-gateway (replicas: 2)

Stateful Services:
├── PostgreSQL (single instance + backup)
├── ClickHouse (cluster)
└── Kafka/Redpanda (cluster)

Storage:
├── PostgreSQL volumes (persistent)
├── ClickHouse volumes (persistent)
└── Kafka volumes (persistent)
```

---

## Technology Stack Summary

| Layer | Component | Purpose | Status |
|-------|-----------|---------|--------|
| **Ingestion** | Integration Service (NestJS) | Webhook handler | ✅ Complete |
| **Streaming** | Kafka/Redpanda | Message queue | ✅ Complete |
| **Processing** | Event Processor (NestJS) | Event consumer | ✅ Complete |
| **Storage (OLTP)** | PostgreSQL | Transactional data | ✅ Complete |
| **Storage (OLAP)** | ClickHouse | Analytics warehouse | ✅ Complete |
| **API** | GraphQL Gateway | Query interface | 🔄 TODO |
| **UI** | React Dashboard | Visualizations | 🔄 TODO |
| **Orchestration** | Docker Compose / K8s | Deployment | 🔄 TODO |

---

## Scalability Considerations

### Current Design (Single Region)
- Integration Service: Horizontal scaling (stateless)
- Event Processor: Horizontal scaling (Kafka consumer groups)
- PostgreSQL: Vertical scaling (larger instance)
- ClickHouse: Cluster mode ready

### Future Enhancements
- Multi-region deployment
- Event deduplication
- Dead-letter queues for failed events
- Event replay mechanism
- Stream joins for correlation

---

## Monitoring & Observability

### Metrics to Track
- Events ingested per minute
- Event processing latency (p50, p95, p99)
- Database write latency
- Consumer lag (Kafka)
- Error rates by event type

### Logging
- JSON structured logs
- Log aggregation (ELK, DataDog, etc)

### Alerts
- *High* consumer lag (> 10s offset)
- Event processor crashing
- Database connection issues
- Failed event persistence

---

## API Examples (Post-Implementation)

### GraphQL Queries (Future)

```graphql
# Get PR metrics for last 30 days
query {
  organization(id: "acme-corp") {
    metrics(days: 30) {
      prsMerged
      averageCycleTime
      reviewCount
    }
  }
}

# Get deployment frequency
query {
  deployments(orgId: "acme-corp", period: WEEKLY) {
    date
    count
    successRate
  }
}

# Get incident correlation
query {
  incidents(orgId: "acme-corp") {
    date
    count
    correlatedEvents {
      type
      actor
    }
  }
}
```

---

## Next Steps

### Phase 2: API Gateway
- [ ] GraphQL schema design
- [ ] Query resolvers for metrics
- [ ] Real-time subscriptions
- [ ] Authentication & authorization

### Phase 3: Dashboard UI
- [ ] React component library
- [ ] Key metric visualizations
- [ ] Alerting interface
- [ ] User authentication

### Phase 4: Advanced Analytics
- [ ] Anomaly detection
- [ ] Predictive models
- [ ] Cohort analysis
- [ ] Root cause analysis

---

## System Reliability

### Fault Tolerance
- **Integration Service**: Stateless, easily replaced
- **Event Processor**: Kafka offset tracking for recovery
- **PostgreSQL**: ACID guarantees, backups
- **ClickHouse**: Replication and backups

### Data Consistency
- Exactly-once processing via idempotent event IDs
- Transaction support in PostgreSQL
- Event deduplication by `eventId`

### Recovery
- Event replay from Kafka if processor fails
- PostgreSQL point-in-time recovery
- ClickHouse backup restoration


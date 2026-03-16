# Useful Commands

A collection of useful commands for managing and monitoring the CTO Dashboard services.

## Service Management

### Restart & Apply Environment Changes
Use this when you update the `.env` file but haven't changed any code.
```bash
docker-compose up -d <service-name>
```

### Rebuild & Restart
Use this when you've modified the Java source code.
```bash
docker-compose up -d --build <service-name>
```

---

## Load Testing (k6)

### Run Webhook Load Test
```bash
k6 run testing/github-webhook-load-test.js
```

---

## Kafka Monitoring (Redpanda/rpk)

### Check Consumer Lag
Shows how many messages are waiting to be processed.
```bash
docker exec redpanda rpk group describe event-processor-group
```

### Stream Lag (Watch mode)
Useful if the `watch` command is missing (e.g., in Git Bash).
```bash
while true; do clear; docker exec redpanda rpk group describe event-processor-group; sleep 1; done
```

### Describe Topic
Check partition info and high watermarks.
```bash
docker exec redpanda rpk topic describe engineering-events
```

### Peek at Messages
Stream the last few messages from a topic.
```bash
docker exec redpanda rpk topic consume engineering-events -n 5
```

---

## Logs

### View Service Logs
```bash
docker logs -f <service-name>
```

### Count Received Webhooks
```bash
docker logs integration-service 2>&1 | grep "Received GitHub webhook" | wc -l
```

# Jira Webhook Setup Guide

## Prerequisites

- Jira instance (Cloud or Server/Data Center)
- Integration service URL (publicly accessible)
- Jira administrator access

---

## Step 1: Get Your Service URL

**Local Development:**
```bash
ngrok http 3000
# Returns: https://abc123.ngrok.io
```

**Production:**
Use your domain: `https://your-domain.com:3000`

---

## Step 2: Configure Jira Webhook

### For Jira Cloud

1. **Navigate to Settings**
   - Click your profile icon
   - Select **Settings** or **Administration**
   - Go to **System** → **Webhooks** (or **Products** → **Automation**)

2. **Create Webhook**
   - Click **Create webhook**
   
3. **Fill in Details:**

   | Field | Value |
   |-------|-------|
   | **Name** | `CTO Dashboard Events` |
   | **URL** | `https://your-domain.com:3000/jira/webhook` |
   | **Description** | `Ingest Jira issue events to CTO analytics` |

4. **Select Issue Events:**
   - ✅ **issue:created** (Story creation)
   - ✅ **issue:updated** (Story updates, status changes)
   - ✅ **issue:deleted** (Cleanup)

5. **Save**

### For Jira Server/Data Center

1. **Administration** → **System** → **Webhooks**

2. **Create a webhook:**
   - **Name:** `CTO Dashboard Events`
   - **URL:** `https://your-domain.com:3000/jira/webhook`
   - **Events:** Issue Created, Issue Updated

3. **Security:** Add an authentication header if needed:
   ```
   Authorization: Bearer YOUR_TOKEN
   ```

---

## Step 3: Test the Webhook

### Create a Test Story

1. Create a new issue of type **Story**
2. Fill in:
   - **Summary:** "Test CTO Dashboard Integration"
   - **Labels:** test-webhook
   - **Save**

3. Check your service logs:
   ```
   Received Jira webhook: jira:issue_created
   Published event: REQUIREMENT_CREATED
   ```

### Manual Test with curl

```bash
curl -X POST http://localhost:3000/jira/webhook \
  -H "Content-Type: application/json" \
  -d @jira-payload.json
```

Sample payload:
```json
{
  "webhookEvent": "jira:issue_created",
  "user": { "name": "john-doe" },
  "issue": {
    "key": "PROJ-123",
    "fields": {
      "summary": "Add new feature",
      "issuetype": { "name": "Story" },
      "created": "2026-03-12T10:00:00.000Z",
      "project": {
        "key": "PROJ",
        "name": "My Project"
      },
      "labels": ["feature", "backend"]
    }
  }
}
```

---

## Step 4: Monitor Events

### Check Service Logs

```bash
npm run start:dev
```

Watch for:
```
Received Jira webhook: jira:issue_created
Published event: REQUIREMENT_CREATED
```

### Verify in Kafka

```bash
docker exec -it redpanda \
  rpk topic consume engineering-events \
  --brokers localhost:9092 \
  --format json
```

You should see events like:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "REQUIREMENT_CREATED",
  "source": "jira",
  "orgId": "PROJ",
  "repo": "My Project",
  "actor": "john-doe",
  "timestamp": 1678627200000,
  "metadata": {
    "issueKey": "PROJ-123",
    "title": "Add new feature",
    "labels": ["feature", "backend"]
  }
}
```

---

## Step 5: Handle Issue Updates

### Trigger REQUIREMENT_UPDATED Event

1. Open the story you created
2. **Update** any field:
   - Change status → Done
   - Add a comment
   - Change assignee
   - Update description

3. Check logs:
   ```
   Received Jira webhook: jira:issue_updated
   Published event: REQUIREMENT_UPDATED
   ```

---

## Webhook Security

### Add Authentication Header (Optional)

1. **In Jira webhook settings:**
   - Add custom header:
     ```
     Authorization: Bearer YOUR_SECRET_TOKEN
     ```

2. **In integration service:**
   ```typescript
   @Post('webhook')
   async webhook(
     @Headers('authorization') auth: string,
     @Body() payload: any
   ) {
     if (auth !== `Bearer ${process.env.JIRA_WEBHOOK_SECRET}`) {
       throw new UnauthorizedException();
     }
     // Process webhook...
   }
   ```

---

## Supported Events

| Jira Event | Transforms to | Conditions |
|-----------|---|---|
| **issue:created** | `REQUIREMENT_CREATED` | Issue type = Story |
| **issue:updated** | `REQUIREMENT_UPDATED` | Has changelog, Issue type = Story |
| **issue:deleted** | (not implemented) | - |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **404 errors in Jira logs** | Verify URL is correct and accessible |
| **Connection refused** | Check firewall, ensure service is running |
| **Webhook not triggering** | Verify event selection in Jira settings |
| **Wrong payload structure** | Check Jira version (Cloud vs Server) |

---

## Integration Flow

```
Jira Story Created
        ↓
Webhook POST to /jira/webhook
        ↓
JiraController.mapJiraEvent()
        ↓
EngineeringEvent (REQUIREMENT_CREATED)
        ↓
KafkaProducer.publish()
        ↓
Redpanda Topic: engineering-events
        ↓
Event Processor
        ↓
ClickHouse Analytics
```

---

## Next Steps

1. ✅ Configure webhook in Jira
2. ✅ Create test story
3. ✅ Verify events in service logs
4. ✅ Check Kafka topic
5. 🔄 Implement Event Processor
6. 📊 Build metrics aggregation

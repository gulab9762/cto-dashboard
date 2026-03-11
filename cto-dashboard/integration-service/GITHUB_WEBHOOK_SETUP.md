# GitHub Webhook Setup Guide

## Prerequisites

- Running integration service on a publicly accessible URL (e.g., `https://your-domain.com:3000`)
- For local development: Use ngrok or similar tunneling service
- GitHub repository with admin access

## Step 1: Local Development with ngrok (Optional)

If running locally, expose your service to the internet:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

This will give you a public URL like: `https://abc123.ngrok.io`

Use this as your `BASE_URL` in the following steps.

---

## Step 2: Configure GitHub Webhook

### Method A: Via GitHub UI (Recommended for Testing)

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click **Settings** → **Webhooks** (or **Code and automation** → **Webhooks**)

2. **Click "Add webhook"**

3. **Fill in the form:**

   | Field | Value |
   |-------|-------|
   | **Payload URL** | `https://your-domain.com:3000/github/webhook` |
   | **Content type** | `application/json` |
   | **Secret** | (Optional) Generate a strong secret for validation |
   | **Which events?** | Select specific events (see below) |
   | **Active** | ✅ Checked |
    
4. **Select Events to Trigger Webhook:**

   Choose these events:
   - ✅ **Push**
   - ✅ **Pull requests**
   - ✅ **Pull request reviews**
   
   Or select **"Send me everything"** for testing.

5. **Click "Add webhook"**

### Method B: Via GitHub CLI

```bash
# Install GitHub CLI: https://cli.github.com

gh repo webhook create \
  --payload-url https://your-domain.com:3000/github/webhook \
  --events push,pull_request,pull_request_review \
  --active \
  --repo user/repo-name
```

---

## Step 3: Test the Webhook

### Via GitHub UI

1. Go to **Webhooks** settings
2. Find your webhook in the list
3. Click on it, scroll to **Recent Deliveries**
4. Click the latest delivery to see:
   - Request payload
   - Response status
   - Response headers/body

### Via curl (Manual Test)

```bash
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -H "x-github-event: push" \
  -d @webhook-payload.json
```

Sample push payload:
```json
{
  "ref": "refs/heads/main",
  "pusher": { "name": "john-doe" },
  "commits": [
    {
      "id": "abc123def456",
      "message": "Fix deployment issue",
      "timestamp": "2026-03-12T10:00:00Z"
    }
  ],
  "repository": { "name": "my-repo" },
  "organization": { "login": "my-org" }
}
```

---

## Step 4: Monitor Webhook Deliveries

### Check Recent Deliveries in GitHub

1. **Settings** → **Webhooks**
2. Click your webhook
3. Scroll to **Recent Deliveries**
4. Each delivery shows:
   - ✅ Status code (200 = success)
   - Response time
   - Request/response details

### Expected Response

Your service should respond with:

```json
{
  "status": "ok"
}
```

HTTP Status: `200 OK`

---

## Step 5: Monitor Service Logs

Check `npm run start:dev` console output for:

```
Received GitHub webhook: push
Published event: COMMIT_CREATED

Received GitHub webhook: pull_request
Published event: PR_CREATED
```

---

## Webhook Security (Optional but Recommended)

### Add Signature Verification

1. **In GitHub webhook settings:** Generate a secret
2. **In your integration service:** Validate the `x-hub-signature-256` header

```typescript
import crypto from 'crypto';

@Post('webhook')
async webhook(
  @Headers('x-hub-signature-256') signature: string,
  @Body() payload: any,
  @Req() req: Request
) {
  // Verify signature
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  if (`sha256=${hash}` !== signature) {
    throw new UnauthorizedException('Invalid signature');
  }
  
  // Process webhook...
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **404 Not Found** | Ensure service URL is correct and service is running |
| **Connection timeout** | Check firewall, ensure service is publicly accessible |
| **500 Internal Server Error** | Check service logs, verify request payload format |
| **Webhook not triggering** | Check GitHub webhook settings > Recent Deliveries |
| **Wrong events** | Verify webhook event selection in GitHub settings |

---

## Supported GitHub Events

Currently handled events:

| Event | Action | Transforms to |
|-------|--------|---|
| **push** | - | `COMMIT_CREATED` |
| **pull_request** | opened | `PR_CREATED` |
| **pull_request** | closed + merged | `PR_MERGED` |
| **pull_request_review** | submitted (approved) | `PR_REVIEWED` |

---

## Next Steps

1. ✅ Create webhook in GitHub
2. ✅ Test with sample events
3. ✅ Monitor service logs and GitHub Recent Deliveries
4. 📊 Verify events appear in Kafka/Redis
5. 🔄 Implement Event Processor service
6. 📈 Build analytics dashboards

---

## Example: Triggering Events

### Generate PR_CREATED Event

```bash
# Create a branch
git checkout -b feature/test

# Make a commit
echo "test" > test.txt
git add test.txt
git commit -m "Test commit"

# Push and create PR
git push origin feature/test

# Create PR via GitHub UI or CLI
gh pr create --title "Test PR" --body "Testing webhook"
```

This will trigger:
1. `COMMIT_CREATED` event
2. `PR_CREATED` event

Both appear in Kafka for downstream processing.

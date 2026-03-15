# GitHub Webhooks CURLs

### 1. Push Event
```bash
curl -X POST https://qd3w2jjv-3000.inc1.devtunnels.ms/github/webhook \
  -H "Content-Type: application/json" \
  -H "x-github-event: push" \
  -d '{
  "ref": "refs/heads/main",
  "pusher": { "name": "john-doe" },
  "commits": [
    {
      "id": "abc123def456",
      "message": "Pushing new features",
      "timestamp": "2026-03-15T10:00:00Z"
    }
  ],
  "repository": { "name": "my-repo" },
  "organization": { "login": "my-org" }
}'
```

### 2. Pull Request Event (Opened)
```bash
curl -X POST https://qd3w2jjv-3000.inc1.devtunnels.ms/github/webhook \
  -H "Content-Type: application/json" \
  -H "x-github-event: pull_request" \
  -d '{
  "action": "opened",
  "pull_request": {
    "id": 123,
    "number": 45,
    "title": "Fix deployment issue",
    "user": { "login": "john-doe" },
    "head": { "ref": "feature-branch" },
    "created_at": "2026-03-15T12:00:00Z"
  },
  "repository": { "name": "my-repo" },
  "organization": { "login": "my-org" }
}'
```

### 3. Pull Request Review Event (Approved)
```bash
curl -X POST https://qd3w2jjv-3000.inc1.devtunnels.ms/github/webhook \
  -H "Content-Type: application/json" \
  -H "x-github-event: pull_request_review" \
  -d '{
  "action": "submitted",
  "review": {
    "id": 999,
    "state": "approved",
    "user": { "login": "jane-smith" },
    "body": "Looks great, approved!",
    "submitted_at": "2026-03-15T13:00:00Z"
  },
  "pull_request": {
    "id": 123,
    "number": 45
  },
  "repository": { "name": "my-repo" },
  "organization": { "login": "my-org" }
}'
```
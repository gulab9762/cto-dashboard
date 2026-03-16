#!/bin/bash

echo "🚀 Verifying GitHub Webhook Mapping Fix..."

# 1. Test PR Reopened
echo "Testing PR Reopened..."
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -H "x-github-event: pull_request" \
  -d '{
    "action": "reopened",
    "pull_request": {
      "id": 12345,
      "number": 42,
      "title": "Fix bug",
      "user": { "login": "dev-user" },
      "head": { "ref": "fix-branch" },
      "created_at": "2026-03-16T12:00:00Z",
      "updated_at": "2026-03-16T12:05:00Z"
    },
    "repository": { "name": "test-repo" },
    "organization": { "login": "test-org" }
  }'

echo -e "\n\nTesting PR Closed (not merged)..."
# 2. Test PR Closed (not merged)
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -H "x-github-event: pull_request" \
  -d '{
    "action": "closed",
    "pull_request": {
      "id": 12345,
      "number": 42,
      "user": { "login": "dev-user" },
      "merged": false,
      "updated_at": "2026-03-16T12:10:00Z"
    },
    "repository": { "name": "test-repo" },
    "organization": { "login": "test-org" }
  }'

echo -e "\n\nTesting PR Synchronized..."
# 3. Test PR Synchronize
curl -X POST http://localhost:3000/github/webhook \
  -H "Content-Type: application/json" \
  -H "x-github-event: pull_request" \
  -d '{
    "action": "synchronize",
    "pull_request": {
      "id": 12345,
      "number": 42,
      "user": { "login": "dev-user" },
      "head": { "ref": "fix-branch", "sha": "abcdef123456" },
      "updated_at": "2026-03-16T12:15:00Z"
    },
    "repository": { "name": "test-repo" },
    "organization": { "login": "test-org" }
  }'

echo -e "\n\n✅ Verification requests sent. Please check the logs of integration-service-java for mapping messages."

# GitHub Webhooks CURLs

### 1. Push Event
```bash {cmd=true}
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
```bash {cmd=true}
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
```bash {cmd=true}
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

### 4. GraphQL Query to Fetch Metrics
```bash {cmd=true}
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "'"$query"'",
    "variables": {
      "orgId": "'"$orgId"'"
    }
  }'
```
Sample Query:
```graphql
{
  organization(login: "my-org") {
    metrics {
      prsMerged
      averageCycleTime
      reviewCount
    }
  }
}
```
Sample cURL:
```bash {cmd=true}
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetOrgMetrics($orgId: ID!) { organization(id: $orgId) { metrics(days: 30) { prsMerged averageCycleTime reviewCount } } }",
    "variables": {
      "orgId": "acme-corp"
    }
  }'


```
Sample Response:
{"data":{"organization":{"metrics":{"prsMerged":15,"averageCycleTime":24.5,"reviewCount":30}}}}

### 5. GraphQL Query to Fetch Metrics Schema
```bash {cmd=true}
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { fields { name args { name type { name kind } } } } } }"}'

  {"data":{"__schema":{"queryType":{"fields":[{"name":"organization","args":[{"name":"id","type":{"name":null,"kind":"NON_NULL"}}]},{"name":"deployments","args":[{"name":"orgId","type":{"name":null,"kind":"NON_NULL"}},{"name":"per
iod","type":{"name":null,"kind":"NON_NULL"}}]},{"name":"incidents","args":[{"name":"orgId","type":{"name":null,"kind":"NON_NULL"}}]},{"name":"recentEvents","args":[{"name":"orgId","type":{"name":null,"kind":"NON_NULL"}},{"name":"limit","type":{"name":"Int","kind":"SCALAR"}}]},{"name":"metricTrends","args":[{"name":"orgId","type":{"name":null,"kind":"NON_NULL"}},{"name":"metricType","type":{"name":null,"kind":"NON_NULL"}}]}]}}}}

curl -X POST https://qd3w2jjv-4000.inc1.devtunnels.ms/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { fields { name args { name type { name kind } } } } } }"}'
```

https://gulab-cto-dash-4000.loca.lt

```bash {cmd=true}
curl -X POST https://gulab-cto-dash-4000.loca.lt/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { fields { name args { name type { name kind } } } } } }"}'
  ```

### 6. Actuator Health Check
```bash {cmd=true}
echo "3000";
echo "-----";
curl -X GET https://gulab-cto-dash-3000.loca.lt/actuator/health
echo "";
echo "-----";
echo "3001";
echo "-----";
curl -X GET https://gulab-cto-dash-3001.loca.lt/actuator/health
echo "";
echo "-----";
echo "4000";
echo "-----";
curl -X GET https://gulab-cto-dash-4000.loca.lt/actuator/health
```

---

### 7. Performance Testing
For high-scale simulation (5k devs, 40 repos), use the k6 script:
- **Location**: `testing/github-webhook-load-test.js`
- **Setup**: See [README.md](../testing/README.md) for k6 installation and usage instructions.

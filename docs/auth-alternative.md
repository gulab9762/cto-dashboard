# Alternative Authorization Strategy: Relationship-Based (ReBAC)

This alternative focuses on **Fine-Grained Permissions** and **Internal Identity Management**, avoiding dependency on large OIDC providers while supporting complex team hierarchies.

## 1. Relationship-Based Access Control (ReBAC)

Instead of static roles (RBAC), we define permissions based on the relationship between users and resources (Org -> Team -> Repos).

### The Model (Zanzibar-inspired)
We store relationships in a simple table or a dedicated service (e.g., SpiceDB):
- `(User:123, member, Organization:Acme)`
- `(User:123, leader, Team:Backend)`
- `(Team:Backend, viewer, Repository:API-Gateway)`

### GraphQL Integration
The Gateway checks the "reachability" of a resource:
```graphql
query {
  # The system checks: Does User(123) have 'view' permission on Repo('API-Gateway')?
  repositoryMetrics(repoId: "API-Gateway") {
    prsMerged
  }
}
```

## 2. Internal Token Service (Simplified Auth)

If you want to avoid external IDPs like Auth0, we can implement a lightweight internal token service.

- **Storage**: A `users` table in PostgreSQL with hashed passwords.
- **Token**: Issue **Long-lived API Keys** or short-lived **Opaque Tokens** stored in Redis/Postgres.
- **Pros**: Full control over user data, no external costs, easier to manage "Service Accounts" (e.g., for automated CLI tools).
- **Cons**: You must handle password hashing (Bcrypt), lockout logic, and token revocation yourself.

## 3. Attribute-Based Access Control (ABAC) with OPA

Use **Open Policy Agent (OPA)** to decouple authorization logic from the Java code.

- **Workflow**: 
  1. Gateway receives a request.
  2. Gateway sends a JSON payload to OPA: `{ "user": "alice", "action": "read", "resource": "metrics", "orgId": "acme" }`.
  3. OPA evaluates a **Rego policy** and returns `allow: true/false`.
- **Pros**: Policies can be changed and deployed independently of the application code. Supports complex logic (e.g., "Allow access only during business hours").

## Comparison: JWT/RBAC vs. ReBAC

| Feature | JWT/RBAC (Standard) | ReBAC (Relationship-based) |
| :--- | :--- | :--- |
| **Complexity** | Low to Medium | High |
| **Flexibility** | Limited to Roles | Extremely Fine-Grained |
| **Scalability** | Good (Stateless) | High (requires relationship store) |
| **Best For** | Simple Orgs / Standard SaaS | Complex hierarchies (Teams/Repos/Projects) |

## Recommendation

Use this **ReBAC** approach if the dashboard needs to support **dynamic team structures** where a user might be an "Admin" for one team but only a "Viewer" for another within the same organization.

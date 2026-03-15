import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// The GraphQL schema based on architecture.md
const typeDefs = `#graphql
  type OrganizationMetrics {
    prsMerged: Int
    averageCycleTime: Float
    reviewCount: Int
  }

  type Organization {
    id: ID!
    metrics(days: Int): OrganizationMetrics
  }

  type Deployment {
    date: String
    count: Int
    successRate: Float
  }

  type Event {
    type: String
    actor: String
  }

  type Incident {
    date: String
    count: Int
    correlatedEvents: [Event]
  }

  type Query {
    organization(id: ID!): Organization
    deployments(orgId: ID!, period: String): [Deployment]
    incidents(orgId: ID!): [Incident]
  }
`;

// Resolver functions mapping to the schema
const resolvers = {
  Query: {
    organization: (_, { id }) => ({
      id, // Pass ID down to the Organization resolver
    }),
    deployments: (_, { orgId, period }) => [
      { date: '2026-03-01', count: 12, successRate: 0.95 },
      { date: '2026-03-08', count: 15, successRate: 0.98 }
    ],
    incidents: (_, { orgId }) => [
      { 
        date: '2026-03-10', 
        count: 1, 
        correlatedEvents: [{ type: 'DEPLOYMENT_FINISHED', actor: 'deploy-bot' }] 
      }
    ]
  },
  Organization: {
    // Generate dummy metrics for the organization matching user request
    metrics: (parent, { days }) => {
      console.log(`Fetching metrics for org: ${parent.id} over ${days || 30} days`);
      return {
        prsMerged: 15,
        averageCycleTime: 24.5,
        reviewCount: 30
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => ({
    // Context can be used for auth later
  })
});

console.log(`🚀 Dummy GraphQL API ready at: ${url}`);
console.log(`Send POST requests to ${url}graphql`);

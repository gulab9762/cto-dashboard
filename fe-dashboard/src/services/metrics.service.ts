import { graphqlRequest } from '../api/client';
import type { OrganizationMetricsResponse, MetricsData } from '../types/metrics';

export class MetricsService {
    static async getOrganizationMetrics(orgId: string): Promise<MetricsData> {
        const query = `
            query GetMetrics($orgId: ID!) {
                organization(id: $orgId) {
                    metrics(days: 30) {
                        prsMerged
                        averageCycleTime
                        reviewCount
                        commitCount
                    }
                }
                deployments(orgId: $orgId, period: DAILY) {
                    date
                    count
                    successRate
                }
                incidents(orgId: $orgId) {
                    date
                    count
                    correlatedEvents {
                        type
                        actor
                    }
                }
            }
        `;

        const response = await graphqlRequest<OrganizationMetricsResponse>(query, { orgId });
        
        if (!response.organization?.metrics) {
            throw new Error('Organization not found or metrics unavailable.');
        }

        const metrics = response.organization.metrics;
        metrics.deployments = response.deployments;
        metrics.incidents = response.incidents;
        
        return metrics;
    }
}

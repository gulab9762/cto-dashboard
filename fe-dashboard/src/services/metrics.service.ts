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
                        # Placeholder for future metrics
                        # dora {
                        #     deploymentFrequency
                        #     leadTimeForChanges
                        #     changeFailureRate
                        #     mttr
                        # }
                    }
                }
            }
        `;

        const response = await graphqlRequest<OrganizationMetricsResponse>(query, { orgId });
        
        if (!response.organization?.metrics) {
            throw new Error('Organization not found or metrics unavailable.');
        }
        
        return response.organization.metrics;
    }
}

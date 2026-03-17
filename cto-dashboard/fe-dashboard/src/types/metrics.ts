export interface DORA {
    deploymentFrequency: number;
    leadTimeForChanges: number;
    changeFailureRate: number;
    mttr: number;
}

export interface AdvancedMetrics {
    cycleTimeBreakdown: {
        development: number;
        review: number;
        testing: number;
        deployment: number;
    };
    wip: number;
    cicdHealth: number;
}

export interface RequirementMetrics {
    clarityScore: number;
    reworkRate: number;
    leadTime: number;
}

export interface Deployment {
    date: string;
    count: number;
    successRate: number;
}

export interface Incident {
    date: string;
    count: number;
    correlatedEvents: {
        type: string;
        actor: string;
    }[];
}

export interface MetricsData {
    prsMerged: number;
    averageCycleTime: number;
    reviewCount: number;
    commitCount: number;
    dora?: DORA;
    advanced?: AdvancedMetrics;
    requirements?: RequirementMetrics;
    deployments?: Deployment[];
    incidents?: Incident[];
}

export interface Event {
    id: string;
    type: string;
    source: string;
    actor: string;
    timestamp: string;
    repo: string;
    url?: string;
}

export interface MetricTrend {
    date: string;
    value: number;
}

export interface OrganizationMetricsResponse {
    organization: {
        metrics: MetricsData;
    };
    deployments?: Deployment[];
    incidents?: Incident[];
    recentEvents?: Event[];
}

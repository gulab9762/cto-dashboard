import { useState, useEffect, type FC, type KeyboardEvent } from 'react';
import MetricCard from './MetricCard';
import SystemsHealth from './SystemsHealth';
import { MetricsService } from '../services/metrics.service';
import type { MetricsData } from '../types/metrics';

const DashboardContainer: FC = () => {
    const [orgId, setOrgId] = useState('acme-corp');
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        if (!orgId.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const data = await MetricsService.getOrganizationMetrics(orgId);
            setMetrics(data);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to fetch metrics');
            setMetrics(null);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchMetrics();
    }, []);

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') fetchMetrics();
    };

    return (
        <div className="container">
            <header>
                <h1>CTO Dashboard</h1>
                <p>Real-time engineering metrics & analytics overlay (React Edition)</p>
            </header>
            
            <div className="input-section">
                <input 
                    type="text" 
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter Organization ID (e.g. acme-corp)" 
                />
                <button onClick={fetchMetrics} disabled={loading}>
                    {loading ? 'Analyzing...' : 'Fetch Metrics'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && (
                <div className="loader">
                    <div className="spinner"></div>
                    <p>Crunching engineering data...</p>
                </div>
            )}

            <div className="metrics-grid">
                <MetricCard 
                    title="PRs Merged (Last 30 Days)"
                    value={metrics?.prsMerged ?? '--'}
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>}
                />
                <MetricCard 
                    title="Avg Cycle Time (Last 30 Days)"
                    value={metrics?.averageCycleTime ? metrics.averageCycleTime.toFixed(1) : '--'}
                    unit="hrs"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                />
                <MetricCard 
                    title="Commits Created (Last 30 Days)"
                    value={metrics?.commitCount ?? '--'}
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>}
                />
                <MetricCard 
                    title="Code Reviews (Last 30 Days)"
                    value={metrics?.reviewCount ?? '--'}
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>}
                />
            </div>

            <SystemsHealth 
                deployments={metrics?.deployments || []} 
                incidents={metrics?.incidents || []} 
                isLoading={loading}
            />
        </div>
    );
};

export default DashboardContainer;

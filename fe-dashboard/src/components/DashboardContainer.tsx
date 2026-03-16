import { useState, useEffect, type FC, type KeyboardEvent } from 'react';
import { 
  BarChart3, 
  Clock, 
  Code2, 
  MessageSquare, 
  Zap, 
  Search,
  LayoutDashboard
} from 'lucide-react';

import PremiumMetricCard from './PremiumMetricCard';
import UnifiedTimeline, { type TimelineEvent } from './UnifiedTimeline';
import ExecutiveStabilityView from './ExecutiveStabilityView';
import { MetricsService } from '../services/metrics.service';
import type { WidgetConfig } from '../types/dashboard';

// Dummy data for demonstration
const MOCK_TIMELINE: TimelineEvent[] = [
  { id: '1', type: 'deployment', title: 'Production Deploy - API Gateway', timestamp: '10m ago', status: 'success', description: 'v2.4.1 stable. No degradation in latency reported.' },
  { id: '2', type: 'pr', title: 'Bugfix: Kafka lag in event-processor', timestamp: '45m ago', status: 'info', description: 'Merged by @gulab9762. Optimized batch processing sizes.' },
  { id: '3', type: 'incident', title: 'PostgreSQL Connection Spike', timestamp: '2h ago', status: 'warning', description: 'Slight latency increase in US-East region. Resolved via auto-scaling.' },
  { id: '4', type: 'deployment', title: 'Staging Deploy - Frontend', timestamp: '5h ago', status: 'success', description: 'v3.0.0-beta. Testing new glassmorphism components.' },
  { id: '5', type: 'system', title: 'Scheduled Maintenance Complete', timestamp: '1d ago', status: 'success', description: 'Cluster nodes upgraded to latest security patch.' },
];

// MOCK_STABILITY removed as it is now dynamic
const WIDGET_CONFIGS: WidgetConfig[] = [
  { id: 'm1', type: 'metric', title: 'PRs Merged', theme: { glowColor: '#60a5fa', glowIntensity: 'medium' } },
  { id: 'm2', type: 'metric', title: 'Avg Cycle Time', theme: { glowColor: '#8b5cf6', glowIntensity: 'medium' } },
  { id: 'm3', type: 'metric', title: 'Commits', theme: { glowColor: '#f472b6', glowIntensity: 'low' } },
  { id: 'm4', type: 'metric', title: 'Reviews', theme: { glowColor: '#fbbf24', glowIntensity: 'low' } },
  { id: 's1', type: 'stability', title: 'Executive Health', layout: { spanX: 2 } },
  { id: 't1', type: 'timeline', title: 'Activity Stream', layout: { spanX: 1 } },
];

const DashboardContainer: FC = () => {
    const [orgId, setOrgId] = useState('acme-corp');
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);
    const [refreshPulse, setRefreshPulse] = useState(0);

    const fetchMetrics = async () => {
        if (!orgId.trim()) return;
        setLoading(true);
        try {
            const data = await MetricsService.getOrganizationMetrics(orgId);
            setMetrics(data);
        } catch (err) {
            console.error('Failed to fetch metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh heartbeat every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshPulse(p => p + 1);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [orgId, refreshPulse]);

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') fetchMetrics();
    };

    // Map backend events to Timeline structure
    const mappedTimeline: TimelineEvent[] = (metrics?.recentEvents || []).map((e: any) => ({
        id: e.id,
        type: e.type.toLowerCase().includes('pr') ? 'pr' : 
              e.type.toLowerCase().includes('deploy') ? 'deployment' : 
              e.type.toLowerCase().includes('incident') ? 'incident' : 'system',
        title: `${e.type.split('_').map((s: string) => s.charAt(0) + s.slice(1).toLowerCase()).join(' ')}: ${e.repo}`,
        timestamp: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: e.type.toLowerCase().includes('error') ? 'error' : 
                e.type.toLowerCase().includes('warn') ? 'warning' : 'success',
        description: `Triggered by ${e.actor} via ${e.source}`,
        url: e.url
    }));

    const stabilityMetrics = [
        { label: 'Recent Deploys', value: `${metrics?.deployments?.length || 0}`, status: 'optimal' as const },
        { label: 'Success Rate', value: metrics?.deployments?.[0]?.successRate ? `${(metrics.deployments[0].successRate * 100).toFixed(0)}%` : '100%', status: 'optimal' as const },
        { label: 'Active Incidents', value: `${metrics?.incidents?.length || 0}`, status: (metrics?.incidents?.length || 0) > 0 ? 'critical' as const : 'optimal' as const },
    ];

    return (
        <div className="min-h-screen bg-dashboard-bg text-white p-6 md:p-12">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-accent-blue">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-70">Engineering Intel</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                      CTO Dashboard <span className="text-accent-blue">.</span>
                    </h1>
                    <p className="text-text-muted font-medium">Real-time engineering metrics & stability overlay</p>
                </div>
                
                <div className="flex items-center gap-3 backdrop-blur-md bg-white/5 border border-white/10 p-1.5 rounded-2xl shadow-xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input 
                        type="text" 
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="bg-transparent border-none focus:ring-0 text-sm pl-9 pr-4 py-2 w-64 placeholder:text-text-muted/50"
                        placeholder="Search Organization..." 
                    />
                  </div>
                  <button 
                    onClick={fetchMetrics} 
                    disabled={loading}
                    className="bg-accent-blue hover:bg-accent-blue/80 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-accent-blue/20 disabled:opacity-50"
                  >
                    {loading ? 'Analyzing...' : 'Refresh'}
                  </button>
                </div>
            </header>

            {loading && !metrics ? (
                <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
                    <div className="relative h-16 w-16">
                      <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                      <div className="absolute inset-0 rounded-full border-4 border-accent-blue border-t-transparent animate-spin" />
                      <Zap className="absolute inset-0 m-auto h-6 w-6 text-accent-blue animate-pulse" />
                    </div>
                    <p className="text-text-muted animate-pulse font-medium tracking-wide">Crunching engineering data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <PremiumMetricCard 
                            config={WIDGET_CONFIGS[0]}
                            value={metrics?.prsMerged ?? 0}
                            icon={<BarChart3 className="h-5 w-5" />}
                            trend={{ value: 12, direction: 'up', label: 'vs last month' }}
                        />
                        <PremiumMetricCard 
                            config={WIDGET_CONFIGS[1]}
                            value={metrics?.averageCycleTime?.toFixed(1) || 0}
                            unit="hrs"
                            icon={<Clock className="h-5 w-5" />}
                            trend={{ value: 8.5, direction: 'down', label: 'vs last month' }}
                        />
                        <PremiumMetricCard 
                            config={WIDGET_CONFIGS[2]}
                            value={metrics?.commitCount || 0}
                            icon={<Code2 className="h-5 w-5" />}
                            trend={{ value: 4, direction: 'up', label: 'vs last week' }}
                        />
                        <PremiumMetricCard 
                            config={WIDGET_CONFIGS[3]}
                            value={metrics?.reviewCount || 0}
                            icon={<MessageSquare className="h-5 w-5" />}
                            trend={{ value: 2, direction: 'neutral', label: 'no change' }}
                        />
                        
                        <div className="sm:col-span-2">
                          <ExecutiveStabilityView 
                              config={WIDGET_CONFIGS[4]}
                              metrics={stabilityMetrics}
                          />
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <UnifiedTimeline 
                            config={WIDGET_CONFIGS[5]}
                            events={mappedTimeline.length > 0 ? mappedTimeline : MOCK_TIMELINE}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardContainer;

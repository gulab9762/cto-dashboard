import type { FC } from 'react';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface StabilityMetric {
  label: string;
  value: string;
  status: 'optimal' | 'warning' | 'critical';
}

interface ExecutiveStabilityViewProps {
  config: WidgetConfig;
  metrics: StabilityMetric[];
}

const statusColorMap = {
  optimal: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
  warning: 'text-amber-400 bg-amber-400/10 border-amber-500/20',
  critical: 'text-rose-400 bg-rose-400/10 border-rose-500/20',
};

const ExecutiveStabilityView: FC<ExecutiveStabilityViewProps> = ({ config, metrics }) => {
  return (
    <GlassCard config={config}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent-purple/10 p-2 text-accent-purple ring-1 ring-accent-purple/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">{config.title || 'System Stability'}</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((metric, i) => (
            <div key={i} className={`flex flex-col gap-2 rounded-xl border p-4 backdrop-blur-sm ${statusColorMap[metric.status]}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{metric.label}</span>
                {metric.status === 'optimal' ? <Zap className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
              </div>
              <span className="text-2xl font-bold tracking-tight">{metric.value}</span>
            </div>
          ))}
        </div>
        
        <div className="rounded-lg bg-white/5 p-3 text-center text-xs text-text-muted">
          Health score: <span className="text-emerald-400 font-bold">98/100</span> (↑ 2% vs prev week)
        </div>
      </div>
    </GlassCard>
  );
};

export default ExecutiveStabilityView;

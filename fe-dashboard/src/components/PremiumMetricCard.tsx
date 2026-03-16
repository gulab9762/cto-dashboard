import type { FC, ReactNode } from 'react';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface PremiumMetricCardProps {
  config: WidgetConfig;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

const PremiumMetricCard: FC<PremiumMetricCardProps> = ({ config, value, unit, icon, trend }) => {
  return (
    <GlassCard config={config}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-white/10 p-2.5 text-accent-blue ring-1 ring-white/10">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend.direction === 'up' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' :
              trend.direction === 'down' ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20' :
              'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20'
            }`}>
              {trend.direction === 'up' && <ArrowUpRight className="h-3 w-3" />}
              {trend.direction === 'down' && <ArrowDownRight className="h-3 w-3" />}
              {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-wider text-text-muted">
            {config.title}
          </p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-4xl font-bold tracking-tight text-white">
              {value}
            </h2>
            {unit && (
              <span className="text-lg font-medium text-text-muted">
                {unit}
              </span>
            )}
          </div>
        </div>
        
        {trend && (
          <p className="text-xs text-text-muted/60">
            {trend.label}
          </p>
        )}
      </div>
    </GlassCard>
  );
};

export default PremiumMetricCard;

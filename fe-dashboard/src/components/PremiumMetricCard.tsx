import type { FC, ReactNode } from 'react';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import type { WidgetSlotSize } from '../types/customization';
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
  slotSize?: WidgetSlotSize;
}

const trendCls = (dir: 'up' | 'down' | 'neutral') =>
  dir === 'up'      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' :
  dir === 'down'    ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20' :
                      'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20';

const PremiumMetricCard: FC<PremiumMetricCardProps> = ({ config, value, unit, icon, trend, slotSize = 'metric' }) => {
  const isWide = slotSize === 'wide';
  const isTall = slotSize === 'tall';

  return (
    <GlassCard config={config} className="h-full">
      {isWide ? (
        // Wide slot: horizontal layout — icon left, big value + title right, trend far right
        <div className="flex items-center gap-6 h-full">
          <div className="rounded-2xl bg-white/10 p-4 text-accent-blue ring-1 ring-white/10 flex-shrink-0">
            {icon}
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p className="text-sm font-medium uppercase tracking-wider text-text-muted">{config.title}</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-5xl font-bold tracking-tight text-white">{value}</h2>
              {unit && <span className="text-xl font-medium text-text-muted">{unit}</span>}
            </div>
            {trend && <p className="text-xs text-text-muted/60">{trend.label}</p>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold flex-shrink-0 ${trendCls(trend.direction)}`}>
              {trend.direction === 'up'      && <ArrowUpRight className="h-4 w-4" />}
              {trend.direction === 'down'    && <ArrowDownRight className="h-4 w-4" />}
              {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
              {trend.value}%
            </div>
          )}
        </div>
      ) : isTall ? (
        // Tall slot: centred column, oversized number
        <div className="flex flex-col items-center justify-center gap-4 h-full text-center">
          <div className="rounded-2xl bg-white/10 p-4 text-accent-blue ring-1 ring-white/10">
            {icon}
          </div>
          <p className="text-sm font-medium uppercase tracking-wider text-text-muted">{config.title}</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-6xl font-bold tracking-tight text-white">{value}</h2>
            {unit && <span className="text-2xl font-medium text-text-muted">{unit}</span>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${trendCls(trend.direction)}`}>
              {trend.direction === 'up'      && <ArrowUpRight className="h-4 w-4" />}
              {trend.direction === 'down'    && <ArrowDownRight className="h-4 w-4" />}
              {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
              {trend.value}% {trend.label}
            </div>
          )}
        </div>
      ) : (
        // Default metric slot: original compact card
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-white/10 p-2.5 text-accent-blue ring-1 ring-white/10">{icon}</div>
            {trend && (
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${trendCls(trend.direction)}`}>
                {trend.direction === 'up'      && <ArrowUpRight className="h-3 w-3" />}
                {trend.direction === 'down'    && <ArrowDownRight className="h-3 w-3" />}
                {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
                {trend.value}%
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wider text-text-muted">{config.title}</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-4xl font-bold tracking-tight text-white">{value}</h2>
              {unit && <span className="text-lg font-medium text-text-muted">{unit}</span>}
            </div>
          </div>
          {trend && <p className="text-xs text-text-muted/60">{trend.label}</p>}
        </div>
      )}
    </GlassCard>
  );
};

export default PremiumMetricCard;

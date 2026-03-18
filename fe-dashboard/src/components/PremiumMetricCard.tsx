import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
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
  dir === 'up'      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
  dir === 'down'    ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]' :
                      'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20 shadow-[0_0_10px_rgba(148,163,184,0.2)]';

const PremiumMetricCard: FC<PremiumMetricCardProps> = ({ config, value, unit, icon, trend, slotSize = 'metric' }) => {
  const isWide = slotSize === 'wide';
  const isTall = slotSize === 'tall';

  const iconContainerCls = "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-4 text-accent-blue ring-1 ring-white/10 shadow-[inset_0_1px_rgba(255,255,255,0.2),_0_4px_10px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_1px_rgba(255,255,255,0.3),_0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300";

  return (
    <GlassCard config={config} className="h-full">
      {isWide ? (
        // Wide slot: horizontal layout
        <div className="flex items-center gap-6 h-full">
          <motion.div whileHover={{ scale: 1.05 }} className={`${iconContainerCls} flex-shrink-0`}>
            {icon}
          </motion.div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p className="text-sm font-medium uppercase tracking-widest text-text-muted/80">{config.title}</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-sm">{value}</h2>
              {unit && <span className="text-xl font-medium text-text-muted/70">{unit}</span>}
            </div>
            {trend && <p className="text-xs text-text-muted/60">{trend.label}</p>}
          </div>
          {trend && (
            <motion.div whileHover={{ scale: 1.05 }} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold flex-shrink-0 ${trendCls(trend.direction)}`}>
              {trend.direction === 'up'      && <ArrowUpRight className="h-4 w-4" />}
              {trend.direction === 'down'    && <ArrowDownRight className="h-4 w-4" />}
              {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
              {trend.value}%
            </motion.div>
          )}
        </div>
      ) : isTall ? (
        // Tall slot: centred column
        <div className="flex flex-col items-center justify-center gap-4 h-full text-center">
          <motion.div whileHover={{ scale: 1.05 }} className={iconContainerCls}>
            {icon}
          </motion.div>
          <p className="text-sm font-medium uppercase tracking-widest text-text-muted/80">{config.title}</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-sm">{value}</h2>
            {unit && <span className="text-2xl font-medium text-text-muted/70">{unit}</span>}
          </div>
          {trend && (
            <motion.div whileHover={{ scale: 1.05 }} className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md ${trendCls(trend.direction)}`}>
              {trend.direction === 'up'      && <ArrowUpRight className="h-4 w-4" />}
              {trend.direction === 'down'    && <ArrowDownRight className="h-4 w-4" />}
              {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
              {trend.value}% {trend.label}
            </motion.div>
          )}
        </div>
      ) : (
        // Default metric slot: original compact card
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-2.5 text-accent-blue ring-1 ring-white/10 shadow-[inset_0_1px_rgba(255,255,255,0.2),_0_2px_5px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_1px_rgba(255,255,255,0.3),_0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300">
              {icon}
            </motion.div>
            {trend && (
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${trendCls(trend.direction)}`}>
                {trend.direction === 'up'      && <ArrowUpRight className="h-3 w-3" />}
                {trend.direction === 'down'    && <ArrowDownRight className="h-3 w-3" />}
                {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
                {trend.value}%
              </div>
            )}
          </div>
          <div className="space-y-1 mt-1">
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted/80">{config.title}</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-sm">{value}</h2>
              {unit && <span className="text-lg font-medium text-text-muted/70">{unit}</span>}
            </div>
          </div>
          {trend && <p className="text-xs text-text-muted/50 font-medium">{trend.label}</p>}
        </div>
      )}
    </GlassCard>
  );
};

export default PremiumMetricCard;

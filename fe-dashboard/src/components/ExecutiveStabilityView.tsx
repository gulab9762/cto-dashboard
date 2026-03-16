import type { FC } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import type { WidgetSlotSize } from '../types/customization';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface StabilityMetric {
  label: string;
  value: string;
  status: 'optimal' | 'warning' | 'critical';
}

interface ExecutiveStabilityViewProps {
  config: WidgetConfig;
  metrics: StabilityMetric[];
  slotSize?: WidgetSlotSize;
}

const statusColorMap = {
  optimal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_1px_rgba(255,255,255,0.1),_0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20',
  warning:  'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[inset_0_1px_rgba(255,255,255,0.1),_0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20',
  critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[inset_0_1px_rgba(255,255,255,0.1),_0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20',
};

const ExecutiveStabilityView: FC<ExecutiveStabilityViewProps> = ({ config, metrics, slotSize = 'wide' }) => {
  // tall slot → stack vertically (single col); wide/metric → 3-col row
  const metricsGridCls = slotSize === 'tall'
    ? 'grid grid-cols-1 gap-3'
    : 'grid grid-cols-1 sm:grid-cols-3 gap-4';

  // metric slot (small card) → hide health-score footer to save space
  const showFooter = slotSize !== 'metric';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <GlassCard config={config} className="h-full">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-purple/5 p-2.5 text-accent-purple ring-1 ring-accent-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.2)] flex-shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">{config.title || 'System Stability'}</h3>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className={metricsGridCls}>
          {metrics.map((metric, i) => (
            <motion.div variants={itemVariants} whileHover={{ scale: 1.03, y: -2 }} key={i} className={`group relative flex flex-col gap-2 rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] ${statusColorMap[metric.status]}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">{metric.label}</span>
                {metric.status === 'optimal' ? <Zap className="h-4 w-4 drop-shadow-[0_0_8px_currentColor]" /> : <Activity className="h-4 w-4 drop-shadow-[0_0_8px_currentColor]" />}
              </div>
              <span className={`font-extrabold tracking-tight drop-shadow-md ${slotSize === 'tall' ? 'text-4xl' : 'text-3xl'}`}>
                {metric.value}
              </span>
              <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {showFooter && (
          <div className="mt-auto rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center text-xs text-text-muted/80 font-medium shadow-[inset_0_1px_rgba(255,255,255,0.05)]">
            Health score: <span className="text-emerald-400 font-extrabold text-sm drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">98/100</span> (↑ 2% vs prev week)
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ExecutiveStabilityView;

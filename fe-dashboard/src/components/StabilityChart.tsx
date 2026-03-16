import type { FC } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import type { WidgetSlotSize } from '../types/customization';
import { Activity } from 'lucide-react';

interface StabilityChartProps {
  config: WidgetConfig;
  data?: number[];
  slotSize?: WidgetSlotSize;
}

const StabilityChart: FC<StabilityChartProps> = ({ config, data = [95, 98, 97, 99, 94, 98, 99], slotSize = 'wide' }) => {
  const chartHeight = slotSize === 'tall' ? 'h-64' : 'h-32';
  const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - val}`).join(' ');
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <GlassCard config={config} className="h-full overflow-hidden">
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-purple/20 text-accent-purple ring-1 ring-accent-purple/30">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">System Stability</h3>
          </div>
          <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
            Uptime: <span className="text-emerald-400">99.9%</span>
          </div>
        </div>

        <div className="flex-1 relative mt-2 flex items-end">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`w-full overflow-visible ${chartHeight}`}>
            <defs>
              <linearGradient id="stabilityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-purple, #8b5cf6)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent-purple, #8b5cf6)" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            <motion.polyline
              points={points}
              fill="none"
              stroke="var(--accent-purple, #8b5cf6)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            <motion.polygon
              points={areaPoints}
              fill="url(#stabilityGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            {data.map((val, i) => (
              <motion.circle
                key={i}
                cx={(i / (data.length - 1)) * 100}
                cy={100 - val}
                r="1"
                fill="white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + (i * 0.1) }}
              />
            ))}
          </svg>
        </div>

        <div className="flex justify-between px-1 text-[8px] font-black tracking-widest text-white/20 uppercase">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default StabilityChart;

import type { FC } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import type { WidgetSlotSize } from '../types/customization';
import { TrendingUp } from 'lucide-react';

interface VelocityChartProps {
  config: WidgetConfig;
  data?: number[];
  slotSize?: WidgetSlotSize;
}

const VelocityChart: FC<VelocityChartProps> = ({ config, data = [30, 45, 35, 60, 55, 80, 75], slotSize = 'wide' }) => {
  const chartHeight = slotSize === 'tall' ? 'h-64' : 'h-32';
  const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - val}`).join(' ');
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <GlassCard config={config} className="h-full overflow-hidden">
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-blue/20 text-accent-blue ring-1 ring-accent-blue/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Engineering Velocity</h3>
          </div>
          <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold ring-1 ring-emerald-500/20">
            +14% vs avg
          </div>
        </div>

        <div className="flex-1 relative mt-2 flex items-end">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`w-full overflow-visible ${chartHeight}`}>
            <defs>
              <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-blue, #3b82f6)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent-blue, #3b82f6)" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            <motion.polyline
              points={points}
              fill="none"
              stroke="var(--accent-blue, #3b82f6)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            <motion.polygon
              points={areaPoints}
              fill="url(#velocityGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Glowing dots at data points */}
            {data.map((val, i) => (
              <motion.circle
                key={i}
                cx={(i / (data.length - 1)) * 100}
                cy={100 - val}
                r="1.5"
                fill="white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + (i * 0.1) }}
                className="shadow-[0_0_10px_#fff]"
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

export default VelocityChart;

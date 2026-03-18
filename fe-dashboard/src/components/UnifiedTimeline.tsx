import type { FC } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import type { WidgetSlotSize } from '../types/customization';
import { GitPullRequest, Layout, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'pr' | 'deployment' | 'incident' | 'system';
  title: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  description?: string;
  url?: string;
}

interface UnifiedTimelineProps {
  config: WidgetConfig;
  events: TimelineEvent[];
  slotSize?: WidgetSlotSize;
}

const iconMap = {
  pr: GitPullRequest,
  deployment: Layout,
  incident: AlertCircle,
  system: CheckCircle2,
};

const statusColors = {
  success: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  warning: 'text-amber-400 bg-amber-400/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  error:   'text-rose-400 bg-rose-400/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
  info:    'text-sky-400 bg-sky-400/10 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]',
};

const EventItem: FC<{ event: TimelineEvent; compact?: boolean; index: number }> = ({ event, compact = false, index }) => {
  const Icon = iconMap[event.type];
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { delay: index * 0.05 } }
  };

  const content = (
    <motion.div 
      variants={itemVariants}
      whileHover={{ x: 4 }}
      className={`relative flex gap-4 group cursor-pointer transition-all duration-300 ${compact ? 'py-2' : 'py-1'}`}
    >
      <div className={`relative z-10 flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 transition-all duration-500 ${statusColors[event.status]} group-hover:scale-110 group-hover:border-white/30 ${compact ? 'h-7 w-7' : 'h-10 w-10'}`}>
        <Icon className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
        {/* Pulsing indicator for important events */}
        {event.status === 'error' && (
           <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
           </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 pt-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`font-bold text-white group-hover:text-accent-blue transition-colors truncate tracking-wide ${compact ? 'text-xs' : 'text-sm'}`}>
            {event.title}
          </span>
          <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-tighter whitespace-nowrap bg-white/5 px-1.5 py-0.5 rounded-md">{event.timestamp}</span>
        </div>
        {!compact && event.description && (
          <p className="text-xs text-text-muted/70 leading-relaxed font-medium line-clamp-2 group-hover:text-text-muted transition-colors">
            {event.description}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (event.url) {
    return <a key={event.id} href={event.url} target="_blank" rel="noopener noreferrer" className="block no-underline">{content}</a>;
  }
  return <div key={event.id}>{content}</div>;
};

const UnifiedTimeline: FC<UnifiedTimelineProps> = ({ config, events, slotSize = 'tall' }) => {
  const shownEvents  = slotSize === 'metric' ? events.slice(0, 3) : events;
  const isWide       = slotSize === 'wide';
  const isCompact    = slotSize === 'metric';

  return (
    <GlassCard config={config} className="h-full">
      <div className="flex flex-col gap-5 h-full">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide uppercase text-[12px] opacity-70">{config.title || 'Event Timeline'}</h3>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" title="Live Feed" />
        </div>

        {isWide ? (
          <motion.div initial="hidden" animate="show" className="grid grid-cols-2 gap-x-8 gap-y-2 overflow-auto pr-2 custom-scrollbar">
            {shownEvents.map((event, i) => (
              <div key={event.id} className="border-b border-white/[0.03] pb-2 last:border-0">
                <EventItem event={event} compact index={i} />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden" 
            animate="show"
            className={`relative space-y-${isCompact ? '4' : '8'} overflow-auto pr-2 custom-scrollbar`}
          >
            {/* Connector Line */}
            <div className={`absolute left-[14px] top-4 bottom-4 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent ${isCompact ? 'left-[14px]' : 'left-[19px]'}`} />
            
            {shownEvents.map((event, i) => (
              <EventItem key={event.id} event={event} compact={isCompact} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
};

export default UnifiedTimeline;

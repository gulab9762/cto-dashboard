import type { FC } from 'react';
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
  success: 'text-emerald-400 bg-emerald-400/10',
  warning: 'text-amber-400 bg-amber-400/10',
  error:   'text-rose-400 bg-rose-400/10',
  info:    'text-sky-400 bg-sky-400/10',
};

const EventItem: FC<{ event: TimelineEvent; compact?: boolean }> = ({ event, compact = false }) => {
  const Icon = iconMap[event.type];
  const content = (
    <div className={`relative flex gap-3 group cursor-pointer transition-all duration-300 hover:translate-x-1 ${compact ? 'py-2' : 'py-0'}`}>
      <div className={`relative z-10 flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-dashboard-bg transition-colors duration-300 ${statusColors[event.status]} group-hover:border-white/30 ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}>
        <Icon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
      </div>
      <div className="flex flex-col gap-0.5 pt-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium text-white group-hover:text-accent-blue transition-colors truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {event.title}
          </span>
          <span className="text-[10px] text-text-muted whitespace-nowrap">{event.timestamp}</span>
        </div>
        {!compact && event.description && (
          <p className="text-xs text-text-muted line-clamp-2 group-hover:text-text-muted/80">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );

  if (event.url) {
    return <a key={event.id} href={event.url} target="_blank" rel="noopener noreferrer" className="block no-underline">{content}</a>;
  }
  return <div key={event.id}>{content}</div>;
};

const UnifiedTimeline: FC<UnifiedTimelineProps> = ({ config, events, slotSize = 'tall' }) => {
  // wide slot → 2-column grid of events (show more, compact cards)
  // tall slot → single vertical list with connecting line (default)
  // metric slot → show only 3 events, very compact
  const shownEvents  = slotSize === 'metric' ? events.slice(0, 3) : events;
  const isWide       = slotSize === 'wide';
  const isCompact    = slotSize === 'metric';

  return (
    <GlassCard config={config} className="h-full">
      <div className="flex flex-col gap-4 h-full">
        <h3 className="text-lg font-semibold text-white flex-shrink-0">{config.title || 'Timeline'}</h3>

        {isWide ? (
          // Wide mode: 2-column grid layout, compact event rows
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 overflow-auto">
            {shownEvents.map(event => (
              <div key={event.id} className="border-b border-white/5 last:border-0">
                <EventItem event={event} compact />
              </div>
            ))}
          </div>
        ) : (
          // Tall / metric mode: single column with connector line
          <div className={`relative space-y-${isCompact ? '4' : '8'} before:absolute before:left-[14px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-white/10 overflow-auto`}>
            {shownEvents.map(event => (
              <EventItem key={event.id} event={event} compact={isCompact} />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default UnifiedTimeline;

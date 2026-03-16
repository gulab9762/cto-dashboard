import type { FC } from 'react';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
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
  error: 'text-rose-400 bg-rose-400/10',
  info: 'text-sky-400 bg-sky-400/10',
};

const UnifiedTimeline: FC<UnifiedTimelineProps> = ({ config, events }) => {
  return (
    <GlassCard config={config} className="h-full">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">{config.title || 'Timeline'}</h3>
        
        <div className="relative space-y-8 before:absolute before:left-[17px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-white/10">
          {events.map((event) => {
            const Icon = iconMap[event.type];
            const Content = (
              <div className="relative flex gap-4 pl-0 group cursor-pointer transition-all duration-300 hover:translate-x-1">
                <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-dashboard-bg transition-colors duration-300 ${statusColors[event.status]} group-hover:border-white/30`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white group-hover:text-accent-blue transition-colors">{event.title}</span>
                    <span className="text-[10px] text-text-muted">{event.timestamp}</span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-text-muted line-clamp-2 group-hover:text-text-muted/80">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );

            if (event.url) {
              return (
                <a 
                  key={event.id} 
                  href={event.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block no-underline"
                  title={`View details for ${event.title}`}
                >
                  {Content}
                </a>
              );
            }

            return <div key={event.id}>{Content}</div>;
          })}
        </div>
      </div>
    </GlassCard>
  );
};

export default UnifiedTimeline;

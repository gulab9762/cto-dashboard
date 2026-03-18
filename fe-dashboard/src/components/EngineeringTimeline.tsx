import type { FC } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import type { WidgetSlotSize } from '../types/customization';
import { GitBranch, GitPullRequest, Ship, HardDrive, User, ExternalLink } from 'lucide-react';

interface EngineeringTimelineProps {
  config: WidgetConfig;
  events?: any[];
  slotSize?: WidgetSlotSize;
}

const EngineeringTimeline: FC<EngineeringTimelineProps> = ({ config, events = [], slotSize = 'tall' }) => {
  const mockEvents = [
    { type: 'deploy', title: 'Prod Deploy: sentinel-v1.0', time: '12m ago', actor: 'GitHub Actions', status: 'success' },
    { type: 'pr', title: 'Refactor: core metrics engine', time: '45m ago', actor: '@gulab9762', status: 'merged' },
    { type: 'system', title: 'Cluster Scale Up: us-east-1', time: '2h ago', actor: 'K8s Operator', status: 'info' },
    { type: 'alert', title: 'DB Pool Saturation: 85%', time: '4h ago', actor: 'Prometheus', status: 'warning' },
  ];

  const actualEvents = events.length > 0 ? events : mockEvents;

  const getIcon = (type: string) => {
    switch (type) {
      case 'deploy': return <Ship className="w-4 h-4" />;
      case 'pr': return <GitPullRequest className="w-4 h-4" />;
      case 'system': return <HardDrive className="w-4 h-4" />;
      case 'alert': return <HardDrive className="w-4 h-4" />; // Replaced with HARDDRIVE for now, maybe use different ones
      default: return <GitBranch className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20';
      case 'merged': return 'text-accent-purple bg-accent-purple/10 ring-accent-purple/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 ring-amber-500/20';
      case 'info': return 'text-accent-blue bg-accent-blue/10 ring-accent-blue/20';
      default: return 'text-white/40 bg-white/5 ring-white/10';
    }
  };

  return (
    <GlassCard config={config} className="h-full">
      <div className="flex flex-col h-full gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60">
            <GitBranch className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Activity Stream</h3>
        </div>

        <div className="flex-1 space-y-6 relative ml-2">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent" />

          {actualEvents.map((event, i) => {
            const ContentWrapper = event.url ? 'a' : 'div';
            const wrapperProps = event.url ? { href: event.url, target: '_blank', rel: 'noopener noreferrer' } : {};

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-12 pr-4 py-3 group/item rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full ring-1 shadow-lg z-10 ${getStatusColor(event.status)}`}>
                  {getIcon(event.type)}
                </div>
                
                <ContentWrapper {...wrapperProps} className={`flex flex-col gap-1 ${event.url ? 'cursor-pointer' : ''}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-black tracking-tight text-white/90 truncate group-hover/item:text-accent-blue transition-colors">
                        {event.title}
                      </span>
                      {event.url && (
                        <ExternalLink className="w-2.5 h-2.5 text-accent-blue opacity-0 group-hover/item:opacity-70 transition-all transform group-hover/item:translate-x-0.5" />
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-white/20 uppercase whitespace-nowrap">{event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-2 h-2 text-white/40" />
                    </div>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{event.actor}</span>
                  </div>
                </ContentWrapper>
              </motion.div>
            );
          })}
        </div>

        {slotSize === 'tall' && (
          <button className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 transition-all">
            View Deep History
          </button>
        )}
      </div>
    </GlassCard>
  );
};

export default EngineeringTimeline;

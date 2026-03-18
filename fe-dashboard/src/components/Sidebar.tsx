import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Code2, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  User as UserIcon,
  Zap,
  ChevronRight,
  ChevronLeft,
  Wind
} from 'lucide-react';

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

const SidebarItem: FC<SidebarItemProps> = ({ icon: Icon, label, active, isExpanded, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, x: isExpanded ? 4 : 0 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`group relative flex items-center h-12 rounded-2xl transition-all duration-300 ${
      isExpanded ? 'px-4 w-full gap-4' : 'justify-center w-12'
    } ${
      active 
        ? 'bg-accent-blue/20 text-accent-blue ring-1 ring-accent-blue/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
        : 'text-white/30 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    
    <AnimatePresence mode="wait">
      {isExpanded && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>

    {/* Tooltip (only when collapsed) */}
    {!isExpanded && (
      <div className="absolute left-16 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 shadow-2xl z-50 whitespace-nowrap">
        {label}
        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
      </div>
    )}

    {active && (
      <motion.div 
        layoutId="active-pill"
        className="absolute left-[-18px] w-1.5 h-6 bg-accent-blue rounded-r-full shadow-[4px_0_15px_rgba(59,130,246,0.5)]" 
      />
    )}
  </motion.button>
);



interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onLogoutRequest: () => void;
  incidentCount?: number;
}

const Sidebar: FC<SidebarProps> = ({ isExpanded, onToggle, onLogoutRequest, incidentCount = 0 }) => {
  const isCtoInPanic = incidentCount > 10;

  return (
    <motion.aside 
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full flex flex-col items-center py-8 bg-zinc-950/20 backdrop-blur-3xl border-r border-white/5 z-40 relative flex-shrink-0"
    >
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-zinc-800 transition-all z-50 shadow-xl"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      
      {/* Logo Area */}
      <div className={`relative mb-12 flex items-center gap-4 ${isExpanded ? 'w-full px-6' : 'justify-center'}`}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple p-0.5 shadow-[0_0_20px_rgba(59,130,246,0.4)] flex-shrink-0">
          <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <h1 className="text-xs font-black text-white tracking-[0.2em] uppercase leading-none">CTO OS</h1>
              <span className="text-[9px] font-bold text-accent-blue tracking-tighter uppercase mt-1">v1.0 Sentinel</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-[-4px] left-[52px] w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 shadow-[0_0_10px_#10b981]" />
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 flex flex-col gap-6 ${isExpanded ? 'w-full px-4' : 'items-center'}`}>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" active isExpanded={isExpanded} />
        <SidebarItem icon={Code2} label="Repositories" isExpanded={isExpanded} />
        <SidebarItem icon={Users} label="Team Intel" isExpanded={isExpanded} />
        <SidebarItem icon={Bell} label="Alerts & Incidents" isExpanded={isExpanded} />
        <SidebarItem icon={Settings} label="Engine Config" isExpanded={isExpanded} />
      </nav>

      {/* Bottom Actions */}
      <div className={`flex flex-col gap-6 mt-auto ${isExpanded ? 'w-full px-4' : 'items-center'}`}>
        <SidebarItem icon={UserIcon} label="Profile" isExpanded={isExpanded} />
        <SidebarItem 
          icon={isCtoInPanic ? Wind : LogOut} 
          label={isCtoInPanic ? "RUN" : "Emergency Exit"} 
          isExpanded={isExpanded} 
          active={isCtoInPanic}
          onClick={onLogoutRequest}
        />
      </div>

    </motion.aside>
  );
};

export default Sidebar;

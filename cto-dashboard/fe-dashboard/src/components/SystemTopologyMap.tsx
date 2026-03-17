import type { FC } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import type { WidgetConfig } from '../types/dashboard';
import type { WidgetSlotSize } from '../types/customization';
import { Database, Zap, Share2, Layers, Cpu } from 'lucide-react';

interface SystemTopologyMapProps {
  config: WidgetConfig;
  slotSize?: WidgetSlotSize;
}

const SystemTopologyMap: FC<SystemTopologyMapProps> = ({ config, slotSize = 'wide' }) => {
  const isTall = slotSize === 'tall';
  const particleSpeed = isTall ? 3 : 2;

  const nodes = [
    { id: 'sources', label: 'External Sources', icon: <Share2 className="w-4 h-4" />, x: 10, y: 50 },
    { id: 'integration', label: 'Integration Svc', icon: <Zap className="w-4 h-4" />, x: 32, y: 50 },
    { id: 'kafka', label: 'Event Bus', icon: <Layers className="w-4 h-4" />, x: 55, y: 50 },
    { id: 'processor', label: 'Event Processor', icon: <Cpu className="w-4 h-4" />, x: 78, y: 50 },
    { id: 'storage', label: 'Storage Layers', icon: <Database className="w-4 h-4" />, x: 95, y: 50 },
  ];

  const connections = [
    { from: 'sources', to: 'integration' },
    { from: 'integration', to: 'kafka' },
    { from: 'kafka', to: 'processor' },
    { from: 'processor', to: 'storage' },
  ];

  return (
    <GlassCard config={config} className="h-full overflow-hidden">
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-blue/20 text-accent-blue ring-1 ring-accent-blue/30">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">System Topology</h3>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-bold ring-1 ring-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Pipeline
          </div>
        </div>

        <div className="flex-1 relative mt-4">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            {/* Connection Lines with animated particles */}
            {connections.map((conn, i) => {
              const fromNode = nodes.find(n => n.id === conn.from)!;
              const toNode = nodes.find(n => n.id === conn.to)!;
              return (
                <g key={i}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity="0.1"
                  />
                  <motion.circle
                    r="0.8"
                    fill="var(--accent-blue, #3b82f6)"
                    initial={{ x: fromNode.x, y: fromNode.y, opacity: 0 }}
                    animate={{
                      x: [fromNode.x, toNode.x],
                      y: [fromNode.y, toNode.y],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                      duration: particleSpeed,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "linear"
                    }}
                    style={{ filter: 'drop-shadow(0 0 4px #3b82f6)' }}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node, i) => (
              <g key={node.id}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="3.5"
                  fill="rgba(9, 9, 11, 0.8)"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="0.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
                <motion.foreignObject
                  x={node.x - 6}
                  y={node.y - 6}
                  width="12"
                  height="12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className="w-full h-full flex items-center justify-center text-white/60">
                    {node.icon}
                  </div>
                </motion.foreignObject>
                <text
                  x={node.x}
                  y={node.y + 8}
                  textAnchor="middle"
                  className="text-[3px] font-black uppercase tracking-tighter fill-white/30"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-white/20 uppercase">ClickHouse</span>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent-blue shadow-[0_0_8px_#3b82f6]" 
                animate={{ width: '85%' }} 
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-white/20 uppercase">PostgreSQL</span>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent-purple shadow-[0_0_8px_#8b5cf6]" 
                animate={{ width: '40%' }} 
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default SystemTopologyMap;

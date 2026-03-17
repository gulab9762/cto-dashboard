import type { FC } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BaseWidgetProps } from '../types/dashboard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GlassCard: FC<BaseWidgetProps> = ({ config, children, className }) => {
  const { theme } = config;
  
  const intensityMap = {
    low: '0.04',
    medium: '0.08',
    high: '0.12'
  };

  const glowColor = theme?.glowColor || '#3b82f6';
  const intensity = intensityMap[theme?.glowIntensity || 'medium'];

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_8px_20px_rgba(0,0,0,0.4)]",
        theme?.variant === 'vibrant' && "bg-white/[0.04] backdrop-blur-vibrant",
        theme?.variant === 'outline' && "bg-transparent",
        className
      )}
      style={{
        boxShadow: theme?.glowIntensity !== 'low' ? `inset 0 1px 1px rgba(255,255,255,0.1), 0 15px 35px -10px rgba(0,0,0,0.5), 0 0 30px -5px ${glowColor}${Math.round(parseFloat(intensity) * 255).toString(16).padStart(2, '0')}` : undefined
      } as any}
    >
      {/* Dynamic gradient border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent [background:linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)_border-box] [-webkit-mask:linear-gradient(#fff_0_0)_padding-box,_linear-gradient(#fff_0_0)] [-webkit-mask-composite:destination-out] mask-composite:exclude pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay pointer-events-none" />

      {/* Subtle top light effect */}
      <div 
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" 
      />
      
      {/* Content */}
      <div className="relative z-10 transition-transform duration-300">
        {children}
      </div>
      
      {/* Background Glow (Animated if vibrant) */}
      {theme?.variant === 'vibrant' && (
        <div 
          className="absolute -right-20 -top-20 h-48 w-48 rounded-full blur-[80px] pointer-events-none transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundColor: glowColor, opacity: 0.15 }}
        />
      )}
      {/* Hover lighting effect */}
      <div 
        className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: glowColor, opacity: 0.08 }}
      />
    </motion.div>
  );
};

export default GlassCard;

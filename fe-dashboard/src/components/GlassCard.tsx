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
    low: '0.05',
    medium: '0.1',
    high: '0.15'
  };

  const glowColor = theme?.glowColor || '#3b82f6';
  const intensity = intensityMap[theme?.glowIntensity || 'medium'];

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-colors hover:border-white/20",
        theme?.variant === 'vibrant' && "bg-white/10",
        theme?.variant === 'outline' && "bg-transparent",
        className
      )}
      style={{
        boxShadow: theme?.glowIntensity !== 'low' ? `0 10px 30px -10px rgba(0,0,0,0.5), 0 0 20px -5px ${glowColor}${Math.round(parseFloat(intensity) * 255).toString(16).padStart(2, '0')}` : undefined
      } as any}
    >
      {/* Subtle top light effect */}
      <div 
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" 
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Background Glow (Animated if vibrant) */}
      {theme?.variant === 'vibrant' && (
        <div 
          className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px]"
          style={{ backgroundColor: glowColor, opacity: 0.1 }}
        />
      )}
    </motion.div>
  );
};

export default GlassCard;

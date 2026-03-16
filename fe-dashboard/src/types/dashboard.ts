import type { ReactNode } from 'react';

export interface WidgetLayout {
  spanX?: number; // grid-column-span
  spanY?: number; // grid-row-span
}

export interface WidgetTheme {
  glowColor?: string;
  variant?: 'outline' | 'filled' | 'vibrant';
  glowIntensity?: 'low' | 'medium' | 'high';
}

export interface WidgetConfig {
  id: string;
  type: 'metric' | 'timeline' | 'stability' | 'custom';
  hidden?: boolean;
  title?: string;
  layout?: WidgetLayout;
  theme?: WidgetTheme;
}

export interface BaseWidgetProps {
  config: WidgetConfig;
  children?: ReactNode;
  className?: string;
}

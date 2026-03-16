// Customization types for user-specific preferences

export type WidgetSlotSize = 'metric' | 'wide' | 'tall';

export interface ThemeSettings {
  accentColor: string;          // hex color string e.g. "#60a5fa"
  cardOpacity: number;          // 0–1
  glowIntensity: 'low' | 'medium' | 'high';
  dashboardBg: 'default' | 'midnight' | 'slate';
}

export const DEFAULT_THEME: ThemeSettings = {
  accentColor: '#60a5fa',
  cardOpacity: 0.6,
  glowIntensity: 'medium',
  dashboardBg: 'default',
};

export const ACCENT_PRESETS = [
  { label: 'Cobalt',   value: '#60a5fa' },
  { label: 'Violet',   value: '#8b5cf6' },
  { label: 'Fuchsia',  value: '#d946ef' },
  { label: 'Rose',     value: '#f43f5e' },
  { label: 'Emerald',  value: '#10b981' },
  { label: 'Amber',    value: '#f59e0b' },
];

export const BG_PRESETS: { label: string; value: ThemeSettings['dashboardBg']; gradient: string }[] = [
  { label: 'Default',  value: 'default',   gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)' },
  { label: 'Midnight', value: 'midnight',  gradient: 'linear-gradient(135deg, #0f0c29 0%, #1a1035 50%, #24243e 100%)' },
  { label: 'Slate',    value: 'slate',     gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
];

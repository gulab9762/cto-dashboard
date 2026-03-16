import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';

import type { WidgetConfig } from '../types/dashboard';
import { DEFAULT_THEME, type ThemeSettings, BG_PRESETS } from '../types/customization';
import { fetchUserPreferences, persistUserPreferences } from '../api/preferences';

// ─── Default widget order (mirrors WIDGET_CONFIGS in DashboardContainer) ──────
const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'm1', type: 'metric', title: '1 PRs Merged',     theme: { glowColor: '#60a5fa', glowIntensity: 'medium' } },
  { id: 'm2', type: 'metric', title: '2 Avg Cycle Time', theme: { glowColor: '#8b5cf6', glowIntensity: 'medium' } },
  { id: 'm3', type: 'metric', title: '3 Commits',        theme: { glowColor: '#f472b6', glowIntensity: 'low' } },
  { id: 'm4', type: 'metric', title: '4 Reviews',        theme: { glowColor: '#fbbf24', glowIntensity: 'low' } },
  { id: 's1', type: 'stability', title: '5 Executive Health', layout: { spanX: 2 } },
  { id: 't1', type: 'timeline',  title: '6 Activity Stream',  layout: { spanX: 1 } },
];

// ─── Context shape ─────────────────────────────────────────────────────────────
interface CustomizationContextValue {
  userId: string;
  widgets: WidgetConfig[];
  theme: ThemeSettings;
  isEditMode: boolean;
  isSaving: boolean;
  isDirty: boolean;
  toggleEditMode: () => void;
  reorderWidgets: (newLayout: WidgetConfig[]) => void;
  toggleWidgetVisibility: (id: string) => void;
  updateTheme: (patch: Partial<ThemeSettings>) => void;
  savePreferences: () => Promise<void>;
  resetToDefaults: () => void;
}

const CustomizationContext = createContext<CustomizationContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
interface ProviderProps {
  userId: string;
  children: ReactNode;
}

function applyThemeToCss(theme: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty('--accent-color', theme.accentColor);
  root.style.setProperty('--card-opacity', String(theme.cardOpacity));
  root.style.setProperty('--glow-intensity', theme.glowIntensity === 'high' ? '0.6' : theme.glowIntensity === 'medium' ? '0.35' : '0.15');
  const bg = BG_PRESETS.find((b) => b.value === theme.dashboardBg);
  if (bg) root.style.setProperty('--dashboard-bg', bg.gradient);
}

export const DashboardCustomizationProvider: FC<ProviderProps> = ({ userId, children }) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const baselineRef = useRef<{ layoutJson: string; themeJson: string }>({ layoutJson: '', themeJson: '' });

  // Load from backend on mount
  useEffect(() => {
    fetchUserPreferences(userId).then((prefs) => {
      if (!prefs) return;
      try {
        const ids: string[] = JSON.parse(prefs.layoutJson);
        const ordered = ids
          .map((id) => DEFAULT_WIDGETS.find((w) => w.id === id))
          .filter(Boolean) as WidgetConfig[];
        if (ordered.length > 0) setWidgets(ordered);

        const savedTheme: ThemeSettings = JSON.parse(prefs.themeJson);
        setTheme(savedTheme);
        applyThemeToCss(savedTheme);

        baselineRef.current = { layoutJson: prefs.layoutJson, themeJson: prefs.themeJson };
      } catch {
        // corrupt json → keep defaults
      }
    });
  }, [userId]);

  const toggleEditMode = useCallback(() => setIsEditMode((v) => !v), []);

  const reorderWidgets = useCallback((newLayout: WidgetConfig[]) => {
    setWidgets(newLayout);
    setIsDirty(true);
  }, []);

  const toggleWidgetVisibility = useCallback((id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, hidden: !w.hidden } : w))
    );
    setIsDirty(true);
  }, []);

  const updateTheme = useCallback((patch: Partial<ThemeSettings>) => {
    setTheme((prev) => {
      const next = { ...prev, ...patch };
      applyThemeToCss(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  const savePreferences = useCallback(async () => {
    setIsSaving(true);
    try {
      await persistUserPreferences(userId, widgets, theme);
      baselineRef.current = {
        layoutJson: JSON.stringify(widgets.map((w) => w.id)),
        themeJson: JSON.stringify(theme),
      };
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [userId, widgets, theme]);

  const resetToDefaults = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    setTheme(DEFAULT_THEME);
    applyThemeToCss(DEFAULT_THEME);
    setIsDirty(true);
  }, []);

  const value = useMemo<CustomizationContextValue>(
    () => ({
      userId,
      widgets,
      theme,
      isEditMode,
      isSaving,
      isDirty,
      toggleEditMode,
      reorderWidgets,
      toggleWidgetVisibility,
      updateTheme,
      savePreferences,
      resetToDefaults,
    }),
    [userId, widgets, theme, isEditMode, isSaving, isDirty, toggleEditMode, reorderWidgets, toggleWidgetVisibility, updateTheme, savePreferences, resetToDefaults]
  );

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useDashboardCustomization(): CustomizationContextValue {
  const ctx = useContext(CustomizationContext);
  if (!ctx) throw new Error('useDashboardCustomization must be used inside DashboardCustomizationProvider');
  return ctx;
}

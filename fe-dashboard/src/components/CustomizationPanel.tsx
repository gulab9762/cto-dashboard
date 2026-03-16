import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Save, Check, Loader2 } from 'lucide-react';
import { useDashboardCustomization } from '../context/DashboardCustomizationContext';
import { ACCENT_PRESETS, BG_PRESETS } from '../types/customization';

interface CustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOW_OPTIONS = ['low', 'medium', 'high'] as const;

const CustomizationPanel: FC<CustomizationPanelProps> = ({ isOpen, onClose }) => {
  const { theme, updateTheme, savePreferences, resetToDefaults, isSaving, isDirty } = useDashboardCustomization();

  const handleSave = async () => {
    await savePreferences();
    // keep panel open — user stays in edit mode after save
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#161b22]/95 border-l border-white/10 backdrop-blur-xl z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Customize Dashboard</h2>
                <p className="text-xs text-white/40 mt-0.5">Drag widgets, tweak theme, save.</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

              {/* Accent Color */}
              <section>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-3">Accent Color</label>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {ACCENT_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => updateTheme({ accentColor: p.value })}
                      title={p.label}
                      className={`w-8 h-8 rounded-full transition-all border-2 ${theme.accentColor === p.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ background: p.value, boxShadow: theme.accentColor === p.value ? `0 0 12px ${p.value}88` : undefined }}
                      aria-label={p.label}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/40">Custom:</label>
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="w-8 h-8 rounded-md border border-white/20 bg-transparent cursor-pointer"
                    aria-label="Custom accent color"
                  />
                  <span className="text-xs text-white/30 font-mono">{theme.accentColor}</span>
                </div>
              </section>

              {/* Background */}
              <section>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-3">Background</label>
                <div className="flex flex-col gap-2">
                  {BG_PRESETS.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => updateTheme({ dashboardBg: bg.value })}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${theme.dashboardBg === bg.value ? 'border-[var(--accent-color)] bg-white/5' : 'border-white/10 hover:border-white/20'}`}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ background: bg.gradient }}
                      />
                      <span className="text-sm text-white/80">{bg.label}</span>
                      {theme.dashboardBg === bg.value && (
                        <Check className="w-4 h-4 text-[var(--accent-color)] ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Card Opacity */}
              <section>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-3">
                  Card Opacity — <span className="text-white/70">{Math.round(theme.cardOpacity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={theme.cardOpacity}
                  onChange={(e) => updateTheme({ cardOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-[var(--accent-color)] cursor-pointer"
                  aria-label="Card opacity"
                />
              </section>

              {/* Glow Intensity */}
              <section>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-3">Glow Intensity</label>
                <div className="flex gap-2">
                  {GLOW_OPTIONS.map((g) => (
                    <button
                      key={g}
                      onClick={() => updateTheme({ glowIntensity: g })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${theme.glowIntensity === g ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)] text-white' : 'border-white/10 text-white/50 hover:border-white/20'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 space-y-2">
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent-color)] hover:opacity-90 disabled:opacity-40 text-white text-sm font-bold transition-all shadow-lg"
                style={{ boxShadow: isDirty ? `0 4px 20px ${theme.accentColor}55` : undefined }}
              >
                {isSaving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> Save Preferences</>
                }
              </button>
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset to defaults
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomizationPanel;

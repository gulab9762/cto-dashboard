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
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 h-full w-80 bg-zinc-950/95 border-l border-white/5 backdrop-blur-2xl z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Noise texture overlay */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-6 border-b border-white/5">
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Interface Engine</h2>
                <p className="text-[10px] text-white/40 mt-1 font-bold tracking-wide uppercase">Core Visualization Config</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="relative flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar">

              {/* Accent Color */}
              <section className="space-y-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Primary Accent</label>
                <div className="grid grid-cols-5 gap-3">
                  {ACCENT_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => updateTheme({ accentColor: p.value })}
                      title={p.label}
                      className={`relative w-8 h-8 rounded-full transition-all group ${theme.accentColor === p.value ? 'scale-110 shadow-[0_0_20px_rgba(0,0,0,0.8)]' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                      style={{ background: p.value }}
                      aria-label={p.label}
                    >
                      {theme.accentColor === p.value && (
                         <div className="absolute inset-0 rounded-full border-2 border-white ring-2 ring-white/10" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 bg-white/[0.03] p-2 rounded-xl border border-white/5">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => updateTheme({ accentColor: e.target.value })}
                      className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] bg-transparent cursor-pointer"
                      aria-label="Custom accent color"
                    />
                  </div>
                  <span className="text-[10px] text-white/60 font-black tracking-widest uppercase">{theme.accentColor}</span>
                  <span className="ml-auto text-[10px] text-white/20 font-bold uppercase tracking-widest">Hex Value</span>
                </div>
              </section>

              {/* Background */}
              <section className="space-y-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Environment</label>
                <div className="flex flex-col gap-2.5">
                  {BG_PRESETS.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => updateTheme({ dashboardBg: bg.value })}
                      className={`group flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left ${theme.dashboardBg === bg.value ? 'border-white/10 bg-white/5 shadow-xl' : 'border-white/[0.02] hover:border-white/10 hover:bg-white/[0.02]'}`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                        style={{ background: bg.gradient }}
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{bg.label}</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Preset Gradient</span>
                      </div>
                      {theme.dashboardBg === bg.value && (
                        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ml-auto shadow-inner">
                          <Check className="w-3 h-3 text-[var(--accent-color)]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Parameters */}
              <section className="space-y-6">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Interface Parameters</label>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center px-1">
                     <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Module Opacity</span>
                     <span className="text-[10px] font-black text-white/80 uppercase">{Math.round(theme.cardOpacity * 100)}%</span>
                   </div>
                   <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={theme.cardOpacity}
                    onChange={(e) => updateTheme({ cardOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--accent-color)] cursor-pointer h-1.5 bg-white/10 rounded-full appearance-none"
                    aria-label="Card opacity"
                  />
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest px-1">Atmospheric Glow</span>
                  <div className="flex gap-2">
                    {GLOW_OPTIONS.map((g) => (
                      <button
                        key={g}
                        onClick={() => updateTheme({ glowIntensity: g })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${theme.glowIntensity === g ? 'bg-white/10 border-white/20 text-white shadow-xl' : 'border-white/[0.02] text-white/30 hover:border-white/10 hover:text-white/60'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="relative px-6 py-8 border-t border-white/5 space-y-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="w-full group relative flex items-center justify-center gap-3 py-4 rounded-2xl transition-all duration-500 disabled:opacity-40 overflow-hidden shadow-2xl"
                style={{ 
                   background: isDirty ? 'var(--accent-color, #3b82f6)' : 'rgba(255,255,255,0.03)',
                   boxShadow: isDirty ? `0 10px 40px ${theme.accentColor}44` : 'none'
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative z-10 flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                    {isSaving ? 'Syncing...' : 'Save Workspace'}
                  </span>
                </div>
              </button>
              
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center justify-center gap-2 py-2 text-white/20 hover:text-white/60 transition-colors"
              >
                <div className="h-px flex-1 bg-white/[0.03]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-1.5">
                  <RotateCcw className="w-2.5 h-2.5" /> Source Reset
                </span>
                <div className="h-px flex-1 bg-white/[0.03]" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomizationPanel;

import { motion } from 'framer-motion';
import {
  BarChart3,
  Clock,
  Code2,
  MessageSquare,
  Zap,
  Search,
  LayoutDashboard,
  Pencil,
  X,
  Palette,
  Save,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useCallback, type FC, type KeyboardEvent } from 'react';

// dnd-kit
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

// Helper to swap two exact positions instead of shifting (arrayMove)
function arraySwap<T>(array: T[], indexA: number, indexB: number): T[] {
  const newArray = [...array];
  const temp = newArray[indexA];
  newArray[indexA] = newArray[indexB];
  newArray[indexB] = temp;
  return newArray;
}

import PremiumMetricCard from './PremiumMetricCard';
import UnifiedTimeline, { type TimelineEvent } from './UnifiedTimeline';
import ExecutiveStabilityView from './ExecutiveStabilityView';
import DraggableWidget from './DraggableWidget';
import CustomizationPanel from './CustomizationPanel';
import Sidebar from './Sidebar';
import { DashboardCustomizationProvider, useDashboardCustomization } from '../context/DashboardCustomizationContext';
import { MetricsService } from '../services/metrics.service';
import type { WidgetConfig } from '../types/dashboard';
import type { WidgetSlotSize } from '../types/customization';

// ─── Mock data (fallback) ──────────────────────────────────────────────────────
const MOCK_TIMELINE: TimelineEvent[] = [
  { id: '1', type: 'deployment', title: 'Production Deploy - API Gateway', timestamp: '10m ago', status: 'success', description: 'v2.4.1 stable. No degradation in latency reported.' },
  { id: '2', type: 'pr', title: 'Bugfix: Kafka lag in event-processor', timestamp: '45m ago', status: 'info', description: 'Merged by @gulab9762. Optimized batch processing sizes.' },
  { id: '3', type: 'incident', title: 'PostgreSQL Connection Spike', timestamp: '2h ago', status: 'warning', description: 'Slight latency increase in US-East region. Resolved via auto-scaling.' },
  { id: '4', type: 'deployment', title: 'Staging Deploy - Frontend', timestamp: '5h ago', status: 'success', description: 'v3.0.0-beta. Testing new glassmorphism components.' },
  { id: '5', type: 'system', title: 'Scheduled Maintenance Complete', timestamp: '1d ago', status: 'success', description: 'Cluster nodes upgraded to latest security patch.' },
];

// ─── Inner dashboard ───────────────────────────────────────────────────────────
const DashboardInner: FC<{ orgId: string; onOrgChange: (v: string) => void }> = ({ orgId, onOrgChange }) => {
  const { widgets, reorderWidgets, toggleWidgetVisibility, isEditMode, toggleEditMode, isDirty, savePreferences, isSaving, resetToDefaults } = useDashboardCustomization();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [refreshPulse, setRefreshPulse] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  // ── Drag preview state ──────────────────────────────────────────────────────
  // activeId   = which widget is being dragged (rendered as ghost via DragOverlay)
  // overId     = which slot is the current drop target (highlighted)
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!orgId.trim()) return;
    setLoading(true);
    try {
      const data = await MetricsService.getOrganizationMetrics(orgId);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    const interval = setInterval(() => setRefreshPulse(p => p + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { fetchMetrics(); }, [orgId, refreshPulse, fetchMetrics]);

  const handleKeyPress = (e: KeyboardEvent) => { if (e.key === 'Enter') fetchMetrics(); };

  const mappedTimeline: TimelineEvent[] = (metrics?.recentEvents || []).map((e: any) => ({
    id: e.id,
    type: e.type.toLowerCase().includes('pr') ? 'pr'
      : e.type.toLowerCase().includes('deploy') ? 'deployment'
        : e.type.toLowerCase().includes('incident') ? 'incident'
          : 'system',
    title: `${e.type.split('_').map((s: string) => s.charAt(0) + s.slice(1).toLowerCase()).join(' ')}: ${e.repo}`,
    timestamp: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: e.type.toLowerCase().includes('error') ? 'error'
      : e.type.toLowerCase().includes('warn') ? 'warning'
        : 'success',
    description: `Triggered by ${e.actor} via ${e.source}`,
    url: e.url,
  }));

  const stabilityMetrics = [
    { label: 'Recent Deploys', value: `${metrics?.deployments?.length || 0}`, status: 'optimal' as const },
    { label: 'Success Rate', value: metrics?.deployments?.[0]?.successRate ? `${(metrics.deployments[0].successRate * 100).toFixed(0)}%` : '100%', status: 'optimal' as const },
    { label: 'Active Incidents', value: `${metrics?.incidents?.length || 0}`, status: (metrics?.incidents?.length || 0) > 0 ? 'critical' as const : 'optimal' as const },
  ];

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  // ── Drag handlers ───────────────────────────────────────────────────────────
  // We perform a true "Map" style swap. The 6 slots are fixed DOM positions.
  // Dragging merely floats a visual copy. Dropping exactly swaps the data
  // at the source index with the target index. No mid-air shifting.

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  // handleDragOver removed as per instruction

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIdx = widgets.findIndex(w => w.id === active.id);
      const newIdx = widgets.findIndex(w => w.id === over.id);
      reorderWidgets(arraySwap(widgets, oldIdx, newIdx));
    }
    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  // ── Render widget content by id + slot size ─────────────────────────────────
  const renderWidgetContent = useCallback((id: string, widgetList: WidgetConfig[], slotSize: WidgetSlotSize = 'metric') => {
    switch (id) {
      case 'm1': return (
        <PremiumMetricCard
          config={widgetList.find(w => w.id === 'm1')!}
          value={metrics?.prsMerged ?? 0}
          icon={<BarChart3 className="h-5 w-5" />}
          trend={{ value: 12, direction: 'up', label: 'vs last month' }}
          slotSize={slotSize}
        />
      );
      case 'm2': return (
        <PremiumMetricCard
          config={widgetList.find(w => w.id === 'm2')!}
          value={metrics?.averageCycleTime?.toFixed(1) || 0}
          unit="hrs"
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 8.5, direction: 'down', label: 'vs last month' }}
          slotSize={slotSize}
        />
      );
      case 'm3': return (
        <PremiumMetricCard
          config={widgetList.find(w => w.id === 'm3')!}
          value={metrics?.commitCount || 0}
          icon={<Code2 className="h-5 w-5" />}
          trend={{ value: 4, direction: 'up', label: 'vs last week' }}
          slotSize={slotSize}
        />
      );
      case 'm4': return (
        <PremiumMetricCard
          config={widgetList.find(w => w.id === 'm4')!}
          value={metrics?.reviewCount || 0}
          icon={<MessageSquare className="h-5 w-5" />}
          trend={{ value: 2, direction: 'neutral', label: 'no change' }}
          slotSize={slotSize}
        />
      );
      case 's1': return (
        <ExecutiveStabilityView
          config={widgetList.find(w => w.id === 's1')!}
          metrics={stabilityMetrics}
          slotSize={slotSize}
        />
      );
      case 't1': return (
        <UnifiedTimeline
          config={widgetList.find(w => w.id === 't1')!}
          events={mappedTimeline.length > 0 ? mappedTimeline : MOCK_TIMELINE}
          slotSize={slotSize}
        />
      );
      default: return null;
    }
  }, [metrics, stabilityMetrics, mappedTimeline]);

  // ── Position-based slot assignment ─────────────────────────────────────────
  // In Edit Mode, we show all widgets so they can be toggled/moved in the strict Map grid.
  // In View Mode, we filter out hidden widgets, allowing remaining widgets to cascade 
  // into the empty slots and auto-adapt their size (smart scaling).
  const displayOrder = isEditMode ? widgets : widgets.filter(w => !w.hidden);

  // ── Grid Layout Parsing ─────────────────────────────────────────────────────
  // Helper to get CSS classes & slot sizes for each index in the 6-widget grid
  const getGridProps = (index: number): { slotSize: WidgetSlotSize; gridClass: string } => {
    switch (index) {
      case 0: return { slotSize: 'metric', gridClass: 'md:col-start-1 md:row-start-1' };
      case 1: return { slotSize: 'metric', gridClass: 'md:col-start-2 md:row-start-1' };
      case 2: return { slotSize: 'metric', gridClass: 'md:col-start-1 md:row-start-2' };
      case 3: return { slotSize: 'metric', gridClass: 'md:col-start-2 md:row-start-2' };
      case 4: return { slotSize: 'wide', gridClass: 'md:col-start-1 md:col-span-2 md:row-start-3 max-md:mt-6' };
      case 5: return { slotSize: 'tall', gridClass: 'md:col-start-3 md:row-start-1 md:row-span-3 h-full max-md:mt-6' };
      default: return { slotSize: 'metric', gridClass: '' };
    }
  };

  const sortableIds = widgets.map(w => w.id);
  const activeWidget = activeId ? widgets.find(w => w.id === activeId) : null;

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen text-white relative overflow-hidden flex" style={{ background: 'var(--dashboard-bg, #09090b)' }}>
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        incidentCount={metrics?.incidents?.length || 0}
      />

      <main className="flex-1 relative overflow-y-auto h-screen overflow-x-hidden custom-scrollbar p-6 md:p-12">
        {/* Background radial effects */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-blue/10 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] rounded-full bg-accent-purple/10 blur-[120px]" />
        </div>

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />

        <header className="relative z-10 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5 pb-1"
            >
              <div className="p-1.5 rounded-lg bg-accent-blue/20 text-accent-blue ring-1 ring-accent-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue/80">Engineering Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent"
            >
              CTO OS <span className="text-accent-blue font-light">1.0</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-text-muted font-bold tracking-wide text-lg opacity-60"
            >
              Command center for engineering stability & architectural velocity.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 p-1 bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
              <button
                id="edit-layout-btn"
                onClick={toggleEditMode}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isEditMode
                  ? 'bg-accent-blue/20 border border-accent-blue/40 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                {isEditMode ? <><X className="w-3.5 h-3.5" /> Exit</> : <><Pencil className="w-3.5 h-3.5" /> Layout</>}
                {isDirty && !isEditMode && <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />}
              </button>

              <button
                id="theme-panel-btn"
                onClick={() => setPanelOpen(v => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${panelOpen
                  ? 'bg-accent-purple/20 border border-accent-purple/40 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Theme
              </button>
            </div>

            <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl shadow-2xl">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 group-focus-within:text-accent-blue transition-colors" />
                <input
                  type="text"
                  value={orgId}
                  onChange={(e) => onOrgChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-transparent border-none focus:ring-0 text-xs font-bold pl-10 pr-4 py-2.5 w-48 placeholder:text-white/20 text-white/80"
                  placeholder="ORG_ID"
                />
              </div>
              <button
                onClick={fetchMetrics}
                disabled={loading}
                className="group relative flex items-center justify-center text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-2.5 rounded-xl transition-all duration-500 disabled:opacity-50 overflow-hidden"
                style={{ background: 'var(--accent-color, #3b82f6)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">{loading ? 'Crunching…' : 'Sync'}</span>
              </button>
            </div>
          </motion.div>
        </header>

        {/* Edit mode banner */}
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-4 px-5 py-4 rounded-2xl border border-accent-blue/30 bg-accent-blue/[0.07] backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="p-2 rounded-lg bg-accent-blue/20 text-accent-blue">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <p className="flex-1 text-xs font-bold tracking-wide text-white/80 uppercase">
              Interface Customization Active <span className="mx-2 opacity-30">|</span> <span className="opacity-60 font-medium lowercase">drag and drop modules to optimize workspace layout.</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                Reset
              </button>
              <button
                id="save-preferences-btn"
                onClick={savePreferences}
                disabled={isSaving || !isDirty}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-40 transition-all active:scale-95"
                style={{
                  background: 'var(--accent-color)',
                  boxShadow: isDirty ? '0 8px 25px rgba(59,130,246,0.3)' : 'none'
                }}
              >
                {isSaving
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> ...</>
                  : <><Save className="w-3 h-3" /> Commit</>
                }
              </button>
            </div>
          </motion.div>
        )}


        {loading && !metrics ? (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-color, #60a5fa) transparent transparent transparent' }} />
              <Zap className="absolute inset-0 m-auto h-6 w-6 animate-pulse" style={{ color: 'var(--accent-color, #60a5fa)' }} />
            </div>
            <p className="text-white/40 animate-pulse font-medium tracking-wide">Crunching engineering data…</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              {/* ── Flattened CSS Grid ────────────────────────────── */}
              {/* By keeping DOM flat, dnd-kit never drops pointers during cross-zone drags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
                {displayOrder.map((w, index) => {
                  const { slotSize, gridClass } = getGridProps(index);
                  return (
                    <DraggableWidget
                      key={w.id}
                      id={w.id}
                      isEditMode={isEditMode}
                      isGhost={activeId === w.id}
                      isDropTarget={overId === w.id && activeId !== w.id}
                      isHidden={w.hidden}
                      onToggleHide={(e) => {
                        e.stopPropagation();
                        toggleWidgetVisibility(w.id);
                      }}
                      className={gridClass}
                    >
                      {renderWidgetContent(w.id, displayOrder, slotSize)}
                    </DraggableWidget>
                  );
                })}
              </div>
            </SortableContext>

            {/* ── Drag overlay: floating ghost under cursor ───────────────── */}
            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activeWidget ? (
                <div className="opacity-90 rotate-1 scale-[1.03] shadow-2xl rounded-2xl pointer-events-none"
                  style={{ boxShadow: `0 20px 60px var(--accent-color, #60a5fa)40` }}>
                  {renderWidgetContent(activeWidget.id, widgets)}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <CustomizationPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
      </main>
    </div>
  );
};

// ─── Exported container ────────────────────────────────────────────────────────
const DashboardContainer: FC = () => {
  const [orgId, setOrgId] = useState('acme-corp');
  return (
    <DashboardCustomizationProvider userId={orgId}>
      <DashboardInner orgId={orgId} onOrgChange={setOrgId} />
    </DashboardCustomizationProvider>
  );
};

export default DashboardContainer;

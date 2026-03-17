import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, ArrowLeftRight, Eye, EyeOff } from 'lucide-react';
import type { FC, ReactNode, MouseEvent } from 'react';

interface DraggableWidgetProps {
  id: string;
  isEditMode: boolean;
  /** This widget is being dragged — keep it in DOM but show placeholder */
  isGhost?: boolean;
  /** A dragged widget is currently hovering over this slot — show swap indicator */
  isDropTarget?: boolean;
  isHidden?: boolean;
  onToggleHide?: (e: MouseEvent) => void;
  className?: string;
  children: ReactNode;
}

const DraggableWidget: FC<DraggableWidgetProps> = ({
  id,
  isEditMode,
  isGhost = false,
  isDropTarget = false,
  isHidden = false,
  onToggleHide,
  className = '',
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    // ── Static Grid Background ─────────────────────────────────────────
    // We are doing a strict Map-based exact swap. We do NOT want the grid
    // items shifting or "rendering like crazy" to make room for the drag cursor.
    // The actual floating element is entirely handled by <DragOverlay>.
    // Therefore, we suppress the Dnd-Kit transform on all grid items.
    transform: undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Whole card is draggable in edit mode — no need to hit the tiny grip icon
      className={`relative group ${className} ${
        isEditMode && !isGhost ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      {...(isEditMode && !isGhost ? { ...attributes, ...listeners } : {})}
    >
      {/* ── SOURCE ghost placeholder ─────────────────────────────────────── */}
      {isGhost && (
        <div className="absolute inset-0 z-10 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-center transition-all overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none" />
          <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
            Reallocating...
          </span>
        </div>
      )}

      {/* ── TARGET swap indicator ─────────────────────────────────────────── */}
      {isDropTarget && !isGhost && isEditMode && (
        <div className="absolute inset-0 z-10 rounded-2xl border-2 border-accent-blue/50 bg-accent-blue/10 pointer-events-none flex items-center justify-center transition-all animate-pulse">
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-2xl"
            style={{
              background: 'var(--accent-color, #3b82f6)',
              color: '#fff',
              boxShadow: '0 0 30px var(--accent-color, #3b82f6)88',
            }}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Commit Swap
          </div>
        </div>
      )}

      {/* ── Edit mode ring ───────────────────────────────────────────────── */}
      {isEditMode && !isGhost && !isDropTarget && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5 ring-1 ring-white/[0.03] transition-all group-hover:ring-accent-blue/20" />
      )}

      {/* ── Visual grip handle & visibility toggle ─────────── */}
      {isEditMode && !isGhost && (
        <div
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          {onToggleHide && (
            <button
              onClick={onToggleHide}
              title={isHidden ? "Show widget" : "Hide widget"}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all pointer-events-auto backdrop-blur-md"
            >
              {isHidden ? <EyeOff className="w-3.5 h-3.5 opacity-40" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 pointer-events-none backdrop-blur-md">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* ── Widget content ───────────────────────────────────────────────── */}
      <div
        className={`transition-all duration-500 h-full ${
          isGhost      ? 'opacity-10 grayscale scale-95' :
          isDropTarget ? 'opacity-20 blur-[2px]' :
          isHidden     ? 'opacity-30 grayscale pointer-events-none' :
                         'opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default DraggableWidget;

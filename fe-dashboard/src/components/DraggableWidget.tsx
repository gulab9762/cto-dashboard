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
        <div className="absolute inset-0 z-10 rounded-2xl border-2 border-dashed border-[var(--accent-color)]/60 bg-[var(--accent-color)]/5 backdrop-blur-sm flex items-center justify-center transition-all">
          <span className="text-[var(--accent-color)]/60 text-xs font-semibold tracking-wide">
            Moving…
          </span>
        </div>
      )}

      {/* ── TARGET swap indicator ─────────────────────────────────────────── */}
      {/* Shown on the widget you're about to swap INTO — dims it and shows ↔  */}
      {isDropTarget && !isGhost && isEditMode && (
        <div className="absolute inset-0 z-10 rounded-2xl border-2 border-[var(--accent-color)] bg-[var(--accent-color)]/20 pointer-events-none flex items-center justify-center transition-all">
          <div
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
            style={{
              background: 'var(--accent-color)',
              color: '#fff',
              boxShadow: '0 4px 16px var(--accent-color, #60a5fa)66',
            }}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Swap here
          </div>
        </div>
      )}

      {/* ── Edit mode ring ───────────────────────────────────────────────── */}
      {isEditMode && !isGhost && !isDropTarget && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-[var(--accent-color)]/25 transition-all" />
      )}

      {/* ── Visual grip handle & visibility toggle ─────────── */}
      {isEditMode && !isGhost && (
        <div
          className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {onToggleHide && (
            <button
              onClick={onToggleHide}
              title={isHidden ? "Show widget" : "Hide widget"}
              className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 hover:text-white transition-all pointer-events-auto"
            >
              {isHidden ? <EyeOff className="w-4 h-4 text-white/60" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          <div className="p-1.5 rounded-lg bg-white/10 text-white/50 pointer-events-none">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* ── Widget content ───────────────────────────────────────────────── */}
      {/* Dim when: source ghost (being dragged) OR drop target (about to swap) OR hidden */}
      <div
        className={`transition-all duration-300 h-full ${
          isGhost      ? 'opacity-15 grayscale' :
          isDropTarget ? 'opacity-30' :
          isHidden     ? 'opacity-40 grayscale pointer-events-none' :
                         'opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default DraggableWidget;

import { PX_PER_MINUTE, DAY_START_MIN } from "../constants";
import { minutesToHHMM, formatDuration } from "../utils/time";

export default function TaskBlock({
  task,
  dayKey,
  category,
  isDragging,
  onStartDrag,
  onContextMenu,
  onToggleDone,
}) {
  const top = (task.start - DAY_START_MIN) * PX_PER_MINUTE;
  const duration = task.end - task.start;
  const height = Math.max(duration * PX_PER_MINUTE, 10);
  const done = !!task.done;

  const bg = category?.color ?? "#6b7280";
  const compact = height < 50;
  const showTime = height >= 50;
  const showDetails = height >= 90;
  const showDuration = height >= 90;

  const handleMouseDown = (mode) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.button !== 0) return;
    onStartDrag({
      taskId: task.id,
      dayKey,
      mode,
      task,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  return (
    <div
      className={`task-block absolute right-1 left-1 rounded-lg overflow-hidden select-none group ${isDragging
        ? "z-40 shadow-2xl ring-2 ring-white/80 dark:ring-white/40 cursor-grabbing"
        : done
          ? "opacity-55 hover:opacity-80 shadow-sm"
          : "shadow-md hover:shadow-lg hover:z-20"
        }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        background: done
          ? `linear-gradient(135deg, ${bg} 0%, ${shadeColor(bg, -15)} 100%)`
          : `linear-gradient(135deg, ${bg} 0%, ${shadeColor(bg, -15)} 100%)`,
        borderRight: `4px solid ${shadeColor(bg, -30)}`,
        filter: done ? "grayscale(35%)" : "none",
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e.clientX, e.clientY, task.id);
      }}
    >
      <div className="relative px-2.5 py-1.5 h-full flex flex-col text-white z-10 pointer-events-none">
        <div className="flex items-start gap-1.5">
          <div className={`text-[15px] font-bold leading-tight truncate flex-1 ${done ? "line-through decoration-2" : ""}`}>
            {task.title || "(بدون عنوان)"}
          </div>
          {!compact && showDuration && (
            <span className="text-[11px] font-semibold bg-black/25 rounded-full px-2 py-0.5 whitespace-nowrap">
              {formatDuration(duration)}
            </span>
          )}
        </div>

        {showTime && (
          <div className="text-[13px] font-medium leading-tight mt-1 tabular-nums opacity-95">
            {minutesToHHMM(task.start)} — {minutesToHHMM(task.end)}
          </div>
        )}

        {showDetails && task.details && (
          <div className={`text-[12px] mt-1.5 leading-tight line-clamp-3 border-t border-white/25 pt-1 opacity-90 ${done ? "line-through" : ""}`}>
            {task.details}
          </div>
        )}

        {showDetails && !task.details && (
          <div className="text-[12px] mt-1.5 italic opacity-50">
            بدون توضیحات
          </div>
        )}
      </div>

      <div
        onMouseDown={handleMouseDown("move")}
        className="absolute inset-x-0 top-1.5 bottom-1.5 cursor-grab z-20"
      />

      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone(task.id);
        }}
        className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all z-30 ${done
            ? "bg-white border-white shadow-md"
            : "border-white/60 bg-black/15 hover:bg-white/30 opacity-0 group-hover:opacity-100"
          }`}
        title={done ? "لغو انجام" : "علامت‌گذاری به عنوان انجام شده"}
        style={done ? { color: shadeColor(bg, -30) } : {}}
      >
        {done && (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>ّ

      <div
        onMouseDown={handleMouseDown("top")}
        className="absolute top-0 right-0 left-0 h-1.5 cursor-ns-resize z-30 hover:bg-white/40 transition-colors"
        title="تغییر ساعت شروع"
      />

      <div
        onMouseDown={handleMouseDown("bottom")}
        className="absolute bottom-0 right-0 left-0 h-1.5 cursor-ns-resize z-30 hover:bg-white/40 transition-colors"
        title="تغییر ساعت پایان"
      />
    </div>
  );
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
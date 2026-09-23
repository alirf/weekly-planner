import { PX_PER_MINUTE, DAY_START_MIN } from "../constants";
import { minutesToHHMM, formatDuration } from "../utils/time";
import { useDragResize } from "../hooks/useDragResize";

export default function TaskBlock({
  task,
  category,
  onClick,
  onLiveChange,
}) {
  const { dragging, handleMouseDown, wasDragged } = useDragResize({
    task,
    onLiveChange: (patch) => onLiveChange(task.id, patch),
  });

  const top = (task.start - DAY_START_MIN) * PX_PER_MINUTE;
  const duration = task.end - task.start;
  const height = Math.max(duration * PX_PER_MINUTE, 10);

  const bg = category?.color ?? "#6b7280";
  const compact = height < 50;
  const showTime = height >= 50;
  const showDetails = height >= 90;
  const showDuration = height >= 90;

  const isDragging = dragging !== null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (wasDragged()) return;
    onClick();
  };

  return (
    <div
      className={`task-block absolute right-1 left-1 rounded-lg overflow-hidden cursor-grab select-none group ${
        isDragging
          ? "z-40 shadow-2xl ring-2 ring-white/80 dark:ring-white/40 scale-[1.02]"
          : "shadow-md hover:shadow-lg hover:z-20"
      }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        background: `linear-gradient(135deg, ${bg} 0%, ${shadeColor(bg, -15)} 100%)`,
        borderRight: `4px solid ${shadeColor(bg, -30)}`,
      }}
      onClick={handleClick}
    >
      <div
        onMouseDown={(e) => handleMouseDown("top", e)}
        className="absolute top-0 right-0 left-0 h-2 cursor-ns-resize z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 hover:bg-white/60"
        title="تغییر ساعت شروع"
      />

      <div
        onMouseDown={(e) => handleMouseDown("bottom", e)}
        className="absolute bottom-0 right-0 left-0 h-2 cursor-ns-resize z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 hover:bg-white/60"
        title="تغییر ساعت پایان"
      />

      <div className="relative px-2.5 py-1.5 h-full flex flex-col text-white z-20">
        <div className="flex items-start gap-1.5">
          <div className="text-[15px] font-bold leading-tight truncate flex-1">
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
          <div className="text-[12px] mt-1.5 leading-tight line-clamp-3 border-t border-white/25 pt-1 opacity-90">
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
        onMouseDown={(e) => handleMouseDown("move", e)}
        className="absolute inset-x-0 top-2 bottom-2 cursor-grab z-10"
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
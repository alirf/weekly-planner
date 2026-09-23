import { PX_PER_MINUTE, DAY_START_MIN } from "../constants";
import { minutesToHHMM } from "../utils/time";
import { useDragResize } from "../hooks/useDragResize";

export default function TaskBlock({
  task,
  category,
  onClick,
  onLiveChange,
  onCommitChange,
}) {
  const { dragging, handleMouseDown } = useDragResize({
    task,
    onChange: (patch) => {
      onLiveChange(task.id, patch);
    },
  });

  const top = (task.start - DAY_START_MIN) * PX_PER_MINUTE;
  const height = Math.max((task.end - task.start) * PX_PER_MINUTE, 8);

  const bg = category?.color ?? "#6b7280";
  const compact = height < 42;
  const showDetails = height > 80;
  const isDragging = dragging !== null;

  const handleMouseUpCommit = () => {
    if (isDragging && onCommitChange) {
      onCommitChange(task.id);
    }
  };

  return (
    <div
      className={`absolute right-1 left-1 rounded-md text-right text-white shadow-sm transition-shadow overflow-hidden group ${
        isDragging ? "z-30 shadow-2xl ring-2 ring-white/50" : "hover:shadow-md hover:z-20"
      }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        background: bg,
        borderRight: `4px solid rgba(0,0,0,0.25)`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) onClick();
      }}
    >
      <div
        onMouseDown={(e) => handleMouseDown("top", e)}
        className="absolute top-0 right-0 left-0 h-2 cursor-ns-resize hover:bg-white/20 transition-colors z-10"
        title="برای تغییر ساعت شروع، بکش"
      />

      {/* محتوا */}
      <div className="px-2 py-1 pointer-events-none select-none">
        <div className="text-[11px] font-bold leading-tight truncate">
          {task.title || "(بدون عنوان)"}
        </div>

        {!compact && (
          <div className="text-[10px] opacity-90 leading-tight mt-0.5 tabular-nums">
            {minutesToHHMM(task.start)} – {minutesToHHMM(task.end)}
          </div>
        )}

        {showDetails && task.details && (
          <div className="text-[10px] opacity-80 mt-1 line-clamp-2 leading-tight">
            {task.details}
          </div>
        )}
      </div>

      <div
        onMouseDown={(e) => handleMouseDown("bottom", e)}
        className="absolute bottom-0 right-0 left-0 h-2 cursor-ns-resize hover:bg-white/20 transition-colors z-10"
        title="برای تغییر ساعت پایان، بکش"
      />

      <div
        onMouseDown={(e) => {
          if (e.target.dataset.handle) return;
          handleMouseDown("move", e);
        }}
        className="absolute inset-x-0 top-2 bottom-2 cursor-grab"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
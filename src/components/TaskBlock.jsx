import { PX_PER_MINUTE, DAY_START_MIN } from "../constants";
import { minutesToHHMM } from "../utils/time";

export default function TaskBlock({ task, category, onClick }) {
  const top = (task.start - DAY_START_MIN) * PX_PER_MINUTE;
  const height = (task.end - task.start) * PX_PER_MINUTE;

  const bg = category?.color ?? "#6b7280";
  const compact = height < 42;
  const showDetails = height > 80;

  return (
    <button
      onClick={onClick}
      className="absolute right-1 left-1 rounded-md px-2 py-1 text-right text-white shadow-sm hover:shadow-md hover:brightness-110 hover:z-20 transition-all overflow-hidden cursor-pointer"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        background: bg,
        borderRight: `4px solid rgba(0,0,0,0.25)`,
      }}
      title={task.title}
    >
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
    </button>
  );
}
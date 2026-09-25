import { COLUMN_HEIGHT } from "../constants";
import { isToday } from "../utils/time";
import TaskBlock from "./TaskBlock";
import NowLine from "./NowLine";

export default function DayColumn({
  day,
  tasks,
  categories,
  onAdd,
  onEditTask,
  onStartDrag,
  draggingTaskId,
  now,
}) {
  const today = isToday(day.key);

  return (
    <div
      data-day-key={day.key}
      className="flex-1 min-w-[130px] border-l border-slate-200 dark:border-slate-700 relative transition-colors"
    >
      <div
        className={`sticky top-0 z-10 h-10 border-b flex items-center justify-center font-bold text-sm transition-colors ${
          today
            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
        }`}
      >
        {day.label}
        {today && (
          <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        )}
      </div>

      <div
        onClick={(e) => e.target === e.currentTarget && onAdd(day.key)}
        className="relative cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
        style={{ height: `${COLUMN_HEIGHT}px` }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute right-0 left-0 border-t border-slate-100 dark:border-slate-800 pointer-events-none"
            style={{ top: `${i * 60}px` }}
          />
        ))}

        {today && now && <NowLine now={now} />}

        {tasks.map((task) => (
          <TaskBlock
            key={task.id}
            task={task}
            dayKey={day.key}
            category={categories.find((c) => c.id === task.categoryId)}
            isDragging={draggingTaskId === task.id}
            onStartDrag={onStartDrag}
          />
        ))}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(day.key);
          }}
          className="absolute bottom-2 right-1/2 translate-x-1/2 bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-lg text-xs px-3 py-1 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm z-10"
        >
          + افزودن
        </button>
      </div>
    </div>
  );
}
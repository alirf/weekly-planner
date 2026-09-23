import { COLUMN_HEIGHT } from "../constants";
import TaskBlock from "./TaskBlock";

export default function DayColumn({
  day,
  tasks,
  categories,
  onAdd,
  onEditTask,
  onLiveChange,
  onCommitChange,
}) {
  const handleEmptyClick = (e) => {
    if (e.target === e.currentTarget) onAdd(day.key);
  };

  return (
    <div className="flex-1 min-w-[130px] border-l border-slate-200 relative">
      <div className="sticky top-0 z-10 h-10 bg-slate-100 border-b border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
        {day.label}
      </div>

      <div
        onClick={handleEmptyClick}
        className="relative cursor-pointer hover:bg-slate-50/50 transition-colors"
        style={{ height: `${COLUMN_HEIGHT}px` }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute right-0 left-0 border-t border-slate-100 pointer-events-none"
            style={{ top: `${i * 60}px` }}
          />
        ))}

        {tasks.map((task) => (
          <TaskBlock
            key={task.id}
            task={task}
            category={categories.find((c) => c.id === task.categoryId)}
            onClick={(e) => {
              e.stopPropagation();
              onEditTask(day.key, task);
            }}
            onLiveChange={onLiveChange}
            onCommitChange={onCommitChange}
          />
        ))}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(day.key);
          }}
          className="absolute bottom-2 right-1/2 translate-x-1/2 bg-white border border-dashed border-slate-300 text-slate-500 rounded-md text-xs px-3 py-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-colors shadow-sm z-10"
        >
          + افزودن
        </button>
      </div>
    </div>
  );
}
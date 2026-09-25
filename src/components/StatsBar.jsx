import { DAYS } from "../constants";

export default function StatsBar({ schedule, categories }) {
  const allTasks = DAYS.flatMap((d) => schedule[d.key] || []);
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const byCategory = categories
    .map((cat) => {
      const tasks = allTasks.filter((t) => t.categoryId === cat.id);
      const d = tasks.filter((t) => t.done).length;
      return { ...cat, total: tasks.length, done: d };
    })
    .filter((c) => c.total > 0);

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 mb-4 text-center text-sm text-slate-400 dark:text-slate-500 transition-colors">
        هنوز هیچ تسکی نداری — برنامه‌ی هفته‌ات رو بساز ✨
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 mb-4 transition-colors">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {percent === 100 ? "🎉" : "📊"}
          </span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            این هفته
          </span>
        </div>

        <div className="flex-1 min-w-[180px] h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
          <span className="text-emerald-600 dark:text-emerald-400">{done}</span>
          <span className="text-slate-400"> / {total}</span>
          <span className="text-xs text-slate-400 mr-2">({percent}%)</span>
        </div>

        {percent === 100 && (
          <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
            عالی! تمام شد 🏆
          </span>
        )}
      </div>

      {byCategory.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {byCategory.map((cat) => {
            const catPercent =
              cat.total === 0 ? 0 : Math.round((cat.done / cat.total) * 100);
            return (
              <div key={cat.id} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: cat.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-semibold">
                  {cat.name}
                </span>
                <span className="text-slate-400 tabular-nums">
                  {cat.done}/{cat.total}
                </span>
                {catPercent === 100 && (
                  <span className="text-emerald-500">✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
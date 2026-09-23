export default function Toolbar({
  onExport,
  onClearAll,
  onOpenCategories,
  onSaveTemplate,
  onLoadTemplate,
  templates,
  exporting,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm transition-colors">
      <div className="max-w-[1500px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          برنامه‌ریز هفتگی
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton onClick={onOpenCategories} icon="🎨" label="دسته‌ها" />
          <ToolbarButton onClick={onSaveTemplate} icon="💾" label="ذخیره قالب" />

          {templates.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) onLoadTemplate(e.target.value);
                e.target.value = "";
              }}
              className="px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer border border-transparent dark:border-slate-700 transition-colors"
              defaultValue=""
            >
              <option value="" disabled>📂 قالب‌ها</option>
              {templates.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <button
            onClick={onExport}
            disabled={exporting}
            className="px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? "⏳ در حال ساخت..." : "📸 خروجی JPG"}
          </button>

          <button
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center text-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent dark:border-slate-700"
            title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            onClick={onClearAll}
            className="px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
          >
            🗑 پاک کردن
          </button>
        </div>
      </div>
    </header>
  );
}

function ToolbarButton({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent dark:border-slate-700"
    >
      {icon} {label}
    </button>
  );
}
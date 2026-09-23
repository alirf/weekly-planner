export default function Toolbar({
  onExport,
  onClearAll,
  onOpenCategories,
  onSaveTemplate,
  onLoadTemplate,
  templates,
  exporting,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1500px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-slate-800">
          📅 برنامه‌ریز هفتگی
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenCategories}
            className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
          >
            🎨 دسته‌ها
          </button>

          <button
            onClick={onSaveTemplate}
            className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
          >
            💾 ذخیره قالب
          </button>

          {templates.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) onLoadTemplate(e.target.value);
                e.target.value = "";
              }}
              className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                📂 قالب‌ها
              </option>
              {templates.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onExport}
            disabled={exporting}
            className="px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md disabled:opacity-60"
          >
            {exporting ? "⏳ در حال ساخت..." : "📸 خروجی JPG"}
          </button>

          <button
            onClick={onClearAll}
            className="px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md"
          >
            🗑 پاک کردن
          </button>
        </div>
      </div>
    </header>
  );
}
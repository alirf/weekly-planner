import { useState } from "react";

const COLORS = [
  "#3b82f6", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6",
  "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6b7280",
];

export default function CategoryManager({
  open,
  categories,
  onAdd,
  onUpdate,
  onRemove,
  onClose,
}) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  if (!open) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = "cat_" + crypto.randomUUID().slice(0, 8);
    onAdd({ id, name: newName.trim(), color: newColor });
    setNewName("");
    setNewColor(COLORS[0]);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
          🎨 مدیریت دسته‌ها
        </h2>

        {/* لیست دسته‌های موجود */}
        <div className="space-y-2 mb-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <input
                type="color"
                value={cat.color}
                onChange={(e) => onUpdate(cat.id, { color: e.target.value })}
                className="w-9 h-9 rounded-lg cursor-pointer border-none bg-transparent"
                style={{ padding: 0 }}
              />
              <input
                value={cat.name}
                onChange={(e) => onUpdate(cat.id, { name: e.target.value })}
                className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
              />
              <button
                onClick={() => onRemove(cat.id)}
                className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors"
                title="حذف"
              >
                ✕
              </button>
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
              هنوز دسته‌ای نداری
            </p>
          )}
        </div>

        {/* افزودن دسته جدید */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 transition-colors">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
            ➕ افزودن دسته‌ی جدید
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
              style={{ padding: 0 }}
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="نام دسته"
              className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
            />
            <button
              onClick={handleAdd}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all shrink-0"
            >
              افزودن
            </button>
          </div>

          {/* رنگ‌های پیشنهادی */}
          <div className="flex flex-wrap gap-2 mt-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 shadow-sm"
                style={{
                  background: c,
                  borderColor:
                    newColor === c
                      ? "#0f172a"
                      : "rgba(0,0,0,0.05)",
                  boxShadow:
                    newColor === c
                      ? "0 0 0 2px white, 0 0 0 4px " + c
                      : "none",
                }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 transition-colors">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
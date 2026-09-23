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
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4 text-slate-800">
          🎨 مدیریت دسته‌ها
        </h2>

        {/* لیست دسته‌های موجود */}
        <div className="space-y-2 mb-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-2 border border-slate-200 rounded-md"
            >
              <input
                type="color"
                value={cat.color}
                onChange={(e) => onUpdate(cat.id, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-none"
              />
              <input
                value={cat.name}
                onChange={(e) => onUpdate(cat.id, { name: e.target.value })}
                className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
              />
              <button
                onClick={() => onRemove(cat.id)}
                className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-sm"
                title="حذف"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* افزودن دسته جدید */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">
            ➕ افزودن دسته‌ی جدید
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-none"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="نام دسته"
              className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
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
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: newColor === c ? "#0f172a" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-sm font-semibold bg-slate-100 hover:bg-slate-200"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
const SHORTCUTS = [
  { group: "عمومی", items: [
    { keys: ["N"], label: "تسک جدید در روز جاری" },
    { keys: ["Ctrl", "S"], label: "خروجی JPG" },
    { keys: ["Ctrl", "/"], label: "نمایش این راهنما" },
    { keys: ["?"], label: "نمایش این راهنما" },
    { keys: ["Esc"], label: "بستن منو / لغو انتخاب" },
    { keys: ["T"], label: "رفتن به امروز" },
  ]},
  { group: "ویرایش تسک (روی تسک انتخاب‌شده)", items: [
    { keys: ["Ctrl", "D"], label: "تکرار تسک" },
    { keys: ["Ctrl", "C"], label: "کپی تسک" },
    { keys: ["Ctrl", "V"], label: "چسباندن در روز انتخاب‌شده" },
    { keys: ["Enter"], label: "باز کردن ویرایشگر" },
    { keys: ["Space"], label: "انجام‌شده / لغو انجام" },
    { keys: ["Delete"], label: "حذف تسک" },
    { keys: ["Shift", "↑"], label: "جابه‌جایی ۵ دقیقه به بالا" },
    { keys: ["Shift", "↓"], label: "جابه‌جایی ۵ دقیقه به پایین" },
  ]},
  { group: "تاریخچه", items: [
    { keys: ["Ctrl", "Z"], label: "واگرد (Undo)" },
    { keys: ["Ctrl", "Y"], label: "ازنو (Redo)" },
    { keys: ["Ctrl", "Shift", "Z"], label: "ازنو (Redo)" },
  ]},
];

export default function ShortcutsHelp({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            ⌨️ کلیدهای میانبر
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 w-8 h-8 rounded-lg text-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {SHORTCUTS.map((group) => (
            <div key={group.group}>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                {group.group}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 py-1"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, j) => (
                        <span key={j} className="flex items-center gap-1">
                          {j > 0 && (
                            <span className="text-slate-300 dark:text-slate-600 text-xs">+</span>
                          )}
                          <kbd className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm min-w-[28px] text-center font-mono">
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-5 text-center">
          💡 کلیدهای میانبر وقتی داخل input هستی کار نمی‌کنن (به‌جز Esc و Ctrl+S)
        </p>
      </div>
    </div>
  );
}
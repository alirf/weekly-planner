import { useState, useEffect } from "react";
import {
  DAY_START_MIN,
  DAY_END_MIN,
} from "../constants";
import { minutesToHHMM, hhmmToMinutes, formatDuration } from "../utils/time";
import { findOverlap } from "../utils/overlap";

export default function TaskEditor({
  open,
  dayKey,
  dayLabel,
  task,
  tasks,
  categories,
  onSave,
  onDelete,
  onClose,
}) {
  const [form, setForm] = useState({
    title: "",
    details: "",
    start: "07:00",
    end: "08:00",
    categoryId: "work",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title ?? "",
        details: task.details ?? "",
        start: minutesToHHMM(task.start),
        end: minutesToHHMM(task.end),
        categoryId: task.categoryId ?? categories[0]?.id,
      });
    } else {
      setForm({
        title: "",
        details: "",
        start: "07:00",
        end: "08:00",
        categoryId: categories[0]?.id,
      });
    }
    setError("");
  }, [task, open, categories]);

  if (!open) return null;

  const duration =
    hhmmToMinutes(form.end) - hhmmToMinutes(form.start);

  const handleSave = () => {
    const start = hhmmToMinutes(form.start);
    const end = hhmmToMinutes(form.end);

    if (!form.title.trim()) {
      setError("عنوان رو وارد کن");
      return;
    }
    if (start >= end) {
      setError("ساعت پایان باید بعد از شروع باشه");
      return;
    }
    if (start < DAY_START_MIN || end > DAY_END_MIN) {
      setError("ساعت باید بین ۷ صبح تا ۱۲ شب باشه");
      return;
    }
    if (end - start < 5) {
      setError("مدت زمان باید حداقل ۵ دقیقه باشه");
      return;
    }

    const overlap = findOverlap(tasks, start, end, task?.id);
    if (overlap) {
      setError(
        `هم‌پوشانی با «${overlap.title}» (${minutesToHHMM(
          overlap.start
        )} – ${minutesToHHMM(overlap.end)})`
      );
      return;
    }

    onSave({
      id: task?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      details: form.details.trim(),
      start,
      end,
      categoryId: form.categoryId,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4 text-slate-800">
          {task ? "ویرایش" : "افزودن"} تسک — {dayLabel}
        </h2>

        <div className="space-y-3">
          {/* عنوان */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              عنوان
            </label>
            <input
              autoFocus
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثلاً: جلسه تیم"
            />
          </div>

          {/* ساعت */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                شروع
              </label>
              <input
                type="time"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm tabular-nums"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                پایان
              </label>
              <input
                type="time"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm tabular-nums"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
              />
            </div>
          </div>

          {duration > 0 && (
            <p className="text-xs text-slate-500 text-center">
              مدت: {formatDuration(duration)}
            </p>
          )}

          {/* دسته */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              دسته
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm({ ...form, categoryId: cat.id })}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition ${
                    form.categoryId === cat.id
                      ? "text-white border-transparent scale-105"
                      : "text-slate-700 border-slate-200 bg-white"
                  }`}
                  style={
                    form.categoryId === cat.id
                      ? { background: cat.color }
                      : { borderColor: cat.color + "80" }
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* جزئیات */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              جزئیات (اختیاری)
            </label>
            <textarea
              rows={3}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="توضیحات بیشتر..."
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded-md border border-red-200">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* دکمه‌ها */}
        <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
          <div>
            {task && (
              <button
                onClick={onDelete}
                className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-semibold"
              >
                🗑 حذف
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              انصراف
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
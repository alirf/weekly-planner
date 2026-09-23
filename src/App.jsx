import { useRef, useState } from "react";
import { DAYS } from "./constants";
import { useSchedule } from "./hooks/useSchedule";
import { exportToJPG } from "./utils/exportImage";
import { useCallback } from "react";
import DayColumn from "./components/DayColumn";
import TimeRuler from "./components/TimeRuler";
import TaskEditor from "./components/TaskEditor";
import CategoryManager from "./components/CategoryManager";
import Toolbar from "./components/Toolbar";

export default function App() {
  const {
    schedule,
    categories,
    addTask,
    updateTask,
    removeTask,
    clearAll,
    addCategory,
    updateCategory,
    removeCategory,
    saveAsTemplate,
    loadTemplate,
    getTemplates,
    liveUpdateTask,
  } = useSchedule();

  const [editor, setEditor] = useState({
    open: false,
    dayKey: null,
    task: null,
  });
  const [showCategories, setShowCategories] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [templates, setTemplates] = useState(() => getTemplates());

  const gridRef = useRef(null);

  const openAdd = (dayKey) =>
    setEditor({ open: true, dayKey, task: null });

  const openEdit = (dayKey, task) =>
    setEditor({ open: true, dayKey, task });

  const closeEditor = () =>
    setEditor({ open: false, dayKey: null, task: null });

  const handleSave = (newTask) => {
    if (editor.task) {
      updateTask(editor.dayKey, editor.task.id, newTask);
    } else {
      addTask(editor.dayKey, newTask);
    }
    closeEditor();
  };

  const handleDelete = () => {
    if (editor.task) {
      removeTask(editor.dayKey, editor.task.id);
      closeEditor();
    }
  };

  const handleExport = async () => {
    if (!gridRef.current) return;
    setExporting(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      await exportToJPG(gridRef.current, `weekly-plan-${date}.jpg`);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveTemplate = () => {
    saveAsTemplate();
    setTemplates(getTemplates());
  };

  const handleLoadTemplate = (name) => {
    loadTemplate(name);
  };

  const handleLiveChange = useCallback(
  (dayKey, taskId, patch) => {
    liveUpdateTask(dayKey, taskId, patch);
  },
  [liveUpdateTask]
  );

  const handleCommitChange = useCallback(
  (dayKey, taskId) => {
    // مرتب‌سازی نهایی
    const task = schedule[dayKey].find((t) => t.id === taskId);
    if (task) {
      updateTask(dayKey, taskId, {
        start: task.start,
        end: task.end,
      });
    }
  },
  [schedule, updateTask]
);

  const dayLabel =
    DAYS.find((d) => d.key === editor.dayKey)?.label ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      <Toolbar
        onExport={handleExport}
        onClearAll={clearAll}
        onOpenCategories={() => setShowCategories(true)}
        onSaveTemplate={handleSaveTemplate}
        onLoadTemplate={handleLoadTemplate}
        templates={templates}
        exporting={exporting}
      />

      <main className="max-w-[1500px] mx-auto p-4">
        <div
          ref={gridRef}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="flex">
            <TimeRuler />
            {DAYS.map((day) => (
              <DayColumn
                key={day.key}
                day={day}
                tasks={schedule[day.key] ?? []}
                categories={categories}
                onAdd={openAdd}
                onEditTask={openEdit}
                onLiveChange={(taskId, patch) => handleLiveChange(day.key, taskId, patch)}
                onCommitChange={(taskId) => handleCommitChange(day.key, taskId)}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3 text-center">
          💡 روی فضای خالی ستون یا دکمه‌ی «+ افزودن» کلیک کن. برای ویرایش، روی خود تسک بزن.
        </p>
      </main>

      <TaskEditor
        open={editor.open}
        dayKey={editor.dayKey}
        dayLabel={dayLabel}
        task={editor.task}
        tasks={editor.dayKey ? schedule[editor.dayKey] : []}
        categories={categories}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeEditor}
      />

      <CategoryManager
        open={showCategories}
        categories={categories}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onRemove={removeCategory}
        onClose={() => setShowCategories(false)}
      />
    </div>
  );
}
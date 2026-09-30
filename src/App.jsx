import { useRef, useState, useEffect, useCallback } from "react";
import {
  DAYS,
  DAY_START_MIN,
  DAY_END_MIN,
  PX_PER_MINUTE,
} from "./constants";
import { useSchedule } from "./hooks/useSchedule";
import { useTheme } from "./hooks/useTheme";
import { useNow } from "./hooks/useNow";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { exportToJPG } from "./utils/exportImage";
import { isToday } from "./utils/time";
import ShortcutsHelp from "./components/ShortcutsHelp";
import DayColumn from "./components/DayColumn";
import TimeRuler from "./components/TimeRuler";
import TaskEditor from "./components/TaskEditor";
import CategoryManager from "./components/CategoryManager";
import Toolbar from "./components/Toolbar";
import TaskContextMenu from "./components/TaskContextMenu";
import StatsBar from "./components/StatsBar";

const SNAP = 5;
const MIN_DURATION = 5;

function snap(min) {
  return Math.round(min / SNAP) * SNAP;
}

function detectDayKey(clientX) {
  const columns = document.querySelectorAll("[data-day-key]");
  for (const col of columns) {
    const rect = col.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right) {
      return col.dataset.dayKey;
    }
  }
  return null;
}

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
    moveTaskToDay,
    duplicateTask,
    copyTaskToDay,
    toggleTaskDone,
    snapshot,
    undo,
    redo,
  } = useSchedule();

  const [editor, setEditor] = useState({
    open: false,
    dayKey: null,
    task: null,
  });
  const [showCategories, setShowCategories] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [templates, setTemplates] = useState(() => getTemplates());
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // { dayKey, taskId }
  const [showHelp, setShowHelp] = useState(false);
  const [clipboard, setClipboard] = useState(null);       // برای Ctrl+C/V

  const gridRef = useRef(null);
  const dragRef = useRef(null);
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;

  const { theme, toggleTheme } = useTheme();
  const now = useNow();

  const [contextMenu, setContextMenu] = useState(null);

  // ─── Editor handlers ─────────────────────────────────────
  const openAdd = useCallback((dayKey) => {
    setEditor({ open: true, dayKey, task: null });
  }, []);

  const openEdit = useCallback((dayKey, task) => {
    setEditor({ open: true, dayKey, task });
  }, []);

  const closeEditor = useCallback(() => {
    setEditor({ open: false, dayKey: null, task: null });
  }, []);

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

  const handleTaskContextMenu = useCallback((clientX, clientY, dayKey, taskId) => {
    setContextMenu({ x: clientX, y: clientY, dayKey, taskId });
    setSelectedTask({ dayKey, taskId });
  }, []);

  // ─── Export ──────────────────────────────────────────────
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

  const getSelectedTask = useCallback(() => {
    if (!selectedTask) return null;
    const task = schedule[selectedTask.dayKey]?.find(
      (t) => t.id === selectedTask.taskId
    );
    return task ? { dayKey: selectedTask.dayKey, task } : null;
  }, [selectedTask, schedule]);

  // ─── Global drag ─────────────────────────────────────────
  const handleStartDrag = useCallback(
    ({ taskId, dayKey, mode, task, clientX, clientY }) => {
      snapshot();
      dragRef.current = {
        taskId,
        dayKey,
        mode,
        origStart: task.start,
        origEnd: task.end,
        startX: clientX,
        startY: clientY,
        moved: false,
      };
      setDraggingTaskId(taskId);
      setSelectedTask({ dayKey, taskId });
    },
    [snapshot]
  );

  useEffect(() => {
    if (!draggingTaskId) return;

    const handleMove = (ev) => {
      const st = dragRef.current;
      if (!st) return;

      const deltaY = ev.clientY - st.startY;
      if (!st.moved && Math.abs(deltaY) < 3) return;
      st.moved = true;

      const deltaMin = snap(deltaY / PX_PER_MINUTE);
      const duration = st.origEnd - st.origStart;

      if (st.mode === "move") {
        let newStart = st.origStart + deltaMin;
        let newEnd = st.origEnd + deltaMin;

        if (newStart < DAY_START_MIN) {
          newStart = DAY_START_MIN;
          newEnd = newStart + duration;
        }
        if (newEnd > DAY_END_MIN) {
          newEnd = DAY_END_MIN;
          newStart = newEnd - duration;
        }

        const overKey = detectDayKey(ev.clientX);
        const targetKey = overKey || st.dayKey;

        if (targetKey !== st.dayKey) {
          moveTaskToDay(st.dayKey, targetKey, st.taskId, {
            start: newStart,
            end: newEnd,
          },
            { noHistory: true });
          st.dayKey = targetKey;
          st.origStart = newStart;
          st.origEnd = newEnd;
          st.startY = ev.clientY;
        } else {
          liveUpdateTask(st.dayKey, st.taskId, {
            start: newStart,
            end: newEnd,
          });
        }
      } else if (st.mode === "top") {
        let newStart = st.origStart + deltaMin;
        if (newStart < DAY_START_MIN) newStart = DAY_START_MIN;
        if (newStart > st.origEnd - MIN_DURATION)
          newStart = st.origEnd - MIN_DURATION;
        liveUpdateTask(st.dayKey, st.taskId, { start: newStart });
      } else if (st.mode === "bottom") {
        let newEnd = st.origEnd + deltaMin;
        if (newEnd > DAY_END_MIN) newEnd = DAY_END_MIN;
        if (newEnd < st.origStart + MIN_DURATION)
          newEnd = st.origStart + MIN_DURATION;
        liveUpdateTask(st.dayKey, st.taskId, { end: newEnd });
      }
    };

    const handleUp = () => {
      const st = dragRef.current;
      // اگر حرکت نکرده بود → کلیک ساده → باز کردن ادیتور
      if (st && !st.moved) {
        const task = scheduleRef.current[st.dayKey]?.find(
          (t) => t.id === st.taskId
        );
        if (task) openEdit(st.dayKey, task);
      }
      dragRef.current = null;
      setDraggingTaskId(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    const mode = dragRef.current?.mode;
    document.body.style.cursor = mode === "move" ? "grabbing" : "ns-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [draggingTaskId, liveUpdateTask, moveTaskToDay, openEdit]);

  const dayLabel =
    DAYS.find((d) => d.key === editor.dayKey)?.label ?? "";

  useKeyboardShortcuts({
    escape: () => {
      if (contextMenu) { setContextMenu(null); return; }
      if (editor.open) { closeEditor(); return; }
      if (showCategories) { setShowCategories(false); return; }
      if (showHelp) { setShowHelp(false); return; }
      setSelectedTask(null);
    },

    export: handleExport,

    undo: () => {
      undo();
      setSelectedTask(null);
    },

    redo,

    help: () => setShowHelp(true),

    newTask: () => {
      const todayKey = DAYS.find((d) => isToday(d.key))?.key ?? DAYS[0].key;
      openAdd(todayKey);
    },

    today: () => {
      const el = document.querySelector('[data-day-key].bg-blue-100, [data-day-key] [class*="bg-blue-100"]');
      // اسکرول به روز جاری
      const todayKey = DAYS.find((d) => isToday(d.key))?.key;
      if (todayKey) {
        const col = document.querySelector(`[data-day-key="${todayKey}"]`);
        col?.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    },

    duplicate: () => {
      const sel = getSelectedTask();
      if (!sel) return alert("اول یه تسک رو انتخاب کن (راست‌کلیک روش)");
      duplicateTask(sel.dayKey, sel.task.id);
    },

    copy: () => {
      const sel = getSelectedTask();
      if (!sel) return alert("اول یه تسک رو انتخاب کن");
      setClipboard({
        task: { ...sel.task },
        fromDayKey: sel.dayKey,
      });
      // فیدبک کوچیک
      console.log("کپی شد:", sel.task.title);
    },

    paste: () => {
      if (!clipboard) return alert("چیزی کپی نکردی");
      // چسباندن در روز انتخاب‌شده یا روز فعلی
      const targetDayKey = selectedTask?.dayKey || clipboard.fromDayKey;
      copyTaskToDay(clipboard.fromDayKey, targetDayKey, clipboard.task.id);
    },

    deleteTask: () => {
      const sel = getSelectedTask();
      if (!sel) return;
      if (confirm(`تسک «${sel.task.title}» حذف بشه؟`)) {
        removeTask(sel.dayKey, sel.task.id);
        setSelectedTask(null);
      }
    },

    enter: () => {
      const sel = getSelectedTask();
      if (!sel) return;
      openEdit(sel.dayKey, sel.task);
    },

    toggleDone: () => {
      const sel = getSelectedTask();
      if (!sel) return;
      toggleTaskDone(sel.dayKey, sel.task.id);
    },

    moveUp: () => {
      const sel = getSelectedTask();
      if (!sel) return;
      const newStart = Math.max(DAY_START_MIN, sel.task.start - 5);
      updateTask(sel.dayKey, sel.task.id, {
        start: newStart,
        end: newStart + (sel.task.end - sel.task.start),
      });
    },

    moveDown: () => {
      const sel = getSelectedTask();
      if (!sel) return;
      const dur = sel.task.end - sel.task.start;
      const newEnd = Math.min(DAY_END_MIN, sel.task.end + 5);
      updateTask(sel.dayKey, sel.task.id, {
        end: newEnd,
        start: newEnd - dur,
      });
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Toolbar
        onExport={handleExport}
        onClearAll={clearAll}
        onOpenCategories={() => setShowCategories(true)}
        onSaveTemplate={handleSaveTemplate}
        onLoadTemplate={handleLoadTemplate}
        templates={templates}
        exporting={exporting}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleHelp={() => setShowHelp(true)}
      />

      <main className="max-w-[1500px] mx-auto p-4">
        <StatsBar schedule={schedule} categories={categories} />

        <div
          ref={gridRef}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors"
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
                onEditTask={(dayKey, task) => {
                  setSelectedTask({ dayKey, taskId: task.id });
                  openEdit(dayKey, task);
                }}
                onStartDrag={handleStartDrag}
                draggingTaskId={draggingTaskId}
                selectedTaskId={selectedTask?.taskId}
                now={now}
                onTaskContextMenu={handleTaskContextMenu}
                onToggleDone={toggleTaskDone}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
          💡 برای افزودن، روی فضای خالی ستون کلیک کن. برای جابه‌جایی، تسک را بکش. برای انجام، روی چک‌باکس کلیک کن.
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

      <ShortcutsHelp open={showHelp} onClose={() => setShowHelp(false)} />

      {contextMenu && (() => {
        const task = schedule[contextMenu.dayKey]?.find(
          (t) => t.id === contextMenu.taskId
        );
        if (!task) return null;
        return (
          <TaskContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            dayKey={contextMenu.dayKey}
            onClose={() => setContextMenu(null)}
            onEdit={() => openEdit(contextMenu.dayKey, task)}
            onDuplicate={() =>
              duplicateTask(contextMenu.dayKey, contextMenu.taskId)
            }
            onCopyToDay={(targetKey) =>
              copyTaskToDay(contextMenu.dayKey, targetKey, contextMenu.taskId)
            }
            onMoveToDay={(targetKey) =>
              moveTaskToDay(contextMenu.dayKey, targetKey, contextMenu.taskId, {}, { smart: true })
            }
            onDelete={() =>
              removeTask(contextMenu.dayKey, contextMenu.taskId)
            }
          />
        );
      })()}
    </div>
  );
}
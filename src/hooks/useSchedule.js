import { useEffect, useState, useCallback } from "react";
import { EMPTY_SCHEDULE, DEFAULT_CATEGORIES, DAYS } from "../constants";
import { findFreeSlot } from "../utils/findFreeSlot";

const STORAGE_KEY = "weekly-planner-v2";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function dayLabelOf(key) {
  const map = {
    sat: "شنبه",
    sun: "یکشنبه",
    mon: "دوشنبه",
    tue: "سه‌شنبه",
    wed: "چهارشنبه",
    thu: "پنجشنبه",
    fri: "جمعه",
  };
  return map[key] || key;
}

export function useSchedule() {
  const [state, setState] = useState(() => {
    const saved = loadFromStorage();
    return {
      schedule: saved?.schedule ?? EMPTY_SCHEDULE,
      categories: saved?.categories ?? DEFAULT_CATEGORIES,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addTask = useCallback((dayKey, task) => {
    setState((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayKey]: [...prev.schedule[dayKey], task].sort(
          (a, b) => a.start - b.start
        ),
      },
    }));
  }, []);

  const updateTask = useCallback((dayKey, taskId, patch) => {
    setState((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayKey]: prev.schedule[dayKey]
          .map((t) => (t.id === taskId ? { ...t, ...patch } : t))
          .sort((a, b) => a.start - b.start),
      },
    }));
  }, []);

  const removeTask = useCallback((dayKey, taskId) => {
    setState((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayKey]: prev.schedule[dayKey].filter((t) => t.id !== taskId),
      },
    }));
  }, []);

  const clearAll = useCallback(() => {
    if (confirm("مطمئنی می‌خوای همه‌ی برنامه‌ها پاک بشن؟")) {
      setState((prev) => ({ ...prev, schedule: EMPTY_SCHEDULE }));
    }
  }, []);

  const saveAsTemplate = useCallback(() => {
    const name = prompt("اسم قالب (مثلاً «هفته‌ی معمولی»):");
    if (!name) return;
    const templates = JSON.parse(
      localStorage.getItem("weekly-planner-templates") || "{}"
    );
    templates[name] = state.schedule;
    localStorage.setItem(
      "weekly-planner-templates",
      JSON.stringify(templates)
    );
    alert(`قالب «${name}» ذخیره شد ✅`);
  }, [state.schedule]);

  const loadTemplate = useCallback((name) => {
    const templates = JSON.parse(
      localStorage.getItem("weekly-planner-templates") || "{}"
    );
    if (!templates[name]) return;
    if (!confirm(`برنامه‌ی فعلی با قالب «${name}» جایگزین بشه؟`)) return;
    setState((prev) => ({ ...prev, schedule: templates[name] }));
  }, []);

  const getTemplates = useCallback(() => {
    return Object.keys(
      JSON.parse(localStorage.getItem("weekly-planner-templates") || "{}")
    );
  }, []);

  const addCategory = useCallback((category) => {
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }));
  }, []);

  const updateCategory = useCallback((id, patch) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));
  }, []);

  const removeCategory = useCallback((id) => {
    setState((prev) => {
      const inUse = DAYS.some((d) =>
        prev.schedule[d.key].some((t) => t.categoryId === id)
      );
      if (inUse) {
        alert("این دسته در حال استفاده‌ست. اول تسک‌هاش رو تغییر بده.");
        return prev;
      }
      return {
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
      };
    });
  }, []);

  const liveUpdateTask = useCallback((dayKey, taskId, patch) => {
  setState((prev) => ({
    ...prev,
    schedule: {
      ...prev.schedule,
      [dayKey]: prev.schedule[dayKey].map((t) =>
        t.id === taskId ? { ...t, ...patch } : t
      ),
    },
  }));
}, []);
  const moveTaskToDay = useCallback(
  (oldDayKey, newDayKey, taskId, patch = {}, opts = {}) => {
    const { smart = false } = opts;

    if (oldDayKey === newDayKey) {
      setState((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [oldDayKey]: prev.schedule[oldDayKey]
            .map((t) => (t.id === taskId ? { ...t, ...patch } : t))
            .sort((a, b) => a.start - b.start),
        },
      }));
      return;
    }

    let error = null;

    setState((prev) => {
      const task = prev.schedule[oldDayKey]?.find((t) => t.id === taskId);
      if (!task) return prev;

      const targetTasks = prev.schedule[newDayKey] || [];

      let finalStart = patch.start ?? task.start;
      let finalEnd = patch.end ?? task.end;

      if (smart) {
        const duration = finalEnd - finalStart;
        const slot = findFreeSlot(targetTasks, duration, {
          preferStart: finalStart,
        });

        if (!slot) {
          error = `توی «${dayLabelOf(newDayKey)}» جای خالی به اندازه‌ی ${duration} دقیقه وجود نداره.`;
          return prev;
        }
        finalStart = slot.start;
        finalEnd = slot.end;
      }

      const updatedTask = {
        ...task,
        ...patch,
        start: finalStart,
        end: finalEnd,
      };

      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [oldDayKey]: prev.schedule[oldDayKey].filter(
            (t) => t.id !== taskId
          ),
          [newDayKey]: [...targetTasks, updatedTask].sort(
            (a, b) => a.start - b.start
          ),
        },
      };
    });

    if (error) alert("⚠️ " + error);
  },
  []
);

const duplicateTask = useCallback((dayKey, taskId) => {
  let error = null;

  setState((prev) => {
    const dayTasks = prev.schedule[dayKey] || [];
    const task = dayTasks.find((t) => t.id === taskId);
    if (!task) return prev;

    const duration = task.end - task.start;

    const slot = findFreeSlot(dayTasks, duration, {
      preferStart: task.start,
      excludeId: taskId,
    });

    if (!slot) {
      error = `توی «${dayLabelOf(dayKey)}» جای خالی به اندازه‌ی ${duration} دقیقه وجود نداره.`;
      return prev;
    }

    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      start: slot.start,
      end: slot.end,
      title: task.title + " (کپی)",
    };

    return {
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayKey]: [...dayTasks, newTask].sort((a, b) => a.start - b.start),
      },
    };
  });

  if (error) alert("⚠️ " + error);
}, []);

const copyTaskToDay = useCallback((fromDayKey, toDayKey, taskId) => {
  if (fromDayKey === toDayKey) {
    return;
  }

  let error = null;

  setState((prev) => {
    const task = prev.schedule[fromDayKey]?.find((t) => t.id === taskId);
    if (!task) return prev;

    const duration = task.end - task.start;
    const targetTasks = prev.schedule[toDayKey] || [];

    const slot = findFreeSlot(targetTasks, duration, {
      preferStart: task.start,
    });

    if (!slot) {
      error = `توی «${dayLabelOf(toDayKey)}» جای خالی به اندازه‌ی ${duration} دقیقه وجود نداره.`;
      return prev;
    }

    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      start: slot.start,
      end: slot.end,
    };

    return {
      ...prev,
      schedule: {
        ...prev.schedule,
        [toDayKey]: [...targetTasks, newTask].sort((a, b) => a.start - b.start),
      },
    };
  });

  if (error) alert("⚠️ " + error);
}, []);

  return {
    schedule: state.schedule,
    categories: state.categories,
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
    copyTaskToDay,
    duplicateTask,
  };
}
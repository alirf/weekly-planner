import { useEffect, useState, useCallback } from "react";
import { EMPTY_SCHEDULE, DEFAULT_CATEGORIES, DAYS } from "../constants";

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

  // دسته‌ها
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
  };
}
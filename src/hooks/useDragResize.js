import { useRef, useState, useCallback } from "react";
import {
  DAY_START_MIN,
  DAY_END_MIN,
  PX_PER_MINUTE,
  COLUMN_HEIGHT,
} from "../constants";

const SNAP = 5;
const MIN_DURATION = 5;

function snap(min) {
  return Math.round(min / SNAP) * SNAP;
}

/**
 * @param {Object} opts
 * @param {Object} opts.task
 * @param {string} opts.dayKey
 * @param {Function} opts.onLiveChange - (patch) => void
 * @param {Function} opts.onLiveDayChange - (newDayKey, patch) => void  ← برای تغییر روز
 */
export function useDragResize({
  task,
  dayKey,
  onLiveChange,
  onLiveDayChange,
}) {
  const [dragging, setDragging] = useState(null);
  const stateRef = useRef(null);

  const handleMouseDown = useCallback(
    (mode, e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.button !== 0) return;

      stateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origStart: task.start,
        origEnd: task.end,
        origDayKey: dayKey,
        currentDayKey: dayKey,
        moved: false,
      };
      setDragging(mode);

      document.body.style.cursor =
        mode === "move" ? "grabbing" : "ns-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (ev) => {
        if (!stateRef.current) return;
        const st = stateRef.current;
        const deltaY = ev.clientY - st.startY;

        // آستانه‌ی حرکت
        if (!st.moved && Math.abs(deltaY) < 3) return;
        st.moved = true;

        const deltaMin = snap(deltaY / PX_PER_MINUTE);
        const duration = st.origEnd - st.origStart;

        if (mode === "move") {
          // ۱. محاسبه‌ی زمان جدید (بر اساس روز اصلی)
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

          // ۲. تشخیص روز جدید بر اساس موقعیت افقی موس
          const newDayKey = detectDayKey(ev.clientX);

          if (newDayKey && newDayKey !== st.currentDayKey) {
            // روز عوض شده
            st.currentDayKey = newDayKey;
            if (onLiveDayChange) {
              onLiveDayChange(newDayKey, {
                start: newStart,
                end: newEnd,
              });
            }
          } else {
            // همون روز، فقط موقعیت عمودی
            onLiveChange({ start: newStart, end: newEnd });
          }
        } else if (mode === "top") {
          let newStart = st.origStart + deltaMin;
          if (newStart < DAY_START_MIN) newStart = DAY_START_MIN;
          if (newStart > st.origEnd - MIN_DURATION)
            newStart = st.origEnd - MIN_DURATION;
          onLiveChange({ start: newStart });
        } else if (mode === "bottom") {
          let newEnd = st.origEnd + deltaMin;
          if (newEnd > DAY_END_MIN) newEnd = DAY_END_MIN;
          if (newEnd < st.origStart + MIN_DURATION)
            newEnd = st.origStart + MIN_DURATION;
          onLiveChange({ end: newEnd });
        }
      };

      const handleMouseUp = () => {
        setDragging(null);
        stateRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [task.start, task.end, dayKey, onLiveChange, onLiveDayChange]
  );

  const wasDragged = () => stateRef.current?.moved ?? false;

  return { dragging, handleMouseDown, wasDragged };
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
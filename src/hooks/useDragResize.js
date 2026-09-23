import { useRef, useState, useCallback } from "react";
import { DAY_START_MIN, DAY_END_MIN, PX_PER_MINUTE } from "../constants";

const SNAP = 5; 

function snap(min) {
  return Math.round(min / SNAP) * SNAP;
}

/**
 * @param {Object} opts
 * @param {Object} opts.task - تسک در حال کشیدن
 * @param {Function} opts.onChange - callback (patch) => void
 */
export function useDragResize({ task, onChange }) {
  const [dragging, setDragging] = useState(null); // "move" | "top" | "bottom" | null
  const stateRef = useRef(null);

  const handleMouseDown = useCallback(
    (mode, e) => {
      e.preventDefault();
      e.stopPropagation();

      stateRef.current = {
        startY: e.clientY,
        origStart: task.start,
        origEnd: task.end,
      };
      setDragging(mode);

      document.body.style.cursor =
        mode === "move" ? "grabbing" : "ns-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (ev) => {
        const deltaY = ev.clientY - stateRef.current.startY;
        const deltaMin = snap(deltaY / PX_PER_MINUTE);

        const { origStart, origEnd } = stateRef.current;
        const duration = origEnd - origStart;

        if (mode === "move") {
          let newStart = origStart + deltaMin;
          let newEnd = origEnd + deltaMin;

          if (newStart < DAY_START_MIN) {
            newStart = DAY_START_MIN;
            newEnd = newStart + duration;
          }
          if (newEnd > DAY_END_MIN) {
            newEnd = DAY_END_MIN;
            newStart = newEnd - duration;
          }

          onChange({ start: newStart, end: newEnd });
        } else if (mode === "top") {
          let newStart = origStart + deltaMin;
          if (newStart < DAY_START_MIN) newStart = DAY_START_MIN;
          if (newStart > origEnd - 5) newStart = origEnd - 5;
          onChange({ start: newStart });
        } else if (mode === "bottom") {
          let newEnd = origEnd + deltaMin;
          if (newEnd > DAY_END_MIN) newEnd = DAY_END_MIN;
          if (newEnd < origStart + 5) newEnd = origStart + 5;
          onChange({ end: newEnd });
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
    [task.start, task.end, onChange]
  );

  return { dragging, handleMouseDown };
}
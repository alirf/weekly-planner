import { useRef, useState, useCallback } from "react";
import { DAY_START_MIN, DAY_END_MIN, PX_PER_MINUTE } from "../constants";

const SNAP = 5;

function snap(min) {
  return Math.round(min / SNAP) * SNAP;
}

export function useDragResize({ task, onLiveChange }) {
  const [dragging, setDragging] = useState(null);
  const stateRef = useRef(null);

  const handleMouseDown = useCallback(
    (mode, e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.button !== 0) return;

      stateRef.current = {
        startY: e.clientY,
        origStart: task.start,
        origEnd: task.end,
        moved: false,
      };
      setDragging(mode);

      document.body.style.cursor =
        mode === "move" ? "grabbing" : "ns-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (ev) => {
        if (!stateRef.current) return;
        const deltaY = ev.clientY - stateRef.current.startY;

        if (!stateRef.current.moved && Math.abs(deltaY) < 3) return;
        stateRef.current.moved = true;

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
          onLiveChange({ start: newStart, end: newEnd });
        } else if (mode === "top") {
          let newStart = origStart + deltaMin;
          if (newStart < DAY_START_MIN) newStart = DAY_START_MIN;
          if (newStart > origEnd - 5) newStart = origEnd - 5;
          onLiveChange({ start: newStart });
        } else if (mode === "bottom") {
          let newEnd = origEnd + deltaMin;
          if (newEnd > DAY_END_MIN) newEnd = DAY_END_MIN;
          if (newEnd < origStart + 5) newEnd = origStart + 5;
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
    [task.start, task.end, onLiveChange]
  );

  const wasDragged = () => stateRef.current?.moved ?? false;

  return { dragging, handleMouseDown, wasDragged };
}
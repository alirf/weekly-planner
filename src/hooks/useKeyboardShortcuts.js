import { useEffect, useRef } from "react";

export function useKeyboardShortcuts(handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const isTypingTarget = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };

    const onKeyDown = (e) => {
      const h = ref.current;
      const key = e.key;
      const lower = key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const typing = isTypingTarget(e.target);

      // Esc → همیشه
      if (key === "Escape") {
        h.escape?.(e);
        return;
      }

      // Ctrl+S → همیشه (خروجی)
      if (ctrl && lower === "s") {
        e.preventDefault();
        h.export?.(e);
        return;
      }

      // Ctrl+/ → همیشه
      if (ctrl && key === "/") {
        e.preventDefault();
        h.help?.(e);
        return;
      }

      // بقیه کلیدها وقتی داخل input هستیم کار نکنن
      if (typing) return;

      // Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
      if (ctrl) {
        if (lower === "z" && e.shiftKey) {
          e.preventDefault();
          h.redo?.(e);
          return;
        }
        if (lower === "z") {
          e.preventDefault();
          h.undo?.(e);
          return;
        }
        if (lower === "y") {
          e.preventDefault();
          h.redo?.(e);
          return;
        }
        if (lower === "d") {
          e.preventDefault();
          h.duplicate?.(e);
          return;
        }
        if (lower === "c") {
          e.preventDefault();
          h.copy?.(e);
          return;
        }
        if (lower === "v") {
          e.preventDefault();
          h.paste?.(e);
          return;
        }
        return;
      }

      // تک کلیدها
      if (lower === "n") {
        e.preventDefault();
        h.newTask?.(e);
      } else if (lower === "t") {
        e.preventDefault();
        h.today?.(e);
      } else if (key === "?") {
        e.preventDefault();
        h.help?.(e);
      } else if (key === "Delete" || key === "Backspace") {
        e.preventDefault();
        h.deleteTask?.(e);
      } else if (key === "Enter") {
        h.enter?.(e);
      } else if (key === "ArrowUp" && e.shiftKey) {
        h.moveUp?.(e);
      } else if (key === "ArrowDown" && e.shiftKey) {
        h.moveDown?.(e);
      } else if (key === " ") {
        e.preventDefault();
        h.toggleDone?.(e);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
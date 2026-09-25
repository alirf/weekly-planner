import { useEffect, useRef, useState } from "react";
import { DAYS } from "../constants";

export default function TaskContextMenu({
  x,
  y,
  dayKey,
  onClose,
  onEdit,
  onDuplicate,
  onCopyToDay,
  onMoveToDay,
  onDelete,
}) {
  const menuRef = useRef(null);
  const [submenu, setSubmenu] = useState(null); // null | "copy" | "move"

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const style = {
    top: `${Math.min(y, window.innerHeight - 380)}px`,
    left: `${Math.min(x, window.innerWidth - 260)}px`,
  };

  const otherDays = DAYS.filter((d) => d.key !== dayKey);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 min-w-[230px] text-sm"
      style={style}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuItem
        icon="✏️"
        label="ویرایش"
        onClick={() => { onEdit(); onClose(); }}
      />
      <MenuItem
        icon="📄"
        label="تکرار در همین روز"
        onClick={() => { onDuplicate(); onClose(); }}
      />

      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />

      <div
        className="relative"
        onMouseEnter={() => setSubmenu("copy")}
        onMouseLeave={() => setSubmenu(null)}
      >
        <MenuItem icon="📋" label="کپی به روز..." hasSubmenu />
        {submenu === "copy" && (
          <Submenu
            days={otherDays}
            onSelect={(targetKey) => {
              onCopyToDay(targetKey);
              onClose();
            }}
          />
        )}
      </div>

      <div
        className="relative"
        onMouseEnter={() => setSubmenu("move")}
        onMouseLeave={() => setSubmenu(null)}
      >
        <MenuItem icon="➡️" label="انتقال به روز..." hasSubmenu />
        {submenu === "move" && (
          <Submenu
            days={otherDays}
            onSelect={(targetKey) => {
              onMoveToDay(targetKey);
              onClose();
            }}
          />
        )}
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />

      <MenuItem
        icon="🗑"
        label="حذف"
        danger
        onClick={() => { onDelete(); onClose(); }}
      />
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger, hasSubmenu }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-right px-3 py-2 flex items-center gap-2 transition-colors ${
        danger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      <span className="w-5 text-center">{icon}</span>
      <span className="flex-1">{label}</span>
      {hasSubmenu && <span className="text-slate-400 text-[10px]">◀</span>}
    </button>
  );
}

function Submenu({ days, onSelect }) {
  return (
    <div
      className="absolute top-0 right-full mr-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 min-w-[150px] z-[101]"
    >
      {days.map((d) => (
        <button
          key={d.key}
          onClick={() => onSelect(d.key)}
          className="w-full text-right px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
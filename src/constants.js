export const DAYS = [
  { key: "sat", label: "شنبه" },
  { key: "sun", label: "یکشنبه" },
  { key: "mon", label: "دوشنبه" },
  { key: "tue", label: "سه‌شنبه" },
  { key: "wed", label: "چهارشنبه" },
  { key: "thu", label: "پنجشنبه" },
  { key: "fri", label: "جمعه" },
];

export const DAY_START_MIN = 7 * 60;    // 07:00
export const DAY_END_MIN   = 24 * 60;   // 24:00
export const PX_PER_MINUTE = 1;
export const COLUMN_HEIGHT =
  (DAY_END_MIN - DAY_START_MIN) * PX_PER_MINUTE; // 1020

export const DEFAULT_CATEGORIES = [
  { id: "work",   name: "کار",       color: "#3b82f6" },
  { id: "study",  name: "مطالعه",    color: "#f59e0b" },
  { id: "sport",  name: "ورزش",      color: "#10b981" },
  { id: "family", name: "خانوادگی",  color: "#ec4899" },
  { id: "rest",   name: "استراحت",   color: "#8b5cf6" },
  { id: "other",  name: "سایر",      color: "#6b7280" },
];

export const EMPTY_SCHEDULE = {
  sat: [], sun: [], mon: [], tue: [], wed: [], thu: [], fri: [],
};
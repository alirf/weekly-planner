import { DAY_START_MIN, DAY_END_MIN } from "../constants";

export function minutesToHHMM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

// لیست مارک‌های ساعت (هر 30 دقیقه)
export function buildHourMarks(stepMinutes = 30) {
  const marks = [];
  for (let m = DAY_START_MIN; m <= DAY_END_MIN; m += stepMinutes) {
    marks.push(m);
  }
  return marks;
}

// مدت به فرمت خوانا: "1 ساعت و 35 دقیقه"
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} دقیقه`;
  if (m === 0) return `${h} ساعت`;
  return `${h} ساعت و ${m} دقیقه`;
}
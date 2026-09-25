import { DAY_START_MIN, DAY_END_MIN } from "../constants";

export function findFreeSlot(
  existingTasks,
  duration,
  { preferStart = null, excludeId = null, step = 5 } = {}
) {
  const tasks = existingTasks
    .filter((t) => t.id !== excludeId)
    .sort((a, b) => a.start - b.start);

  if (preferStart !== null) {
    const end = preferStart + duration;
    if (
      preferStart >= DAY_START_MIN &&
      end <= DAY_END_MIN &&
      !hasOverlap(tasks, preferStart, end)
    ) {
      return { start: preferStart, end };
    }
  }

  let cursor = DAY_START_MIN;

  for (const t of tasks) {
    const gap = t.start - cursor;
    if (gap >= duration) {
      return { start: cursor, end: cursor + duration };
    }
    cursor = Math.max(cursor, t.end);
  }

  if (DAY_END_MIN - cursor >= duration) {
    return { start: cursor, end: cursor + duration };
  }

  return null;
}

function hasOverlap(tasks, start, end) {
  return tasks.some((t) => start < t.end && end > t.start);
}
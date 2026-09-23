export function findOverlap(tasks, start, end, excludeId = null) {
  return tasks.find((t) => {
    if (t.id === excludeId) return false;
    return start < t.end && end > t.start;
  });
}
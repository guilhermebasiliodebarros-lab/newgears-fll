export function studentAttendanceStats(student = {}) {
  const total = Math.max(0, Number(student.totalClasses) || 0);
  const attended = Math.min(total, Math.max(0, Number(student.attendedClasses) || 0));
  return { percent: total ? Math.round(attended / total * 100) : 0, absences: total - attended };
}

export function studentLevel(xp, levels) {
  const value = Number.isFinite(Number(xp)) ? Math.max(Number(xp), levels[0].min) : levels[0].min;
  return levels.find((level) => value >= level.min && value <= level.max) || levels.at(-1);
}

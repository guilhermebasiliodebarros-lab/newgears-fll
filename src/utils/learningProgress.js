import { taskParticipants } from './teamProcesses.js';
import { weekStartFor } from './weeklyReports.js';

export function reportCalendarWeek(report) {
  const value = report?.reportDate;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value) return '';
  return weekStartFor(value);
}
export function reportWeekIndex(reports) {
  const weeks = new Map();
  for (const report of reports) {
    const week = reportCalendarWeek(report); if (!week) continue;
    const group = weeks.get(week) || { week, reports: 0, authors: new Set() };
    group.reports++; if (report.studentId || report.userId) group.authors.add(report.studentId || report.userId); weeks.set(week, group);
  }
  return [...weeks.values()].sort((a, b) => b.week.localeCompare(a.week)).map((group) => ({ ...group, authors: group.authors.size }));
}
export function collaborationProgress({ tasks = [], students = [], reports = [], today }) {
  const shared = tasks.filter((task) => new Set(taskParticipants(task, students).map((person) => person.id || person.name)).size > 1);
  const active = students.filter((student) => student?.id && student.status !== 'inactive');
  const week = reportCalendarWeek({ reportDate: today });
  const authors = new Set(reports.filter((report) => week && reportCalendarWeek(report) === week && active.some((student) => String(student.id) === report.studentId)).map((report) => report.studentId));
  return { sharedTotal: shared.length, sharedCompleted: shared.filter((task) => task.status === 'done').length, authors: authors.size, members: active.length, week };
}

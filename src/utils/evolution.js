import { sessionEntries, validDate } from './teamProcesses.js';
import { weekStartFor } from './weeklyReports.js';

export function localDateOf(value) {
  if (!value) return '';
  if (typeof value === 'string' && validDate(value)) return value;
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date) : '';
}
export function shiftDate(value, days) { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
export function comparePeriod(start, end) {
  if (!validDate(start) || !validDate(end) || start > end) throw new Error('Escolha um período válido.');
  const length = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  if (length > 366) throw new Error('Escolha um período de até 366 dias.');
  return { start: shiftDate(start, -length), end: shiftDate(start, -1) };
}
export function summarizeEvolution({ tasks = [], sessions = [], start, end }) {
  const inPeriod = (value) => { const date = localDateOf(value); return date && date >= start && date <= end; };
  const completed = tasks.filter((task) => task.status === 'done' && inPeriod(task.completedAt));
  const withDeadline = completed.filter((task) => validDate(task.dueDate));
  const onTime = withDeadline.filter((task) => localDateOf(task.completedAt) <= task.dueDate).length;
  const reviews = tasks.filter((task) => (task.history || []).some((entry) => inPeriod(entry.date) && (entry.to === 'review' || entry.from === 'review')));
  const returned = reviews.filter((task) => (task.history || []).some((entry) => entry.from === 'review' && entry.to === 'doing' && inPeriod(entry.date))).length;
  const entries = sessions.filter((session) => inPeriod(session.date)).flatMap((session) => Object.values(sessionEntries(session)));
  const present = entries.filter((entry) => ['present', 'late'].includes(entry.status)).length;
  const absences = entries.filter((entry) => entry.status === 'absent').length;
  const justified = entries.filter((entry) => entry.status === 'excused').length;
  const percent = (part, total) => total ? Math.round(part * 1000 / total) / 10 : null;
  return { completed: completed.length, onTime, withDeadline: withDeadline.length, onTimeRate: percent(onTime, withDeadline.length), returned, reviewed: reviews.length, reworkRate: percent(returned, reviews.length), present, absences, justified, attendanceRate: percent(present, present + absences), blocked: tasks.filter((task) => task.block && !task.block.resolvedAt && task.status !== 'done').length };
}
export function buildEvolution(input) {
  const previousPeriod = comparePeriod(input.start, input.end);
  const weeks = [];
  for (let day = weekStartFor(input.start); day <= input.end; day = shiftDate(day, 7)) {
    const start = day < input.start ? input.start : day;
    const last = shiftDate(day, 6); const end = last > input.end ? input.end : last;
    weeks.push({ start, end, ...summarizeEvolution({ ...input, start, end }) });
  }
  return { current: summarizeEvolution(input), previous: summarizeEvolution({ ...input, ...previousPeriod }), previousPeriod, weeks };
}

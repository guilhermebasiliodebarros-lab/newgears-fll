import { dateKey, taskParticipants, validDate } from './teamProcesses.js';

export function parseEffortMinutes(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > 2400) throw Error('Informe um esforço de 1 a 2.400 minutos ou deixe sem estimativa.');
  return number;
}
export const formatMinutes = (value) => {
  const minutes = Math.round(value);
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}min` : ''}`;
};
export function buildWorkload({ students = [], tasks = [], today }) {
  if (!validDate(today)) throw Error('Informe uma data válida para acompanhar a carga da equipe.');
  const end = new Date(`${today}T12:00:00`); end.setDate(end.getDate() + 6);
  const endDate = dateKey(end);
  const active = students.filter((student) => student?.id && student.status !== 'inactive');
  const rows = new Map(active.map((student) => [student.id, { student, tasks: [], estimatedMinutes: 0, unestimated: 0, overdue: 0, blocked: 0, inReview: 0, withoutDeadline: 0 }]));
  const unassigned = [];
  for (const task of tasks) {
    if (!['todo', 'doing', 'review'].includes(task.status) || (task.dueDate && task.dueDate > endDate)) continue;
    const ids = [...new Set(taskParticipants(task, students).map((person) => person.id).filter((id) => rows.has(id)))];
    if (!ids.length) { unassigned.push(task); continue; }
    let estimate;
    try { estimate = parseEffortMinutes(task.estimatedMinutes); } catch { estimate = null; }
    for (const id of ids) {
      const row = rows.get(id); row.tasks.push(task);
      if (task.status === 'review') { row.inReview += 1; continue; }
      if (estimate === null) row.unestimated += 1;
      else row.estimatedMinutes += estimate / ids.length;
      if (task.dueDate && task.dueDate < today) row.overdue += 1;
      if (!task.dueDate) row.withoutDeadline += 1;
      if (task.block && !task.block.resolvedAt) row.blocked += 1;
    }
  }
  return { endDate, unassigned, rows: [...rows.values()].sort((a, b) => a.student.name.localeCompare(b.student.name, 'pt-BR')).map((row) => {
    let capacity; try { capacity = parseEffortMinutes(row.student.weeklyCapacityMinutes); } catch { capacity = null; }
    return { ...row, capacity, overCapacity: capacity !== null && row.estimatedMinutes > capacity };
  }) };
}

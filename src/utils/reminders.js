import { taskParticipants, validDate } from './teamProcesses.js';
import { buildWeeklyDeliveries, weekStartFor } from './weeklyReports.js';
import { shiftDate } from './evolution.js';

export const DEFAULT_REMINDERS = Object.freeze({ emailEnabled: false, emailHour: 10, leadDays: 1, tasks: true, reports: true, blocks: true });
export function validateReminderSettings(input) {
  for (const key of ['emailEnabled', 'tasks', 'reports', 'blocks']) if (typeof input[key] !== 'boolean') throw new Error('Informe as preferências dos lembretes.');
  if (!Number.isInteger(input.emailHour) || input.emailHour < 0 || input.emailHour > 23 || !Number.isInteger(input.leadDays) || input.leadDays < 0 || input.leadDays > 7) throw new Error('Escolha um horário de 0 a 23 horas e antecedência de até sete dias.');
  return Object.fromEntries(Object.keys(DEFAULT_REMINDERS).map((key) => [key, input[key]]));
}
export function buildReminders({ user, students = [], tasks = [], reports = [], expectations = {}, planning = {}, config = DEFAULT_REMINDERS, today }) {
  const items = []; const admin = user.role === 'admin' || user.type === 'admin';
  const studentId = user.studentId || user.data?.id || '';
  const name = user.name || user.data?.name || '';
  const until = shiftDate(today, config.leadDays ?? 1);
  for (const task of tasks) {
    if (task.status === 'done') continue;
    const own = admin || taskParticipants(task, students).some((person) => person.id ? person.id === studentId : person.name === name);
    const helping = studentId && task.block?.helpFromId === studentId;
    if (config.blocks && task.block && !task.block.resolvedAt && (own || helping)) items.push({ id: `block:${task.id}`, kind: 'block', entityId: task.id, title: helping && !own ? `Pedido de ajuda: ${task.text}` : `Tarefa bloqueada: ${task.text}`, detail: task.block.reason, tab: 'kanban' });
    if (config.tasks && own && validDate(task.dueDate) && task.dueDate <= until) items.push({ id: `task:${task.id}`, kind: 'task', entityId: task.id, title: task.dueDate < today ? `Prazo vencido: ${task.text}` : `Prazo próximo: ${task.text}`, detail: `Prazo ${task.dueDate.split('-').reverse().join('/')}`, tab: 'kanban' });
  }
  if (config.reports) {
    const active = students.filter((student) => student.status !== 'inactive');
    const currentWeek = weekStartFor(today);
    for (let offset = 0; offset < 4; offset += 1) {
      const week = shiftDate(currentWeek, -7 * offset); const end = shiftDate(week, 6);
      if ((planning.startDate && end < planning.startDate) || (planning.pauseWeeks || []).some((date) => date >= week && date <= end)) continue;
      const rows = buildWeeklyDeliveries({ students: active, reports, weekStart: week, dueDay: planning.reportDueDay ?? 5, exemptions: expectations[week] || {}, today });
      rows.filter((row) => !row.report && !row.exemption && row.dueDate <= until && (admin || row.student.id === studentId)).forEach((row) => items.push({ id: `report:${row.student.id}:${week}`, kind: 'report', entityId: row.student.id, title: `${row.status === 'Atrasado' ? 'Relatório atrasado' : 'Entrega de relatório'}: ${row.student.name}`, detail: `Semana de ${week.split('-').reverse().join('/')} · prazo ${row.dueDate.split('-').reverse().join('/')}`, tab: 'weekly_reports' }));
    }
  }
  return items;
}

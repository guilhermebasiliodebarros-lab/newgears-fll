import { taskParticipants } from './teamProcesses.js';
import { recordDay } from './workspaceRecords.js';

export function briefingTasks(tasks, { student, technical, students = [], today }) {
  return (Array.isArray(tasks) ? tasks : []).filter((task) => task && task.status !== 'done' && (technical || (student?.id && taskParticipants(task, students).some((person) => person.id ? person.id === student.id : person.name === student.name))))
    .sort((left, right) => {
      const priority = (task) => (recordDay(task.dueDate) && recordDay(task.dueDate) < today ? 8 : 0) + (task.block && !task.block.resolvedAt ? 4 : 0) + (['alta', 'high', 'urgent'].includes(task.priority) ? 2 : 0);
      return priority(right) - priority(left) || (recordDay(left.dueDate) || '9999').localeCompare(recordDay(right.dueDate) || '9999');
    });
}

export function briefingEvents(events, today) {
  return (Array.isArray(events) ? events : []).filter((event) => event && recordDay(event.date) >= today && !['concluido', 'cancelado', 'done', 'cancelled'].includes(event.status))
    .sort((left, right) => `${recordDay(left.date)} ${left.time || ''}`.localeCompare(`${recordDay(right.date)} ${right.time || ''}`));
}

import { taskParticipants } from './teamProcesses.js';

export const belongsToStudent = (task, student, roster = []) => taskParticipants(task, roster).some((person) => person.id ? person.id === student?.id : Boolean(student?.name) && person.name === student.name);
export const participantSignature = (task, roster = []) => JSON.stringify(taskParticipants(task, roster).map(({ id, name }) => [id, name]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));
export const openStudentTasks = (tasks, student, roster = []) => tasks.filter((task) => task.status !== 'done' && belongsToStudent(task, student, roster));
export const completedEvidenceTasks = (tasks, student, technical = false) => tasks.filter((task) => task.status === 'done' && (technical || belongsToStudent(task, student))).sort((a, b) => String(b.completedAt || '').localeCompare(String(a.completedAt || '')));
export const taskEvidenceText = (task) => [`Tarefa: ${task.text}`, task.evidence ? `Resultado e verificação: ${task.evidence}` : '', /^https?:\/\//i.test(task.evidenceUrl || '') ? `Evidência: ${task.evidenceUrl}` : ''].filter(Boolean).join('\n');
export function parseLinkedTaskIds(value) {
  let ids;
  try { ids = typeof value === 'string' ? JSON.parse(value) : value || []; } catch { throw new Error('Revise as tarefas vinculadas.'); }
  if (!Array.isArray(ids) || ids.length > 30 || ids.some((id) => typeof id !== 'string' || !/^[\w-]{1,128}$/.test(id))) throw new Error('Vincule até 30 tarefas válidas por registro.');
  return [...new Set(ids)];
}
export const missingStudentFields = (student) => [!String(student.name || '').trim() && 'nome', !String(student.turma || '').trim() && 'turma', !String(student.username || '').trim() && 'usuário', !String(student.password || '').trim() && 'senha de acesso'].filter(Boolean);
export function taskMatchesAttention(task, filter, today, student) {
  if (filter === 'blocked') return task.status !== 'done' && Boolean(task.block && !task.block.resolvedAt);
  if (filter === 'urgent') return task.status !== 'done' && Boolean(task.dueDate && task.dueDate <= today);
  if (filter === 'review') return task.status === 'review';
  if (filter === 'mine') return task.status !== 'done' && belongsToStudent(task, student);
  return true;
}

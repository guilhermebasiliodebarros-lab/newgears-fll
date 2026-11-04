import { doc, runTransaction } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { parseEffortMinutes } from '../utils/workload.js';
import { validDate } from '../utils/teamProcesses.js';
import { RecordConflictError, sameValue, pickFields } from '../utils/recordConflicts.js';
const adapter = { doc, runTransaction };
export const TASK_EDIT_FIELDS = ['text', 'estimatedMinutes', 'dueDate', 'priority'];
export function editableTask(task) {
  return { text: task?.text || '', estimatedMinutes: task?.estimatedMinutes ?? null, dueDate: task?.dueDate || '', priority: task?.priority || 'normal' };
}
export async function saveTaskDetails({ db, user, id, expected, changes, seasonId = 'legacy', store = adapter }) {
  if (user?.type !== 'admin') throw Error('Apenas o técnico pode editar os detalhes da tarefa.');
  const next = editableTask(changes);
  next.text = next.text.trim(); next.estimatedMinutes = parseEffortMinutes(next.estimatedMinutes);
  if (!next.text || next.text.length > 2000) throw Error('Descreva a tarefa em até 2.000 caracteres.');
  if (next.dueDate && !validDate(next.dueDate)) throw Error('Informe um prazo válido.');
  if (!['baixa', 'normal', 'alta', 'urgente'].includes(next.priority)) throw Error('Escolha uma prioridade válida.');
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = store.doc(db, 'tasks', id); const snapshot = await transaction.get(ref); const current = snapshot.data();
    if (!current || (current.seasonId || 'legacy') !== seasonId) throw Error('A tarefa foi removida ou pertence a outra temporada. Seu texto foi mantido.');
    if (!sameValue(editableTask(current), editableTask(expected))) throw new RecordConflictError('A tarefa mudou em outro acesso. Compare as versões antes de salvar.', { expected: editableTask(expected), current: editableTask(current), proposed: next, fields: TASK_EDIT_FIELDS });
    transaction.update(ref, { ...next, updatedAt: new Date().toISOString(), editedBy: user.name || 'Técnico' });
    return { ...current, ...next };
  });
}
export async function saveWeeklyCapacity({ db, user, studentId, minutes, expected, store = adapter }) {
  if (user?.type !== 'admin') throw Error('Apenas o técnico pode combinar a disponibilidade dos integrantes.');
  const next = parseEffortMinutes(minutes);
  return store.runTransaction(db, async (transaction) => {
    const ref = store.doc(db, 'students', studentId); const snapshot = await transaction.get(ref); const current = snapshot.data();
    if (!current || current.status === 'inactive') throw Error('Escolha um integrante ativo.');
    if (!sameValue(current.weeklyCapacityMinutes ?? null, expected ?? null)) throw new RecordConflictError('A disponibilidade foi alterada em outro acesso.', { expected: { weeklyCapacityMinutes: expected }, current, proposed: { weeklyCapacityMinutes: next }, fields: ['weeklyCapacityMinutes'] });
    transaction.update(ref, pickFields({ weeklyCapacityMinutes: next }, ['weeklyCapacityMinutes']));
    return next;
  });
}

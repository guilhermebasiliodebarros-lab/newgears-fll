import { collection, doc, runTransaction } from 'firebase/firestore';
import { taskParticipants } from '../utils/teamProcesses.js';
import { belongsToStudent, participantSignature } from '../utils/workflowImprovements.js';
import { assertActiveSeason } from './teamProcesses.js';

const adapter = { collection, doc, runTransaction };

// Change access and its audit record together, without replacing the student profile.
export async function setStudentAccess({ db, user, studentId, active, actor, seasonId = 'legacy', handoff, store = adapter }) {
  if (user?.type !== 'admin') throw new Error('Apenas o técnico pode alterar o acesso de alunos.');
  if (typeof studentId !== 'string' || !studentId || studentId.includes('/') || typeof active !== 'boolean') {
    throw new Error('Confira o aluno e a situação de acesso.');
  }
  const studentRef = store.doc(db, 'students', studentId);
  const logRef = store.doc(store.collection(db, 'activityLogs'));
  return store.runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(studentRef);
    if (!snapshot.exists()) throw new Error('O aluno não foi encontrado. Atualize a lista.');
    const student = snapshot.data();
    const status = active ? 'active' : 'inactive';
    if ((student.status !== 'inactive') === active) return;
    const changes = [];
    let settings;
    if (!active && handoff) {
      settings = await assertActiveSeason(transaction, db, seasonId, store);
      const assignments = handoff.tasks || [];
      if (!Array.isArray(assignments) || assignments.length > 100 || new Set(assignments.map((item) => item.taskId)).size !== assignments.length) throw new Error('Revise a lista de tarefas para redistribuir (máximo de 100).');
      for (const assignment of assignments) {
        if (!assignment.taskId || assignment.taskId.includes('/') || (assignment.replacementId && assignment.replacementId.includes('/'))) throw new Error('Confira os responsáveis das tarefas.');
        const ref = store.doc(db, 'tasks', assignment.taskId);
        const task = (await transaction.get(ref)).data();
        if (!task || task.status === 'done' || (task.seasonId || 'legacy') !== seasonId || !belongsToStudent(task, { ...student, id: studentId }) || participantSignature(task) !== assignment.expectedParticipants || task.status !== assignment.expectedStatus) throw new Error('Uma tarefa mudou. Feche e abra novamente a revisão de acesso.');
        let replacement;
        if (assignment.replacementId) {
          replacement = (await transaction.get(store.doc(db, 'students', assignment.replacementId))).data();
          if (!replacement || replacement.status === 'inactive' || assignment.replacementId === studentId) throw new Error('Escolha outro integrante ativo para receber a tarefa.');
        }
        const participants = taskParticipants(task).filter((person) => person.id ? person.id !== studentId : person.name !== student.name);
        if (replacement && !participants.some((person) => person.id ? person.id === assignment.replacementId : person.name === replacement.name)) participants.push({ id: assignment.replacementId, name: replacement.name });
        if (participants.length > 3) throw new Error('Uma tarefa ultrapassa o limite de três participantes.');
        changes.push({ ref, task, participants });
      }
    }
    const createdAt = new Date().toISOString();
    const actorName = actor || user.name || 'Técnico';
    for (const { ref, task, participants } of changes) transaction.update(ref, {
      participants, assigneeId: participants[0]?.id || '', author: participants.map((person) => person.name).join(', ') || null,
      createdBy: task.createdBy || task.author || 'Equipe', createdById: task.createdById || '', updatedAt: createdAt,
      peopleHistory: [...(task.peopleHistory || []).slice(-99), { action: 'student-inactivated', studentId, actor: actorName, date: createdAt, participants }],
    });
    if (!active && handoff?.removeFromPlanning && settings?.planningConfig) {
      const planningConfig = { ...settings.planningConfig };
      for (const key of ['participantIds', 'captainIds', 'traineeIds']) planningConfig[key] = (planningConfig[key] || []).filter((id) => id !== studentId);
      transaction.update(store.doc(db, 'settings', 'workspace_season'), { planningConfig });
    }
    transaction.update(studentRef, {
      status,
      archivedAt: active ? null : createdAt,
      archivedBy: active ? null : actorName,
    });
    transaction.set(logRef, {
      seasonId, action: active ? 'reativou o acesso de um aluno' : 'inativou o acesso de um aluno',
      category: 'team', title: student.name || 'Aluno', detail: 'Cadastro e histórico preservados.',
      entityId: studentId, actorName, actorId: user.uid || '', actorType: 'admin', createdAt,
      redistributedTaskIds: changes.map(({ ref }) => ref.id), removedFromPlanning: Boolean(!active && handoff?.removeFromPlanning && settings?.planningConfig),
    });
  });
}

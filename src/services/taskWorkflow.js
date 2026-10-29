import { doc, runTransaction } from 'firebase/firestore';
import { taskParticipants } from '../utils/teamProcesses.js';
import { assertActiveSeason } from './teamProcesses.js';
import { prepareTaskGearRewards, validateTaskGearReward } from './taskGearRewards.js';
const firestoreAdapter = { doc, runTransaction };

export async function changeTaskStage({ db, id, status, expectedStatus, expectedGearReward, isAdmin, actor, actorId, seasonId, details = {}, store = firestoreAdapter }) {
  const { doc, runTransaction } = store;
  return runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = doc(db, 'tasks', id); const snapshot = await transaction.get(ref); const task = snapshot.data();
    if (!task) throw new Error('A tarefa não foi encontrada.');
    if (task.seasonId && task.seasonId !== seasonId) throw new Error('Esta tarefa pertence a outra temporada.');
    if (expectedStatus !== task.status) throw new Error('A tarefa mudou enquanto você a editava. Atualize e tente novamente.');
    if (task.block && !task.block.resolvedAt && status !== 'todo') throw new Error('Resolva o impedimento antes de avançar esta tarefa.');
    const next = { todo: ['doing'], doing: ['todo', 'review'], review: ['doing', 'done'], done: ['review'] };
    if (!next[task.status]?.includes(status)) throw new Error('Avance ou retorne uma etapa por vez.');
    if ((status === 'done' || task.status === 'done' || task.status === 'review') && !isAdmin) throw new Error('Apenas o técnico pode aprovar, devolver ou reabrir uma tarefa revisada.');
    if (status === 'review' && (details.evidence || '').trim().length < 5) throw new Error('Descreva o resultado e sua verificação antes de enviar.');
    if ((details.evidence || '').length > 2000 || (details.feedback || '').length > 2000 || (details.evidenceUrl || '').length > 1000) throw new Error('Resuma a evidência ou a devolução em até 2.000 caracteres.');
    if (task.status === 'review' && status === 'doing' && (details.feedback || '').trim().length < 5) throw new Error('Informe o motivo da devolução.');
    if (details.evidenceUrl && !/^https?:\/\//i.test(details.evidenceUrl)) throw new Error('Informe um link iniciado em https:// ou http://.');
    const now = new Date().toISOString();
    const reward = validateTaskGearReward(task.gearReward || 0);
    if (status === 'done' && reward && !task.gearRewardPaidAt && expectedGearReward !== reward) throw new Error('A recompensa mudou. Atualize a tarefa e confira os Gears antes de aprovar.');
    const grants = status === 'done' ? await prepareTaskGearRewards({ transaction, store, db, id, task, actor, actorId, seasonId, now }) : { writes: [], studentIds: [], coins: 0 };
    transaction.update(ref, { status, completedAt: status === 'done' ? now : null, updatedAt: now,
      ...(grants.studentIds.length ? { gearRewardPaidAt: now, gearRewardPaidStudentIds: grants.studentIds, gearRewardPaidBy: actorId || actor || 'tecnico' } : {}),
      ...(status === 'review' && task.status !== 'done' ? { evidence: details.evidence, evidenceUrl: details.evidenceUrl || '', submittedAt: now } : {}), ...(task.status === 'review' ? { feedback: details.feedback || '', reviewedBy: actor, reviewedAt: now } : {}), history: [...(task.history || []).slice(-99), { from: task.status, to: status, actor, actorId: actorId || '', date: now, feedback: details.feedback || '' }] });
    for (const entry of grants.writes) { transaction.set(entry.accountRef, entry.account); transaction.set(entry.receiptRef, entry.receipt); }
    return { rewardedStudents: grants.studentIds.length, coinsPerStudent: grants.coins };
  });
}

export async function setTaskBlock({ db, id, blocked, reason = '', category = 'other', dependencyId = '', helpFromId = '', resolution = '', expectedStatus, expectedBlockAt = '', actor, actorStudentId = '', isAdmin, seasonId, store = firestoreAdapter }) {
  const { doc, runTransaction } = store;
  const categories = ['material', 'help', 'decision', 'dependency', 'other'];
  if (blocked && (!categories.includes(category) || reason.trim().length < 5 || reason.length > 1000)) throw new Error('Descreva o impedimento em 5 a 1.000 caracteres.');
  if (blocked && category === 'dependency' && !dependencyId) throw new Error('Escolha a tarefa que precisa ser concluída antes.');
  if (!blocked && (resolution.trim().length < 3 || resolution.length > 1000)) throw new Error('Descreva como o impedimento foi resolvido.');
  await runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = doc(db, 'tasks', id); const snapshot = await transaction.get(ref); const task = snapshot.data();
    if (!task || task.status === 'done') throw new Error('Esta tarefa foi concluída ou não foi encontrada.');
    if ((task.seasonId || seasonId) !== seasonId) throw new Error('Esta tarefa pertence a outra temporada.');
    if (task.status !== expectedStatus || (task.block?.updatedAt || '') !== expectedBlockAt) throw new Error('O impedimento mudou. Abra a tarefa novamente.');
    if (!isAdmin && !taskParticipants(task).some((person) => person.id ? person.id === actorStudentId : person.name === actor)) throw new Error('Somente responsáveis e o técnico podem alterar impedimentos.');
    if (!blocked && (!task.block || task.block.resolvedAt)) throw new Error('Não há um impedimento aberto nesta tarefa.');
    const dependency = blocked ? dependencyId : task.block?.dependencyId;
    if (dependency) {
      let cursor = dependency; const visited = new Set([id]); let depth = 0;
      while (cursor) {
        if (visited.has(cursor) || ++depth > 50) throw new Error('Essa dependência cria um ciclo entre tarefas.');
        visited.add(cursor);
        const entry = (await transaction.get(doc(db, 'tasks', cursor))).data();
        if (!entry || (entry.seasonId && entry.seasonId !== seasonId)) throw new Error('A dependência não pertence à temporada ativa.');
        if (!blocked && depth === 1 && entry.status !== 'done') throw new Error('Conclua a tarefa anterior antes de liberar esta dependência.');
        cursor = entry.block && !entry.block.resolvedAt ? entry.block.dependencyId : '';
      }
    }
    if (blocked && helpFromId) {
      const student = (await transaction.get(doc(db, 'students', helpFromId))).data();
      if (!student || student.status === 'inactive') throw new Error('Escolha um integrante ativo para pedir ajuda.');
    }
    const now = new Date().toISOString();
    const block = blocked ? { reason: reason.trim(), category, dependencyId, helpFromId, createdAt: task.block && !task.block.resolvedAt ? task.block.createdAt : now, createdBy: actor, updatedAt: now, resolvedAt: null } : { ...task.block, resolvedAt: now, resolvedBy: actor, resolution: resolution.trim(), updatedAt: now };
    transaction.update(ref, { block, updatedAt: now, blockHistory: [...(task.blockHistory || []).slice(-99), { action: blocked ? 'blocked' : 'resolved', date: now, actor, reason: blocked ? reason.trim() : resolution.trim() }] });
  });
}

export async function updateTaskPeople({ db, id, mode, person, students, seasonId, isAdmin, store = firestoreAdapter }) {
  const { doc, runTransaction } = store;
  await runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = doc(db, 'tasks', id); const snapshot = await transaction.get(ref); const task = snapshot.data();
    if (!task || task.status === 'done') throw new Error('Esta tarefa já foi concluída ou não foi encontrada.');
    if (task.seasonId && task.seasonId !== seasonId) throw new Error('Esta tarefa pertence a outra temporada.');
    if (mode === 'assign' && !isAdmin) throw new Error('Apenas o técnico pode atribuir responsáveis.');
    if (person?.id) { const student = await transaction.get(doc(db, 'students', person.id)); if (!student.exists() || student.data().status === 'inactive') throw new Error('Este integrante está inativo.'); }
    let participants = taskParticipants(task, students);
    if (mode === 'leave') participants = participants.filter((item) => item.id !== person.id && item.name !== person.name);
    else if (mode === 'join') { if (!participants.some((item) => item.id === person.id || item.name === person.name)) participants.push(person); }
    else participants = person ? [person] : [];
    if (participants.length > 3) throw new Error('Esta tarefa já atingiu o limite de três participantes.');
    transaction.update(ref, { participants, assigneeId: participants[0]?.id || '', author: participants.map((item) => item.name).join(', ') || null, createdBy: task.createdBy || task.author || 'Equipe', createdById: task.createdById || '', updatedAt: new Date().toISOString() });
  });
}

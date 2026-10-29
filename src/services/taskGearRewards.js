import { doc, runTransaction } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { assertGearWallet } from './gearShop.js';
import { gearProfile } from '../utils/gearShop.js';
import { GEAR_GRANT_MAX } from '../utils/gearGrants.js';

const adapter = { doc, runTransaction };
export function validateTaskGearReward(value = 0) {
  if (!Number.isSafeInteger(value) || value < 0 || value > GEAR_GRANT_MAX) throw new Error('Use de 0 a 10.000 Gears por participante. Zero deixa a tarefa sem recompensa.');
  return value;
}

export async function setTaskGearReward({ db, user, id, coins, expectedCoins = 0, seasonId, store = adapter }) {
  if (user?.type !== 'admin') throw new Error('Somente o técnico pode definir os Gears da tarefa.');
  validateTaskGearReward(coins);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = store.doc(db, 'tasks', id);
    const task = (await transaction.get(ref)).data();
    if (!task || (task.seasonId && task.seasonId !== seasonId)) throw new Error('Esta tarefa não pertence à temporada atual.');
    if (task.status === 'done' || task.gearRewardPaidAt) throw new Error('Os Gears de uma tarefa concluída ou já paga não podem ser alterados.');
    if ((task.gearReward || 0) !== expectedCoins) throw new Error('Outro técnico alterou a recompensa. Atualize a tarefa.');
    transaction.update(ref, { gearReward: coins, gearRewardUpdatedBy: user.uid || user.name || 'tecnico', updatedAt: new Date().toISOString() });
  });
}

// Prepare every read first; the caller commits task approval and all credits together.
export async function prepareTaskGearRewards({ transaction, store, db, id, task, actor, actorId, seasonId, now }) {
  const coins = validateTaskGearReward(task.gearReward || 0);
  if (!coins || task.gearRewardPaidAt) return { writes: [], studentIds: [], coins: 0 };
  const participants = Array.isArray(task.participants) && task.participants.length ? task.participants : task.assigneeId ? [{ id: task.assigneeId }] : [];
  if (!participants.length || participants.some((person) => typeof person?.id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(person.id))) throw new Error('Vincule os participantes aos cadastros dos alunos antes de aprovar uma tarefa com Gears.');
  const studentIds = [...new Set(participants.map((person) => person.id))];
  if (studentIds.length > 3) throw new Error('Uma tarefa com recompensa pode ter até três participantes.');
  const entries = await Promise.all(studentIds.map(async (studentId) => {
    const accountRef = store.doc(db, 'studentGearProfiles', studentId);
    const receiptRef = store.doc(db, 'studentGearProfiles', studentId, 'taskGrants', id);
    const [student, wallet, receipt] = await Promise.all([transaction.get(store.doc(db, 'students', studentId)), transaction.get(accountRef), transaction.get(receiptRef)]);
    if (!student.exists() || student.data().status === 'inactive') throw new Error('Todos os participantes precisam estar ativos para receber os Gears. Ajuste os responsáveis antes de aprovar.');
    if (receipt.exists()) throw new Error('Esta recompensa já tem um recibo. Confira o pagamento antes de aprovar novamente.');
    const account = gearProfile(studentId, wallet.data());
    assertGearWallet(account);
    if (![account.balance + coins, account.earned + coins].every(Number.isSafeInteger)) throw new Error('O saldo de um participante ultrapassa o limite permitido.');
    return { accountRef, receiptRef,
      account: { ...account, balance: account.balance + coins, earned: account.earned + coins, updatedAt: now, lastAction: { type: 'task_grant', id, coins } },
      receipt: { studentId, taskId: id, seasonId, coins, reason: `Tarefa aprovada: ${task.text || 'Tarefa do Kanban'}`.slice(0, 500), actorId: actorId || 'tecnico', actorName: String(actor || 'Técnico').slice(0, 120), createdAt: now },
    };
  }));
  return { writes: entries, studentIds, coins };
}

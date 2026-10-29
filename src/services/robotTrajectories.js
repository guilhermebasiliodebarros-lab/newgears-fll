import { collection, doc, onSnapshot, query, runTransaction, where } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { validateTrajectory } from '../utils/robotTrajectory.js';

const adapter = { collection, doc, onSnapshot, query, runTransaction, where };
export const trajectoryActorId = (user) => String(user?.uid || user?.studentId || user?.data?.id || user?.name || '');
export const canEditTrajectory = (user, record) => Boolean(user && (user.type === 'admin' || (user.type === 'student' && record.ownerId === trajectoryActorId(user))));
export const trajectoryError = (error) => error?.code === 'permission-denied' ? 'Sem permissão para salvar trajetos. Peça ao técnico para conferir as regras do Firebase.' : error?.code === 'unavailable' ? 'Sem conexão com o servidor. O rascunho continua neste navegador.' : error?.message || 'Não foi possível confirmar o trajeto.';

export function subscribeTrajectories({ db, seasonId, onData, onError, store = adapter }) {
  return store.onSnapshot(store.query(store.collection(db, 'robotTrajectories'), store.where('seasonId', '==', seasonId)), (snapshot) => {
    onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })).filter((item) => item.seasonId === seasonId).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))));
  }, onError);
}

export async function saveTrajectory({ db, user, seasonId, id, expectedRevision = 0, plan, store = adapter }) {
  if (!['admin', 'student'].includes(user?.type) || !trajectoryActorId(user)) throw new Error('Entre na sua conta para salvar trajetos.');
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(id || '') || !/^[a-zA-Z0-9_-]{1,160}$/.test(seasonId || '')) throw new Error('Identificador do trajeto ou temporada inválidos.');
  const clean = validateTrajectory(plan);
  const ref = store.doc(db, 'robotTrajectories', id);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const previous = (await transaction.get(ref)).data();
    if (previous && (previous.seasonId !== seasonId || !canEditTrajectory(user, previous))) throw new Error('Você pode editar seus trajetos. Use Duplicar para criar uma versão de outro integrante.');
    if ((previous?.revision || 0) !== expectedRevision) {
      // A lost response can be retried without creating a second plan or version.
      if (previous?.revision === expectedRevision + 1 && JSON.stringify(validateTrajectory(previous)) === JSON.stringify(clean)) return { id, record: { ...previous, id } };
      throw new Error('Este trajeto mudou em outro computador. Abra a versão salva ou duplique seu rascunho.');
    }
    if (clean.roundId) {
      const round = (await transaction.get(store.doc(db, 'rounds', clean.roundId))).data();
      if (!round || (round.seasonId && round.seasonId !== seasonId)) throw new Error('A saída vinculada foi removida ou pertence a outra temporada.');
    }
    const now = new Date().toISOString();
    const record = { ...clean, seasonId, ownerId: previous?.ownerId || trajectoryActorId(user), author: previous?.author || String(user.name || user.data?.name || 'Integrante').slice(0, 120), createdAt: previous?.createdAt || now, updatedAt: now, updatedBy: trajectoryActorId(user), revision: (previous?.revision || 0) + 1 };
    transaction.set(ref, record);
    return { id, record: { ...record, id } };
  });
}

export async function deleteTrajectory({ db, user, seasonId, id, expectedRevision, store = adapter }) {
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = store.doc(db, 'robotTrajectories', id);
    const previous = (await transaction.get(ref)).data();
    if (!previous || previous.seasonId !== seasonId || !canEditTrajectory(user, previous)) throw new Error('Somente o autor ou o técnico pode excluir este trajeto.');
    if (previous.revision !== expectedRevision) throw new Error('O trajeto mudou. Reabra a versão salva antes de excluir.');
    transaction.delete(ref);
  });
}

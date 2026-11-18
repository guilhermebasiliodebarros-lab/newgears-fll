import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { validateCompetitionPlan } from '../utils/competition.js';
import { sameValue } from '../utils/recordConflicts.js';

const adapter = { doc, onSnapshot, runTransaction };
const validId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
export const canManageCompetition = (user) => user?.type === 'admin';
export const competitionSaveError = (error) => error?.code === 'permission-denied' ? 'O servidor recusou o acesso à central. Peça ao técnico para conferir o acesso autenticado e as permissões da equipe. Seu rascunho local foi preservado.' : error?.code === 'unavailable' ? 'Não foi possível confirmar no servidor. Verifique a conexão; o rascunho continua neste dispositivo.' : error?.message || 'Não foi possível salvar o planejamento.';

export function subscribeCompetitionWorkspace({ db, seasonId, onData, onError, store = adapter }) {
  return store.onSnapshot(store.doc(db, 'competitionWorkspaces', seasonId), (snapshot) => {
    try {
      if (!snapshot.exists()) { onData(null); return; }
      const data = snapshot.data();
      if (data.seasonId !== seasonId || !Number.isInteger(data.revision) || data.revision < 1) throw Error('A versão recebida pertence a outra temporada ou está incompleta.');
      onData({ ...data, plan: validateCompetitionPlan(data.plan) });
    } catch (error) { onError(error); }
  }, onError);
}

export async function saveCompetitionWorkspace({ db, user, seasonId, plan, expectedRevision, mutationId, store = adapter }) {
  if (!canManageCompetition(user)) throw Error('Somente o técnico pode alterar o plano da equipe.');
  if (!validId(seasonId) || !validId(mutationId) || !Number.isInteger(expectedRevision) || expectedRevision < 0) throw Error('Identificador ou revisão do planejamento inválidos.');
  const clean = validateCompetitionPlan(plan);
  const ref = store.doc(db, 'competitionWorkspaces', seasonId);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const previous = (await transaction.get(ref)).data();
    if (previous && previous.seasonId !== seasonId) throw Error('O plano não pertence a esta temporada.');
    if (previous?.mutationId === mutationId && sameValue(previous.plan, clean)) return previous;
    if ((previous?.revision || 0) !== expectedRevision) {
      const error = Error('O planejamento mudou em outro computador. Exporte seu rascunho antes de abrir a versão atual da equipe.');
      error.code = 'competition-conflict'; throw error;
    }
    const now = new Date().toISOString();
    const record = { plan: clean, seasonId, revision: (previous?.revision || 0) + 1, mutationId, createdAt: previous?.createdAt || now, updatedAt: now, updatedBy: String(user.uid || user.name || 'Técnico').slice(0, 120) };
    transaction.set(ref, record);
    return record;
  });
}

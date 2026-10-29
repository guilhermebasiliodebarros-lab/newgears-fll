import { collection, doc, onSnapshot, query, runTransaction, where } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { GIRO_FEEDBACK_COLLECTION, validateGiroFeedback } from '../utils/giroFeedback.js';

const adapter = { collection, doc, onSnapshot, query, runTransaction, where };
const validId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,160}$/.test(value);

export async function saveGiroFeedback({ db, user, ownerId, seasonId, id, feedback, store = adapter }) {
  if (!user || !validId(ownerId) || !validId(seasonId) || !validId(id)) throw new Error('Entre no sistema e atualize a conversa antes de avaliar.');
  const clean = validateGiroFeedback(feedback);
  const ref = store.doc(db, GIRO_FEEDBACK_COLLECTION, id);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const previous = await transaction.get(ref);
    if (previous.exists()) throw new Error('Esta resposta já foi avaliada.');
    transaction.set(ref, { ...clean, ownerId, seasonId, status: 'open', correction: '', createdAt: new Date().toISOString(), reviewedAt: '' });
    return ref.id;
  });
}

export function subscribeGiroFeedback({ db, user, seasonId, onData, onError, store = adapter }) {
  if (user?.type !== 'admin') throw new Error('Somente o técnico pode revisar as avaliações.');
  return store.onSnapshot(store.query(store.collection(db, GIRO_FEEDBACK_COLLECTION), store.where('seasonId', '==', seasonId)), (snapshot) => onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })).filter((item) => item.seasonId === seasonId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))), onError);
}

export async function reviewGiroFeedback({ db, user, seasonId, id, correction, store = adapter }) {
  if (user?.type !== 'admin') throw new Error('Somente o técnico pode revisar as avaliações.');
  if (!validId(id) || !validId(seasonId) || typeof correction !== 'string' || correction.length > 4000) throw new Error('Use até 4.000 caracteres na orientação revisada.');
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = store.doc(db, GIRO_FEEDBACK_COLLECTION, id);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists() || snapshot.data().seasonId !== seasonId) throw new Error('Esta avaliação não pertence à temporada atual.');
    if (snapshot.data().status === 'reviewed') throw new Error('Outro técnico já revisou esta avaliação. Atualize a lista.');
    transaction.update(ref, { status: 'reviewed', correction: correction.trim(), reviewedAt: new Date().toISOString() });
  });
}

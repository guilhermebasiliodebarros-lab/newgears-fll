import { collection, doc, onSnapshot, query, runTransaction, where } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { GIRO_KNOWLEDGE_COLLECTION, validateGiroMaterial } from '../utils/giroKnowledge.js';

const adapter = { collection, doc, onSnapshot, query, runTransaction, where };
export const giroKnowledgeError = (error) => error?.code === 'permission-denied'
  ? 'Sem permissão para acessar a biblioteca. Confira as regras de acesso do Firebase com o responsável pelo sistema.'
  : error?.code === 'unavailable' ? 'A biblioteca está sem conexão. Tente novamente antes de publicar.' : error?.message || 'Não foi possível acessar a biblioteca do Giro.';

export function subscribeGiroMaterials({ db, seasonId, user, onData, onError, store = adapter }) {
  const constraints = [store.where('seasonId', '==', seasonId)];
  if (user?.type !== 'admin') constraints.push(store.where('status', '==', 'published'));
  return store.onSnapshot(store.query(store.collection(db, GIRO_KNOWLEDGE_COLLECTION), ...constraints), (snapshot) => {
    onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })).filter((item) => item.seasonId === seasonId && (user?.type === 'admin' || item.status === 'published')));
  }, onError);
}

export async function saveGiroMaterial({ db, user, seasonId, id, expectedUpdatedAt, expectedRevision, material, store = adapter }) {
  if (user?.type !== 'admin') throw new Error('Somente o técnico pode publicar ou editar os materiais do Giro.');
  if (!seasonId || seasonId.includes('/') || (id && (id.includes('/') || id.startsWith('system-')))) throw new Error('Material ou temporada inválidos.');
  const clean = validateGiroMaterial(material);
  const ref = id ? store.doc(db, GIRO_KNOWLEDGE_COLLECTION, id) : store.doc(store.collection(db, GIRO_KNOWLEDGE_COLLECTION));
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const previous = await transaction.get(ref);
    const before = previous.data();
    if (id && (!previous.exists() || before.seasonId !== seasonId)) throw new Error('Este material não pertence à temporada atual ou foi removido.');
    if (id && (before.updatedAt !== expectedUpdatedAt || before.revision !== expectedRevision)) throw new Error('Outro técnico alterou este material. Reabra o material para não sobrescrever a atualização.');
    const now = new Date().toISOString();
    transaction.set(ref, { ...clean, seasonId, createdAt: before?.createdAt || now, updatedAt: now, revision: (before?.revision || 0) + 1 });
    return ref.id;
  });
}

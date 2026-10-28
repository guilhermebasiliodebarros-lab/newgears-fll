import { collection, doc, runTransaction } from 'firebase/firestore';
const adapter = { collection, doc, runTransaction };

// One persistent draft ID = one new document, even after a lost response/reload.
export async function createDraftRecord({ db, path, data, draftId, store = adapter }) {
  const target = draftId ? store.doc(db, ...path, draftId) : store.doc(store.collection(db, ...path));
  await store.runTransaction(db, async (transaction) => {
    const existing = await transaction.get(target);
    if (!existing.exists()) transaction.set(target, data);
    else {
      const previous = existing.data();
      if (previous.createdByStudentId && data.createdByStudentId !== previous.createdByStudentId) throw new Error('Este rascunho pertence a outro aluno.');
      // A newer draft can finish the same record after an interrupted response.
      const next = { ...previous, ...data, createdAt: previous.createdAt || data.createdAt || new Date().toISOString() };
      if ('applied' in previous) next.applied = previous.applied;
      if (previous.image && !data.image) next.image = previous.image;
      if (previous.photo && !data.photo) next.photo = previous.photo;
      transaction.set(target, next);
    }
  });
  return target;
}

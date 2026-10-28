import { doc, runTransaction } from 'firebase/firestore';
import { GIRO_EXPRESSIONS, WORKSHOP_REACTIONS, validWorkshopLayout, resolveGearWorkshop } from '../utils/gearWorkshop.js';

const adapter = { doc, runTransaction };
const actorId = (user) => {
  const id = String(user?.studentId || user?.data?.id || '');
  if (user?.type !== 'student' || !id || id.includes('/')) throw new Error('Entre no seu perfil de aluno para personalizar sua oficina.');
  return id;
};
const assertActive = (snapshot) => { if (!snapshot.exists() || snapshot.data().status === 'inactive') throw new Error('Este integrante não está ativo na equipe.'); };

export async function saveGearWorkshop({ db, user, layout, expression, store = adapter }) {
  const id = actorId(user);
  if (!validWorkshopLayout(layout) || !GIRO_EXPRESSIONS.some((entry) => entry.id === expression)) throw new Error('Confira as posições e a expressão da oficina antes de salvar.');
  return store.runTransaction(db, async (transaction) => {
    const ref = store.doc(db, 'students', id);
    const student = await transaction.get(ref);
    assertActive(student);
    const workshop = { ...resolveGearWorkshop({ layout, expression }), updatedAt: new Date().toISOString() };
    transaction.update(ref, { gearWorkshop: workshop });
    return workshop;
  });
}

export async function reactToGearWorkshop({ db, user, targetStudentId, type, store = adapter }) {
  const id = actorId(user);
  const target = String(targetStudentId || '');
  if (!target || target.includes('/') || target === id) throw new Error('Escolha a oficina de outro integrante para deixar um incentivo.');
  if (!WORKSHOP_REACTIONS.some((entry) => entry.id === type)) throw new Error('Escolha uma das reações da oficina.');
  return store.runTransaction(db, async (transaction) => {
    const ref = store.doc(db, 'students', target, 'gearWorkshopReactions', id);
    const [actor, owner, previous] = await Promise.all([transaction.get(store.doc(db, 'students', id)), transaction.get(store.doc(db, 'students', target)), transaction.get(ref)]);
    assertActive(actor); assertActive(owner);
    const next = { actorStudentId: id, targetStudentId: target, type: previous.exists() && previous.data().type === type ? 'none' : type, updatedAt: new Date().toISOString() };
    transaction.set(ref, next);
    return next;
  });
}

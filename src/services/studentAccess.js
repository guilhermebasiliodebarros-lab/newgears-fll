import { collection, doc, runTransaction } from 'firebase/firestore';

const adapter = { collection, doc, runTransaction };

// Change access and its audit record together, without replacing the student profile.
export async function setStudentAccess({ db, user, studentId, active, actor, seasonId = 'legacy', store = adapter }) {
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
    const createdAt = new Date().toISOString();
    const actorName = actor || user.name || 'Técnico';
    transaction.update(studentRef, {
      status,
      archivedAt: active ? null : createdAt,
      archivedBy: active ? null : actorName,
    });
    transaction.set(logRef, {
      seasonId, action: active ? 'reativou o acesso de um aluno' : 'inativou o acesso de um aluno',
      category: 'team', title: student.name || 'Aluno', detail: 'Cadastro e histórico preservados.',
      entityId: studentId, actorName, actorId: user.uid || '', actorType: 'admin', createdAt,
    });
  });
}

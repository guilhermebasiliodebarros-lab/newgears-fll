import { collection, doc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { gearDay, validGearCheckIn } from '../utils/gearShop.js';

const adapter = { collection, doc, getDocs, query, runTransaction, where };
export const CHECK_IN_REWARD_XP = 2;

export async function saveTeamCheckIn({ db, user, studentId, level, seasonId, date = gearDay(), store = adapter }) {
  if (user?.type !== 'student' || String(user.studentId || user.data?.id || '') !== String(studentId)) throw new Error('Entre no seu perfil de aluno para fazer check-in.');
  if (!validGearCheckIn({ date, level })) throw new Error('Escolha uma das opções de energia do check-in.');
  // Legacy records had random IDs. New records use one stable ID per student/day.
  const legacy = await store.getDocs(store.query(store.collection(db, 'dailyMoods'), store.where('studentId', '==', studentId), store.where('date', '==', date)));
  const prior = legacy.docs.find((item) => item.data().studentId === studentId && item.data().date === date);
  const target = store.doc(db, 'dailyMoods', prior?.id || `${studentId}__${date}`);
  return store.runTransaction(db, async (transaction) => {
    const studentRef = store.doc(db, 'students', studentId);
    const [student, existing] = await Promise.all([transaction.get(studentRef), transaction.get(target)]);
    if (!student.exists() || student.data().status === 'inactive') throw new Error('Este cadastro não está ativo na equipe.');
    if (existing.exists()) return { sourceId: target.id, duplicate: true, xp: student.data().xp || 0, record: existing.data() };
    const record = { seasonId: seasonId || 'legacy', studentId, createdByStudentId: studentId, studentName: student.data().name, date, level, timestamp: new Date() };
    const xp = (Number(student.data().xp) || 0) + CHECK_IN_REWARD_XP;
    transaction.set(target, record);
    transaction.update(studentRef, { xp });
    return { sourceId: target.id, duplicate: false, xp, record };
  });
}

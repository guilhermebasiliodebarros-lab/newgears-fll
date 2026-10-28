import { collection, collectionGroup, doc, getDoc, getDocs, runTransaction, setDoc } from 'firebase/firestore';
import { contributionPath, GEAR_CONTRIBUTIONS, gearDay, gearDayIndex, gearProfile, gearReceiptId } from '../utils/gearShop.js';
import { buildGearHistoryPlan, growGearProfile, normalizeGearAuthor } from '../utils/gearEvolution.js';

const adapter = { collection, collectionGroup, doc, getDoc, getDocs, runTransaction, setDoc };
const assertAdmin = (user) => { if (user?.type !== 'admin') throw new Error('Somente o técnico pode reconhecer o histórico da equipe.'); };
export const GEAR_HISTORY_VERSION = 'v2';

export async function creditGearHistory({ db, user, candidate, students, store = adapter, referenceDate = new Date() }) {
  assertAdmin(user);
  const { studentId, type, sourceId, attribution } = candidate;
  const rule = GEAR_CONTRIBUTIONS[type];
  const sourcePath = contributionPath(type, sourceId, studentId);
  const receiptId = gearReceiptId(studentId, type, sourceId, candidate);
  return store.runTransaction(db, async (transaction) => {
    const accountRef = store.doc(db, 'studentGearProfiles', studentId);
    const receiptRef = store.doc(db, 'studentGearRewards', receiptId);
    const [student, source, snapshot, receipt, activity] = await Promise.all([
      transaction.get(store.doc(db, 'students', studentId)), transaction.get(store.doc(db, ...sourcePath.split('/'))),
      transaction.get(accountRef), transaction.get(receiptRef),
      attribution.kind === 'activity' ? transaction.get(store.doc(db, 'activityLogs', attribution.activityId)) : Promise.resolve(null),
    ]);
    if (!student.exists() || student.data().status === 'inactive' || !source.exists()) throw new Error('O aluno ou o registro não está mais disponível. Confira o histórico novamente.');
    const record = { ...source.data(), id: sourceId, refPath: sourcePath };
    if (gearReceiptId(studentId, type, sourceId, record) !== receiptId) throw new Error('A data desse check-in mudou. Confira o histórico novamente.');
    // Recheck current ownership inside the transaction. Activity attribution was
    // selected only after the complete scan proved the source title was unique.
    const roster = students.map((item) => item.id === studentId ? { ...student.data(), id: studentId } : item);
    const plan = buildGearHistoryPlan({ students: roster, records: { [rule.collection]: [record] }, activities: activity?.exists() ? [{ ...activity.data(), id: activity.id }] : [] });
    if (!plan.candidates.some((item) => item.studentId === studentId)) throw new Error('A autoria desse registro precisa ser conferida antes do crédito.');
    if (attribution.kind === 'author' && normalizeGearAuthor(record.author || record.studentName) !== normalizeGearAuthor(student.data().name)) throw new Error('O nome do autor mudou. Confira o histórico novamente.');
    const previous = receipt.exists() ? receipt.data() : null;
    if (previous && (!Number.isSafeInteger(previous.coins) || previous.coins < 0 || previous.studentId !== studentId || previous.type !== type)) throw new Error('O recibo anterior precisa ser conferido pelo técnico.');
    const coins = Math.max(0, rule.coins - (previous?.coins || 0));
    const grow = !Number.isSafeInteger(previous?.growthPoints);
    if (!coins && !grow) return { coins: 0, points: 0, duplicate: true };
    const account = gearProfile(studentId, snapshot.data());
    if (![account.balance, account.earned, account.spent, account.growthPoints].every((value) => Number.isSafeInteger(value) && value >= 0) || account.earned !== account.balance + account.spent) throw new Error('Os valores da carteira precisam ser conferidos pelo técnico.');
    const updatedAt = referenceDate.toISOString();
    transaction.set(accountRef, { ...account, ...(grow ? growGearProfile(account, type) : {}), balance: account.balance + coins, earned: account.earned + coins, updatedAt, lastAction: { type: 'history', id: receiptId, coins } });
    const entry = previous ? { ...previous, growthPoints: rule.coins, coins: previous.coins + coins,
      ...(grow ? { evolutionMigratedAt: updatedAt } : {}), ...(coins ? { coinsBeforeUncap: previous.coins, uncappedAt: updatedAt } : {}),
    } : {
      studentId, type, sourceId, sourcePath, day: gearDay(referenceDate), dayIndex: gearDayIndex(referenceDate),
      coins, growthPoints: rule.coins, mode: 'history', attribution, createdAt: updatedAt,
    };
    transaction.set(receiptRef, entry);
    return { coins, points: grow ? rule.coins : 0, duplicate: false };
  });
}

export async function reconcileGearHistory({ db, user, store = adapter, onProgress = () => {} }) {
  assertAdmin(user);
  const names = ['students', ...new Set(Object.values(GEAR_CONTRIBUTIONS).map((rule) => rule.collection).filter((name) => name !== 'logbook')), 'activityLogs', 'studentGearRewards'];
  const snapshots = await Promise.all([...names.map((name) => store.getDocs(store.collection(db, name))), store.getDocs(store.collectionGroup(db, 'logbook'))]);
  const records = Object.fromEntries([...names, 'logbook'].map((name, index) => [name, snapshots[index].docs.map((item) => ({ ...item.data(), id: item.id, refPath: item.ref.path }))]));
  const plan = buildGearHistoryPlan({ students: records.students, records, activities: records.activityLogs });
  const receipts = new Map(records.studentGearRewards.map((entry) => [entry.id, entry]));
  const summary = { version: 2, processed: 0, total: plan.candidates.length, coins: 0, points: 0, credited: 0, checkins: 0, unresolved: plan.unresolved, byStudent: {} };
  onProgress({ ...summary });
  for (const candidate of plan.candidates) {
    const previous = receipts.get(gearReceiptId(candidate.studentId, candidate.type, candidate.sourceId, candidate));
    const fullyRecognized = previous?.studentId === candidate.studentId && previous?.type === candidate.type && Number.isSafeInteger(previous?.growthPoints) && previous.coins >= GEAR_CONTRIBUTIONS[candidate.type].coins;
    const result = fullyRecognized ? { coins: 0, points: 0, duplicate: true } : await creditGearHistory({ db, user, candidate, students: records.students, store });
    summary.processed++;
    summary.coins += result.coins;
    summary.points += result.points;
    if (!result.duplicate) summary.credited++;
    if (candidate.type === 'checkin' && !result.duplicate) summary.checkins++;
    const current = summary.byStudent[candidate.studentId] || { coins: 0, points: 0, records: 0 };
    summary.byStudent[candidate.studentId] = { coins: current.coins + result.coins, points: current.points + result.points, records: current.records + (result.duplicate ? 0 : 1) };
    onProgress({ ...summary });
  }
  const completed = { ...summary, completedAt: new Date().toISOString() };
  await store.setDoc(store.doc(db, 'gearHistoryMigrations', GEAR_HISTORY_VERSION), completed);
  return completed;
}

export const getGearHistoryStatus = ({ db, store = adapter }) => store.getDoc(store.doc(db, 'gearHistoryMigrations', GEAR_HISTORY_VERSION));

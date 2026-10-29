import { collection, doc, limit, onSnapshot, orderBy, query, runTransaction } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { assertGearWallet } from './gearShop.js';
import { gearProfile } from '../utils/gearShop.js';
import { validateGearGrant } from '../utils/gearGrants.js';

const adapter = { collection, doc, limit, onSnapshot, orderBy, query, runTransaction };

export async function grantStudentGears({ db, user, studentId, coins, reason, grantId, seasonId, store = adapter }) {
  if (user?.type !== 'admin') throw new Error('Somente o técnico pode conceder Gears por tarefas.');
  const clean = validateGearGrant({ studentId, coins, reason, grantId, seasonId });
  const actorId = String(user.uid || user.name || 'tecnico').slice(0, 128);
  const actorName = String(user.name || 'Técnico').slice(0, 120);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const accountRef = store.doc(db, 'studentGearProfiles', studentId);
    const grantRef = store.doc(db, 'studentGearProfiles', studentId, 'manualGrants', grantId);
    const [student, wallet, receipt] = await Promise.all([
      transaction.get(store.doc(db, 'students', studentId)), transaction.get(accountRef), transaction.get(grantRef),
    ]);
    if (receipt.exists()) {
      const previous = receipt.data();
      if (previous.studentId !== studentId || previous.coins !== coins || previous.reason !== clean.reason || previous.seasonId !== seasonId || previous.actorId !== actorId) throw new Error('Este envio já foi registrado com outros dados. Descarte o rascunho para iniciar uma nova concessão.');
      return { duplicate: true, coins: 0 };
    }
    if (!student.exists() || student.data().status === 'inactive') throw new Error('Escolha um aluno ativo da equipe para receber Gears.');
    const account = gearProfile(studentId, wallet.data());
    assertGearWallet(account);
    if (![account.balance + coins, account.earned + coins].every(Number.isSafeInteger)) throw new Error('O saldo está acima do limite permitido. Confira a carteira antes de continuar.');
    const createdAt = new Date().toISOString();
    const next = { ...account, balance: account.balance + coins, earned: account.earned + coins, updatedAt: createdAt, lastAction: { type: 'manual_grant', id: grantId, coins } };
    transaction.set(accountRef, next);
    transaction.set(grantRef, { ...clean, actorId, actorName, createdAt });
    return { duplicate: false, coins, balance: next.balance };
  });
}

export function subscribeGearGrants({ db, user, studentId, includeTasks = false, onData, onError, store = adapter }) {
  const ownId = String(user?.studentId || user?.data?.id || user?.student?.id || '');
  if (!user || (user.type !== 'admin' && (user.type !== 'student' || ownId !== studentId))) throw new Error('Você pode consultar apenas suas próprias concessões de Gears.');
  if (typeof studentId !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(studentId)) throw new Error('Escolha um aluno válido.');
  const kinds = includeTasks ? ['manualGrants', 'taskGrants'] : ['manualGrants'];
  const rows = new Map();
  const unsubscribers = kinds.map((kind) => store.onSnapshot(store.query(store.collection(db, 'studentGearProfiles', studentId, kind), store.orderBy('createdAt', 'desc'), store.limit(10)), (snapshot) => {
    rows.set(kind, snapshot.docs.map((item) => ({ ...item.data(), id: includeTasks ? `${kind}:${item.id}` : item.id, source: kind === 'taskGrants' ? 'kanban' : 'manual' })).filter((item) => item.studentId === studentId));
    if (rows.size === kinds.length) onData([...rows.values()].flat().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 10));
  }, onError));
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

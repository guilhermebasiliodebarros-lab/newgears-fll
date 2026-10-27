import { doc, runTransaction } from 'firebase/firestore';
import { contributionPath, DAILY_GEARS_LIMIT, gearDay, gearDayIndex, gearItem, gearProfile, GEAR_CONTRIBUTIONS } from '../utils/gearShop.js';

const adapter = { doc, runTransaction };
const assertStudent = (user, studentId) => {
  if (user?.type !== 'student' || String(user.studentId || user.data?.id || user.student?.id || '') !== String(studentId)) throw new Error('Entre no seu perfil de aluno para usar seus Gears.');
};
const assertActive = (snapshot) => {
  if (!snapshot.exists() || snapshot.data().status === 'inactive') throw new Error('Este cadastro não está ativo na equipe.');
};
const assertWallet = (account) => {
  if (![account.balance, account.earned, account.spent].every((value) => Number.isSafeInteger(value) && value >= 0) || account.earned !== account.balance + account.spent) throw new Error('Os valores da carteira precisam ser conferidos pelo técnico antes de continuar.');
};
export const gearShopError = (error) => {
  if (`${error?.code}`.includes('resource-exhausted')) return 'O banco atingiu o limite de uso. Esta operação não foi confirmada; tente novamente mais tarde.';
  if (`${error?.code}`.includes('permission-denied')) return 'Não foi possível acessar a carteira. O técnico precisa conferir as permissões da loja.';
  return error?.message || 'Não foi possível confirmar a operação. Tente novamente.';
};

export async function rewardGearContribution({ db, user, studentId, type, sourceId, referenceDate = new Date(), store = adapter }) {
  assertStudent(user, studentId);
  const sourcePath = contributionPath(type, sourceId, studentId);
  const rule = GEAR_CONTRIBUTIONS[type];
  const receiptId = `${studentId}__${type}__${sourceId}`;
  const day = gearDay(referenceDate);
  const dayIndex = gearDayIndex(referenceDate);
  return store.runTransaction(db, async (transaction) => {
    const accountRef = store.doc(db, 'studentGearProfiles', String(studentId));
    const receiptRef = store.doc(db, 'studentGearRewards', receiptId);
    const [student, source, accountSnapshot, receipt] = await Promise.all([
      transaction.get(store.doc(db, 'students', String(studentId))), transaction.get(store.doc(db, ...sourcePath.split('/'))),
      transaction.get(accountRef), transaction.get(receiptRef),
    ]);
    assertActive(student);
    if (receipt.exists()) return { coins: 0, duplicate: true, label: rule.label };
    const record = source.data();
    if (!source.exists() || String(record.createdByStudentId || record.studentId || '') !== String(studentId) || !`${record[rule.required] || ''}`.trim()) throw new Error('O registro precisa estar salvo no seu nome para receber Gears.');
    const account = gearProfile(studentId, accountSnapshot.data());
    assertWallet(account);
    const sameDay = account.rewardDayIndex === dayIndex;
    const dayEarned = sameDay ? Number(account.dayEarned) || 0 : 0;
    const dayCounts = sameDay ? { ...account.dayCounts } : {};
    const count = Number(dayCounts[type]) || 0;
    const coins = count >= rule.limit ? 0 : Math.max(0, Math.min(rule.coins, DAILY_GEARS_LIMIT - dayEarned));
    const updatedAt = referenceDate.toISOString();
    transaction.set(accountRef, {
      ...account, balance: account.balance + coins, earned: account.earned + coins, rewardDay: day, rewardDayIndex: dayIndex,
      dayEarned: dayEarned + coins, dayCounts: { ...dayCounts, [type]: count + 1 }, updatedAt,
      lastAction: { type: 'reward', id: receiptId, coins },
    });
    transaction.set(receiptRef, { studentId: String(studentId), type, sourceId, sourcePath, day, dayIndex, coins, createdAt: updatedAt });
    return { coins, capped: coins === 0, label: rule.label };
  });
}

export async function purchaseGearItem({ db, user, studentId, itemId, store = adapter }) {
  assertStudent(user, studentId);
  const item = gearItem(itemId);
  if (!item) throw new Error('Este item não está no catálogo.');
  return store.runTransaction(db, async (transaction) => {
    const studentRef = store.doc(db, 'students', String(studentId));
    const accountRef = store.doc(db, 'studentGearProfiles', String(studentId));
    const [student, snapshot] = await Promise.all([transaction.get(studentRef), transaction.get(accountRef)]);
    assertActive(student);
    const account = gearProfile(studentId, snapshot.data());
    assertWallet(account);
    if (account.owned.includes(itemId)) throw new Error('Você já tem este item. Use Equipar para ativá-lo.');
    if (!Number.isSafeInteger(account.balance) || account.balance < item.price) throw new Error('Você ainda não tem Gears suficientes para este item.');
    const equipped = { ...account.equipped, [item.category]: itemId };
    const next = { ...account, balance: account.balance - item.price, spent: account.spent + item.price, owned: [...account.owned, itemId], equipped, updatedAt: new Date().toISOString(), lastAction: { type: 'purchase', id: itemId, coins: item.price } };
    transaction.set(accountRef, next);
    transaction.update(studentRef, { gearAppearance: equipped });
    return next;
  });
}

export async function equipGearItem({ db, user, studentId, itemId, store = adapter }) {
  assertStudent(user, studentId);
  const item = gearItem(itemId);
  if (!item) throw new Error('Este item não está no catálogo.');
  return store.runTransaction(db, async (transaction) => {
    const studentRef = store.doc(db, 'students', String(studentId));
    const accountRef = store.doc(db, 'studentGearProfiles', String(studentId));
    const [student, snapshot] = await Promise.all([transaction.get(studentRef), transaction.get(accountRef)]);
    assertActive(student);
    const account = gearProfile(studentId, snapshot.data());
    assertWallet(account);
    if (!account.owned.includes(itemId)) throw new Error('Desbloqueie este item antes de equipar.');
    const equipped = { ...account.equipped, [item.category]: itemId };
    const next = { ...account, equipped, updatedAt: new Date().toISOString(), lastAction: { type: 'equip', id: itemId, coins: 0 } };
    transaction.set(accountRef, next);
    transaction.update(studentRef, { gearAppearance: equipped });
    return next;
  });
}

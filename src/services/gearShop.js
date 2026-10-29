import { doc, runTransaction } from 'firebase/firestore';
import { contributionPath, DEFAULT_GEAR_EQUIPMENT, gearDay, gearDayIndex, gearItem, gearProfile, gearReceiptId, GEAR_CONTRIBUTIONS } from '../utils/gearShop.js';
import { gearEvolution, growGearProfile } from '../utils/gearEvolution.js';

const adapter = { doc, runTransaction };
export const GEAR_REFUND_LIMIT = 3;
const assertStudent = (user, studentId) => {
  if (user?.type !== 'student' || String(user.studentId || user.data?.id || user.student?.id || '') !== String(studentId)) throw new Error('Entre no seu perfil de aluno para usar seus Gears.');
};
const assertActive = (snapshot) => {
  if (!snapshot.exists() || snapshot.data().status === 'inactive') throw new Error('Este cadastro não está ativo na equipe.');
};
const assertWallet = (account) => {
  if (![account.balance, account.earned, account.spent].every((value) => Number.isSafeInteger(value) && value >= 0) || account.earned !== account.balance + account.spent) throw new Error('Os valores da carteira precisam ser conferidos pelo técnico antes de continuar.');
  if (!Number.isInteger(account.refundCount) || account.refundCount < 0 || account.refundCount > GEAR_REFUND_LIMIT || !Array.isArray(account.refundableItems) || new Set(account.refundableItems).size !== account.refundableItems.length || account.refundableItems.some((id) => !account.owned.includes(id) || !(gearItem(id)?.price > 0))) throw new Error('O histórico de reembolsos precisa ser conferido pelo técnico.');
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
  const day = gearDay(referenceDate);
  const dayIndex = gearDayIndex(referenceDate);
  return store.runTransaction(db, async (transaction) => {
    const accountRef = store.doc(db, 'studentGearProfiles', String(studentId));
    const [student, source, accountSnapshot] = await Promise.all([
      transaction.get(store.doc(db, 'students', String(studentId))), transaction.get(store.doc(db, ...sourcePath.split('/'))),
      transaction.get(accountRef),
    ]);
    assertActive(student);
    const record = source.data();
    if (!source.exists() || String(record.createdByStudentId || record.studentId || '') !== String(studentId) || !`${record[rule.required] || ''}`.trim()) throw new Error('O registro precisa estar salvo no seu nome para receber Gears.');
    const receiptId = gearReceiptId(studentId, type, sourceId, record);
    const receiptRef = store.doc(db, 'studentGearRewards', receiptId);
    const receipt = await transaction.get(receiptRef);
    if (receipt.exists()) return { coins: 0, duplicate: true, label: rule.label };
    const account = gearProfile(studentId, accountSnapshot.data());
    assertWallet(account);
    const sameDay = account.rewardDayIndex === dayIndex;
    const dayEarned = sameDay ? Number(account.dayEarned) || 0 : 0;
    const dayCounts = sameDay ? { ...account.dayCounts } : {};
    const count = Number(dayCounts[type]) || 0;
    const coins = rule.coins;
    const updatedAt = referenceDate.toISOString();
    const growth = growGearProfile(account, type);
    const nextEvolution = gearEvolution({ ...account, ...growth });
    transaction.set(accountRef, {
      ...account, ...growth, balance: account.balance + coins, earned: account.earned + coins, rewardDay: day, rewardDayIndex: dayIndex,
      dayEarned: dayEarned + coins, dayCounts: { ...dayCounts, [type]: count + 1 }, updatedAt,
      lastAction: { type: 'reward', id: receiptId, coins },
    });
    transaction.set(receiptRef, { studentId: String(studentId), type, sourceId, sourcePath, day, dayIndex, coins, growthPoints: rule.coins, createdAt: updatedAt });
    return { coins, label: rule.label, animationId: account.equipped.animation, levelUp: nextEvolution.level > gearEvolution(account).level ? { name: nextEvolution.name, unlock: nextEvolution.unlock } : null };
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
    const next = { ...account, balance: account.balance - item.price, spent: account.spent + item.price, refundableItems: [...account.refundableItems, itemId], owned: [...account.owned, itemId], equipped, updatedAt: new Date().toISOString(), lastAction: { type: 'purchase', id: itemId, coins: item.price } };
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

export async function refundGearItem({ db, user, studentId, itemId, store = adapter }) {
  assertStudent(user, studentId);
  const item = gearItem(itemId);
  if (!item || item.price <= 0) throw new Error('Somente itens comprados com Gears podem ser reembolsados.');
  return store.runTransaction(db, async (transaction) => {
    const studentRef = store.doc(db, 'students', String(studentId));
    const accountRef = store.doc(db, 'studentGearProfiles', String(studentId));
    const [student, snapshot] = await Promise.all([transaction.get(studentRef), transaction.get(accountRef)]);
    assertActive(student);
    const account = gearProfile(studentId, snapshot.data());
    assertWallet(account);
    if (account.refundCount >= GEAR_REFUND_LIMIT) throw new Error('Você já usou os três reembolsos disponíveis.');
    if (!account.owned.includes(itemId) || !account.refundableItems.includes(itemId) || account.spent < item.price) throw new Error('Este item não tem uma compra disponível para reembolso.');
    const count = account.refundCount + 1;
    const receiptRef = store.doc(db, 'studentGearRefunds', `${studentId}__${count}`);
    if ((await transaction.get(receiptRef)).exists()) throw new Error('Este reembolso já foi registrado. Atualize a carteira.');
    const equipped = { ...account.equipped, ...(account.equipped[item.category] === itemId ? { [item.category]: DEFAULT_GEAR_EQUIPMENT[item.category] } : {}) };
    const updatedAt = new Date().toISOString();
    const next = { ...account, balance: account.balance + item.price, spent: account.spent - item.price, owned: account.owned.filter((id) => id !== itemId), refundableItems: account.refundableItems.filter((id) => id !== itemId), refundCount: count, equipped, updatedAt, lastAction: { type: 'refund', id: itemId, coins: item.price } };
    transaction.set(accountRef, next);
    transaction.update(studentRef, { gearAppearance: equipped });
    transaction.set(receiptRef, { studentId: String(studentId), itemId, coins: item.price, number: count, createdAt: updatedAt });
    return next;
  });
}

export async function resetGearPurchases({ db, user, studentId, keepItems, store = adapter }) {
  if (user?.type !== 'admin') throw new Error('Somente o técnico pode restaurar as compras antigas.');
  if (typeof keepItems !== 'boolean' || !studentId || String(studentId).includes('/')) throw new Error('Confira o aluno e como os itens serão restaurados.');
  return store.runTransaction(db, async (transaction) => {
    const accountRef = store.doc(db, 'studentGearProfiles', String(studentId));
    const studentRef = store.doc(db, 'students', String(studentId));
    const receiptRef = store.doc(db, 'gearPurchaseResets', `v1__${studentId}`);
    const [snapshot, student, receipt] = await Promise.all([transaction.get(accountRef), transaction.get(studentRef), transaction.get(receiptRef)]);
    if (receipt.exists()) return { coins: 0, duplicate: true };
    if (!snapshot.exists() || !student.exists()) throw new Error('A carteira ou o aluno não foi encontrado.');
    const account = gearProfile(studentId, snapshot.data());
    assertWallet(account);
    if (!account.spent) return { coins: 0, duplicate: true };
    const coins = account.spent;
    const equipped = keepItems ? account.equipped : { ...DEFAULT_GEAR_EQUIPMENT };
    const updatedAt = new Date().toISOString();
    const next = { ...account, balance: account.balance + coins, spent: 0, owned: keepItems ? account.owned : Object.values(DEFAULT_GEAR_EQUIPMENT), refundableItems: [], equipped, updatedAt, lastAction: { type: 'purchase_reset', id: `v1__${studentId}`, coins } };
    transaction.set(accountRef, next);
    transaction.update(studentRef, { gearAppearance: equipped });
    transaction.set(receiptRef, { studentId: String(studentId), coins, keepItems, previousOwned: account.owned, previousEquipped: account.equipped, createdAt: updatedAt });
    return { coins, duplicate: false };
  });
}

import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { DEFAULT_GEAR_EQUIPMENT, gearProfile } from '../src/utils/gearShop.js';
import { purchaseGearItem, refundGearItem, resetGearPurchases } from '../src/services/gearShop.js';
import { attachmentRoundIds, attachmentRoundNames, attachmentsByRound } from '../src/utils/attachmentRounds.js';

export async function runGearRefundsTests() {
  const initial = { ...gearProfile('a'), balance: 500, earned: 500, growthPoints: 200 };
  const memory = memoryStore({ 'students/a': { name: 'A', xp: 125, status: 'active' }, 'students/b': { name: 'B', xp: 60 }, 'studentGearProfiles/a': initial });
  const context = { db: {}, user: { type: 'student', studentId: 'a' }, studentId: 'a', store: memory.store };
  for (let index = 1; index <= 3; index++) {
    const bought = await purchaseGearItem({ ...context, itemId: 'skin-solar' });
    assert.ok(bought.refundableItems.includes('skin-solar'));
    const refunded = await refundGearItem({ ...context, itemId: 'skin-solar' });
    assert.equal(refunded.refundCount, index);
    assert.equal(refunded.balance, 500); assert.equal(refunded.spent, 0); assert.equal(refunded.earned, 500);
    assert.equal(refunded.growthPoints, 200);
    assert.equal(refunded.equipped.skin, DEFAULT_GEAR_EQUIPMENT.skin);
    assert.equal(refunded.owned.includes('skin-solar'), false);
    assert.equal(refunded.refundableItems.includes('skin-solar'), false);
    assert.equal(memory.records.get('students/a').xp, 125);
    assert.equal(memory.records.get(`studentGearRefunds/a__${index}`).coins, 25);
    await assert.rejects(refundGearItem({ ...context, itemId: 'skin-solar' }), /compra disponível|três reembolsos/);
  }
  await purchaseGearItem({ ...context, itemId: 'skin-solar' });
  const beforeFourth = structuredClone([...memory.records]);
  await assert.rejects(refundGearItem({ ...context, itemId: 'skin-solar' }), /três reembolsos/);
  assert.deepEqual([...memory.records], beforeFourth);
  await assert.rejects(refundGearItem({ ...context, itemId: 'skin-nebula' }), /Somente itens comprados/);
  await assert.rejects(refundGearItem({ ...context, studentId: 'b', itemId: 'skin-solar' }), /seu perfil/);
  await assert.rejects(refundGearItem({ ...context, user: { type: 'admin' }, itemId: 'skin-solar' }), /seu perfil/);

  const admin = { ...context, user: { type: 'admin' } };
  const reset = await resetGearPurchases({ ...admin, keepItems: false });
  assert.equal(reset.coins, 25);
  const afterReset = memory.records.get('studentGearProfiles/a');
  assert.equal(afterReset.balance, 500); assert.equal(afterReset.spent, 0);
  assert.equal(afterReset.refundCount, 3, 'The administrative reset does not consume or replenish refund uses');
  assert.equal(afterReset.growthPoints, 200);
  assert.deepEqual(afterReset.owned, Object.values(DEFAULT_GEAR_EQUIPMENT));
  assert.deepEqual(memory.records.get('students/a').gearAppearance, DEFAULT_GEAR_EQUIPMENT);
  assert.deepEqual(memory.records.get('students/b'), { name: 'B', xp: 60 });
  await purchaseGearItem({ ...context, itemId: 'skin-solar' });
  assert.equal((await resetGearPurchases({ ...admin, keepItems: false })).duplicate, true);
  assert.equal(memory.records.get('studentGearProfiles/a').spent, 25, 'Retrying the reset never refunds later purchases');
  await assert.rejects(resetGearPurchases({ ...context, keepItems: false }), /Somente o técnico/);

  const legacy = memoryStore({ 'students/a': { name: 'A', status: 'active', xp: 42 }, 'studentGearProfiles/a': { studentId: 'a', balance: 60, earned: 140, spent: 80, owned: [...Object.values(DEFAULT_GEAR_EQUIPMENT), 'animation-trophy'], equipped: { ...DEFAULT_GEAR_EQUIPMENT, animation: 'animation-trophy' } } });
  const legacyContext = { ...context, store: legacy.store };
  const interrupted = { ...legacy.store, runTransaction: (_db, action) => legacy.store.runTransaction(_db, async (transaction) => { await action(transaction); throw new Error('Network failed'); }) };
  const beforeFailure = structuredClone([...legacy.records]);
  await assert.rejects(refundGearItem({ ...legacyContext, store: interrupted, itemId: 'animation-trophy' }), /Network failed/);
  assert.deepEqual([...legacy.records], beforeFailure, 'A failed refund cannot partially return Gears or remove an item');
  const returned = await refundGearItem({ ...legacyContext, itemId: 'animation-trophy' });
  assert.equal(returned.balance, 140); assert.equal(returned.refundCount, 1);
  assert.equal(returned.equipped.animation, 'animation-default');

  const old = { id: 'old', roundId: 'r1' };
  const multi = { id: 'multi', roundIds: ['r1', 'r2', 'r2'], roundId: 'ignored' };
  assert.deepEqual(attachmentRoundIds(old), ['r1']);
  assert.deepEqual(attachmentRoundIds(multi), ['r1', 'r2']);
  assert.deepEqual(attachmentRoundIds({ roundIds: [], roundId: 'old' }), []);
  const linked = attachmentsByRound([old, multi]);
  assert.deepEqual(linked.r1.map((item) => item.id), ['old', 'multi']);
  assert.deepEqual(linked.r2.map((item) => item.id), ['multi']);
  assert.equal(linked.ignored, undefined);
  assert.equal(attachmentRoundNames(multi, [{ id: 'r1', name: 'Saída 1' }, { id: 'r2', name: 'Saída 2' }]), 'Saída 1, Saída 2');
  assert.equal(attachmentsByRound([{ roundIds: ['__proto__'] }]).__proto__.length, 1, 'Grouping cannot modify object prototypes');
}

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { memoryStore } from './teamProcesses.test.js';
import { equipGearItem, purchaseGearItem, rewardGearContribution } from '../src/services/gearShop.js';
import { DEFAULT_GEAR_EQUIPMENT, GEAR_SHOP_COLLECTIONS, GEAR_SHOP_ITEMS, gearCollectionItems, gearItem, gearProfile, resolveGearEquipment } from '../src/utils/gearShop.js';
import { completedGearCollections, gearCollectionProgress } from '../src/utils/gearCollections.js';
import { buildWorkshopInteraction, workshopResidentPosition } from '../src/utils/gearWorkshopInteractions.js';
import { resolveGearWorkshop } from '../src/utils/gearWorkshop.js';

export async function runGearStudioTests() {
  const legacy = { studentId: 'a', balance: 500, earned: 525, spent: 25, growthPoints: 180, contributionCounts: { code: 15 }, rewardDay: '2026-10-28', rewardDayIndex: 20754, dayEarned: 12, dayCounts: { code: 1 }, owned: ['skin-nebula', 'frame-none', 'accessory-none', 'title-team', 'skin-solar'], equipped: { skin: 'skin-solar', frame: 'frame-none', accessory: 'accessory-none', title: 'title-team' } };
  const original = structuredClone(legacy);
  const resolved = gearProfile('a', legacy);
  assert.deepEqual(legacy, original, 'Viewing a legacy wallet must not mutate it');
  for (const key of ['balance', 'earned', 'spent', 'growthPoints', 'contributionCounts']) assert.deepEqual(resolved[key], legacy[key]);
  assert.equal(resolved.equipped.skin, 'skin-solar', 'Existing purchases and appearance survive the expansion');
  for (const category of ['room', 'bench', 'light', 'decor', 'animation']) {
    const id = DEFAULT_GEAR_EQUIPMENT[category];
    assert.equal(gearItem(id).price, 0);
    assert.ok(resolved.owned.includes(id), 'Every existing student receives the free starter workshop');
    assert.equal(resolved.equipped[category], id);
  }
  assert.equal(resolveGearEquipment({ room: 'skin-lava', animation: 'missing' }).room, 'room-base');
  assert.equal(resolveGearEquipment({ animation: 'room-orbit' }).animation, 'animation-default');
  assert.equal(gearCollectionItems('missing').length, 0);
  assert.equal(GEAR_SHOP_COLLECTIONS.length, 6);
  for (const collection of GEAR_SHOP_COLLECTIONS) {
    assert.equal(gearCollectionItems(collection.id).length, Object.keys(DEFAULT_GEAR_EQUIPMENT).length);
    for (const [category, id] of Object.entries(collection.equipment)) assert.equal(gearItem(id)?.category, category, `${collection.name} contains a valid ${category}`);
    const owned = [...Object.values(DEFAULT_GEAR_EQUIPMENT), ...Object.values(collection.equipment)];
    const before = structuredClone(owned);
    const progress = gearCollectionProgress(collection.id, owned);
    assert.ok(progress.reward?.name && progress.reward?.description, 'Every collection needs a usable workshop reward and card');
    assert.equal(progress.complete, true, 'Past purchases unlock the collection without a claim or an extra purchase');
    assert.equal(progress.count, 9);
    assert.equal(completedGearCollections(owned).some((entry) => entry.id === collection.id), true);
    const paidItem = progress.items.find((item) => item.price > 0);
    const incomplete = owned.filter((id) => id !== paidItem.id);
    assert.equal(gearCollectionProgress(collection.id, [...incomplete, ...incomplete, 'missing']).complete, false, 'Duplicates and unknown items cannot replace a missing purchase');
    assert.deepEqual(buildWorkshopInteraction({ action: 'collection', collectionId: collection.id, equipment: collection.equipment, owned: incomplete }), [], 'Trying on a full set does not unlock its reward');
    const steps = buildWorkshopInteraction({ action: 'collection', collectionId: collection.id, equipment: collection.equipment, owned });
    assert.equal(steps.length > 2, true);
    assert.equal(steps.every((step) => step.collectionId === collection.id && step.duration > 0), true);
    assert.equal(steps.at(-1).target, 'home', 'Every collection performance returns to the saved position');
    assert.equal(steps.reduce((sum, step) => sum + step.duration, 0) < 15000, true, 'Performances must be short and finite');
    assert.deepEqual(owned, before, 'Playing a reward never changes inventory');
  }
  assert.equal(gearCollectionProgress('missing', GEAR_SHOP_ITEMS.map((item) => item.id)).complete, false);
  const layout = resolveGearWorkshop({ layout: { bench: { x: 640, y: 345 }, decor: { x: 130, y: 290 }, light: { x: 250, y: 45 }, giro: { x: 440, y: 330 } } }).layout;
  assert.deepEqual(workshopResidentPosition('bench', layout), { x: 545, y: 350 });
  assert.deepEqual(workshopResidentPosition('decor', layout), { x: 215, y: 350 });
  assert.deepEqual(workshopResidentPosition('light', layout), { x: 250, y: 310 });
  assert.deepEqual(workshopResidentPosition('home', layout), layout.giro);
  const lightSequence = buildWorkshopInteraction({ action: 'light', lightOn: true });
  assert.equal(lightSequence[0].action, 'walk');
  assert.equal(lightSequence[0].lightOn, undefined, 'The light stays on until Giro reaches its switch');
  assert.equal(lightSequence[1].lightOn, false);
  assert.equal(buildWorkshopInteraction({ action: 'light', lightOn: false })[1].lightOn, true);
  assert.equal(buildWorkshopInteraction({ action: 'accessory', equipment: { accessory: 'accessory-headphones' } })[0].effect, 'music');
  assert.equal(buildWorkshopInteraction({ action: 'accessory', equipment: { accessory: 'accessory-visor' } })[0].effect, 'scan');
  assert.deepEqual(buildWorkshopInteraction({ action: 'unknown' }), []);

  const spaceItems = gearCollectionItems('space').map((item) => item.id);
  const lastItem = 'accessory-helmet';
  const completionMemory = memoryStore({ 'students/collector': { name: 'Colecionador', xp: 123, status: 'active' }, 'studentGearProfiles/collector': gearProfile('collector', { balance: 1000, earned: 1000, spent: 0, owned: spaceItems.filter((id) => id !== lastItem) }) });
  assert.equal(gearCollectionProgress('space', completionMemory.records.get('studentGearProfiles/collector').owned).complete, false);
  const completedAccount = await purchaseGearItem({ db: {}, user: { type: 'student', studentId: 'collector' }, studentId: 'collector', itemId: lastItem, store: completionMemory.store });
  assert.equal(gearCollectionProgress('space', completedAccount.owned).complete, true, 'Buying the final piece immediately unlocks the collection');
  assert.equal(completedAccount.balance, 1000 - gearItem(lastItem).price, 'Only the catalog price is charged, with no collection fee');
  const completedSnapshot = structuredClone([...completionMemory.records]);
  const reloadedAccount = gearProfile('collector', completionMemory.records.get('studentGearProfiles/collector'));
  assert.equal(completedGearCollections(reloadedAccount.owned).some((entry) => entry.id === 'space'), true);
  buildWorkshopInteraction({ action: 'collection', collectionId: 'space', equipment: reloadedAccount.equipped, owned: reloadedAccount.owned });
  assert.deepEqual([...completionMemory.records], completedSnapshot, 'Replaying a collection performance never writes to the wallet or XP');

  const memory = memoryStore({ 'students/a': { name: 'Ana', xp: 321, status: 'active' }, 'studentGearProfiles/a': legacy, 'codeSnippets/c1': { title: 'Teste com sensores', createdByStudentId: 'a' } });
  const context = { db: {}, user: { type: 'student', studentId: 'a' }, studentId: 'a', store: memory.store };
  let totalSpent = 0;
  for (const itemId of ['room-orbit', 'bench-holo', 'light-neon', 'decor-planet', 'animation-gears', 'accessory-helmet']) {
    const before = gearProfile('a', memory.records.get('studentGearProfiles/a'));
    const item = gearItem(itemId);
    const purchased = await purchaseGearItem({ ...context, itemId });
    totalSpent += item.price;
    assert.equal(purchased.balance, 500 - totalSpent);
    assert.equal(purchased.spent, 25 + totalSpent);
    assert.equal(purchased.earned, 525);
    assert.deepEqual(purchased.equipped, { ...before.equipped, [item.category]: itemId }, 'Only the chosen slot changes');
    assert.deepEqual(memory.records.get('students/a').gearAppearance, purchased.equipped);
    assert.equal(memory.records.get('students/a').xp, 321);
    assert.equal(purchased.growthPoints, 180);
    const after = structuredClone([...memory.records]);
    await assert.rejects(purchaseGearItem({ ...context, itemId }), /já tem/);
    assert.deepEqual([...memory.records], after, 'A repeated purchase never debits Gears twice');
  }
  const reward = await rewardGearContribution({ ...context, type: 'code', sourceId: 'c1' });
  assert.equal(reward.animationId, 'animation-gears', 'Only a confirmed reward carries the equipped celebration');
  assert.equal((await rewardGearContribution({ ...context, type: 'code', sourceId: 'c1' })).animationId, undefined, 'Repeated rewards never trigger another celebration');
  const beforeEquip = gearProfile('a', memory.records.get('studentGearProfiles/a'));
  for (const itemId of ['room-base', 'bench-base', 'light-base', 'decor-base', 'animation-default']) await equipGearItem({ ...context, itemId });
  assert.equal(memory.records.get('studentGearProfiles/a').balance, beforeEquip.balance, 'Reequipping starter items is free');
  await assert.rejects(equipGearItem({ ...context, itemId: 'animation-trophy' }), /Desbloqueie/);
  await assert.rejects(purchaseGearItem({ ...context, studentId: 'b', itemId: 'room-arena' }), /seu perfil/);
  await assert.rejects(purchaseGearItem({ ...context, user: { type: 'admin' }, itemId: 'room-arena' }), /seu perfil/);
  const beforeFailure = structuredClone([...memory.records]);
  const interrupted = { ...memory.store, runTransaction: (_db, action) => memory.store.runTransaction(_db, async (transaction) => { await action(transaction); throw new Error('Network failed'); }) };
  await assert.rejects(purchaseGearItem({ ...context, store: interrupted, itemId: 'room-neon' }), /Network/);
  assert.deepEqual([...memory.records], beforeFailure, 'An interrupted workshop purchase cannot partially debit or equip');
  const wallet = memory.records.get('studentGearProfiles/a');
  wallet.balance = 0; wallet.earned = wallet.spent;
  await assert.rejects(purchaseGearItem({ ...context, itemId: 'animation-trophy' }), /suficientes/);

  const rules = await readFile(new URL('../firestore.weekly-reports.rules', import.meta.url), 'utf8');
  const priceTable = rules.slice(rules.indexOf('function gearPrice'), rules.indexOf('function gearCategory'));
  const prices = Object.fromEntries([...priceTable.matchAll(/'([^']+)': (\d+)/g)].map(([, id, price]) => [id, Number(price)]));
  assert.deepEqual(prices, Object.fromEntries(GEAR_SHOP_ITEMS.map(({ id, price }) => [id, price])), 'Client prices must match the security rules catalog');
  assert.ok(rules.includes(`data.owned.size() <= ${GEAR_SHOP_ITEMS.length}`));
}

import assert from 'node:assert/strict';
import { wishlistIds, wishlistKey, wishlistProgress, tryOnEquipment } from '../src/utils/shopWishlist.js';
import { gearProfile, GEAR_SHOP_COLLECTIONS, gearCollectionItems } from '../src/utils/gearShop.js';

export async function runShopExperienceTests() {
  const user = { type: 'student', studentId: 'a', name: 'Ana' };
  assert.notEqual(wishlistKey(user), wishlistKey({ ...user, studentId: 'b' }));
  assert.equal(wishlistKey(user), wishlistKey({ ...user, name: 'Nome atualizado' }));
  assert.deepEqual(wishlistIds(['skin-solar', null, 'skin-solar', 'missing', 'skin-nebula']), ['skin-solar']);
  const account = gearProfile('a'); const before = structuredClone(account);
  const outfit = tryOnEquipment(account.equipped, { skin: 'skin-plasma', frame: 'frame-circuit', accessory: 'accessory-pilot' });
  assert.equal(outfit.skin, 'skin-plasma'); assert.equal(outfit.frame, 'frame-circuit'); assert.equal(outfit.accessory, 'accessory-pilot');
  assert.equal(tryOnEquipment(account.equipped, { skin: 'frame-circuit' }).skin, account.equipped.skin, 'wrong categories cannot enter an outfit');
  assert.deepEqual(account, before, 'a preview must not change equipment, ownership, refunds or balances');
  const desired = wishlistProgress(['skin-solar', 'accessory-crown'], account);
  assert.equal(desired.pending.length, 2); assert.ok(desired.total > 25); assert.equal(desired.missing, Math.max(0, desired.total - 40));
  assert.equal(wishlistProgress(['skin-solar'], { ...account, owned: [...account.owned, 'skin-solar'] }).pending.length, 0);
  assert.equal(wishlistProgress(['skin-plasma'], { ...account, balance: 500 }).percent, 100);
  for (const collection of GEAR_SHOP_COLLECTIONS) {
    const preview = tryOnEquipment(account.equipped, collection.equipment);
    assert.deepEqual(preview, collection.equipment);
    assert.ok(gearCollectionItems(collection.id).length >= 9);
  }
}

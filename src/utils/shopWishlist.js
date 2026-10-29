import { applyGearItem, GEAR_SHOP_ITEMS, gearItem, resolveGearEquipment } from './gearShop.js';

export const wishlistKey = (user) => {
  const id = user?.type === 'student' ? user.studentId || user.data?.id : user?.uid || user?.email || user?.name;
  return id ? `newgears_wishlist_v1:${encodeURIComponent(JSON.stringify([user.type, String(id)]))}` : null;
};

export const wishlistIds = (values) => [...new Set((Array.isArray(values) ? values : [])
  .filter((id) => typeof id === 'string' && gearItem(id)?.price > 0))].slice(0, GEAR_SHOP_ITEMS.length);

export function wishlistProgress(ids, account) {
  const items = wishlistIds(ids).map(gearItem);
  const pending = items.filter((item) => !account.owned.includes(item.id));
  const total = pending.reduce((sum, item) => sum + item.price, 0);
  const balance = Math.max(0, Number(account.balance) || 0);
  return { items, pending, total, missing: Math.max(0, total - balance), percent: total ? Math.min(100, Math.floor(balance / total * 100)) : 100 };
}

export const tryOnEquipment = (equipped, changes) => {
  const { accessory, accessories, ...other } = changes;
  const next = resolveGearEquipment({ ...equipped, ...other });
  if (Object.hasOwn(changes, 'accessories')) return resolveGearEquipment({ ...next, accessories });
  return Object.hasOwn(changes, 'accessory') ? applyGearItem(next, accessory) : next;
};

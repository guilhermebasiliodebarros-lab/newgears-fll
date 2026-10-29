import { applyGearItem, GEAR_SHOP_ITEMS, gearItem, gearProfile } from './gearShop.js';
import { GEAR_LEVELS } from './gearEvolution.js';
import { resolveGearWorkshop } from './gearWorkshop.js';

export const technicianGiroKey = (user, seasonId) => user?.type === 'admin'
  ? `newgears_technician_giro_v1:${encodeURIComponent(JSON.stringify([user.uid || user.name || 'tecnico', seasonId]))}` : null;

export function technicianGiroState(user, stored = {}) {
  if (user?.type !== 'admin') throw new Error('O teste com Gears ilimitados é exclusivo do técnico.');
  return {
    account: { ...gearProfile('', { equipped: stored?.equipment }), balance: Number.MAX_SAFE_INTEGER, owned: GEAR_SHOP_ITEMS.map((item) => item.id), growthPoints: GEAR_LEVELS.at(-1).minimum },
    workshop: resolveGearWorkshop(stored?.workshop),
  };
}

export function readTechnicianGiro(storage, user, seasonId) {
  const key = technicianGiroKey(user, seasonId);
  if (!key) return null;
  try { return technicianGiroState(user, JSON.parse(storage.getItem(key)) || {}); }
  catch { return technicianGiroState(user); }
}

export function equipTechnicianGiro(user, state, itemId) {
  const item = gearItem(itemId);
  if (!item) throw new Error('Escolha um item válido da loja.');
  return technicianGiroState(user, { equipment: applyGearItem(state.account.equipped, item.id, { toggle: true }), workshop: state.workshop });
}

export function saveTechnicianGiro(storage, user, seasonId, state) {
  const clean = technicianGiroState(user, { equipment: state.account.equipped, workshop: state.workshop });
  storage.setItem(technicianGiroKey(user, seasonId), JSON.stringify({ equipment: clean.account.equipped, workshop: clean.workshop }));
}

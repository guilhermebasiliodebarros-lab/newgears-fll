import { GEAR_SHOP_COLLECTIONS, gearCollectionItems } from './gearShop.js';

export const GEAR_COLLECTION_REWARDS = {
  mechanic: { name: 'Invenção na forja', description: 'O Giro monta uma invenção, liga a projeção da bancada e celebra entre faíscas.' },
  space: { name: 'Missão gravidade zero', description: 'O Giro investiga a decoração e faz uma descoberta entre órbitas e estrelas.' },
  neon: { name: 'Show de circuitos', description: 'A oficina vira um palco com equalizador, luzes e os passos do Giro.' },
  tournament: { name: 'Volta da cooperação', description: 'O Giro busca o troféu e faz uma homenagem ao trabalho da equipe.' },
  racing: { name: 'Largada do Giro', description: 'Preparação na bancada, bandeira quadriculada e uma corrida pela oficina.' },
};

export const gearCollectionProgress = (collectionId, owned = []) => {
  const collection = GEAR_SHOP_COLLECTIONS.find((entry) => entry.id === collectionId);
  const items = gearCollectionItems(collectionId);
  const inventory = new Set(Array.isArray(owned) ? owned : []);
  const missing = items.filter((item) => !inventory.has(item.id));
  return { collection, items, missing, count: items.length - missing.length, complete: items.length > 0 && missing.length === 0, reward: GEAR_COLLECTION_REWARDS[collectionId] };
};

// Ownership is already persisted by the wallet. Unlocks also work for past purchases.
export const completedGearCollections = (owned) => GEAR_SHOP_COLLECTIONS.filter((entry) => gearCollectionProgress(entry.id, owned).complete);

export const favoritesStorageKey = (accountKey) => `newgears_workspace_favorites_v1:${encodeURIComponent(accountKey)}`;
export const normalizeFavorites = (value) => Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string' && /^[a-z_]+$/.test(id)))].slice(0, 40) : [];
export const readWorkspaceFavorites = (storage, accountKey) => {
  try { return normalizeFavorites(JSON.parse(storage.getItem(favoritesStorageKey(accountKey)))); } catch { return []; }
};
export const saveWorkspaceFavorites = (storage, accountKey, ids) => storage.setItem(favoritesStorageKey(accountKey), JSON.stringify(normalizeFavorites(ids)));

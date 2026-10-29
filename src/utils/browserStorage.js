// Browser preferences must not prevent the app from rendering when storage is blocked/full.
export function createBrowserStorage(resolveStorage, onFailure = () => {}) {
  const memory = new Map();
  return {
    getItem(key) {
      if (memory.has(key)) return memory.get(key);
      try { return resolveStorage().getItem(key); }
      catch { onFailure(); return null; }
    },
    setItem(key, value) {
      const serialized = String(value);
      try { resolveStorage().setItem(key, serialized); memory.delete(key); }
      catch { memory.set(key, serialized); onFailure(); }
    },
    removeItem(key) {
      try { resolveStorage().removeItem(key); memory.delete(key); }
      catch { memory.set(key, null); onFailure(); }
    },
  };
}

let unavailable = false;
const listeners = new Set();
export const browserStorage = createBrowserStorage(() => window.localStorage, () => {
  if (unavailable) return;
  unavailable = true;
  // A preference may be read during React rendering; notify subscribers afterwards.
  queueMicrotask(() => listeners.forEach((notify) => notify()));
});
export const subscribeStorageStatus = (notify) => { listeners.add(notify); return () => listeners.delete(notify); };
export const isStorageUnavailable = () => unavailable;

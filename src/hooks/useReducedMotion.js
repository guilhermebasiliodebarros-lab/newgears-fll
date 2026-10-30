import { useSyncExternalStore } from 'react';

const preference = () => window.matchMedia('(prefers-reduced-motion: reduce)');
const subscribe = (notify) => {
  const query = preference(); query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};

export default function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => preference().matches, () => true);
}

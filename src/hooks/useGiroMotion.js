import { useEffect, useState, useSyncExternalStore } from 'react';

const listeners = new Set();
const notify = () => listeners.forEach((callback) => callback());
const subscribe = (callback) => {
  if (!listeners.size) document.addEventListener('visibilitychange', notify);
  listeners.add(callback);
  return () => { listeners.delete(callback); if (!listeners.size) document.removeEventListener('visibilitychange', notify); };
};
const visible = () => document.visibilityState !== 'hidden';
const observed = new Map();
let observer;

// One observer and one document listener for every Giro, including shop previews.
export default function useGiroMotion(ref, still) {
  const documentVisible = useSyncExternalStore(subscribe, visible);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    if (still || !('IntersectionObserver' in window)) return;
    if (!observer) observer = new IntersectionObserver((entries) => entries.forEach((entry) => observed.get(entry.target)?.(entry.isIntersecting)), { rootMargin: '40px' });
    const node = ref.current;
    if (!node) return;
    observed.set(node, setOnScreen); observer.observe(node);
    return () => { observer.unobserve(node); observed.delete(node); if (!observed.size) { observer.disconnect(); observer = null; } };
  }, [ref, still]);
  return still || !onScreen || !documentVisible;
}

import { useEffect, useRef, useState } from 'react';
import { giroProgressReaction, giroProgressSnapshot } from '../utils/giroCompanion';
import { browserStorage } from '../utils/browserStorage';

export default function useGiroLife({ student, technical, tasks, scope }) {
  const preference = `newgears_giro_quiet_v1:${encodeURIComponent(scope || 'local')}`;
  const [quiet, setQuiet] = useState(() => browserStorage.getItem(preference) === 'true');
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden');
  const [greeting, setGreeting] = useState(true);
  const [notice, setNotice] = useState(null);
  const previous = useRef(null);
  const lastNotice = useRef(-Infinity);
  useEffect(() => {
    const change = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', change);
    const timer = setTimeout(() => setGreeting(false), 2600);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', change); };
  }, []);
  useEffect(() => {
    const next = giroProgressSnapshot({ student, technical, tasks });
    const reaction = giroProgressReaction(previous.current, next);
    previous.current = next;
    if (!reaction || quiet || document.visibilityState === 'hidden' || document.querySelector('[role="dialog"][aria-modal="true"],dialog[open]')) return;
    const now = Date.now();
    // Coalesce updates in a short burst; never queue a parade of old notifications.
    if (now - lastNotice.current < 12000) return;
    lastNotice.current = now;
    setNotice({ ...reaction, id: now });
  }, [student, technical, tasks, quiet]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6500);
    return () => clearTimeout(timer);
  }, [notice]);
  return { quiet, visible, greeting: greeting && visible && !quiet, notice: quiet || !visible ? null : notice,
    dismissNotice: () => setNotice(null),
    toggleQuiet: () => { const next = !quiet; setQuiet(next); browserStorage.setItem(preference, String(next)); setNotice(null); },
  };
}

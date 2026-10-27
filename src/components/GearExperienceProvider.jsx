import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { GearShopContext } from '../hooks/useGearShopContext';
import { equipGearItem, gearShopError, purchaseGearItem, rewardGearContribution } from '../services/gearShop';
import { GEAR_CONTRIBUTIONS, GEAR_CONTRIBUTION_EVENT, gearProfile } from '../utils/gearShop';

const readPending = (key) => {
  try {
    const items = JSON.parse(localStorage.getItem(key));
    return Array.isArray(items) ? items.filter((item) => GEAR_CONTRIBUTIONS[item?.type] && typeof item.sourceId === 'string').slice(-100) : [];
  } catch { return []; }
};

export default function GearExperienceProvider({ children, db, user, student, onOpenShop, isLiteMode }) {
  const studentId = user?.type === 'student' ? String(user.studentId || user.data?.id || student?.id || '') : '';
  const storageKey = `newgears_pending_gears_v1:${studentId}`;
  const [wallet, setWallet] = useState({ loading: Boolean(studentId), error: '', profile: gearProfile(studentId) });
  const [retryCount, setRetryCount] = useState(0);
  const [pending, setPending] = useState(() => studentId ? readPending(storageKey) : []);
  const queueRef = useRef(pending);
  const [reaction, setReaction] = useState(null);
  const sequence = useRef(0);
  const [busy, setBusy] = useState('');
  const [operationError, setOperationError] = useState('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!studentId || !db) return;
    return onSnapshot(doc(db, 'studentGearProfiles', studentId), (snapshot) => {
      setWallet({ loading: false, error: '', profile: gearProfile(studentId, snapshot.exists() ? snapshot.data() : null) });
    }, (error) => setWallet((current) => ({ ...current, loading: false, error: gearShopError(error) })));
  }, [db, studentId, retryCount]);

  const updateQueue = useCallback((updater) => {
    const next = updater(queueRef.current).slice(-100);
    queueRef.current = next;
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep the retry available during this session. */ }
    setPending(next);
  }, [storageKey]);

  const reward = useCallback(async (contribution) => {
    if (!studentId || String(contribution.studentId) !== studentId || !GEAR_CONTRIBUTIONS[contribution.type]) return;
    const id = `${contribution.type}:${contribution.sourceId}`;
    updateQueue((current) => current.some((item) => `${item.type}:${item.sourceId}` === id) ? current : [...current, { type: contribution.type, sourceId: contribution.sourceId, studentId }]);
    const reactionId = ++sequence.current;
    const rule = GEAR_CONTRIBUTIONS[contribution.type];
    setReaction({ id: reactionId, mood: 'celebrate', title: 'Mais uma engrenagem em movimento!', message: rule.message, status: 'pending', coins: 0 });
    try {
      const result = await rewardGearContribution({ db, user, studentId, type: contribution.type, sourceId: contribution.sourceId });
      updateQueue((current) => current.filter((item) => `${item.type}:${item.sourceId}` !== id));
      setReaction((current) => current?.id === reactionId ? { ...current, status: result.capped ? 'capped' : result.duplicate ? 'duplicate' : 'earned', coins: result.coins } : current);
    } catch (error) {
      setReaction((current) => current?.id === reactionId ? { ...current, status: 'retry', detail: gearShopError(error) } : current);
    }
  }, [db, user, studentId, updateQueue]);

  useEffect(() => {
    const handle = (event) => { void reward(event.detail || {}); };
    window.addEventListener(GEAR_CONTRIBUTION_EVENT, handle);
    return () => window.removeEventListener(GEAR_CONTRIBUTION_EVENT, handle);
  }, [reward]);

  const retryPending = async () => {
    if (retrying) return;
    setRetrying(true);
    try { for (const item of [...queueRef.current]) await reward(item); }
    finally { setRetrying(false); }
  };
  const activateItem = async (itemId, purchase) => {
    if (busy || !studentId || wallet.loading || wallet.error) return false;
    setBusy(itemId); setOperationError('');
    try {
      const action = purchase ? purchaseGearItem : equipGearItem;
      await action({ db, user, studentId, itemId });
      setReaction({ id: ++sequence.current, mood: 'celebrate', title: purchase ? 'Novo visual desbloqueado!' : 'Visual equipado!', message: 'Seu Giro ficou com a sua cara. Vamos continuar construindo juntos?', status: 'style', coins: 0 });
      return true;
    } catch (error) { setOperationError(gearShopError(error)); return false; }
    finally { setBusy(''); }
  };

  return <GearShopContext.Provider value={{ account: wallet.profile, loading: wallet.loading, walletError: wallet.error, reloadWallet: () => setRetryCount((value) => value + 1), student, isStudent: Boolean(studentId), isLiteMode, pending, retrying, retryPending, reaction, busy, operationError, activateItem, onOpenShop }}>{children}</GearShopContext.Provider>;
}

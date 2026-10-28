import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { GearShopContext } from '../hooks/useGearShopContext';
import { equipGearItem, gearShopError, purchaseGearItem, rewardGearContribution } from '../services/gearShop';
import { GEAR_CONTRIBUTIONS, GEAR_CONTRIBUTION_EVENT, gearProfile } from '../utils/gearShop';
import { gearContributionTip, gearEvolution } from '../utils/gearEvolution';
import { getGearHistoryStatus, reconcileGearHistory } from '../services/gearHistory';
import { saveGearWorkshop } from '../services/gearWorkshop';
import { resolveGearWorkshop } from '../utils/gearWorkshop';
import { sanitizeGiroContext } from '../utils/giroAI';
import useGiroKnowledge from '../hooks/useGiroKnowledge';

const readPending = (key) => {
  try {
    const items = JSON.parse(localStorage.getItem(key));
    return Array.isArray(items) ? items.filter((item) => GEAR_CONTRIBUTIONS[item?.type] && typeof item.sourceId === 'string').slice(-100) : [];
  } catch { return []; }
};

export default function GearExperienceProvider({ children, db, user, student, teamMembers = [], seasonId = 'legacy', onOpenShop, onOpenKnowledge, isLiteMode, aiContext = {} }) {
  const technicalContext = useMemo(() => sanitizeGiroContext(aiContext), [aiContext]);
  const knowledge = useGiroKnowledge({ db, seasonId, user, context: technicalContext });
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
  const [history, setHistory] = useState({ loading: false, error: '', summary: null });
  const historyRunning = useRef(false);
  const draftScope = JSON.stringify([user?.type, studentId || user?.uid || user?.name || 'tecnico', seasonId]);
  const evolution = gearEvolution(wallet.profile);
  const [workshopState, setWorkshopState] = useState(() => ({ loading: Boolean(studentId), error: '', data: resolveGearWorkshop(student?.gearWorkshop) }));
  const [workshopSaving, setWorkshopSaving] = useState(false);
  const workshopSaveRunning = useRef(false);
  useEffect(() => {
    if (!studentId || !db) return;
    return onSnapshot(doc(db, 'students', studentId), (snapshot) => {
      setWorkshopState({ loading: false, error: '', data: resolveGearWorkshop(snapshot.data()?.gearWorkshop) });
    }, (error) => setWorkshopState((current) => ({ ...current, loading: false, error: gearShopError(error) })));
  }, [db, studentId, retryCount]);
  const saveWorkshop = async (configuration) => {
    if (!studentId || workshopState.loading || workshopSaveRunning.current) return false;
    workshopSaveRunning.current = true; setWorkshopSaving(true);
    setWorkshopState((current) => ({ ...current, error: '' }));
    try {
      const data = await saveGearWorkshop({ db, user, ...configuration });
      setWorkshopState({ loading: false, error: '', data });
      return true;
    } catch (error) { setWorkshopState((current) => ({ ...current, error: gearShopError(error) })); return false; }
    finally { workshopSaveRunning.current = false; setWorkshopSaving(false); }
  };

  const syncHistory = useCallback(async () => {
    if (user?.type !== 'admin' || historyRunning.current || !db) return;
    historyRunning.current = true;
    setHistory((current) => ({ ...current, loading: true, error: '' }));
    try {
      const summary = await reconcileGearHistory({ db, user, onProgress: (summary) => setHistory({ loading: true, error: '', summary }) });
      setHistory({ loading: false, error: '', summary });
    } catch (error) { setHistory((current) => ({ ...current, loading: false, error: gearShopError(error) })); }
    finally { historyRunning.current = false; }
  }, [db, user]);

  useEffect(() => {
    if (user?.type !== 'admin' || !db) return;
    let active = true;
    getGearHistoryStatus({ db }).then((snapshot) => {
      if (!active) return;
      if (snapshot.exists()) setHistory({ loading: false, error: '', summary: snapshot.data() });
    }).catch((error) => { if (active) setHistory((current) => ({ ...current, error: gearShopError(error) })); });
    return () => { active = false; };
  }, [db, user?.type]);

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
    setReaction({ id: reactionId, mood: 'celebrate', title: 'Mais uma engrenagem em movimento!', message: rule.message, tip: gearContributionTip(contribution.type, contribution.record), status: 'pending', coins: 0 });
    try {
      const result = await rewardGearContribution({ db, user, studentId, type: contribution.type, sourceId: contribution.sourceId });
      updateQueue((current) => current.filter((item) => `${item.type}:${item.sourceId}` !== id));
      setReaction((current) => current?.id === reactionId ? { ...current, ...(result.levelUp ? { title: `Giro evoluiu para ${result.levelUp.name}!`, message: `${rule.message} Você desbloqueou: ${result.levelUp.unlock.toLowerCase()}.` } : {}), status: result.duplicate ? 'duplicate' : 'earned', coins: result.coins, animationId: result.animationId } : current);
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
      const next = await action({ db, user, studentId, itemId });
      setReaction({ id: ++sequence.current, mood: 'celebrate', title: purchase ? 'Novo item desbloqueado!' : 'Personalização equipada!', message: 'Seu Giro ficou com a sua cara. Vamos continuar construindo juntos?', status: 'style', coins: 0, animationId: next.equipped.animation });
      return true;
    } catch (error) { setOperationError(gearShopError(error)); return false; }
    finally { setBusy(''); }
  };

  return <GearShopContext.Provider value={{ account: wallet.profile, evolution, draftScope, aiContext: technicalContext, knowledge, onOpenKnowledge, history, syncHistory, loading: wallet.loading, walletError: wallet.error, reloadWallet: () => setRetryCount((value) => value + 1), student, isStudent: Boolean(studentId), isLiteMode, pending, retrying, retryPending, reaction, busy, operationError, activateItem, onOpenShop, db, user, teamMembers, workshop: workshopState.data, workshopLoading: workshopState.loading, workshopError: workshopState.error, workshopSaving, saveWorkshop }}>{children}</GearShopContext.Provider>;
}

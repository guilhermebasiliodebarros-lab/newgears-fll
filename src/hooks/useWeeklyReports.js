import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db, FIREBASE_AUTH_ENABLED } from '../firebase';

const EMPTY = { reports: [], readIds: new Set(), recipients: [], error: '', reportsReady: false, readsReady: false, recipientsReady: false };

export default function useWeeklyReports(user) {
  const [snapshotState, setSnapshotState] = useState(EMPTY);
  const [retryCount, setRetryCount] = useState(0);
  const enabled = FIREBASE_AUTH_ENABLED && Boolean(user?.uid);
  const identity = `${user?.uid || ''}:${user?.type || ''}:${retryCount}`;
  const state = enabled && snapshotState.identity === identity ? snapshotState : EMPTY;
  const { reports, readIds, recipients, error } = state;
  const loading = enabled && !error && (!state.reportsReady || !state.readsReady || (user.type === 'admin' && !state.recipientsReady));
  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const update = (partial) => {
      if (active) setSnapshotState((current) => ({ ...(current.identity === identity ? current : EMPTY), identity, ...partial }));
    };
    const fail = () => update({ error: 'Não foi possível carregar os relatórios. Tente novamente; se continuar, peça ao técnico para conferir as permissões do Firestore.' });
    const subscriptions = [
      onSnapshot(query(collection(db, 'weeklyReports'), orderBy('createdAt', 'desc')), (snapshot) => update({ reports: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })), reportsReady: true }), fail),
      onSnapshot(collection(db, 'weeklyReportReads', user.uid, 'reports'), (snapshot) => update({ readIds: new Set(snapshot.docs.map((doc) => doc.id)), readsReady: true }), fail),
    ];
    if (user.type === 'admin') subscriptions.push(onSnapshot(collection(db, 'weeklyReportRecipients'), (snapshot) => update({ recipients: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })), recipientsReady: true }), fail));
    return () => { active = false; subscriptions.forEach((unsubscribe) => unsubscribe()); };
  }, [enabled, identity, user?.uid, user?.type]);
  const unreadReports = useMemo(() => reports.filter((report) => report.userId !== user?.uid && !readIds.has(report.id)), [reports, readIds, user?.uid]);
  const retry = useCallback(() => setRetryCount((value) => value + 1), []);
  return { reports, readIds, recipients, unreadReports, loading, error, retry, enabled };
}

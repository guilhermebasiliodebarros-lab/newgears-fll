import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { normalizeWorkspaceRecord } from '../utils/workspaceRecords';
import { reportClientIssue } from '../services/clientDiagnostics';

const EMPTY = [];

// Keep records attached to the account, season and subscription that produced them.
export default function useTeamRecords({ db, user, studentId, technical, seasonId, enabled = true, attempt = 0, collectionName }) {
  const [snapshot, setSnapshot] = useState({});
  const scope = JSON.stringify([collectionName, user?.uid || user?.studentId || user?.name || '', user?.type, studentId, technical, seasonId, attempt]);
  const active = Boolean(db && user && enabled && (technical || (user.type === 'student' && studentId)));
  const current = active && snapshot.scope === scope ? snapshot : {};
  useEffect(() => {
    if (!active) return undefined;
    let mounted = true;
    const source = collection(db, collectionName);
    const ref = technical ? source : query(source, where('studentId', '==', String(studentId)));
    const unsubscribe = onSnapshot(ref, (result) => {
      if (!mounted) return;
      const records = result.docs.map((item) => normalizeWorkspaceRecord(collectionName, { ...item.data(), id: item.id })).filter((record) => !seasonId || record.seasonId === seasonId);
      setSnapshot({ scope, records, ready: true, error: false });
    }, (error) => {
      if (!mounted) return;
      reportClientIssue(error, { area: collectionName });
      setSnapshot({ scope, records: EMPTY, ready: true, error: true });
    });
    return () => { mounted = false; unsubscribe(); };
  }, [db, active, scope, technical, studentId, seasonId, collectionName]);
  return { records: current.records || EMPTY, loading: active && !current.ready, ready: active && current.ready === true && !current.error, error: current.error || false };
}

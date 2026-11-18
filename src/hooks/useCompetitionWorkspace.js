import { useEffect, useState } from 'react';
import { saveCompetitionWorkspace, subscribeCompetitionWorkspace } from '../services/competitionWorkspace';

export default function useCompetitionWorkspace({ db, user, seasonId }) {
  const [snapshot, setSnapshot] = useState({});
  const [attempt, setAttempt] = useState(0);
  const scope = JSON.stringify([user?.uid || user?.studentId || user?.name, user?.type, seasonId, attempt]);
  const active = Boolean(db && user && seasonId);
  const current = snapshot.scope === scope ? snapshot : {};
  useEffect(() => {
    if (!active) return;
    let mounted = true;
    const unsubscribe = subscribeCompetitionWorkspace({ db, seasonId,
      onData: (record) => { if (mounted) setSnapshot({ scope, record, ready: true, error: null }); },
      onError: (error) => { if (mounted) setSnapshot((previous) => ({ ...(previous.scope === scope ? previous : {}), scope, ready: true, error })); },
    });
    return () => { mounted = false; unsubscribe(); };
  }, [db, seasonId, scope, active]);
  const save = async ({ plan, expectedRevision, mutationId }) => {
    const record = await saveCompetitionWorkspace({ db, user, seasonId, plan, expectedRevision, mutationId });
    setSnapshot((previous) => previous.scope === scope ? { scope, record, ready: true, error: null } : previous);
    return record;
  };
  return { record: current.record || null, loading: active && !current.ready, error: current.error || null, retry: () => setAttempt((value) => value + 1), save };
}

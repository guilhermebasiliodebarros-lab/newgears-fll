import { useCallback, useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { normalizeEvaluationRecords } from '../utils/finalSprintEvaluations';
import { reportClientIssue } from '../services/clientDiagnostics';

const EMPTY = [];

export default function useSeasonEvaluations({ db, user, technical, studentId, seasonId, ready }) {
  const [snapshot, setSnapshot] = useState({});
  const [attempt, setAttempt] = useState(0);
  const scope = JSON.stringify([user?.uid || user?.studentId || user?.name || '', user?.type, technical, studentId, seasonId, attempt]);
  const enabled = Boolean(db && user && ready && (technical || (user.type === 'student' && studentId)));
  const state = snapshot.scope === scope ? snapshot : {};
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const filters = [];
    if (seasonId) filters.push(where('seasonId', '==', seasonId));
    if (!technical) filters.push(where('studentId', '==', String(studentId)));
    const source = query(collection(db, 'finalSprintEvaluations'), ...filters);
    const unsubscribe = onSnapshot(source, (next) => {
      if (!active) return;
      const records = normalizeEvaluationRecords(next.docs.map((item) => ({ ...item.data(), id: item.id })));
      setSnapshot({ scope, records, loading: false, error: '' });
    }, (error) => {
      if (!active) return;
      console.error('[New Gears] Não foi possível carregar as avaliações.', error);
      reportClientIssue(error, { area: 'evaluations', kind: 'runtime' });
      setSnapshot((previous) => ({ scope, records: previous.scope === scope ? previous.records : EMPTY, loading: false, error: 'Não foi possível carregar as avaliações. Confira a conexão e tente novamente.' }));
    });
    return () => { active = false; unsubscribe(); };
  }, [db, enabled, scope, technical, studentId, seasonId, attempt]);
  return { records: enabled ? state.records || EMPTY : EMPTY, loading: Boolean(user) && (!ready || (enabled && state.loading !== false)), error: state.error || '', retry };
}

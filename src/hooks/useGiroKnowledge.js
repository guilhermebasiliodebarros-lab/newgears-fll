import { useEffect, useMemo, useState } from 'react';
import { giroKnowledgeError, saveGiroMaterial, subscribeGiroMaterials } from '../services/giroKnowledge';
import { buildGiroKnowledgeIndex, giroSystemMaterials } from '../utils/giroKnowledge';

export default function useGiroKnowledge({ db, seasonId, user, context }) {
  const identity = `${seasonId}:${user?.type}:${user?.uid || user?.studentId || user?.name || ''}`;
  const [state, setState] = useState({ identity: '', materials: [], loading: true, error: '' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!db || !user) return;
    let active = true;
    const unsubscribe = subscribeGiroMaterials({ db, seasonId, user,
      onData: (materials) => { if (active) setState({ identity, materials, loading: false, error: '' }); },
      onError: (error) => { if (active) setState({ identity, materials: [], loading: false, error: giroKnowledgeError(error) }); },
    });
    return () => { active = false; unsubscribe(); };
  }, [db, identity, retry, seasonId, user]);
  const materials = useMemo(() => state.identity === identity ? state.materials : [], [state, identity]);
  const systemMaterials = useMemo(() => giroSystemMaterials(context, seasonId), [context, seasonId]);
  const published = useMemo(() => [...materials.filter((item) => item.status === 'published'), ...systemMaterials], [materials, systemMaterials]);
  const index = useMemo(() => buildGiroKnowledgeIndex(published, seasonId), [published, seasonId]);
  return { materials, systemMaterials, published, index, loading: state.identity !== identity || state.loading, error: state.identity === identity ? state.error : '', retry: () => setRetry((value) => value + 1), seasonId,
    save: (options) => saveGiroMaterial({ ...options, db, user, seasonId }),
  };
}

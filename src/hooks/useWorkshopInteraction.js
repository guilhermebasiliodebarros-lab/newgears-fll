import { useCallback, useEffect, useState } from 'react';
import { buildWorkshopInteraction } from '../utils/gearWorkshopInteractions';

export default function useWorkshopInteraction({ equipment, owned = [] }) {
  const [state, setState] = useState({ lightOn: true, run: null });
  const run = state.run;
  const stop = useCallback(() => setState((current) => ({ ...current, run: null })), []);
  const play = (action, collectionId) => {
    const steps = buildWorkshopInteraction({ action, collectionId, equipment, owned, lightOn: state.lightOn });
    if (!steps.length) return false;
    setState((current) => ({ ...current, run: { id: crypto.randomUUID(), steps, index: 0 } }));
    return true;
  };
  useEffect(() => {
    if (!run) return;
    const timer = window.setTimeout(() => setState((current) => {
      if (current.run?.id !== run.id || current.run.index !== run.index) return current;
      const nextIndex = run.index + 1;
      const next = run.steps[nextIndex];
      return { lightOn: next?.lightOn ?? current.lightOn, run: next ? { ...run, index: nextIndex } : null };
    }), run.steps[run.index].duration);
    return () => window.clearTimeout(timer);
  }, [run]);
  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [stop]);
  return { play, stop, lightOn: state.lightOn, activity: run ? run.steps[run.index] : null, animationKey: run ? `${run.id}-${run.index}` : undefined };
}

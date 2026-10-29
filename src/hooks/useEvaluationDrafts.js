import { useRef, useState } from 'react';
import { normalizeEvaluationDraft } from '../utils/finalSprintEvaluations';

const empty = () => ({ weekly: {}, presentation: {}, report: {} });
const readDrafts = (key) => {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    if (stored?.version !== 1) return empty();
    return Object.fromEntries(Object.keys(empty()).map((type) => [type,
      Object.fromEntries(Object.entries(stored[type] && typeof stored[type] === 'object' && !Array.isArray(stored[type]) ? stored[type] : {})
        .map(([id, value]) => [id, normalizeEvaluationDraft(type, value)]).filter(([, value]) => value)),
    ]));
  } catch { return empty(); }
};

// Writes happen with each edit so refreshing immediately cannot lose the last field.
export default function useEvaluationDrafts(scope) {
  const storageKey = `newgears_evaluation_drafts_v1:${scope}`;
  const [drafts, setDrafts] = useState(() => readDrafts(storageKey));
  const latest = useRef(drafts);
  const [storageError, setStorageError] = useState(false);
  const [restored] = useState(() => Object.entries(drafts).flatMap(([type, entries]) => Object.keys(entries).map((key) => ({ type, key }))));

  const commit = (next) => {
    latest.current = next;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, ...next }));
      setStorageError(false);
    } catch { setStorageError(true); }
    setDrafts(next);
  };
  const update = (type, key, updater) => {
    const current = latest.current;
    const value = updater(current[type][key]);
    commit({ ...current, [type]: { ...current[type], [key]: { ...value, draftSavedAt: new Date().toISOString() } } });
  };
  const remove = (type, key, submitted) => {
    const current = latest.current;
    // Do not remove edits made while the submitted evaluation was saving.
    if (submitted && current[type][key] && current[type][key] !== submitted) return false;
    const entries = { ...current[type] };
    delete entries[key];
    commit({ ...current, [type]: entries });
    return true;
  };
  return { drafts, update, remove, storageError, restored: restored.filter(({ type, key }) => drafts[type][key]) };
}

// Browser-only fixture: these exports never connect to Firebase.
const alice = { id: 'alice', name: 'Alice', username: 'alice', password: 'fixture', turma: '8A', station: 'Engenharia', status: 'active', weeklyCapacityMinutes: 60 };
const bob = { id: 'bob', name: 'Bob', status: 'active' };
const records = new Map(Object.entries({
  'students/alice': alice,
  'students/bob': bob,
  'tasks/urgent': { text: 'Montagem para hoje', status: 'todo', dueDate: '2026-11-04', participants: [alice], author: 'Alice', seasonId: 'legacy', estimatedMinutes: 120 },
  'tasks/blocked': { text: 'Material pendente', status: 'doing', participants: [alice], author: 'Alice', seasonId: 'legacy', block: { reason: 'Precisamos de material' } },
  'tasks/review': { text: 'Apresentação para revisar', status: 'review', participants: [bob], author: 'Bob', seasonId: 'legacy' },
  'settings/workspace_season': { activeSeason: 'final', activeSeasonId: 'legacy', activeSeasonName: 'Temporada fictícia', planningConfig: { startDate: '2026-11-02', totalWeeks: 8, participantIds: ['alice', 'bob'], captainIds: [], traineeIds: [], trainingDays: [1, 3], pauseWeeks: [], reportDueDay: 5 } },
}));
const storageKey = 'workflow_fixture_firestore';
const subscriptions = new Set();
try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (Array.isArray(saved)) { records.clear(); saved.forEach(([key, value]) => records.set(key, value)); } } catch { /* Isolated fixture storage. */ }
const notify = () => subscriptions.forEach((subscription) => queueMicrotask(() => { if (subscriptions.has(subscription)) subscription.callback(snapshot(subscription.source)); }));
function commit(writes) {
  for (const { kind, ref: reference, data, options } of writes) {
    if (kind === 'delete') records.delete(reference.path);
    else records.set(reference.path, kind === 'update' || options?.merge || options?.mergeFields ? { ...records.get(reference.path), ...data } : data);
  }
  localStorage.setItem(storageKey, JSON.stringify([...records])); notify();
}
window.addEventListener('storage', (event) => { if (event.key === storageKey && event.newValue) { records.clear(); JSON.parse(event.newValue).forEach(([key, value]) => records.set(key, value)); notify(); } });
window.__workflowFixture = { get: (path) => structuredClone(records.get(path)), patch: (path, data) => commit([{ kind: 'update', ref: { path }, data }]) };
const ref = (path, kind) => ({ path, kind, id: path.split('/').at(-1), parent: { id: path.split('/').at(-2) } });
export const collection = (_db, ...parts) => ref(parts.join('/'), 'collection');
export const collectionGroup = (_db, name) => ({ group: name });
export const doc = (first, ...parts) => ref(first?.path ? [first.path, ...parts.length ? parts : ['fixture-auto']].join('/') : parts.join('/'), 'doc');
export const query = (source, ...constraints) => ({ ...source, constraints });
export const where = (field, operator, value) => ({ field, operator, value });
export const orderBy = () => ({});
export const limit = () => ({});
const snapshot = (reference) => {
  const docs = [...records.entries()].filter(([path, data]) => path.split('/').slice(0, -1).join('/') === reference.path && (reference.constraints || []).every((rule) => !rule.field || rule.operator !== '==' || data[rule.field] === rule.value)).map(([path]) => snapshot(ref(path, 'doc')));
  return { id: reference.id, ref: reference, exists: () => records.has(reference.path), data: () => structuredClone(records.get(reference.path)), docs, empty: !docs.length, size: docs.length, forEach: (callback) => docs.forEach(callback), metadata: { fromCache: false, hasPendingWrites: false } };
};
export const onSnapshot = (source, callback) => { const subscription = { source, callback }; subscriptions.add(subscription); queueMicrotask(() => { if (subscriptions.has(subscription)) callback(snapshot(source)); }); return () => subscriptions.delete(subscription); };
export const getDocs = async (source) => snapshot(source);
export const getDoc = async (source) => snapshot(source);
export const setDoc = async (reference, data, options) => commit([{ kind: 'set', ref: reference, data, options }]);
export const updateDoc = async (reference, data) => commit([{ kind: 'update', ref: reference, data }]);
export const deleteDoc = async (reference) => commit([{ kind: 'delete', ref: reference }]);
export const addDoc = async () => ref('fixture/auto', 'doc');
export const writeBatch = () => ({ set() {}, update() {}, delete() {}, async commit() {} });
export const runTransaction = async (_db, callback) => {
  const writes = [];
  const value = await callback({ get: getDoc, set: (ref, data, options) => writes.push({ kind: 'set', ref, data, options }), update: (ref, data) => writes.push({ kind: 'update', ref, data }), delete: (ref) => writes.push({ kind: 'delete', ref }) });
  if (writes.length) commit(writes);
  return value;
};
export const serverTimestamp = () => new Date().toISOString();
export const deleteField = () => null;
export const arrayRemove = () => [];
export const increment = (value) => value;

// Normalize data for display without rewriting the saved records or payment receipts.
const record = (value) => value && typeof value === 'object' && !Array.isArray(value);
const text = (value, fallback = '') => typeof value === 'string' ? value : fallback;

export function recordDate(value) {
  try {
    if (value == null || value === '') return null;
    const date = value instanceof Date ? value
      : typeof value?.toDate === 'function' ? value.toDate()
        : Number.isFinite(value?.seconds) ? new Date(value.seconds * 1000)
          : typeof value === 'string' || typeof value === 'number' ? new Date(value) : null;
    return date instanceof Date && Number.isFinite(date.getTime()) ? date : null;
  } catch { return null; }
}

export function recordDay(value) {
  if (typeof value === 'string') {
    const day = value.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return '';
    const parsed = recordDate(`${day}T12:00:00Z`);
    return parsed?.toISOString().slice(0, 10) === day ? day : '';
  }
  const date = recordDate(value);
  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
}

const timestamp = (value) => recordDate(value)?.toISOString() || '';
const history = (entries) => (Array.isArray(entries) ? entries : []).filter(record).map((entry) => ({
  ...entry, actor: text(entry.actor, 'Integrante'), reason: text(entry.reason),
  feedback: text(entry.feedback), to: text(entry.to), date: timestamp(entry.date),
}));

export function normalizeTaskRecord(value) {
  const task = record(value) ? value : {};
  const participants = Array.isArray(task.participants) ? task.participants.filter(record).map((person) => ({
    ...person, id: text(person.id), name: text(person.name),
  })).filter((person) => person.id || person.name) : undefined;
  return {
    ...task,
    text: text(task.text, 'Tarefa sem título'),
    author: text(task.author, participants?.map((person) => person.name).filter(Boolean).join(', ') || ''),
    ...(participants ? { participants } : {}),
    status: ['todo', 'doing', 'review', 'done'].includes(task.status) ? task.status : 'todo',
    tag: text(task.tag, 'geral'), priority: text(task.priority, 'normal'),
    dueDate: recordDay(task.dueDate), createdAt: timestamp(task.createdAt), completedAt: timestamp(task.completedAt),
    createdBy: text(task.createdBy), evidence: text(task.evidence), evidenceUrl: text(task.evidenceUrl), feedback: text(task.feedback),
    gearReward: Number.isSafeInteger(Number(task.gearReward)) && Number(task.gearReward) >= 0 ? Number(task.gearReward) : 0,
    block: record(task.block) ? { ...task.block, reason: text(task.block.reason), dependencyId: text(task.block.dependencyId), helpFromId: text(task.block.helpFromId) } : null,
    history: history(task.history), blockHistory: history(task.blockHistory),
  };
}

export const normalizeKanbanTasks = (tasks) => (Array.isArray(tasks) ? tasks : []).filter(record).map(normalizeTaskRecord);

export function normalizeEventRecord(value) {
  const event = record(value) ? value : {};
  return {
    ...event, title: text(event.title, 'Evento sem título'), description: text(event.description),
    location: text(event.location), author: text(event.author), type: text(event.type, 'Outro'),
    date: recordDay(event.date), time: typeof event.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(event.time) ? event.time : '',
    priority: text(event.priority, 'normal'), status: text(event.status),
  };
}

const COLLECTION_TEXT = {
  robotVersions: ['version', 'name', 'changes', 'description', 'author', 'image'],
  attachments: ['name', 'description', 'changes', 'author', 'image', 'roundId'],
  codeSnippets: ['title', 'description', 'author', 'code', 'language'],
  rounds: ['name', 'startBase', 'strategy', 'description', 'author'],
  missions: ['code', 'name', 'description', 'image'],
  experts: ['name', 'role', 'specialty', 'organization', 'contact', 'area', 'notes', 'impact', 'author', 'image'],
  expertContacts: ['expertName', 'name', 'role', 'summary', 'description', 'learning', 'application', 'author', 'evidenceName', 'evidenceType', 'feedback', 'channel', 'contactDetail', 'notes', 'status'],
  outreach: ['title', 'name', 'description', 'location', 'author', 'type', 'feedback'],
  prototypeIterations: ['title', 'version', 'focus', 'participants', 'improvement', 'nextStep', 'photo', 'description', 'author', 'result', 'changes', 'feedback'],
  decisionMatrix: ['title', 'name', 'description', 'author'],
  finalSprintAssignments: ['studentName', 'frontId', 'commitment', 'progressNote', 'status'],
  logbook: ['text', 'studentName', 'weekName', 'author', 'refPath'],
  activityLogs: ['actorName', 'action', 'title', 'detail', 'category'],
  xpLossRecords: ['reason', 'studentName', 'author', 'actorName'],
  leaderPenaltyRequests: ['reason', 'studentName', 'leaderName', 'feedback', 'status'],
  publicGalleryPhotos: ['title', 'caption', 'description', 'author', 'image', 'url'],
};
const COLLECTION_NUMBERS = {
  rounds: ['estimatedTime', 'totalPoints'], outreach: ['people'],
  score_history: ['score', 'time', 'exitNumber'], logbook: ['wordCount'],
  decisionMatrix: ['impact', 'cost', 'feasibility', 'innovation'],
  missions: ['points'],
};

export function normalizeWorkspaceRecord(collectionName, value) {
  const item = { ...(record(value) ? value : {}) };
  for (const field of COLLECTION_TEXT[collectionName] || []) {
    item[field] = text(item[field]);
  }
  for (const field of COLLECTION_NUMBERS[collectionName] || []) {
    if (Object.hasOwn(item, field)) item[field] = (typeof item[field] === 'number' || typeof item[field] === 'string') && Number.isFinite(Number(item[field])) ? Number(item[field]) : 0;
  }
  for (const field of ['date', 'createdAt', 'updatedAt']) {
    if (Object.hasOwn(item, field)) item[field] = typeof item[field] === 'string' && item[field].length === 10 ? recordDay(item[field]) : timestamp(item[field]);
  }
  if (collectionName === 'rounds') item.missions = (Array.isArray(item.missions) ? item.missions : []).filter((id) => typeof id === 'string');
  if (collectionName === 'attachments' && Object.hasOwn(item, 'roundIds')) item.roundIds = (Array.isArray(item.roundIds) ? item.roundIds : []).filter((id) => typeof id === 'string');
  if (collectionName === 'logbook') item.tags = (Array.isArray(item.tags) ? item.tags : []).filter((tag) => typeof tag === 'string');
  return item;
}

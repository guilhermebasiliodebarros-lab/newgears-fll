export const DIAGNOSTIC_LABELS = {
  'module-load': 'Um arquivo da tela não carregou',
  'invalid-data': 'A tela recebeu um campo em formato inesperado',
  'permission-denied': 'O acesso aos dados foi recusado',
  network: 'A conexão com os dados falhou',
  render: 'Falha ao exibir uma tela',
  runtime: 'Falha durante uma operação',
};
const AREAS = new Set(['startup', 'principal', 'overview', 'sprint', 'kanban', 'agenda', 'weekly_reports', 'report_recipients', 'logbook', 'strategy', 'rounds', 'rubrics', 'giro_knowledge', 'students', 'rotation', 'evaluations', 'discipline', 'showcase', 'operations', 'history', 'season_history', 'shop', 'mission', 'feedback', 'public', 'tv', 'tasks', 'events', 'experts', 'expertContacts', 'decisionMatrix', 'outreach', 'prototypeIterations', 'robotVersions', 'attachments', 'codeSnippets', 'score_history', 'xpLossRecords', 'leaderPenaltyRequests', 'publicGalleryPhotos']);
export const diagnosticArea = (value) => {
  const area = String(value || '').replace(/^(admin|student)-/, '');
  return AREAS.has(area) ? area : 'principal';
};
export function diagnosticCode(error, kind) {
  const message = `${error?.message || ''}`;
  if (/dynamically imported module|module script|loading.*chunk|preload css/i.test(message) || kind === 'module-load') return 'module-load';
  if (/permission-denied/.test(error?.code || '')) return 'permission-denied';
  if (/unavailable|network|failed to fetch|connection|offline/i.test(`${error?.code || ''} ${message}`)) return 'network';
  if (/is not a function|cannot read properties|objects are not valid|invalid time value/i.test(message)) return 'invalid-data';
  return kind === 'render' ? 'render' : 'runtime';
}
export function diagnosticFrames(stack) {
  // Keep only source file names and line numbers; never transport raw errors,
  // form text, user names, request URLs, tokens or Firebase document paths.
  return [...String(stack || '').matchAll(/(?:\/|\\)((?:assets|src)[/\\][A-Za-z0-9_./\\-]+\.(?:jsx?|mjs))(?::(\d+):(\d+))?/g)]
    .slice(0, 3).map((match) => `${match[1].replaceAll('\\', '/')}${match[2] ? `:${match[2]}:${match[3]}` : ''}`).join(' | ').slice(0, 300);
}
export function diagnosticFingerprint(value) {
  let hash = 2166136261;
  for (const char of `${value.area}:${value.code}:${value.frames}:${value.build}`) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
export function validateDiagnostic(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(value.id || '') || !Object.hasOwn(DIAGNOSTIC_LABELS, value.code)) return null;
  if (diagnosticArea(value.area) !== value.area || !['technical', 'student', 'visitor'].includes(value.role)) return null;
  if (!['desktop', 'mobile'].includes(value.device) || !['Edge', 'Chrome', 'Firefox', 'Safari', 'Other'].includes(value.browser)) return null;
  if (typeof value.build !== 'string' || !/^[a-zA-Z0-9:._-]{1,50}$/.test(value.build)) return null;
  const frames = typeof value.frames === 'string' ? value.frames : '';
  if (frames && (frames.split(' | ').length > 3 || !frames.split(' | ').every((frame) => /^(assets|src)\/[A-Za-z0-9_./-]+\.(jsx?|mjs)(:\d+:\d+)?$/.test(frame)))) return null;
  if (frames.length > 300 || !Number.isSafeInteger(value.count) || value.count < 1 || value.count > 10000) return null;
  const date = new Date(value.occurredAt);
  if (typeof value.occurredAt !== 'string' || !Number.isFinite(date.getTime())) return null;
  const clean = { id: value.id, code: value.code, area: value.area, role: value.role, device: value.device, browser: value.browser, build: value.build, frames, count: value.count, occurredAt: date.toISOString(), online: value.online === true };
  return { ...clean, fingerprint: diagnosticFingerprint(clean) };
}

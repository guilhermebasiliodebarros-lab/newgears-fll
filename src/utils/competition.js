import { validDate } from './teamProcesses.js';

export const COMPETITION_PIT_GROUPS = { equipment: 'Robô e equipamentos', documents: 'Documentos e evidências', team: 'Organização da equipe' };
export const COMPETITION_SLOT_TYPES = { arrival: 'Chegada', inspection: 'Inspeção', round: 'Round', presentation: 'Apresentação', break: 'Pausa', other: 'Outro compromisso' };
export const COMPETITION_CRITERION_STATUSES = { todo: 'A preparar', doing: 'Em preparação', done: 'Com evidência' };
const identifier = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
export const competitionItemId = () => `item-${crypto.randomUUID()}`;
export const competitionDraftKey = (scope) => `newgears_competition_draft_v1:${encodeURIComponent(scope)}`;

export function competitionUrl(value) {
  if (typeof value !== 'string' || value.length > 1600) return '';
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}

export function validCompetitionDateTime(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) && validDate(value.slice(0, 10));
}

export function newCompetitionPlan() {
  return {
    version: 1,
    event: { name: 'Próxima competição', program: '', category: '', date: '', location: '', rulebookUrl: '', rulebookVersion: '', matchSeconds: null },
    pit: [
      { id: 'robot', title: 'Robô revisado e identificado', group: 'equipment', owner: '', checked: false },
      { id: 'power', title: 'Baterias carregadas e carregador separado', group: 'equipment', owner: '', checked: false },
      { id: 'tools', title: 'Peças de reposição e ferramentas conferidas', group: 'equipment', owner: '', checked: false },
      { id: 'code', title: 'Código e arquivos com cópia de segurança', group: 'documents', owner: '', checked: false },
      { id: 'evidence', title: 'Apresentação e evidências disponíveis', group: 'documents', owner: '', checked: false },
      { id: 'roles', title: 'Horários e responsabilidades combinados', group: 'team', owner: '', checked: false },
    ],
    schedule: [],
    criteria: [
      { id: 'robot', title: 'Robô testado', weight: 1, status: 'todo', owner: '', evidence: '', evidenceUrl: '' },
      { id: 'project', title: 'Projeto e evidências organizados', weight: 1, status: 'todo', owner: '', evidence: '', evidenceUrl: '' },
      { id: 'presentation', title: 'Apresentação ensaiada', weight: 1, status: 'todo', owner: '', evidence: '', evidenceUrl: '' },
      { id: 'team', title: 'Equipe e responsabilidades alinhadas', weight: 1, status: 'todo', owner: '', evidence: '', evidenceUrl: '' },
    ],
  };
}

export function validateCompetitionPlan(input, { draft = false } = {}) {
  if (!input || input.version !== 1 || !input.event) throw Error('Plano de competição inválido.');
  const text = (value, limit, label, minimum = 0) => {
    if (typeof value !== 'string' || value.length > limit || (!draft && value.trim().length < minimum)) throw Error(`Confira ${label}.`);
    return value.trim();
  };
  const url = (value, label) => { if (typeof value !== 'string' || (value && !competitionUrl(value))) throw Error(`Use um endereço http ou https válido em ${label}.`); return value ? competitionUrl(value) : ''; };
  const event = {
    name: text(input.event.name, 120, 'o nome da competição', 3), program: text(input.event.program, 100, 'a modalidade'), category: text(input.event.category, 80, 'a categoria'),
    date: text(input.event.date, 10, 'a data'), location: text(input.event.location, 180, 'o local'), rulebookUrl: url(input.event.rulebookUrl, 'regulamento'), rulebookVersion: text(input.event.rulebookVersion, 80, 'a versão do regulamento'), matchSeconds: input.event.matchSeconds,
  };
  if (event.date && !validDate(event.date)) throw Error('Escolha uma data válida para a competição.');
  if (event.matchSeconds !== null && (!Number.isInteger(event.matchSeconds) || event.matchSeconds < 10 || event.matchSeconds > 3600)) throw Error('Defina o tempo de round entre 10 e 3.600 segundos, ou deixe a definir.');
  const rows = (items, maximum, convert) => {
    if (!Array.isArray(items) || items.length > maximum) throw Error(`Use no máximo ${maximum} itens nesta seção.`);
    const ids = new Set();
    return items.map((item) => { if (!item || !identifier(item.id) || ids.has(item.id)) throw Error('Há itens repetidos ou com identificador inválido.'); ids.add(item.id); return { id: item.id, ...convert(item) }; });
  };
  const pit = rows(input.pit, 30, (item) => {
    if (!Object.hasOwn(COMPETITION_PIT_GROUPS, item.group) || typeof item.checked !== 'boolean') throw Error('Confira o grupo e a conferência do item do pit.');
    return { title: text(item.title, 140, 'o item do pit', 3), group: item.group, owner: text(item.owner, 80, 'o responsável'), checked: item.checked };
  });
  const schedule = rows(input.schedule, 30, (item) => {
    if (!validCompetitionDateTime(item.at) || !Object.hasOwn(COMPETITION_SLOT_TYPES, item.type)) throw Error('Confira a data, o horário e o tipo do compromisso.');
    return { title: text(item.title, 140, 'o compromisso', 3), at: item.at, type: item.type, location: text(item.location, 120, 'o local do compromisso'), owner: text(item.owner, 80, 'o responsável') };
  });
  const criteria = rows(input.criteria, 16, (item) => {
    if (!Object.hasOwn(COMPETITION_CRITERION_STATUSES, item.status) || !Number.isInteger(item.weight) || item.weight < 1 || item.weight > 5) throw Error('Confira a situação e o peso do critério.');
    const evidence = text(item.evidence, 1200, 'a evidência'); const evidenceUrl = url(item.evidenceUrl, 'evidência');
    if (!draft && item.status === 'done' && evidence.length < 8 && !evidenceUrl) throw Error('Descreva a evidência com pelo menos 8 caracteres ou informe um link antes de concluir o critério.');
    return { title: text(item.title, 140, 'o critério', 3), weight: item.weight, status: item.status, owner: text(item.owner, 80, 'o responsável'), evidence, evidenceUrl };
  });
  return { version: 1, event, pit, schedule, criteria };
}

export function readCompetitionDraft(serialized) {
  try {
    if (typeof serialized !== 'string' || serialized.length > 150000) return null;
    const value = JSON.parse(serialized);
    if (value.version !== 1 || !Number.isInteger(value.baseRevision) || value.baseRevision < 0 || !identifier(value.mutationId)) return null;
    return { version: 1, baseRevision: value.baseRevision, mutationId: value.mutationId, plan: validateCompetitionPlan(value.plan, { draft: true }) };
  } catch { return null; }
}

export function competitionReadiness(plan) {
  const criteria = plan.criteria;
  const weight = criteria.reduce((sum, item) => sum + item.weight, 0);
  const complete = criteria.filter((item) => item.status === 'done' && (item.evidence.trim().length >= 8 || competitionUrl(item.evidenceUrl)));
  return { percentage: weight ? Math.round(complete.reduce((sum, item) => sum + item.weight, 0) / weight * 100) : null, complete: complete.length, total: criteria.length, pitChecked: plan.pit.filter((item) => item.checked).length, pitTotal: plan.pit.length };
}

export function competitionSchedule(slots, now = Date.now()) {
  const sorted = [...slots].sort((left, right) => left.at.localeCompare(right.at) || left.title.localeCompare(right.title));
  const next = sorted.find((item) => new Date(item.at).getTime() >= now) || null;
  return { sorted, next };
}

export function competitionReliability(records, matchSeconds = null, versionId = '') {
  const recent = (Array.isArray(records) ? records : []).filter((item) => item && item.practiceType === 'full_round' && !item.roundId && typeof item.score === 'number' && Number.isFinite(item.score) && item.score >= 0 && typeof item.time === 'number' && Number.isFinite(item.time) && item.time > 0 && (!versionId || item.robotVersionId === versionId) && Number.isFinite(new Date(item.date).getTime())).sort((left, right) => new Date(right.date) - new Date(left.date)).slice(0, 10);
  const scores = recent.map((item) => item.score).sort((a, b) => a - b);
  const middle = Math.floor(scores.length / 2);
  const within = matchSeconds === null ? null : recent.filter((item) => item.time <= matchSeconds).length;
  return { recent, count: recent.length, median: scores.length ? scores.length % 2 ? scores[middle] : (scores[middle - 1] + scores[middle]) / 2 : null, best: scores.length ? scores.at(-1) : null, spread: scores.length ? scores.at(-1) - scores[0] : null, within, withinPercentage: recent.length && within !== null ? Math.round(within / recent.length * 100) : null };
}

export function competitionReport(plan, { season = '', draft = false } = {}) {
  const readiness = competitionReadiness(plan);
  return ['NEW GEARS · PLANO DE COMPETIÇÃO', draft ? 'RASCUNHO LOCAL — ainda não confirmado para a equipe.' : 'Versão da equipe.', season, '', plan.event.name, `Modalidade: ${plan.event.program || 'A definir'}`, `Categoria: ${plan.event.category || 'A definir'}`, `Data: ${plan.event.date || 'A definir'}`, `Local: ${plan.event.location || 'A definir'}`, `Tempo do round: ${plan.event.matchSeconds === null ? 'A definir' : `${plan.event.matchSeconds} segundos`}`, `Regulamento: ${plan.event.rulebookUrl || 'Não informado'} ${plan.event.rulebookVersion}`, '', `PREPARAÇÃO INTERNA: ${readiness.percentage === null ? 'Sem critérios' : `${readiness.percentage}%`} — não representa nota oficial.`, ...plan.criteria.map((item) => `${item.status === 'done' ? '[x]' : '[ ]'} ${item.title} · peso ${item.weight} · ${item.owner || 'Sem responsável'}\nEvidência: ${item.evidence || 'Não registrada'} ${item.evidenceUrl}`), '', 'CHECKLIST DO PIT', ...plan.pit.map((item) => `[${item.checked ? 'x' : ' '}] ${item.title} · ${item.owner || 'Sem responsável'}`), '', 'PROGRAMAÇÃO', ...competitionSchedule(plan.schedule).sorted.map((item) => `${item.at.replace('T', ' ')} · ${COMPETITION_SLOT_TYPES[item.type]} · ${item.title} · ${item.location || 'Local a definir'} · ${item.owner || 'Equipe'}`)].join('\n');
}

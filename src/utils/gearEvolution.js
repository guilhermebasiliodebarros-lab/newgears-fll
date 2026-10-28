import { GEAR_CONTRIBUTIONS, validGearCheckIn } from './gearShop.js';

export const GEAR_LEVELS = [
  { level: 1, minimum: 0, name: 'Faísca', description: 'Toda grande ideia começa com uma faísca.', unlock: 'Acenos e dança' },
  { level: 2, minimum: 40, name: 'Aprendiz', description: 'Sua participação está colocando as ideias em movimento.', unlock: 'Giro especial e luz de energia' },
  { level: 3, minimum: 100, name: 'Inventor', description: 'Descobrir, registrar e melhorar já fazem parte da sua jornada.', unlock: 'Salto de alegria e faíscas' },
  { level: 4, minimum: 200, name: 'Engenheiro', description: 'Suas contribuições conectam conhecimento e prática.', unlock: 'Órbita de energia e expressão confiante' },
  { level: 5, minimum: 400, name: 'Mestre das Engrenagens', description: 'Uma história de participação que faz a equipe crescer.', unlock: 'Estrelas e aura de mestre' },
];

export function gearEvolution(account = {}) {
  const points = Math.max(0, Number(account.growthPoints) || 0);
  const current = [...GEAR_LEVELS].reverse().find((entry) => points >= entry.minimum);
  const next = GEAR_LEVELS[current.level];
  const counts = account.contributionCounts || {};
  const total = Object.values(counts).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const milestones = [
    { id: 'first', name: 'Primeira contribuição', achieved: total >= 1 },
    { id: 'expert', name: 'Conexão com especialista', achieved: (counts.expert || 0) >= 1 },
    { id: 'code', name: 'Código em movimento', achieved: (counts.code || 0) >= 1 },
    { id: 'ten', name: '10 contribuições', achieved: total >= 10 },
    { id: 'tests', name: '10 testes documentados', achieved: (counts.test || 0) >= 10 },
    { id: 'fifty', name: '50 contribuições', achieved: total >= 50 },
    { id: 'checkins', name: '10 check-ins da equipe', achieved: (counts.checkin || 0) >= 10 },
  ];
  return { ...current, points, next, total, milestones, progress: next ? Math.min(100, Math.round((points - current.minimum) / (next.minimum - current.minimum) * 100)) : 100 };
}

export function growGearProfile(account, type) {
  return {
    growthPoints: (Number(account.growthPoints) || 0) + GEAR_CONTRIBUTIONS[type].coins,
    contributionCounts: { ...account.contributionCounts, [type]: (Number(account.contributionCounts?.[type]) || 0) + 1 },
  };
}

export function gearContributionTip(type, record = {}) {
  const has = (field) => `${record[field] || ''}`.trim().length >= 15;
  switch (type) {
    case 'code': return has('description') ? 'Como esse código se comportou no robô? Registre o resultado do teste e os ajustes necessários.' : 'Anote o que o código faz, quais sensores usa e em qual situação ele deve funcionar.';
    case 'expert': return record.applied ? 'O que mudou depois de aplicar a sugestão do especialista? Guarde uma evidência do resultado.' : 'Qual descoberta dessa entrevista pode ajudar o projeto? Registre como a equipe pretende aplicá-la.';
    case 'contact': return record.status === 'replied' ? 'A resposta trouxe uma ideia útil? Registre o aprendizado e combine o próximo passo.' : 'Anote o que vocês querem descobrir com esse contato e quando pretendem acompanhar a resposta.';
    case 'robot': return 'Compare esta versão com a anterior: qual mudança funcionou melhor e o que o teste mostrou?';
    case 'attachment': return 'Teste o anexo na missão para a qual foi criado e anote a estabilidade, o tempo e os ajustes.';
    case 'outreach': return has('feedback') ? 'Qual mudança essa ação provocou nas pessoas? Guarde uma evidência para contar essa história.' : 'Além do número de pessoas, registre o que elas aprenderam e o feedback recebido.';
    case 'logbook': return /pr[oó]xim|amanh[ãa]|depois|melhorar/i.test(record.text || '') ? 'Esse aprendizado pode ajudar outra pessoa da equipe? Compartilhe a descoberta no próximo encontro.' : 'Inclua um próximo passo: o que você pretende testar ou melhorar depois desse aprendizado?';
    case 'prototype': return !has('result') ? 'O que o teste mostrou depois dessa melhoria? Complete o resultado observado para comparar as versões.' : !has('nextStep') ? 'Qual será o próximo teste do protótipo? Anote uma hipótese para orientar a nova versão.' : 'Mostre a evolução para quem deu o feedback e confira se a mudança resolveu a dificuldade.';
    case 'test': return has('learning') ? 'Repita o teste nas mesmas condições e compare os resultados para conferir a consistência.' : 'O que vocês aprenderam com esse teste? Anotem o resultado observado e o ajuste para a próxima tentativa.';
    case 'checkin': return Number(record.level) <= 50 ? 'Vale pedir uma pausa, conversar com o técnico ou combinar uma tarefa em dupla. Você não precisa dar conta de tudo sozinho.' : 'Combine um objetivo para o treino e veja se alguém precisa de uma mão. Toda energia compartilhada ajuda a equipe.';
    default: return 'Conte o que você aprendeu e qual será o próximo passo da equipe.';
  }
}

export const normalizeGearAuthor = (value) => `${value || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
const CREATION_ACTIONS = {
  code: 'adicionou uma nova programacao', expert: 'registrou um especialista', contact: 'registrou um contato de prospeccao',
  robot: 'registrou uma versao do robo', attachment: 'registrou um novo anexo do robo', outreach: 'registrou uma acao de impacto', prototype: 'registrou uma versao do prototipo',
};
export const gearRecordTitle = (type, record) => type === 'checkin' ? `Check-in de ${record.date || 'data não informada'}` : type === 'prototype' ? `${record.version} · ${record.focus}` : type === 'robot' ? `${record.version}${record.name ? ` - ${record.name}` : ''}` : record.title || record.name || record.version || 'Registro';

// Only a unique author or a unique creation event can attribute a legacy record.
export function buildGearHistoryPlan({ students, records, activities = [] }) {
  const candidates = [], unresolved = [];
  const checkIns = new Set();
  const byId = new Map(students.map((student) => [String(student.id), student]));
  const named = (name) => students.filter((student) => normalizeGearAuthor(student.name) === normalizeGearAuthor(name));
  const actor = (event) => {
    if (event.actorType && event.actorType !== 'student') return null;
    if (event.actorId) return byId.get(String(event.actorId)) || null;
    const matches = named(event.actorName);
    return matches.length === 1 ? matches[0] : null;
  };
  for (const [type, rule] of Object.entries(GEAR_CONTRIBUTIONS)) {
    const sources = records[rule.collection] || [];
    for (const record of sources) {
      if (!`${record[rule.required] || ''}`.trim()) continue;
      if (type === 'checkin' && !validGearCheckIn(record)) { unresolved.push({ type, sourceId: record.id, title: gearRecordTitle(type, record) }); continue; }
      const pathOwner = type === 'logbook' ? record.refPath?.split('/')[1] : '';
      const explicitId = pathOwner || record.createdByStudentId || record.studentId || record.authorId;
      let owner = explicitId ? byId.get(String(explicitId)) : null;
      let attribution = { kind: 'id' };
      const author = record.author || (type === 'checkin' ? record.studentName : '');
      if (!explicitId && author) {
        const matches = named(author);
        if (matches.length === 1) { owner = matches[0]; attribution = { kind: 'author', name: author }; }
      }
      if (!owner && !explicitId && !record.author && CREATION_ACTIONS[type]) {
        const action = CREATION_ACTIONS[type];
        const title = normalizeGearAuthor(gearRecordTitle(type, record));
        const direct = activities.filter((event) => normalizeGearAuthor(event.action) === action && event.entityId === record.id);
        const uniqueTitle = sources.filter((source) => normalizeGearAuthor(gearRecordTitle(type, source)) === title).length === 1;
        const matches = direct.length ? direct : uniqueTitle ? activities.filter((event) => normalizeGearAuthor(event.action) === action && normalizeGearAuthor(event.title) === title) : [];
        if (matches.length === 1) { owner = actor(matches[0]); attribution = { kind: 'activity', activityId: matches[0].id }; }
      }
      if (owner?.status === 'inactive') continue;
      if (owner) {
        const checkInKey = `${owner.id}:${record.date}`;
        if (type === 'checkin' && checkIns.has(checkInKey)) continue;
        if (type === 'checkin') checkIns.add(checkInKey);
        candidates.push({ type, sourceId: record.id, studentId: String(owner.id), ...(type === 'checkin' ? { date: record.date, level: record.level } : {}), attribution });
      }
      else unresolved.push({ type, sourceId: record.id, title: gearRecordTitle(type, record) });
    }
  }
  return { candidates, unresolved };
}

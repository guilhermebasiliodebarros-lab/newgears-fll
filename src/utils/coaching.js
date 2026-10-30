export const COACHING_CRITERIA = [
  { id: 'participation', label: 'Participação' }, { id: 'commitment', label: 'Comprometimento' },
  { id: 'communication', label: 'Comunicação' }, { id: 'responsibility', label: 'Responsabilidade' },
  { id: 'teamwork', label: 'Trabalho em equipe' }, { id: 'technical', label: 'Desenvolvimento técnico' },
  { id: 'presentation', label: 'Preparação para apresentações' }, { id: 'delivery', label: 'Cumprimento de tarefas' },
];
export const COACHING_LEVELS = [{ id: 0, label: 'Não observado' }, { id: 1, label: 'Com apoio' }, { id: 2, label: 'Em prática' }, { id: 3, label: 'Com autonomia' }];
export function validateCoachingObservation(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Informe uma observação válida.');
  for (const key of ['id', 'studentId', 'seasonId']) if (typeof input[key] !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(input[key])) throw Error('Integrante, temporada ou envio inválido.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || '') || !Number.isFinite(Date.parse(input.date)) || new Date(`${input.date}T12:00:00Z`).toISOString().slice(0, 10) !== input.date) throw Error('Informe uma data válida.');
  if (!input.ratings || typeof input.ratings !== 'object' || Array.isArray(input.ratings) || Object.keys(input.ratings).some((key) => !COACHING_CRITERIA.some((item) => item.id === key))) throw Error('Critério de acompanhamento inválido.');
  const ratings = Object.fromEntries(COACHING_CRITERIA.map(({ id }) => {
    const score = input.ratings[id] ?? 0;
    if (!Number.isInteger(score) || score < 0 || score > 3) throw Error('Selecione um nível de observação válido.');
    return [id, score];
  }));
  if (!Object.values(ratings).some((value) => value > 0)) throw Error('Registre pelo menos uma dimensão observada.');
  const text = (key, max) => { if (typeof input[key] !== 'string' || input[key].length > max) throw Error(`Confira ${key === 'nextStep' ? 'o próximo passo' : 'as anotações'} (até ${max} caracteres).`); return input[key].trim(); };
  return { id: input.id, studentId: input.studentId, seasonId: input.seasonId, date: input.date, ratings, strength: text('strength', 1200), nextStep: text('nextStep', 1200), note: text('note', 2000) };
}
export function coachingTrend(records, criterion) {
  if (!COACHING_CRITERIA.some((item) => item.id === criterion)) return [];
  return [...records].filter((record) => Number.isInteger(record.ratings?.[criterion]) && record.ratings[criterion] > 0).sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.createdAt || '').localeCompare(b.createdAt || '')).map((record) => ({ id: record.id, date: record.date, score: record.ratings[criterion] }));
}

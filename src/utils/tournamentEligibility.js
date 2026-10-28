// These three members of the current team are being evaluated for learning only.
const LEARNING_ONLY_STUDENTS = new Set(['antonio echenique', 'heloisa', 'helena']);
const normalizeName = (name) => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

export const isTournamentEligible = (student) => student?.tournamentEligible !== false
  && !LEARNING_ONLY_STUDENTS.has(normalizeName(student?.name));

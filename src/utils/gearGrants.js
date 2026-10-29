export const GEAR_GRANT_MAX = 10000;
export const GEAR_GRANT_REASON_MAX = 500;

export function validateGearGrant({ studentId, coins, reason, grantId, seasonId } = {}) {
  if (![studentId, grantId, seasonId].every((id) => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,160}$/.test(id))) throw new Error('Escolha um aluno e atualize a página antes de conceder Gears.');
  if (!Number.isSafeInteger(coins) || coins < 1 || coins > GEAR_GRANT_MAX) throw new Error('Informe uma quantidade inteira entre 1 e 10.000 Gears.');
  if (typeof reason !== 'string' || reason.trim().length < 3 || reason.trim().length > GEAR_GRANT_REASON_MAX) throw new Error('Descreva a tarefa ou o motivo em 3 a 500 caracteres.');
  return { studentId, coins, reason: reason.trim(), grantId, seasonId };
}

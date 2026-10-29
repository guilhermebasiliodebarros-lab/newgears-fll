export function attachmentRoundIds(attachment) {
  const values = Array.isArray(attachment?.roundIds) ? attachment.roundIds : [attachment?.roundId];
  return [...new Set(values.filter((id) => typeof id === 'string' && id.trim()).map((id) => id.trim()))];
}

export const attachmentRoundNames = (attachment, rounds) => attachmentRoundIds(attachment).map((id) => rounds.find((round) => round.id === id)?.name || 'Saída removida').join(', ') || 'Geral';

export function attachmentsByRound(attachments) {
  const result = Object.create(null);
  for (const attachment of attachments) for (const id of attachmentRoundIds(attachment)) (result[id] ||= []).push(attachment);
  return result;
}

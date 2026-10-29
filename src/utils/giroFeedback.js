export const GIRO_FEEDBACK_COLLECTION = 'giroAnswerFeedback';

export function validateGiroFeedback(input) {
  if (!['helpful', 'incorrect'].includes(input?.rating)) throw new Error('Escolha como avaliar a resposta.');
  const question = String(input.question || '').trim();
  const answer = String(input.answer || '').trim();
  const note = String(input.note || '').trim();
  if (!question || question.length > 4000 || !answer || answer.length > 16000 || note.length > 1000) throw new Error('Confira a pergunta, a resposta e o comentário da avaliação.');
  return { question, answer, note, rating: input.rating,
    sources: (Array.isArray(input.sources) ? input.sources : []).slice(0, 4).filter((source) => typeof source?.materialId === 'string' && Number.isInteger(source.page)).map((source) => ({ materialId: source.materialId.slice(0, 200), page: source.page, title: String(source.title || 'Material').slice(0, 180) })),
  };
}

export function giroFeedbackDraft(feedback, correction) {
  const text = String(correction || '').trim();
  if (text.length < 20 || text.length > 120000) throw new Error('Escreva uma orientação revisada com pelo menos 20 caracteres.');
  return { title: `Orientação: ${feedback.question}`.slice(0, 180), category: 'general', status: 'draft', sourceURL: '', tags: '', fileName: '', pages: [{ number: 1, text }] };
}

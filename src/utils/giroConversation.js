import { GIRO_AI_MAX_HISTORY, sanitizeGiroContext } from './giroAI.js';
import { searchGiroKnowledge } from './giroKnowledge.js';

export function prepareGiroAIRequest({ question, messages, knowledge, context, useKnowledge = true }) {
  const previous = messages.filter((item) => item.role === 'user').at(-1)?.text || '';
  const references = useKnowledge ? searchGiroKnowledge(question, knowledge.index, previous).map((item) => ({ materialId: item.materialId, title: item.title, page: item.page, excerpt: item.excerpt, url: item.sourceURL })) : [];
  const outgoing = [...messages.slice(-(GIRO_AI_MAX_HISTORY - 1)).map((item) => ({ role: item.role, content: item.text })), { role: 'user', content: question }];
  const payload = { messages: outgoing, references, seasonId: knowledge.seasonId, useKnowledge, context: sanitizeGiroContext(useKnowledge ? context : { season: context?.season }) };
  // Bound both UTF-8 request size and history length before sending to the server.
  while (outgoing.length > 1 && (outgoing.reduce((total, item) => total + item.content.length, 0) > 27000 || new TextEncoder().encode(JSON.stringify(payload)).length > 90000)) outgoing.shift();
  return payload;
}

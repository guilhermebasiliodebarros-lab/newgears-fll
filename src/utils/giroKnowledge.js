import { safeGiroURL, sanitizeGiroContext } from './giroAI.js';

export const GIRO_KNOWLEDGE_COLLECTION = 'giroKnowledgeMaterials';
export const GIRO_MATERIAL_MAX_TEXT = 120000;
export const GIRO_MATERIAL_MAX_PAGES = 200;
export const GIRO_MATERIAL_MAX_BYTES = 15 * 1024 * 1024;
export const GIRO_MATERIAL_CATEGORIES = {
  rubric: 'Rúbrica e avaliação', tournament: 'Torneio', season: 'Temporada',
  robot: 'Robô e programação', project: 'Projeto de inovação', general: 'Orientações da equipe',
};
export const GIRO_LIBRARY_SUGGESTIONS = [
  'O que a rúbrica pede no projeto de inovação?',
  'Quais são as regras do torneio?',
  'Qual é o problema e a solução do nosso projeto?',
  'Quais materiais temos sobre programação do robô?',
];

export function validateGiroMaterial(input) {
  const title = String(input?.title || '').trim();
  if (title.length < 3 || title.length > 180) throw new Error('Dê ao material um título de 3 a 180 caracteres.');
  if (!Object.hasOwn(GIRO_MATERIAL_CATEGORIES, input?.category)) throw new Error('Escolha a categoria do material.');
  if (!['draft', 'published', 'archived'].includes(input?.status)) throw new Error('Escolha se o material é rascunho ou publicado.');
  const tags = String(input.tags || '').trim();
  if (tags.length > 500) throw new Error('Use até 500 caracteres nas palavras-chave.');
  const rawURL = String(input.sourceURL || '').trim();
  const sourceURL = rawURL ? safeGiroURL(rawURL) : '';
  if (rawURL && (!sourceURL || sourceURL.length > 2000)) throw new Error('A fonte deve ser um endereço HTTP ou HTTPS válido com até 2.000 caracteres.');
  if (!Array.isArray(input.pages) || !input.pages.length || input.pages.length > GIRO_MATERIAL_MAX_PAGES) throw new Error(`Use de 1 a ${GIRO_MATERIAL_MAX_PAGES} páginas por material.`);
  const pages = input.pages.map((page) => ({ number: page?.number, text: typeof page?.text === 'string' ? page.text.split('\u0000').join('').trim() : '' }));
  if (pages.some((page, index) => !Number.isInteger(page.number) || page.number !== index + 1)) throw new Error('Confira a sequência das páginas do material.');
  const textLength = pages.reduce((total, page) => total + page.text.length, 0);
  if (textLength < 20) throw new Error('Adicione pelo menos 20 caracteres de conteúdo. PDFs digitalizados precisam de texto reconhecido (OCR).');
  if (textLength > GIRO_MATERIAL_MAX_TEXT) throw new Error(`O material ultrapassa ${GIRO_MATERIAL_MAX_TEXT.toLocaleString('pt-BR')} caracteres. Divida-o em partes menores.`);
  return { title, category: input.category, status: input.status, tags, sourceURL, pages, textLength, fileName: String(input.fileName || '').slice(0, 220), version: 1 };
}

export function validateGiroFile(file) {
  const extension = String(file?.name || '').split('.').at(-1).toLowerCase();
  if (!['pdf', 'txt', 'md'].includes(extension)) throw new Error('Selecione um arquivo PDF, TXT ou Markdown.');
  if (!file.size || file.size > GIRO_MATERIAL_MAX_BYTES) throw new Error('O arquivo deve ter até 15 MB e não pode estar vazio.');
  return extension;
}

const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const stop = new Set('a o as os um uma uns umas de da do das dos e em no na nos nas ao aos para por com sem se que qual quais como quando onde quem quanto quantos quanta quantas porque por que eu meu minha meus minhas nosso nossa nossos nossas voce voces eles elas ele ela isso isto esse essa esses essas este esta estes estas tem temos ter tenho ser sou sao e foi sera pode posso podemos preciso quero gostaria saber explique explicar fale falar diga sobre mais melhor muito bem favor fazer feito faz estar esta estao me ajude ajuda duvida detalhes detalhe novamente continuar continue tenho ha ja ainda tambem material materiais conteudo conteudos informacao informacoes'.split(' '));
const groups = [
  ['rubrica', 'rubricas', 'avaliacao', 'avaliacoes', 'avaliar', 'avaliado', 'avaliada', 'julgamento', 'juiz', 'juizes', 'criterio', 'criterios'],
  ['robo', 'robos', 'robot', 'robotica'], ['programacao', 'programar', 'programa', 'programas', 'codigo', 'codigos'],
  ['torneio', 'torneios', 'competicao', 'competicoes'], ['inovacao', 'inovador', 'inovadora'],
  ['evidencia', 'evidencias', 'comprovacao', 'comprovar'], ['pontuacao', 'ponto', 'pontos', 'score'],
  ['equipe', 'equipes', 'time', 'times'], ['regra', 'regras', 'regulamento'], ['sensor', 'sensores'],
  ['solucao', 'solucoes'], ['problema', 'problemas'], ['teste', 'testes', 'testar'],
  ['calibracao', 'calibrar', 'calibrado', 'calibrada', 'calibrados', 'calibradas'],
  ['giro', 'giros', 'curva', 'curvas', 'virar', 'girar'], ['giroscopio', 'gyro', 'yaw'],
  ['compartilhar', 'compartilhamento', 'compartilhamos', 'compartilhada'],
  ['pesquisa', 'pesquisar', 'pesquisas', 'pesquisada', 'pesquisadas'],
  ['documentar', 'documentado', 'documentada', 'documentacao', 'registrar'],
];
const aliases = new Map(groups.flatMap((group) => group.map((term) => [term, group[0]])));
const tokens = (value) => [...new Set((normalize(value).match(/[a-z0-9]+/g) || []).filter((term) => term.length > 1 && !stop.has(term)).map((term) => aliases.get(term) || term))];

// Keep excerpts literal, with original page numbers. No generated tournament rules or scores.
function passages(text) {
  const result = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + 1100, text.length);
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf('\n', end), text.lastIndexOf('. ', end), text.lastIndexOf(' ', end));
      if (boundary > start + 650) end = boundary + 1;
    }
    const excerpt = text.slice(start, end).trim();
    if (excerpt) result.push(excerpt);
    if (end === text.length) break;
    start = Math.max(start + 1, end - 140);
  }
  return result;
}

export function buildGiroKnowledgeIndex(materials = [], seasonId = 'legacy') {
  return materials.filter((material) => material?.status === 'published' && material.seasonId === seasonId).flatMap((material) => {
    const metadata = new Set(tokens(`${material.title} ${material.tags || ''} ${GIRO_MATERIAL_CATEGORIES[material.category] || ''}`));
    return (Array.isArray(material.pages) ? material.pages : []).slice(0, GIRO_MATERIAL_MAX_PAGES).flatMap((page) => passages(String(page.text || '').slice(0, GIRO_MATERIAL_MAX_TEXT)).map((excerpt, index) => ({
      id: `${material.id}:${page.number}:${index}`, materialId: String(material.id), title: String(material.title),
      page: page.number, excerpt, sourceURL: safeGiroURL(material.sourceURL) || '',
      system: material.system === true, category: material.category, terms: new Set(tokens(excerpt)), metadata,
      words: (normalize(excerpt).match(/[a-z0-9]+/g) || []).map((term) => aliases.get(term) || term),
      normalized: normalize(excerpt), heading: normalize(`${material.title} ${material.tags || ''}`),
    })));
  });
}

export function searchGiroKnowledge(question, index, previousQuestion = '') {
  const current = tokens(question);
  const followup = /\b(mais|melhor|isso|continue|novamente|detalhes|nesse|nessa|desse|dessa|ele|ela|e se|e quanto)\b/.test(normalize(question));
  const context = followup ? tokens(previousQuestion).filter((term) => !current.includes(term)).slice(0, 14) : [];
  const terms = [...current, ...context];
  if (!terms.length) return [];
  const averageLength = index.reduce((sum, entry) => sum + (entry.words?.length || entry.terms.size), 0) / Math.max(1, index.length);
  const rarity = new Map(terms.map((term) => {
    const count = index.filter((entry) => entry.terms.has(term)).length;
    return [term, Math.log(1 + (index.length - count + 0.5) / (count + 0.5))];
  }));
  const phrase = normalize(question).replace(/[?!.,]/g, '').trim();
  const matches = index.map((entry) => {
    let score = 0; let covered = 0; let bodyMatches = 0; let currentMatches = 0;
    for (const term of terms) {
      const body = entry.terms.has(term); const heading = entry.metadata.has(term);
      const weight = current.includes(term) ? 1 : current.length ? 0.4 : 1;
      if (body || heading) {
        covered++;
        if (current.includes(term)) currentMatches++;
        const frequency = entry.words?.filter((word) => word === term).length || (body ? 1 : 0);
        const bm25 = frequency * 2.2 / (frequency + 1.2 * (0.25 + 0.75 * (entry.words?.length || entry.terms.size) / (averageLength || 1)));
        score += weight * (rarity.get(term) * bm25 + (heading ? 0.65 : 0));
      }
      if (body) bodyMatches++;
    }
    if (phrase.length > 5 && (entry.normalized?.includes(phrase) || entry.heading?.includes(phrase))) score += 2;
    const coverage = covered / terms.length;
    return { ...entry, score: score * (0.5 + coverage), covered, bodyMatches, coverage, currentMatches };
  }).filter((entry) => entry.bodyMatches > 0 && (!current.length || entry.currentMatches > 0) && entry.covered >= Math.min(2, terms.length) && entry.coverage >= (followup ? 0.3 : 0.4))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const selected = [];
  for (const match of matches) {
    if (selected.length === 4) break;
    const samePage = selected.filter((item) => item.materialId === match.materialId && item.page === match.page);
    if (samePage.length >= 2 || samePage.some((item) => [...match.terms].filter((term) => item.terms.has(term)).length / Math.max(1, Math.min(match.terms.size, item.terms.size)) > 0.8)) continue;
    selected.push(match);
  }
  return selected;
}

export function answerGiroKnowledge(question, index, previousQuestion = '') {
  if (!index.length) return { text: 'A biblioteca desta temporada ainda não tem conteúdo publicado. Peça ao técnico para adicionar a rúbrica, as regras e os materiais da temporada em **Biblioteca do Giro**.', sources: [], searched: false, mode: 'library' };
  const found = searchGiroKnowledge(question, index, previousQuestion);
  if (!found.length) return { text: 'Não encontrei trechos com correspondência suficiente para essa pergunta nos materiais disponíveis. Tente citar o assunto, a missão ou o nome do documento. Você também pode abrir **Materiais** ou pedir ao técnico para complementar a biblioteca.\n\nNão consultei a internet nem gerei uma resposta fora dos materiais.', sources: [], searched: false, mode: 'library' };
  return {
    text: `Encontrei estes trechos nos materiais disponíveis. Confira o contexto e a versão do documento para a sua temporada.\n\n${found.map((entry, index) => `### ${index + 1}. ${entry.title}${entry.system ? ' · registro do sistema' : ` · página ${entry.page}`}\n\n${entry.excerpt}`).join('\n\n')}`,
    sources: found.map((entry) => ({ type: 'internal', materialId: entry.materialId, title: entry.title, page: entry.page, url: entry.sourceURL, excerpt: entry.excerpt, system: entry.system })),
    searched: false, mode: 'library',
  };
}

// Only explicitly permitted technical fields become searchable system references.
export function giroSystemMaterials(context, seasonId) {
  const safe = sanitizeGiroContext(context);
  const make = (id, title, category, fields) => ({ id: `system-${id}`, title, category, seasonId, status: 'published', system: true, pages: [{ number: 1, text: fields.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join('\n\n') }] });
  return [
    make('project', safe.project.title || 'Projeto de inovação da equipe', 'project', [['Projeto', safe.project.title], ['Problema', safe.project.problem], ['Solução', safe.project.solution], ['Impacto', safe.project.impact], ['Compartilhamento', safe.project.sharing]]),
    ...safe.robots.map((robot, index) => make(`robot-${index}`, robot.name || robot.version || 'Versão do robô', 'robot', Object.entries(robot))),
    ...safe.attachments.map((item, index) => make(`attachment-${index}`, item.name || 'Anexo do robô', 'robot', Object.entries(item))),
    ...safe.codes.map((item, index) => make(`code-${index}`, item.title || 'Programação da equipe', 'robot', Object.entries(item))),
  ].filter((material) => material.pages[0].text.length > 10 && !(material.id === 'system-project' && Object.keys(safe.project).every((key) => key === 'title') && safe.project.title === 'Nome do Projeto'));
}

export const WELCOME_GEARS = 40;

export const GEAR_SHOP_CATEGORIES = [
  { id: 'all', label: 'Toda a loja' },
  { id: 'skin', label: 'Cores do Giro' },
  { id: 'frame', label: 'Molduras' },
  { id: 'accessory', label: 'Acessórios' },
  { id: 'title', label: 'Títulos' },
];

export const GEAR_SHOP_ITEMS = [
  { id: 'skin-nebula', category: 'skin', name: 'Nebulosa New Gears', description: 'Azul e violeta, as cores de quem faz a equipe girar.', price: 0, colors: ['#67e8f9', '#6366f1', '#d946ef'], rarity: 'Essencial' },
  { id: 'skin-solar', category: 'skin', name: 'Motor solar', description: 'Dourado quente para iluminar cada nova ideia.', price: 25, colors: ['#fde68a', '#f59e0b', '#fb7185'], rarity: 'Criativa' },
  { id: 'skin-emerald', category: 'skin', name: 'Circuito esmeralda', description: 'Verde elétrico, pronto para colocar o plano em ação.', price: 35, colors: ['#bbf7d0', '#10b981', '#22d3ee'], rarity: 'Criativa' },
  { id: 'skin-rose', category: 'skin', name: 'Pulso rosa', description: 'Rosa e roxo para uma engrenagem cheia de personalidade.', price: 45, colors: ['#fbcfe8', '#ec4899', '#8b5cf6'], rarity: 'Rara' },
  { id: 'skin-arctic', category: 'skin', name: 'Núcleo ártico', description: 'Prata e azul profundo, direto do laboratório do futuro.', price: 65, colors: ['#f8fafc', '#94a3b8', '#38bdf8'], rarity: 'Rara' },
  { id: 'skin-lava', category: 'skin', name: 'Forja de ideias', description: 'Laranja e vermelho para ideias que acabaram de sair da forja.', price: 85, colors: ['#fed7aa', '#f97316', '#ef4444'], rarity: 'Épica' },
  { id: 'frame-none', category: 'frame', name: 'Órbita livre', description: 'O visual original, com espaço para novas possibilidades.', price: 0, variant: 'none', rarity: 'Essencial' },
  { id: 'frame-orbit', category: 'frame', name: 'Órbita neon', description: 'Anéis de luz ao redor do Giro e do seu avatar.', price: 20, variant: 'orbit', rarity: 'Criativa' },
  { id: 'frame-hex', category: 'frame', name: 'Escudo hexagonal', description: 'Uma moldura de engenharia para proteger boas ideias.', price: 40, variant: 'hex', rarity: 'Rara' },
  { id: 'frame-stars', category: 'frame', name: 'Constelação', description: 'Pequenas estrelas para uma contribuição que brilha.', price: 60, variant: 'stars', rarity: 'Rara' },
  { id: 'frame-champion', category: 'frame', name: 'Aro de campeão', description: 'Dourado, para celebrar o caminho construído em equipe.', price: 100, variant: 'champion', rarity: 'Épica' },
  { id: 'accessory-none', category: 'accessory', name: 'Giro original', description: 'Olhos curiosos e disposição para aprender.', price: 0, variant: 'none', rarity: 'Essencial' },
  { id: 'accessory-antenna', category: 'accessory', name: 'Antena de ideias', description: 'Sintonizado nas próximas descobertas da equipe.', price: 20, variant: 'antenna', rarity: 'Criativa' },
  { id: 'accessory-visor', category: 'accessory', name: 'Visor de programação', description: 'Pronto para ler sensores e encontrar o próximo bug.', price: 45, variant: 'visor', rarity: 'Rara' },
  { id: 'accessory-headphones', category: 'accessory', name: 'Fone de concentração', description: 'Foco no treino, sintonia com a equipe.', price: 55, variant: 'headphones', rarity: 'Rara' },
  { id: 'accessory-crown', category: 'accessory', name: 'Coroa da cooperação', description: 'A melhor conquista é fazer a equipe crescer junto.', price: 90, variant: 'crown', rarity: 'Épica' },
  { id: 'title-team', category: 'title', name: 'Faço a equipe girar', description: 'Toda engrenagem tem uma contribuição importante.', price: 0, rarity: 'Essencial' },
  { id: 'title-code', category: 'title', name: 'Código em ação', description: 'Para quem transforma lógica em movimento.', price: 20, rarity: 'Criativa' },
  { id: 'title-ideas', category: 'title', name: 'Força das ideias', description: 'Curiosidade que encontra novos caminhos.', price: 30, rarity: 'Criativa' },
  { id: 'title-voice', category: 'title', name: 'Voz da inovação', description: 'Escutar, perguntar e compartilhar descobertas.', price: 40, rarity: 'Rara' },
  { id: 'title-teamwork', category: 'title', name: 'Conecto engrenagens', description: 'Uma homenagem a quem ajuda outras pessoas a avançar.', price: 60, rarity: 'Rara' },
];

export const DEFAULT_GEAR_EQUIPMENT = { skin: 'skin-nebula', frame: 'frame-none', accessory: 'accessory-none', title: 'title-team' };
export const GEAR_CONTRIBUTIONS = {
  code: { collection: 'codeSnippets', coins: 12, label: 'Programação', message: 'Código no cofre! Sua lógica colocou mais uma ideia em movimento.', required: 'title' },
  expert: { collection: 'experts', coins: 20, label: 'Entrevista com especialista', message: 'Conhecimento de fora para fazer a equipe crescer. Boa entrevista!', required: 'name' },
  contact: { collection: 'expertContacts', coins: 8, label: 'Contato com especialista', message: 'Uma nova conexão! Buscar conhecimento também faz parte da jornada.', required: 'name' },
  robot: { collection: 'robotVersions', coins: 12, label: 'Versão do robô', message: 'Mais uma evolução do robô registrada. A engenharia está girando!', required: 'version' },
  attachment: { collection: 'attachments', coins: 10, label: 'Anexo do robô', message: 'Nova ferramenta na oficina! Cada detalhe ajuda a equipe a avançar.', required: 'name' },
  outreach: { collection: 'outreach', coins: 15, label: 'Ação de impacto', message: 'O conhecimento foi além da sala. Essa contribuição faz diferença!', required: 'name' },
  logbook: { collection: 'logbook', coins: 5, label: 'Diário de bordo', message: 'Aprendizado registrado! Nossa memória de equipe ficou mais rica.', required: 'text' },
  prototype: { collection: 'prototypeIterations', coins: 15, label: 'Evolução do protótipo', message: 'Uma ideia ganhou uma nova versão. Testar e melhorar é o caminho!', required: 'improvement' },
  test: { collection: 'score_history', coins: 6, label: 'Teste do robô', message: 'Teste registrado! Comparar resultados faz a engenharia avançar.', required: 'date' },
  checkin: { collection: 'dailyMoods', coins: 5, label: 'Check-in da equipe', message: 'Obrigado por contar como você está! Conhecer a energia de cada pessoa ajuda a equipe a cuidar de todos.', required: 'date' },
};

export const validGearCheckIn = (record) => {
  const date = record?.date;
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(Date.parse(`${date}T12:00:00Z`)) && new Date(`${date}T12:00:00Z`).toISOString().startsWith(date)
    && [25, 50, 75, 100].includes(record.level);
};
export const gearReceiptId = (studentId, type, sourceId, record) => {
  if (type === 'checkin' && !validGearCheckIn(record)) throw new Error('O check-in precisa ter uma data e uma energia válidas.');
  return `${studentId}__${type}__${type === 'checkin' ? record.date : sourceId}`;
};

export const gearItem = (id) => GEAR_SHOP_ITEMS.find((item) => item.id === id);
export const gearDay = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
};
export const gearDayIndex = (date = new Date()) => Math.floor((date.getTime() - 3 * 60 * 60 * 1000) / 86400000);
export const newGearProfile = (studentId) => ({ studentId: String(studentId), balance: WELCOME_GEARS, earned: WELCOME_GEARS, spent: 0, owned: Object.values(DEFAULT_GEAR_EQUIPMENT), equipped: { ...DEFAULT_GEAR_EQUIPMENT }, rewardDay: '', rewardDayIndex: -1, dayEarned: 0, dayCounts: {}, growthPoints: 0, contributionCounts: {} });
export const resolveGearEquipment = (equipment = {}) => Object.fromEntries(Object.entries(DEFAULT_GEAR_EQUIPMENT).map(([category, fallback]) => [category, gearItem(equipment?.[category])?.category === category ? equipment[category] : fallback]));
export const gearProfile = (studentId, value) => {
  const initial = newGearProfile(studentId);
  if (!value) return initial;
  return { ...initial, ...value, studentId: String(studentId), owned: [...new Set([...initial.owned, ...(Array.isArray(value.owned) ? value.owned.filter((id) => gearItem(id)) : [])])], equipped: resolveGearEquipment(value.equipped) };
};
export const contributionPath = (type, sourceId, studentId) => {
  if (!GEAR_CONTRIBUTIONS[type] || !sourceId || String(sourceId).includes('/')) throw new Error('Contribuição inválida.');
  return type === 'logbook' ? `students/${studentId}/logbook/${sourceId}` : `${GEAR_CONTRIBUTIONS[type].collection}/${sourceId}`;
};

export const GEAR_CONTRIBUTION_EVENT = 'newgears:contribution-saved';
export const celebrateGearContribution = (detail) => {
  if (typeof window !== 'undefined' && detail.studentId && GEAR_CONTRIBUTIONS[detail.type]) window.dispatchEvent(new CustomEvent(GEAR_CONTRIBUTION_EVENT, { detail }));
};

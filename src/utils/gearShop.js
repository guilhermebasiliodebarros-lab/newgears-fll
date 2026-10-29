export const WELCOME_GEARS = 40;

export const GEAR_SHOP_CATEGORIES = [
  { id: 'all', label: 'Toda a loja' },
  { id: 'skin', label: 'Cores do Giro' },
  { id: 'frame', label: 'Molduras' },
  { id: 'accessory', label: 'Acessórios' },
  { id: 'title', label: 'Títulos' },
  { id: 'room', label: 'Cenários' },
  { id: 'bench', label: 'Bancadas' },
  { id: 'light', label: 'Iluminação' },
  { id: 'decor', label: 'Decoração' },
  { id: 'animation', label: 'Comemorações' },
];

export const GEAR_SHOP_COLLECTIONS = [
  { id: 'bioglow', name: 'Expedição Bioglow', description: 'Luz de vaga-lumes e descobertas para uma oficina inspirada na natureza.', accent: '#a3e635', equipment: { skin: 'skin-bioglow', frame: 'frame-leaves', accessory: 'accessory-leaf', title: 'title-bioglow', room: 'room-base', bench: 'bench-engineer', light: 'light-solar', decor: 'decor-planet', animation: 'animation-fireflies' } },
  { id: 'mechanic', name: 'Oficina Mecânica', description: 'Ferramentas à mão, bancada de trabalho e ideias saindo da forja.', accent: '#fb923c', equipment: { skin: 'skin-lava', frame: 'frame-hex', accessory: 'accessory-goggles', title: 'title-code', room: 'room-base', bench: 'bench-engineer', light: 'light-solar', decor: 'decor-tools', animation: 'animation-gears' } },
  { id: 'space', name: 'Exploração Espacial', description: 'Uma estação entre as estrelas para descobertas de outro mundo.', accent: '#a5b4fc', equipment: { skin: 'skin-arctic', frame: 'frame-stars', accessory: 'accessory-helmet', title: 'title-ideas', room: 'room-orbit', bench: 'bench-holo', light: 'light-cosmic', decor: 'decor-planet', animation: 'animation-default' } },
  { id: 'neon', name: 'Circuito Neon', description: 'Luzes, circuitos e um palco para o Giro mostrar seu ritmo.', accent: '#22d3ee', equipment: { skin: 'skin-emerald', frame: 'frame-orbit', accessory: 'accessory-headphones', title: 'title-voice', room: 'room-neon', bench: 'bench-holo', light: 'light-neon', decor: 'decor-planet', animation: 'animation-stage' } },
  { id: 'tournament', name: 'Espírito de Torneio', description: 'Uma arena para celebrar o caminho construído com a equipe.', accent: '#fcd34d', equipment: { skin: 'skin-solar', frame: 'frame-champion', accessory: 'accessory-medal', title: 'title-teamwork', room: 'room-arena', bench: 'bench-podium', light: 'light-solar', decor: 'decor-trophy', animation: 'animation-trophy' } },
  { id: 'racing', name: 'Oficina de Corrida', description: 'Prepare o motor, confira os circuitos e dê a largada com o Giro.', accent: '#fb7185', equipment: { skin: 'skin-lava', frame: 'frame-orbit', accessory: 'accessory-visor', title: 'title-code', room: 'room-arena', bench: 'bench-engineer', light: 'light-neon', decor: 'decor-trophy', animation: 'animation-gears' } },
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
  { id: 'accessory-goggles', category: 'accessory', name: 'Óculos de inventor', description: 'Lentes de cobre para descobrir o que pode melhorar.', price: 45, variant: 'goggles', rarity: 'Rara' },
  { id: 'accessory-helmet', category: 'accessory', name: 'Capacete explorador', description: 'O Giro pronto para uma missão entre as estrelas.', price: 65, variant: 'helmet', rarity: 'Épica' },
  { id: 'accessory-medal', category: 'accessory', name: 'Medalha da equipe', description: 'Uma lembrança dourada de cada passo dado em equipe.', price: 70, variant: 'medal', rarity: 'Épica' },
  { id: 'room-base', category: 'room', name: 'Garagem New Gears', description: 'O primeiro cantinho do Giro, pronto para receber suas ideias.', price: 0, variant: 'base', rarity: 'Essencial' },
  { id: 'room-orbit', category: 'room', name: 'Estação orbital', description: 'Uma janela para o espaço e um horizonte de descobertas.', price: 70, variant: 'orbit', rarity: 'Rara' },
  { id: 'room-neon', category: 'room', name: 'Laboratório neon', description: 'Circuitos luminosos atravessam as paredes da oficina.', price: 80, variant: 'neon', rarity: 'Épica' },
  { id: 'room-arena', category: 'room', name: 'Arena da equipe', description: 'Arquibancadas e bandeiras para comemorar junto.', price: 90, variant: 'arena', rarity: 'Épica' },
  { id: 'bench-base', category: 'bench', name: 'Bancada inicial', description: 'Uma boa base para montar a próxima ideia.', price: 0, variant: 'base', rarity: 'Essencial' },
  { id: 'bench-engineer', category: 'bench', name: 'Bancada de engenharia', description: 'Gavetas, ferramentas e uma superfície pronta para testar.', price: 45, variant: 'engineer', rarity: 'Criativa' },
  { id: 'bench-holo', category: 'bench', name: 'Mesa holográfica', description: 'Uma bancada iluminada com projeções de novas possibilidades.', price: 65, variant: 'holo', rarity: 'Rara' },
  { id: 'bench-podium', category: 'bench', name: 'Pódio New Gears', description: 'Um lugar especial para celebrar o esforço da equipe.', price: 70, variant: 'podium', rarity: 'Épica' },
  { id: 'light-base', category: 'light', name: 'Luz da garagem', description: 'Iluminação suave para começar os trabalhos.', price: 0, variant: 'base', rarity: 'Essencial' },
  { id: 'light-neon', category: 'light', name: 'Faixa de luz neon', description: 'Azul e rosa iluminam as ideias do Giro.', price: 30, variant: 'neon', rarity: 'Criativa' },
  { id: 'light-solar', category: 'light', name: 'Luminária solar', description: 'Uma luz dourada que deixa a oficina mais acolhedora.', price: 35, variant: 'solar', rarity: 'Criativa' },
  { id: 'light-cosmic', category: 'light', name: 'Luz de nebulosa', description: 'Violeta e estrelas para acompanhar a próxima descoberta.', price: 40, variant: 'cosmic', rarity: 'Rara' },
  { id: 'decor-base', category: 'decor', name: 'Placa da equipe', description: 'A assinatura New Gears no seu cantinho.', price: 0, variant: 'base', rarity: 'Essencial' },
  { id: 'decor-tools', category: 'decor', name: 'Painel de ferramentas', description: 'O Giro pega sua chave favorita para trabalhar na bancada.', price: 35, variant: 'tools', rarity: 'Criativa' },
  { id: 'decor-planet', category: 'decor', name: 'Mini planeta orbital', description: 'Um pequeno planeta que o Giro pode colocar para girar.', price: 40, variant: 'planet', rarity: 'Rara' },
  { id: 'decor-trophy', category: 'decor', name: 'Troféu da cooperação', description: 'O Giro celebra com o símbolo do esforço em equipe.', price: 60, variant: 'trophy', rarity: 'Épica' },
  { id: 'animation-default', category: 'animation', name: 'Alegria do Giro', description: 'O pulinho de felicidade que já acompanha cada conquista.', price: 0, variant: 'celebrate', rarity: 'Essencial' },
  { id: 'animation-stage', category: 'animation', name: 'Dança de palco', description: 'Passos especiais, notas musicais e luzes para comemorar.', price: 50, variant: 'stage', rarity: 'Rara' },
  { id: 'animation-gears', category: 'animation', name: 'Chuva de engrenagens', description: 'Engrenagens coloridas caem pela tela do navegador.', price: 60, variant: 'gears', rarity: 'Épica' },
  { id: 'animation-trophy', category: 'animation', name: 'Troféu em festa', description: 'Um troféu dourado sobe pela tela com uma celebração especial.', price: 80, variant: 'trophy', rarity: 'Épica' },
  { id: 'skin-bioglow', category: 'skin', name: 'Núcleo Bioglow', description: 'Verde luminoso e dourado para explorar novas descobertas.', price: 55, colors: ['#ecfccb', '#65a30d', '#22c55e'], rarity: 'Rara' },
  { id: 'skin-ocean', category: 'skin', name: 'Maré de ideias', description: 'Turquesa e azul para navegar entre boas soluções.', price: 50, colors: ['#a5f3fc', '#0891b2', '#1d4ed8'], rarity: 'Rara' },
  { id: 'skin-plasma', category: 'skin', name: 'Energia plasma', description: 'Uma mistura de rosa e violeta que acende a oficina.', price: 95, colors: ['#f5d0fe', '#9333ea', '#f472b6'], rarity: 'Épica' },
  { id: 'skin-graphite', category: 'skin', name: 'Engrenagem grafite', description: 'Metal escuro e luz de gelo para o Giro engenheiro.', price: 80, colors: ['#e2e8f0', '#475569', '#22d3ee'], rarity: 'Épica' },
  { id: 'frame-leaves', category: 'frame', name: 'Círculo da floresta', description: 'Uma coroa de folhas ao redor do Giro e do avatar.', price: 50, variant: 'leaves', rarity: 'Rara' },
  { id: 'frame-circuit', category: 'frame', name: 'Circuito de precisão', description: 'Trilhas e conexões para uma moldura tecnológica.', price: 75, variant: 'circuit', rarity: 'Épica' },
  { id: 'accessory-leaf', category: 'accessory', name: 'Broto de descobertas', description: 'Duas folhas que crescem com as ideias do Giro.', price: 40, variant: 'leaf', rarity: 'Criativa' },
  { id: 'accessory-scientist', category: 'accessory', name: 'Giro cientista', description: 'Óculos redondos e uma gravata para investigar cada hipótese.', price: 60, variant: 'scientist', rarity: 'Rara' },
  { id: 'accessory-pilot', category: 'accessory', name: 'Boné de piloto', description: 'Viseira de corrida para comandar a próxima saída.', price: 55, variant: 'pilot', rarity: 'Rara' },
  { id: 'title-bioglow', category: 'title', name: 'Acendo descobertas', description: 'Ideias que iluminam o caminho da equipe.', price: 35, rarity: 'Criativa' },
  { id: 'title-navigator', category: 'title', name: 'Navegante da mesa', description: 'Cada curva tem um teste e cada saída tem um plano.', price: 45, rarity: 'Rara' },
  { id: 'title-explorer', category: 'title', name: 'Exploro possibilidades', description: 'Uma homenagem à curiosidade e às perguntas bem feitas.', price: 30, rarity: 'Criativa' },
  { id: 'animation-fireflies', category: 'animation', name: 'Festa dos vaga-lumes', description: 'Luzes verdes e folhas dançam com o Giro.', price: 85, variant: 'fireflies', rarity: 'Épica' },
  { id: 'animation-rocket', category: 'animation', name: 'Decolagem de ideias', description: 'Um foguete sobe com estrelas para celebrar a conquista.', price: 100, variant: 'rocket', rarity: 'Épica' },
];

export const DEFAULT_GEAR_EQUIPMENT = { skin: 'skin-nebula', frame: 'frame-none', accessory: 'accessory-none', title: 'title-team', room: 'room-base', bench: 'bench-base', light: 'light-base', decor: 'decor-base', animation: 'animation-default' };
export const GEAR_WORKSHOP_CATEGORIES = ['room', 'bench', 'light', 'decor'];
export const gearCollectionItems = (collectionId) => {
  const collection = GEAR_SHOP_COLLECTIONS.find((entry) => entry.id === collectionId);
  return collection ? Object.values(collection.equipment).map((id) => GEAR_SHOP_ITEMS.find((item) => item.id === id)).filter(Boolean) : [];
};
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
export const newGearProfile = (studentId) => ({ studentId: String(studentId), balance: WELCOME_GEARS, earned: WELCOME_GEARS, spent: 0, refundCount: 0, refundableItems: [], owned: Object.values(DEFAULT_GEAR_EQUIPMENT), equipped: { ...DEFAULT_GEAR_EQUIPMENT }, rewardDay: '', rewardDayIndex: -1, dayEarned: 0, dayCounts: {}, growthPoints: 0, contributionCounts: {} });
export const equippedGearAccessories = (equipment = {}) => [...new Set((Array.isArray(equipment?.accessories) ? equipment.accessories : [equipment?.accessory])
  .filter((id) => typeof id === 'string' && id !== 'accessory-none' && gearItem(id)?.category === 'accessory'))];

export const resolveGearEquipment = (equipment = {}) => {
  const selected = Object.fromEntries(Object.entries(DEFAULT_GEAR_EQUIPMENT).map(([category, fallback]) => [category, gearItem(equipment?.[category])?.category === category ? equipment[category] : fallback]));
  const accessories = equippedGearAccessories(equipment);
  selected.accessory = accessories.at(-1) || 'accessory-none';
  // Single-accessory profiles keep the original shape; no purchase/data reset is required.
  return accessories.length > 1 ? { ...selected, accessories } : selected;
};

export const isGearItemEquipped = (equipment, itemId) => {
  const item = gearItem(itemId);
  if (!item) return false;
  return item.category === 'accessory' ? itemId === 'accessory-none' ? !equippedGearAccessories(equipment).length : equippedGearAccessories(equipment).includes(itemId) : equipment?.[item.category] === itemId;
};

export function applyGearItem(equipment, itemId, { toggle = false, remove = false } = {}) {
  const selected = resolveGearEquipment(equipment);
  const item = gearItem(itemId);
  if (!item) return selected;
  if (item.category !== 'accessory') return { ...selected, [item.category]: remove ? DEFAULT_GEAR_EQUIPMENT[item.category] : itemId };
  const current = equippedGearAccessories(selected);
  const accessories = itemId === 'accessory-none' ? [] : remove || (toggle && current.includes(itemId)) ? current.filter((id) => id !== itemId) : [...new Set([...current, itemId])];
  return resolveGearEquipment({ ...selected, accessories });
}

export const gearEquipmentItems = (equipment) => {
  const selected = resolveGearEquipment(equipment);
  return [...Object.entries(selected).filter(([category]) => !['accessory', 'accessories'].includes(category)).map(([, id]) => gearItem(id)),
    ...(equippedGearAccessories(selected).length ? equippedGearAccessories(selected).map(gearItem) : [gearItem('accessory-none')])];
};
export const gearProfile = (studentId, value) => {
  const initial = newGearProfile(studentId);
  if (!value) return initial;
  const owned = [...new Set([...initial.owned, ...(Array.isArray(value.owned) ? value.owned.filter((id) => gearItem(id)) : [])])];
  return { ...initial, ...value, studentId: String(studentId), owned, refundableItems: value.refundableItems ?? owned.filter((id) => gearItem(id).price > 0 && value.spent > 0), equipped: resolveGearEquipment(value.equipped) };
};
export const contributionPath = (type, sourceId, studentId) => {
  if (!GEAR_CONTRIBUTIONS[type] || !sourceId || String(sourceId).includes('/')) throw new Error('Contribuição inválida.');
  return type === 'logbook' ? `students/${studentId}/logbook/${sourceId}` : `${GEAR_CONTRIBUTIONS[type].collection}/${sourceId}`;
};

export const GEAR_CONTRIBUTION_EVENT = 'newgears:contribution-saved';
export const celebrateGearContribution = (detail) => {
  if (typeof window !== 'undefined' && detail.studentId && GEAR_CONTRIBUTIONS[detail.type]) window.dispatchEvent(new CustomEvent(GEAR_CONTRIBUTION_EVENT, { detail }));
};

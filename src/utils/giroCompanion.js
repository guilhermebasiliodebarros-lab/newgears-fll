import { taskParticipants } from './teamProcesses.js';
import { briefingEvents } from './workspaceBriefing.js';

export function giroPersonalTasks(tasks, student, technical = false) {
  return (Array.isArray(tasks) ? tasks : []).filter((task) => task && (technical || (student?.id && taskParticipants(task, [student]).some((person) => person.id ? person.id === student.id : person.name === student.name))));
}

// Local UI context only. Never include this snapshot in an AI request or persist it.
export function giroProgressSnapshot({ student, technical, tasks }) {
  return {
    owner: technical ? 'team' : student?.id || '',
    xp: typeof student?.xp === 'number' && Number.isFinite(student.xp) ? student.xp : null,
    badges: Array.isArray(student?.badges) ? [...new Set(student.badges.filter((id) => typeof id === 'string'))] : null,
    tasks: Object.fromEntries(giroPersonalTasks(tasks, student, technical).filter((task) => task.id).map((task) => [task.id, task.status])),
  };
}

export function giroProgressReaction(previous, next) {
  if (!previous || !next.owner || previous.owner !== next.owner) return null;
  const xp = previous.xp !== null && next.xp !== null ? Math.max(0, next.xp - previous.xp) : 0;
  const badges = previous.badges && next.badges ? next.badges.filter((id) => !previous.badges.includes(id)).length : 0;
  // A newly loaded record is not a new accomplishment; require a known transition.
  const completed = Object.entries(next.tasks).filter(([id, status]) => status === 'done' && Object.hasOwn(previous.tasks, id) && previous.tasks[id] !== 'done').length;
  if (!xp && !badges && !completed) return null;
  return {
    kind: badges ? 'achievement' : completed ? 'task' : 'xp', mood: badges ? 'excited' : 'celebrate',
    title: badges ? 'Uma nova conquista!' : completed ? 'Mais um passo concluído!' : `+${xp.toLocaleString('pt-BR')} XP!`,
    message: [badges ? `${badges === 1 ? 'Uma conquista foi desbloqueada' : `${badges} conquistas foram desbloqueadas`}.` : '', completed ? `${completed === 1 ? 'Uma tarefa foi concluída' : `${completed} tarefas foram concluídas`}. Que tal registrar o que funcionou?` : '', xp ? `Seu progresso aumentou ${xp.toLocaleString('pt-BR')} XP. Cada contribuição conta!` : ''].filter(Boolean).join(' '),
    xp,
  };
}

const advice = (id, title, message, page, label, question, mood = 'help') => ({ id, title, message, action: { page, label }, question, mood });

export function giroLocalAdvice({ page = 'overview', student, technical, tasks, events, today, readiness }, step = 0) {
  page = page === 'rounds' ? 'robot' : page === 'sprint' ? 'final_sprint' : page;
  const pending = giroPersonalTasks(tasks, student, technical).filter((task) => task.status !== 'done');
  const upcoming = briefingEvents(events, today || '9999-12-31');
  const feedbackPage = technical ? 'evaluations' : 'feedback';
  const common = [
    advice('welcome', 'Vamos construir juntos?', 'Uma ideia, um teste e um registro de cada vez. Posso dar dicas aqui mesmo, mesmo quando a IA estiver indisponível.', 'kanban', 'Ver tarefas', 'Como organizar um treino produtivo?'),
    advice('robot-test', 'Um ajuste por teste', 'No treino, mantenha o ponto de saída e mude uma variável por vez. Anote os acertos e as condições para comparar os resultados.', 'robot', 'Abrir robô', 'Como comparar a confiabilidade de duas saídas do robô?'),
    advice('judges', 'Conte a história das decisões', 'Para preparar a apresentação, expliquem o problema, a escolha feita, o teste e o que mudou depois do feedback. Usem evidências reais da equipe.', 'rubrics', 'Ver rubricas', 'Como ensaiar uma apresentação para os juízes sem decorar um texto?'),
  ];
  const pages = {
    kanban: [advice('tasks', 'Qual é o próximo passo?', pending.length ? `${pending.length} ${pending.length === 1 ? 'tarefa em aberto' : 'tarefas em aberto'} ${technical ? 'na equipe' : 'para você'}. Escolha uma, combine o resultado esperado e registre uma evidência antes de concluir.` : 'Nenhuma tarefa em aberto nos registros disponíveis. Aproveite para revisar os aprendizados com a equipe.', 'kanban', 'Abrir tarefas', 'Como dividir uma tarefa grande em passos menores?'), advice('task-proof', 'Mostre o que mudou', 'Uma foto, um resultado de teste ou uma explicação curta pode ajudar a equipe a entender sua entrega. Revise antes de marcar como concluída.', 'logbook', 'Abrir diário', 'Como registrar uma boa evidência de uma tarefa?')],
    agenda: [advice('events', 'Prepare o próximo encontro', upcoming.length ? `Próximo evento registrado: ${String(upcoming[0].title || 'Encontro da equipe').slice(0, 120)}. Confira os detalhes na agenda e combine o que cada pessoa precisa levar.` : 'Não encontrei próximos eventos nos dados disponíveis. Uma pauta curta ajuda a transformar o próximo encontro em resultados.', 'agenda', 'Ver agenda', 'Como montar uma pauta para o próximo treino?')],
    weekly_reports: [advice('reports', 'Um relatório que ajuda a equipe', 'Conte o objetivo, o que foi feito, as evidências e o próximo passo. Diferencie o que já foi testado do que ainda é uma hipótese.', 'weekly_reports', 'Ver relatórios', 'Como estruturar um relatório de testes da equipe?')],
    logbook: [advice('logbook', 'Registre a descoberta de hoje', 'O que você tentou? O que observou? O que faria diferente? Três respostas curtas já ajudam a lembrar por que a equipe tomou uma decisão.', 'logbook', 'Abrir diário', 'Como transformar minhas anotações em um registro de aprendizagem?')],
    strategy: [advice('project', 'A solução responde ao problema?', 'Conectem pesquisa, protótipo e feedback. Identifiquem qual hipótese o próximo teste pode confirmar ou refutar, sem inventar resultados.', 'strategy', 'Ver estratégia', 'Como planejar um teste simples do nosso projeto de inovação?')],
    robot: [common[1], advice('reverse', 'Ré também faz parte da estratégia', 'No simulador, confira a orientação inicial, os trechos de ré e o espaço da garra. Depois compare o percurso com testes reais na mesa.', 'robot', 'Abrir robô', 'Como testar uma saída que inclui marcha à ré?')],
    rubrics: [common[2]],
    evaluations: [advice('feedback', 'Feedback vira um próximo passo', 'Escolha um ponto de melhoria e combine uma ação observável para o próximo encontro. A evolução se percebe nos registros, não só na nota.', feedbackPage, 'Ver avaliações', 'Como transformar um feedback em uma meta prática?')],
    feedback: [advice('progress', 'Seu próximo passo importa', 'Compare seu feedback com uma contribuição recente. Escolha algo pequeno para praticar e compartilhe o resultado com o técnico.', feedbackPage, 'Ver meu feedback', 'Como acompanhar minha evolução na equipe?')],
    final_sprint: [common[2], common[1]],
  };
  const candidates = [...(pages[page] || [...(pending.length ? [pages.kanban[0]] : []), ...(upcoming.length ? [pages.agenda[0]] : [])]), ...common];
  const options = [...new Map(candidates.map((tip) => [tip.id, tip])).values()];
  if (technical && page === 'overview' && Number.isFinite(readiness)) options.push(advice('readiness', 'Preparação com evidências', `O painel indica ${Math.round(Math.max(0, Math.min(100, readiness)))}% de preparação nos critérios acompanhados pelo sistema. Isso é um indicador interno, não uma previsão de resultado no torneio.`, feedbackPage, 'Ver preparação', 'Como organizar as evidências para a apresentação?'));
  const selected = options[((Number.isFinite(step) ? Math.trunc(step) : 0) % options.length + options.length) % options.length];
  return { ...selected, action: { ...selected.action, page: selected.action.page === 'robot' ? 'rounds' : selected.action.page } };
}

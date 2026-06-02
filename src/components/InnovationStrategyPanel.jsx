import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Lightbulb,
  Mail,
  Megaphone,
  MessageSquare,
  Paperclip,
  Pencil,
  Phone,
  Send,
  Star,
  Target,
  Trash2,
  UserCircle,
} from 'lucide-react';

const scoreDecisionIdea = (item) => (item.impact * 3) + (item.cost * 2) + item.feasibility + (item.innovation * 2);

const formatDate = (value) => {
  if (!value) return 'Sem data';
  return `${value}`.includes('-') ? `${value}`.split('-').reverse().join('/') : value;
};

const getImpactTone = (impact) => {
  if (impact === 'Alto') return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100';
  if (impact === 'Medio') return 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100';
  return 'border-white/10 bg-white/5 text-gray-200';
};

const CONTACT_CHANNEL_META = {
  email: { label: 'E-mail', icon: Mail },
  instagram: { label: 'Instagram', icon: Instagram },
  linkedin: { label: 'LinkedIn', icon: Linkedin },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare },
  phone: { label: 'Telefone', icon: Phone },
  other: { label: 'Outro', icon: Send },
};

const CONTACT_STATUS_META = {
  sent: { label: 'Mensagem enviada', tone: 'border-blue-400/20 bg-blue-400/10 text-blue-100' },
  waiting: { label: 'Aguardando retorno', tone: 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100' },
  responded: { label: 'Respondeu', tone: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100' },
  meeting: { label: 'Mentoria agendada', tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' },
  no_response: { label: 'Sem retorno', tone: 'border-white/10 bg-white/5 text-gray-300' },
  unavailable: { label: 'Nao disponivel', tone: 'border-red-400/20 bg-red-400/10 text-red-100' },
};

const InnovationStrategyPanel = ({
  projectSummary,
  projectImpactNarrative,
  decisionMatrix,
  experts,
  expertContacts,
  outreachEvents,
  totalImpactPeople,
  isAdmin,
  viewAsStudent,
  onOpenProject,
  onOpenMatrix,
  onDeleteMatrix,
  onOpenExpert,
  onOpenExpertEdit,
  onOpenExpertView,
  onDeleteExpert,
  onOpenExpertContact,
  onOpenExpertContactEdit,
  onDeleteExpertContact,
  onOpenImpact,
  onDeleteOutreach,
}) => {
  const [showProjectGuide, setShowProjectGuide] = React.useState(false);
  const sortedDecisionIdeas = [...decisionMatrix].sort((left, right) => scoreDecisionIdea(right) - scoreDecisionIdea(left));
  const sortedExperts = [...experts].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const sortedExpertContacts = [...expertContacts].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const sortedImpactEvents = [...outreachEvents].sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const topDecisionIdea = sortedDecisionIdeas[0] || null;
  const matrixAverageScore = sortedDecisionIdeas.length > 0
    ? (sortedDecisionIdeas.reduce((sum, item) => sum + scoreDecisionIdea(item), 0) / sortedDecisionIdeas.length).toFixed(1)
    : '0.0';
  const appliedExperts = sortedExperts.filter((expert) => expert.applied);
  const expertsWithEvidence = sortedExperts.filter((expert) => expert.image);
  const expertConversionRate = sortedExperts.length > 0 ? Math.round((appliedExperts.length / sortedExperts.length) * 100) : 0;
  const respondedExpertContacts = sortedExpertContacts.filter((contact) => ['responded', 'meeting'].includes(contact.status));
  const scheduledExpertContacts = sortedExpertContacts.filter((contact) => contact.status === 'meeting');
  const expertContactsWithEvidence = sortedExpertContacts.filter((contact) => contact.evidence);
  const expertContactResponseRate = sortedExpertContacts.length > 0
    ? Math.round((respondedExpertContacts.length / sortedExpertContacts.length) * 100)
    : 0;
  const expertContactChannelCounts = sortedExpertContacts.reduce((accumulator, contact) => {
    accumulator[contact.channel || 'other'] = (accumulator[contact.channel || 'other'] || 0) + 1;
    return accumulator;
  }, {});
  const topImpactType = Object.entries(
    sortedImpactEvents.reduce((accumulator, event) => {
      accumulator[event.type || 'Outro'] = (accumulator[event.type || 'Outro'] || 0) + (event.people || 0);
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1])[0];
  const latestImpactEvent = sortedImpactEvents[0] || null;
  const projectReadinessChecklist = [
    {
      label: 'Nome do projeto definido',
      ready: Boolean(`${projectSummary?.title || ''}`.trim()) && projectSummary?.title !== 'Nome do Projeto',
      helper: 'Escolham um nome que os juizes consigam repetir com facilidade.',
    },
    {
      label: 'Problema bem delimitado',
      ready: Boolean(`${projectSummary?.problem || ''}`.trim()),
      helper: 'Descrevam quem sofre, o que acontece e por que isso importa.',
    },
    {
      label: 'Solucao compreensivel',
      ready: Boolean(`${projectSummary?.solution || ''}`.trim()),
      helper: 'Expliquem como a ideia funciona de forma simples e convincente.',
    },
    {
      label: 'Impacto explicado',
      ready: Boolean(`${projectSummary?.impact || ''}`.trim()),
      helper: 'Mostrem quem ganha com isso e qual beneficio real aparece.',
    },
    {
      label: 'Evidencia visual',
      ready: Boolean(projectSummary?.image),
      helper: 'Anexem desenho, mockup ou prototipo para dar concretude.',
    },
  ];
  const projectReadinessScore = Math.round((projectReadinessChecklist.filter((item) => item.ready).length / projectReadinessChecklist.length) * 100);
  const missingReadinessCount = projectReadinessChecklist.filter((item) => !item.ready).length;

  const strategySignals = [
    {
      label: 'Projeto pronto',
      value: `${projectReadinessScore}%`,
      helper: `${projectReadinessChecklist.filter((item) => item.ready).length}/${projectReadinessChecklist.length} blocos prontos`,
      tone: projectReadinessScore >= 80 ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100',
    },
    {
      label: 'Matriz de ideias',
      value: sortedDecisionIdeas.length,
      helper: topDecisionIdea ? `Lider atual: ${topDecisionIdea.name}` : 'Cadastrem mais alternativas',
      tone: 'border-purple-400/20 bg-purple-400/10 text-purple-100',
    },
    {
      label: 'Contatos feitos',
      value: sortedExpertContacts.length,
      helper: `${expertContactResponseRate}% de retorno nas prospeccoes`,
      tone: 'border-pink-400/20 bg-pink-400/10 text-pink-100',
    },
    {
      label: 'Impacto real',
      value: totalImpactPeople,
      helper: topImpactType ? `${topImpactType[0]} puxando o alcance` : 'Documentem o primeiro contato',
      tone: 'border-orange-400/20 bg-orange-400/10 text-orange-100',
    },
  ];

  const projectQuestCards = [
    {
      label: 'Problema real',
      value: projectSummary?.problem || 'Descrevam quem sofre com o problema, onde isso acontece e por que a equipe decidiu agir.',
      tone: 'border-rose-400/20 bg-rose-400/10 text-rose-50',
    },
    {
      label: 'Solucao da equipe',
      value: projectSummary?.solution || 'Explique como a proposta funciona, o que ela faz e por que e melhor que alternativas comuns.',
      tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-50',
    },
    {
      label: 'Impacto defendivel',
      value: projectImpactNarrative || 'Mostrem quem se beneficia, qual ganho real aparece e como a equipe pretende ampliar esse efeito.',
      tone: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-50',
    },
  ];

  const guideCards = [
    {
      title: 'Matriz de decisao',
      detail: 'Comparem pelo menos 3 ideias reais usando os mesmos criterios. A banca precisa enxergar por que uma rota ficou melhor que a outra.',
      tone: 'border-purple-400/20 bg-purple-400/10 text-purple-100',
      icon: <BarChart3 size={14} className="text-purple-200" />,
    },
    {
      title: 'Consulta a especialistas',
      detail: 'Registrem nome, cargo, insight principal, se a sugestao foi aplicada e o que mudou depois da conversa.',
      tone: 'border-pink-400/20 bg-pink-400/10 text-pink-100',
      icon: <MessageSquare size={14} className="text-pink-200" />,
    },
    {
      title: 'Impacto comprovado',
      detail: 'Cada registro precisa mostrar acao feita, publico, quantidade de pessoas e algum retorno para virar evidencia forte.',
      tone: 'border-orange-400/20 bg-orange-400/10 text-orange-100',
      icon: <Megaphone size={14} className="text-orange-200" />,
    },
  ];

  const focusCards = [
    {
      label: 'Matriz de decisao',
      value: sortedDecisionIdeas.length,
      helper: topDecisionIdea ? `Melhor ideia: ${topDecisionIdea.name}` : 'Cadastrem alternativas para comparar.',
      tone: 'border-purple-400/20 bg-purple-400/10 text-purple-100',
    },
    {
      label: 'Contatos feitos',
      value: sortedExpertContacts.length,
      helper: sortedExpertContacts.length > 0 ? `${respondedExpertContacts.length} retorno(s) recebido(s)` : 'Registrem a primeira tentativa de contato.',
      tone: 'border-pink-400/20 bg-pink-400/10 text-pink-100',
    },
    {
      label: 'Impacto',
      value: totalImpactPeople,
      helper: latestImpactEvent ? `Ultimo registro: ${latestImpactEvent.name}` : 'Documentem o primeiro alcance real.',
      tone: 'border-orange-400/20 bg-orange-400/10 text-orange-100',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="newgears-major-panel relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(24,16,28,0.98),rgba(13,16,24,0.98))] p-6 md:p-8 shadow-[0_26px_90px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_40%)]" />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[0.94fr,1.06fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-100">
              <Lightbulb size={12} />
              Estrategia
            </span>
            <h3 className="mt-4 text-3xl font-black leading-tight text-white">Estrategia da equipe</h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
              A tela principal agora fica focada no que mais ajuda na rotina: matriz de decisao, especialistas e impacto. O resumo completo do projeto ficou separado para nao tomar o espaco principal.
            </p>
            {projectSummary?.title && projectSummary.title !== 'Nome do Projeto' ? (
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-yellow-100/80">
                Projeto atual: <span className="text-white">{projectSummary.title}</span>
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={onOpenProject} className="inline-flex items-center gap-2 rounded-[18px] border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-yellow-100 transition-all hover:-translate-y-0.5 hover:bg-yellow-400 hover:text-slate-950">
                <Lightbulb size={14} /> Projeto
              </button>
              <button onClick={() => setShowProjectGuide((current) => !current)} className="inline-flex items-center gap-2 rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-400 hover:text-slate-950">
                <Target size={14} /> {showProjectGuide ? 'Ocultar guia' : 'Ver guia do projeto'}
              </button>
              <button onClick={onOpenMatrix} className="inline-flex items-center gap-2 rounded-[18px] border border-purple-400/20 bg-purple-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-purple-100 transition-all hover:-translate-y-0.5 hover:bg-purple-400 hover:text-white">
                <BarChart3 size={14} /> Matriz
              </button>
              <button onClick={onOpenExpert} className="inline-flex items-center gap-2 rounded-[18px] border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-pink-100 transition-all hover:-translate-y-0.5 hover:bg-pink-400 hover:text-white">
                <MessageSquare size={14} /> Especialista
              </button>
              <button onClick={onOpenExpertContact} className="inline-flex items-center gap-2 rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-400 hover:text-slate-950">
                <Send size={14} /> Registrar contato
              </button>
              <button onClick={onOpenImpact} className="inline-flex items-center gap-2 rounded-[18px] border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-orange-100 transition-all hover:-translate-y-0.5 hover:bg-orange-400 hover:text-white">
                <Megaphone size={14} /> Impacto
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/25 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Foco principal</p>
                <h4 className="mt-2 text-xl font-black text-white">O que precisa ficar visivel</h4>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-200">
                3 frentes
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {focusCards.map((card) => (
                <div key={card.label} className={`rounded-[22px] border p-4 ${card.tone}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">{card.label}</p>
                  <p className="mt-3 text-2xl font-black text-white">{card.value}</p>
                  <p className="mt-2 text-xs leading-relaxed opacity-90">{card.helper}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Projeto separado</p>
              <p className="mt-3 text-xs leading-relaxed text-gray-300">
                O resumo completo do projeto saiu da tela principal. Use <span className="font-bold text-white">Projeto</span> para editar e <span className="font-bold text-white">Ver guia do projeto</span> quando quiser revisar narrativa e defesa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showProjectGuide ? (
        <div className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
          <div className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Resumo do projeto</p>
                <h3 className="mt-2 text-xl font-black text-white">Narrativa central</h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${projectReadinessScore >= 80 ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100'}`}>
                {projectReadinessScore}% pronto
              </span>
            </div>

            <div className="mt-5 rounded-[26px] border border-white/10 bg-black/25 p-4">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Prontidao do projeto</p>
                  <p className="mt-2 text-4xl font-black text-white">{projectReadinessScore}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-bold text-gray-200">
                  {projectReadinessChecklist.filter((item) => item.ready).length} etapa(s) liberada(s)
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/40">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-fuchsia-300 to-cyan-300" style={{ width: `${Math.max(8, projectReadinessScore)}%` }} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-400">
                Aqui fica o resumo completo para revisar a defesa do projeto quando voces quiserem.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {strategySignals.map((signal) => (
                <div key={signal.label} className={`rounded-[22px] border p-4 ${signal.tone}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">{signal.label}</p>
                  <p className="mt-3 text-2xl font-black text-white">{signal.value}</p>
                  <p className="mt-2 text-xs leading-relaxed opacity-90">{signal.helper}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {projectQuestCards.map((card) => (
                <div key={card.label} className={`rounded-[24px] border p-4 ${card.tone}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">{card.label}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {projectReadinessChecklist.map((item) => (
                <div key={item.label} className={`rounded-[22px] border p-4 ${item.ready ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    {item.ready ? <CheckCircle size={14} className="text-emerald-300" /> : <AlertTriangle size={14} className="text-yellow-300" />}
                    {item.label}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-300">{item.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Guia de apresentacao</p>
                <h3 className="mt-2 text-xl font-black text-white">Leitura para a defesa</h3>
              </div>
              <button onClick={() => setShowProjectGuide(false)} className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-gray-200 transition-all hover:bg-white/10 hover:text-white">
                Ocultar guia
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {guideCards.map((card) => (
                <div key={card.title} className={`rounded-[24px] border p-4 ${card.tone}`}>
                  <p className="flex items-center gap-2 text-sm font-black text-white">
                    {card.icon}
                    {card.title}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-white/90">{card.detail}</p>
                </div>
              ))}

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-gray-200">
                <p className="flex items-center gap-2 text-sm font-black text-white">
                  <Target size={14} className="text-cyan-300" />
                  Regra de defesa
                </p>
                <p className="mt-3 text-xs leading-relaxed">
                  Sempre que a equipe afirmar algo, tentem ligar essa fala a uma evidencia real: teste, conversa, foto, impacto, prototipo ou comparacao de ideias.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Oficina de ideias</p>
            <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-white">
              <BarChart3 className="text-purple-400" />
              Matriz de decisao
            </h3>
          </div>
          <button onClick={onOpenMatrix} className="rounded-[18px] border border-purple-400/20 bg-purple-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-purple-100 transition-all hover:-translate-y-0.5 hover:bg-purple-400 hover:text-white">
            + Nova ideia
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.72fr,1.28fr]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Manual da matriz</p>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">Impacto: o quanto a ideia realmente ajuda o problema.</div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">Custo: se a equipe consegue sustentar essa rota.</div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">Facilidade: tempo, recurso e chance de execucao.</div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">Inovacao: o quanto a proposta se destaca.</div>
              </div>
            </div>

            <div className="rounded-[24px] border border-purple-400/20 bg-purple-400/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-100/80">Leitura rapida</p>
              <p className="mt-3 text-3xl font-black text-white">{matrixAverageScore}</p>
              <p className="mt-2 text-xs text-purple-50/80">media geral das ideias registradas.</p>
              <p className="mt-4 text-sm font-black text-white">{topDecisionIdea ? topDecisionIdea.name : 'Sem lider atual'}</p>
              <p className="mt-2 text-xs leading-relaxed text-purple-50/80">
                {topDecisionIdea ? `Pontuacao atual: ${scoreDecisionIdea(topDecisionIdea)}` : 'Adicionem ideias para comparar caminhos com criterio.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[26px] border border-white/10 bg-black/20">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Ideia</th>
                  <th className="p-3 text-center">Impacto x3</th>
                  <th className="p-3 text-center">Custo x2</th>
                  <th className="p-3 text-center">Facilidade</th>
                  <th className="p-3 text-center">Inovacao x2</th>
                  <th className="p-3 text-right text-white">Total</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {sortedDecisionIdeas.map((item, index) => {
                  const total = scoreDecisionIdea(item);

                  return (
                    <tr key={item.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                      <td className="p-3">
                        <span className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-full text-xs font-black ${index === 0 ? 'bg-yellow-300 text-slate-950' : 'bg-white/10 text-gray-100'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-black text-white">
                        {item.name}
                        {item.author && (
                          <span className="mt-1 flex items-center gap-1 text-[10px] font-normal text-gray-500">
                            <UserCircle size={10} /> {item.author}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center text-gray-400">{item.impact}</td>
                      <td className="p-3 text-center text-gray-400">{item.cost}</td>
                      <td className="p-3 text-center text-gray-400">{item.feasibility}</td>
                      <td className="p-3 text-center text-gray-400">{item.innovation}</td>
                      <td className="p-3 text-right text-lg font-black text-purple-300">{total}</td>
                      <td className="p-3 text-right">
                        {(isAdmin || item.author === viewAsStudent?.name) && (
                          <button onClick={() => onDeleteMatrix(item.id)} className="rounded-xl p-1 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-300">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {sortedDecisionIdeas.length === 0 && (
              <div className="py-8 text-center text-sm italic text-gray-500">
                Nenhuma ideia cadastrada ainda. Adicionem opcoes diferentes para comparar com criterio.
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-[30px] border border-cyan-400/20 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/70">Prospeccao documentada</p>
            <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-white">
              <Send className="text-cyan-300" />
              Contatos realizados
            </h3>
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-gray-300">
              Registre cada tentativa de contato, mesmo quando nao houver resposta. Isso mostra iniciativa, organizacao e busca ativa por conhecimento.
            </p>
          </div>
          <button onClick={onOpenExpertContact} className="rounded-[16px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 transition-all hover:bg-cyan-400 hover:text-slate-950">
            + Novo contato
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100/80">Contatos feitos</p>
            <p className="mt-3 text-3xl font-black text-white">{sortedExpertContacts.length}</p>
          </div>
          <div className="rounded-[22px] border border-blue-400/20 bg-blue-400/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/80">Retornos</p>
            <p className="mt-3 text-3xl font-black text-white">{respondedExpertContacts.length}</p>
          </div>
          <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/80">Mentorias agendadas</p>
            <p className="mt-3 text-3xl font-black text-white">{scheduledExpertContacts.length}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Taxa de resposta</p>
            <p className="mt-3 text-3xl font-black text-white">{expertContactResponseRate}%</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
            <Paperclip size={12} />
            Evidencias: {expertContactsWithEvidence.length}
          </span>
          {Object.entries(expertContactChannelCounts).map(([channel, total]) => {
            const channelMeta = CONTACT_CHANNEL_META[channel] || CONTACT_CHANNEL_META.other;

            return (
              <span key={channel} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-200">
                {React.createElement(channelMeta.icon, { size: 12 })}
                {channelMeta.label}: {total}
              </span>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {sortedExpertContacts.map((contact) => {
            const channelMeta = CONTACT_CHANNEL_META[contact.channel] || CONTACT_CHANNEL_META.other;
            const statusMeta = CONTACT_STATUS_META[contact.status] || CONTACT_STATUS_META.sent;

            return (
              <article key={contact.id} className="group relative rounded-[24px] border border-white/10 bg-black/25 p-4 transition-all hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/5">
                <div className="absolute right-3 top-3 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <button onClick={() => onOpenExpertContactEdit(contact)} className="rounded-xl bg-black/60 p-2 text-gray-400 transition-colors hover:text-white" title="Editar contato">
                    <Pencil size={14} />
                  </button>
                  {(isAdmin || contact.author === viewAsStudent?.name) && (
                    <button onClick={() => onDeleteExpertContact(contact.id)} className="rounded-xl bg-black/60 p-2 text-gray-400 transition-colors hover:text-red-300" title="Excluir contato">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="pr-20">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-white">{contact.name}</h4>
                      <p className="mt-1 text-xs text-gray-400">{contact.role || 'Area nao informada'}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusMeta.tone}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-gray-400">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      {React.createElement(channelMeta.icon, { size: 11 })} {channelMeta.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      <Calendar size={11} /> {formatDate(contact.date)}
                    </span>
                    {contact.author && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        <UserCircle size={11} /> {contact.author}
                      </span>
                    )}
                  </div>

                  {contact.contactDetail && <p className="mt-3 break-words text-xs font-bold text-cyan-200">{contact.contactDetail}</p>}
                  {contact.notes && <p className="mt-3 text-xs leading-relaxed text-gray-300">{contact.notes}</p>}
                  {contact.evidence && (
                    <div className="mt-4 rounded-[18px] border border-cyan-400/15 bg-cyan-400/5 p-3">
                      {contact.evidenceType?.startsWith('image/') && (
                        <a href={contact.evidence} target="_blank" rel="noreferrer" className="mb-3 block overflow-hidden rounded-xl border border-white/10 bg-black/25">
                          <img src={contact.evidence} alt={`Evidencia do contato com ${contact.name}`} className="max-h-36 w-full object-cover object-top transition-transform hover:scale-[1.02]" />
                        </a>
                      )}
                      <div className="flex items-center justify-between gap-3">
                        <a href={contact.evidence} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-xs font-bold text-cyan-200 transition-colors hover:text-white">
                          <Paperclip size={13} className="shrink-0" />
                          <span className="truncate">{contact.evidenceName || 'Abrir evidencia'}</span>
                        </a>
                        <a href={contact.evidence} download={contact.evidenceName || `evidencia-${contact.name}`} className="rounded-lg border border-white/10 bg-black/25 p-2 text-gray-300 transition-colors hover:text-white" title="Baixar evidencia">
                          <Download size={13} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {sortedExpertContacts.length === 0 && (
          <div className="mt-5 rounded-[22px] border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm italic text-gray-500">
            Nenhuma tentativa registrada ainda. Comecem documentando os primeiros e-mails, mensagens ou contatos pelo LinkedIn.
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Mentorias e especialistas</p>
              <h3 className="mt-2 flex items-center gap-2 text-lg font-black text-white">
                <MessageSquare className="text-pink-400" />
                Especialistas
              </h3>
            </div>
            <button onClick={onOpenExpert} className="rounded-[16px] border border-pink-400/20 bg-pink-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-pink-100 transition-all hover:bg-pink-400 hover:text-white">
              + Novo
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Consultas</p>
              <p className="mt-3 text-2xl font-black text-white">{sortedExperts.length}</p>
            </div>
            <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/80">Aplicadas</p>
              <p className="mt-3 text-2xl font-black text-white">{appliedExperts.length}</p>
            </div>
            <div className="rounded-[22px] border border-pink-400/20 bg-pink-400/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-100/80">Com evidencia</p>
              <p className="mt-3 text-2xl font-black text-white">{expertsWithEvidence.length}</p>
            </div>
          </div>

          <div className="mb-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">O que vale ouro em um bom especialista</p>
            <p className="mt-3 text-xs leading-relaxed text-gray-300">
              Nome e cargo, insight principal, como isso afeta o projeto, se a sugestao foi aplicada e alguma evidencia da conversa.
            </p>
            <p className="mt-3 text-xs text-gray-400">Taxa de aplicacao atual: {expertConversionRate}%.</p>
          </div>

          <div className="space-y-4">
            {sortedExperts.map((expert) => (
              <div
                key={expert.id}
                onClick={() => onOpenExpertView(expert)}
                className="group relative cursor-pointer rounded-[24px] border border-white/10 bg-black/25 p-4 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5"
              >
                <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={(event) => { event.stopPropagation(); onOpenExpertEdit(expert); }} className="rounded-xl bg-black/60 p-2 text-gray-400 backdrop-blur-sm transition-colors hover:text-white">
                    <Pencil size={14} />
                  </button>
                  {(isAdmin || expert.author === viewAsStudent?.name) && (
                    <button onClick={(event) => onDeleteExpert(event, expert.id)} className="rounded-xl bg-black/60 p-2 text-gray-400 backdrop-blur-sm transition-colors hover:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="pr-14">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="block text-sm font-black text-white">{expert.name}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">
                        {expert.role}
                        {expert.author && (
                          <>
                            <span className="mx-1 text-gray-600">•</span>
                            <UserCircle size={10} />
                            {expert.author}
                          </>
                        )}
                      </span>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${expert.applied ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/5 text-gray-200'}`}>
                      {expert.applied ? 'Ja aplicado' : 'Consulta'}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 rounded-[20px] border border-white/10 bg-white/5 p-3 text-xs italic leading-relaxed text-gray-200">
                    "{expert.notes}"
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {expert.image && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-pink-400/20 bg-pink-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-pink-100">
                        <ImageIcon size={10} /> Evidencia
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${getImpactTone(expert.impact)}`}>
                      <Star size={10} /> Impacto {expert.impact}
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
                    <div className={`${expert.impact === 'Alto' ? 'w-full bg-gradient-to-r from-emerald-300 to-green-400' : expert.impact === 'Medio' ? 'w-2/3 bg-gradient-to-r from-yellow-300 to-orange-300' : 'w-1/3 bg-gradient-to-r from-slate-300 to-slate-400'} h-full rounded-full`} />
                  </div>
                </div>
              </div>
            ))}

            {sortedExperts.length === 0 && (
              <div className="py-6 text-center text-sm italic text-gray-500">
                Nenhum especialista registrado ainda. Conversem com pessoas reais e documentem o que mudou.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Compartilhar e provar</p>
              <h3 className="mt-2 flex items-center gap-2 text-lg font-black text-white">
                <Megaphone className="text-orange-400" />
                Impacto
              </h3>
            </div>
            <button onClick={onOpenImpact} className="rounded-[16px] border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-100 transition-all hover:bg-orange-400 hover:text-white">
              + Registro
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mb-5">
            <div className="rounded-[22px] border border-orange-400/20 bg-orange-400/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-100/80">Pessoas alcancadas</p>
              <h4 className="mt-3 text-3xl font-black text-white">{totalImpactPeople}</h4>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Tipo com maior alcance</p>
              <h4 className="mt-3 text-lg font-black text-white">{topImpactType ? topImpactType[0] : 'Sem dados ainda'}</h4>
              <p className="mt-2 text-xs text-gray-400">{topImpactType ? `${topImpactType[1]} pessoas` : 'Registrem os primeiros compartilhamentos.'}</p>
            </div>
          </div>

          <div className="mb-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">O que precisa aparecer em um bom registro</p>
            <p className="mt-3 text-xs leading-relaxed text-gray-300">
              Nome da acao, publico atingido, data, quantidade de pessoas e algum retorno. Isso mostra que a equipe nao so apresentou a ideia, mas realmente gerou alcance.
            </p>
            <p className="mt-3 text-xs text-gray-400">
              {latestImpactEvent ? `Ultimo registro: ${latestImpactEvent.name} em ${formatDate(latestImpactEvent.date)}.` : 'Sem ultimo registro ainda.'}
            </p>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedImpactEvents.map((event) => (
              <div key={event.id} className="group relative rounded-[24px] border border-white/10 bg-black/25 p-4 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5">
                <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {(isAdmin || event.author === viewAsStudent?.name) && (
                    <button onClick={() => onDeleteOutreach(event.id)} className="rounded-xl bg-black/60 p-2 text-gray-400 backdrop-blur-sm transition-colors hover:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="pr-12">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="block text-sm font-black text-white">{event.name}</span>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-200">
                          {event.type}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                          <Calendar size={10} /> {formatDate(event.date)}
                        </span>
                        {event.author && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                            <UserCircle size={10} /> {event.author}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-black text-orange-100">
                      +{event.people}
                    </span>
                  </div>

                  {event.feedback ? (
                    <p className="mt-4 rounded-[20px] border border-white/10 bg-white/5 p-3 text-xs italic leading-relaxed text-gray-200">
                      "{event.feedback}"
                    </p>
                  ) : (
                    <p className="mt-4 rounded-[20px] border border-white/10 bg-white/5 p-3 text-xs italic leading-relaxed text-gray-500">
                      Adicionem feedback para mostrar retorno do publico.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {sortedImpactEvents.length === 0 && (
              <div className="py-6 text-center text-sm italic text-gray-500">
                Nenhum registro de impacto ainda. Documentem cada apresentacao, conversa ou postagem relevante.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InnovationStrategyPanel;



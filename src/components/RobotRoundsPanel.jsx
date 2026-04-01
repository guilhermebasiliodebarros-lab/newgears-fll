import React from 'react';
import StrategyBoard from './StrategyBoard';
import {
  Activity,
  AlertTriangle,
  Calculator,
  Check,
  CheckCircle,
  Flag,
  Image as ImageIcon,
  Laptop,
  LayoutDashboard,
  ListTodo,
  Map,
  Play,
  Plus,
  Rocket,
  Settings,
  Sparkles,
  Square,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  Wrench,
} from 'lucide-react';

const formatDateTime = (value) => {
  if (!value) return 'Sem registro';

  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Sem registro';

    return parsed.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Sem registro';
  }
};

const formatDateOnly = (value) => {
  if (!value) return 'Sem data';

  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Sem data';

    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return 'Sem data';
  }
};

const formatSeconds = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
  return `${Math.round(Number(value))}s`;
};

const formatAverageSeconds = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
  return `${Number(value).toFixed(1)}s`;
};

const MetricCard = ({ label, value, helper, tone = 'border-white/10 bg-black/25 text-white', icon }) => (
  <div className={`rounded-2xl border p-4 ${tone}`}>
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">{label}</p>
      {icon ? <span className="opacity-90">{icon}</span> : null}
    </div>
    <p className="text-2xl font-black text-white mt-3">{value}</p>
    {helper ? <p className="text-xs text-gray-400 mt-2 leading-relaxed">{helper}</p> : null}
  </div>
);

const MetaChip = ({ children, tone = 'border-white/10 bg-white/5 text-gray-300' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${tone}`}>
    {children}
  </span>
);

const EmptyState = ({ text }) => (
  <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-sm italic text-gray-500">
    {text}
  </div>
);

const getReadinessTone = (score) => {
  if (score >= 80) return 'border-green-500/20 bg-green-500/10 text-green-200';
  if (score >= 60) return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200';
  return 'border-red-500/20 bg-red-500/10 text-red-200';
};

const getBaseTone = (base) => {
  if (base === 'Esquerda') return 'border-red-500/20 bg-red-500/10 text-red-200';
  if (base === 'Direita') return 'border-blue-500/20 bg-blue-500/10 text-blue-200';
  return 'border-white/10 bg-white/5 text-gray-300';
};

const RobotRoundsPanel = ({
  rounds,
  missionsList,
  attachments,
  activeCommandCode,
  scoreHistory,
  robotSubTab,
  onChangeRobotSubTab,
  activeTimer,
  timerDisplay,
  roundFormValues,
  onRoundFormValueChange,
  onToggleTimer,
  onOpenNewRound,
  onOpenMissionForm,
  onOpenPitStop,
  onSavePracticeScore,
  onDeleteRound,
  onSaveRoundRun,
  scoreChart,
  readonly = false,
}) => {
  const missionMap = Object.fromEntries(missionsList.map((mission) => [mission.id, mission]));
  const totalPoints = rounds.reduce((sum, round) => sum + (round.totalPoints || 0), 0);
  const totalTime = rounds.reduce((sum, round) => sum + (round.estimatedTime || 0), 0);
  const isOverTime = totalTime > 150;
  const timePercent = rounds.length > 0 ? Math.min(100, (totalTime / 150) * 100) : 0;
  const missionCoverageIds = new Set(rounds.flatMap((round) => round.missions || []).filter(Boolean));
  const missionCoveragePercent = missionsList.length > 0
    ? Math.round((missionCoverageIds.size / missionsList.length) * 100)
    : 0;

  const roundRuns = scoreHistory
    .filter((entry) => entry.roundId && typeof entry.time === 'number')
    .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  const roundRunsById = roundRuns.reduce((accumulator, entry) => {
    const current = accumulator[entry.roundId] || [];
    current.push(entry);
    accumulator[entry.roundId] = current;
    return accumulator;
  }, {});

  const generalPracticeRuns = scoreHistory
    .filter((entry) => !entry.roundId && (typeof entry.score === 'number' || typeof entry.time === 'number'))
    .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));

  const latestGeneralRun = generalPracticeRuns[0] || null;
  const bestScoreRun = generalPracticeRuns.reduce((best, current) => {
    if (!best) return current;
    return (current.score || 0) > (best.score || 0) ? current : best;
  }, null);

  const attachmentsByRoundId = attachments.reduce((accumulator, attachment) => {
    if (!attachment.roundId) return accumulator;

    const current = accumulator[attachment.roundId] || [];
    current.push(attachment);
    accumulator[attachment.roundId] = current;
    return accumulator;
  }, {});

  const linkedRoundIds = new Set(Object.keys(attachmentsByRoundId));
  const roundsWithRecordedRun = new Set(roundRuns.map((entry) => entry.roundId));
  const baseCounts = rounds.reduce((accumulator, round) => {
    if (round.startBase === 'Esquerda') accumulator.left += 1;
    if (round.startBase === 'Direita') accumulator.right += 1;
    return accumulator;
  }, { left: 0, right: 0 });

  const topRound = [...rounds].sort((left, right) => (right.totalPoints || 0) - (left.totalPoints || 0))[0] || null;
  const fastestRound = [...rounds]
    .filter((round) => typeof round.estimatedTime === 'number')
    .sort((left, right) => (left.estimatedTime || Number.MAX_SAFE_INTEGER) - (right.estimatedTime || Number.MAX_SAFE_INTEGER))[0] || null;
  const mostEfficientRound = [...rounds]
    .filter((round) => round.estimatedTime > 0)
    .sort((left, right) => ((right.totalPoints || 0) / right.estimatedTime) - ((left.totalPoints || 0) / left.estimatedTime))[0] || null;

  const readinessItems = [
    {
      label: 'Plano de saidas',
      ready: rounds.length >= 3,
      helper: rounds.length > 0 ? `${rounds.length} rounds cadastrados` : 'Monte a sequencia inicial da mesa.',
    },
    {
      label: 'Tempo competitivo',
      ready: rounds.length > 0 && totalTime <= 150,
      helper: rounds.length > 0 ? `${totalTime}s estimados para a partida` : 'Sem tempo consolidado ainda.',
    },
    {
      label: 'Cobertura de missoes',
      ready: missionCoverageIds.size >= (missionsList.length > 0 ? Math.min(missionsList.length, 5) : 1),
      helper: missionsList.length > 0 ? `${missionCoverageIds.size}/${missionsList.length} missoes conectadas` : 'Cadastre as missoes da mesa.',
    },
    {
      label: 'Anexos vinculados',
      ready: rounds.length > 0 ? linkedRoundIds.size >= Math.max(1, Math.ceil(rounds.length / 2)) : attachments.length > 0,
      helper: linkedRoundIds.size > 0 ? `${linkedRoundIds.size} round(s) com recurso associado` : 'Relacione garras e saidas.',
    },
    {
      label: 'Codigo oficial',
      ready: Boolean(activeCommandCode),
      helper: activeCommandCode ? activeCommandCode.title : 'Definam a programacao base da equipe.',
    },
    {
      label: 'Treinos registrados',
      ready: generalPracticeRuns.length >= 2 || roundRuns.length >= 3,
      helper: generalPracticeRuns.length > 0 ? `${generalPracticeRuns.length} treino(s) gerais no historico` : `${roundRuns.length} tempo(s) isolados por round`,
    },
  ];

  const readinessScore = Math.round((readinessItems.filter((item) => item.ready).length / readinessItems.length) * 100);
  const readinessTone = getReadinessTone(readinessScore);

  const actionPriorities = [
    isOverTime && {
      title: 'Cortar tempo da mesa',
      detail: `O plano atual soma ${totalTime}s. Revisem missao, trajeto ou anexo para voltar abaixo de 150s.`,
      tone: 'border-red-500/20 bg-red-500/10 text-red-200',
    },
    rounds.length < 3 && {
      title: 'Abrir mais saidas',
      detail: 'Ter mais de uma rota aumenta consistencia e facilita a conversa sobre estrategia com os juizes.',
      tone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200',
    },
    linkedRoundIds.size < rounds.length && rounds.length > 0 && {
      title: 'Conectar anexos aos rounds',
      detail: 'Amarrem cada garra a uma saida especifica para deixar a logica mecanica visivel.',
      tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
    },
    !activeCommandCode && {
      title: 'Definir o codigo oficial',
      detail: 'Escolham uma base unica para treino, ajustes e apresentacao tecnica.',
      tone: 'border-green-500/20 bg-green-500/10 text-green-200',
    },
    generalPracticeRuns.length === 0 && {
      title: 'Registrar treino consolidado',
      detail: 'Salvem a pontuacao geral para acompanhar evolucao real da equipe ao longo da temporada.',
      tone: 'border-purple-500/20 bg-purple-500/10 text-purple-200',
    },
  ].filter(Boolean).slice(0, 3);

  const robotTabs = [
    {
      id: 'overview',
      label: 'Painel de Rounds',
      description: 'Planejamento, treino, anexos e leitura competitiva da mesa.',
      icon: <LayoutDashboard size={16} />,
      tone: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
      activeClass: 'border-blue-500/30 bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]',
      inactiveClass: 'border-white/10 bg-black/20 text-gray-300 hover:bg-white/5 hover:text-white',
    },
    {
      id: 'map',
      label: 'Mesa de Estrategia',
      description: 'Desenho tatico, trajetos e combinacoes de saida.',
      icon: <Map size={16} />,
      tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200',
      activeClass: 'border-cyan-500/30 bg-cyan-500 text-black shadow-[0_18px_40px_rgba(6,182,212,0.18)]',
      inactiveClass: 'border-white/10 bg-black/20 text-gray-300 hover:bg-white/5 hover:text-white',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="rounded-[28px] border border-white/10 bg-[#151520] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="grid gap-2 md:grid-cols-2">
          {robotTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangeRobotSubTab(tab.id)}
              className={`rounded-[22px] border px-4 py-4 text-left transition-all ${robotSubTab === tab.id ? tab.activeClass : tab.inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-2xl border px-2 py-2 ${robotSubTab === tab.id ? 'border-white/15 bg-white/10 text-current' : tab.tone}`}>
                  {tab.icon}
                </span>
                <div>
                  <p className="text-sm font-black">{tab.label}</p>
                  <p className="text-xs text-current/80 mt-1 leading-relaxed">{tab.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeTimer ? (
        <div
          className="fixed bottom-6 right-6 z-[100] flex cursor-pointer items-center gap-6 rounded-full border-4 border-[#151520] bg-red-600 px-6 py-4 text-white shadow-[0_0_40px_rgba(220,38,38,0.8)] transition-transform hover:scale-105"
          onClick={() => onToggleTimer({ id: activeTimer.roundId })}
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">Rodando</span>
            <span className="text-sm font-black">{activeTimer.name}</span>
          </div>
          <div className="w-24 text-center font-mono text-4xl font-black tabular-nums">
            {timerDisplay}s
          </div>
          <div className="rounded-full bg-white p-2 text-red-600 animate-pulse">
            <Square size={24} fill="currentColor" />
          </div>
        </div>
      ) : null}

      {robotSubTab === 'overview' ? (
        <>
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#0f1b35] via-[#11192a] to-[#0d111a] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_35%)] pointer-events-none"></div>
            <div className="relative z-10 grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                  <Rocket size={12} /> Robot Game Command Deck
                </span>
                <h3 className="mt-4 text-3xl font-black leading-tight text-white">Painel de rounds com leitura de torneio</h3>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
                  Organizem aqui a sequencia das saidas, o tempo real de treino, o uso de anexos e a referencia oficial de codigo. A ideia e transformar a aba do robo em um painel de decisao, nao so em uma lista de registros.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {!readonly ? (
                    <>
                      <button onClick={onOpenNewRound} className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-bold text-blue-200 transition-all hover:bg-blue-500 hover:text-white">
                        <Plus size={14} /> Nova saida
                      </button>
                      <button onClick={onOpenMissionForm} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white transition-all hover:bg-white hover:text-black">
                        <Settings size={14} /> Missoes da mesa
                      </button>
                      <button onClick={onOpenPitStop} className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-200 transition-all hover:bg-red-500 hover:text-white">
                        <Timer size={14} /> Pit Stop
                      </button>
                      <button onClick={() => onSavePracticeScore(totalPoints, totalTime)} className="inline-flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs font-bold text-green-200 transition-all hover:bg-green-500 hover:text-black">
                        <Trophy size={14} /> Salvar treino
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Potencial de pontos"
                  value={totalPoints}
                  helper={topRound ? `Round destaque: ${topRound.name}` : 'Monte as primeiras saidas'}
                  icon={<Calculator size={14} className="text-green-300" />}
                />
                <MetricCard
                  label="Tempo planejado"
                  value={`${totalTime}s`}
                  helper={rounds.length > 0 ? `${Math.max(150 - totalTime, 0)}s livres no teto de 150s` : 'Sem consolidacao ainda'}
                  tone={isOverTime ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-white/10 bg-black/25 text-white'}
                  icon={<Timer size={14} className={isOverTime ? 'text-red-300' : 'text-blue-300'} />}
                />
                <MetricCard
                  label="Saidas ativas"
                  value={rounds.length}
                  helper={fastestRound ? `Mais rapida: ${fastestRound.name}` : 'Cadastre a primeira saida'}
                  icon={<Flag size={14} className="text-cyan-300" />}
                />
                <MetricCard
                  label="Cobertura da mesa"
                  value={`${missionCoveragePercent}%`}
                  helper={missionsList.length > 0 ? `${missionCoverageIds.size}/${missionsList.length} missoes ligadas a rounds` : 'Cadastre as missoes primeiro'}
                  icon={<Target size={14} className="text-yellow-300" />}
                />
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.06fr,0.94fr]">
            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Radar competitivo</p>
                  <h3 className="mt-2 text-xl font-black text-white">O que a equipe ja consegue sustentar</h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${readinessTone}`}>
                  {readinessScore}% pronto
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {readinessItems.map((item) => (
                  <div key={item.label} className={`rounded-2xl border p-4 ${item.ready ? 'border-green-500/20 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      {item.ready ? <CheckCircle size={14} className="text-green-400" /> : <AlertTriangle size={14} className="text-yellow-400" />}
                      {item.label}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-gray-300">{item.helper}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Codigo oficial</p>
                  <p className="mt-3 text-sm font-bold text-white">{activeCommandCode ? activeCommandCode.title : 'Nao definido'}</p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-200">
                    {activeCommandCode ? activeCommandCode.description : 'Escolham uma base oficial para a equipe inteira falar a mesma lingua tecnica.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Balanceamento de base</p>
                  <p className="mt-3 text-sm font-bold text-white">{baseCounts.left} esquerda / {baseCounts.right} direita</p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-200">
                    Variar bases ajuda a distribuir riscos e deixa a estrategia de mesa mais robusta.
                  </p>
                </div>
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-200">Ultimo treino geral</p>
                  <p className="mt-3 text-sm font-bold text-white">
                    {latestGeneralRun ? `${latestGeneralRun.score || 0} pts em ${formatSeconds(latestGeneralRun.time)}` : 'Sem treino salvo'}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-200">
                    {latestGeneralRun ? `Registrado em ${formatDateTime(latestGeneralRun.date)}.` : 'Salvem a pontuacao consolidada para acompanhar evolucao real.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Leitura rapida</p>
                  <h3 className="mt-2 text-xl font-black text-white">Coisas necessarias para uma aba de robo forte</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-200">
                  Operacao clara
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-white"><Sparkles size={14} className="text-yellow-300" /> Round com maior teto</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-100">
                    {topRound ? `${topRound.name} entrega ${topRound.totalPoints || 0} pontos e hoje e a sua principal referencia de valor.` : 'Cadastre rounds para descobrir qual saida carrega o maior teto de pontuacao.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-white"><Activity size={14} className="text-green-300" /> Melhor eficiencia</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-100">
                    {mostEfficientRound ? `${mostEfficientRound.name} rende ${(mostEfficientRound.totalPoints / mostEfficientRound.estimatedTime).toFixed(1)} pontos por segundo.` : 'Assim que houver tempo e pontos cadastrados, a aba destaca a saida mais eficiente.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-white"><Wrench size={14} className="text-cyan-300" /> Anexos ligados ao plano</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-100">
                    {linkedRoundIds.size > 0 ? `${linkedRoundIds.size} round(s) ja tem anexo associado. Isso ajuda a explicar o por que de cada mecanismo.` : 'Relacionem cada garra a uma saida para mostrar uso claro de recurso mecanico.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-white"><Laptop size={14} className="text-indigo-300" /> Historico e tomada de decisao</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-100">
                    {bestScoreRun ? `Melhor treino salvo: ${bestScoreRun.score || 0} pts em ${formatSeconds(bestScoreRun.time)}.` : 'Com historico geral salvo, voces conseguem ver se a estrategia esta realmente subindo de nivel.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Sequencia da partida</p>
                  <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-white">
                    <ListTodo className="text-blue-500" /> Rounds planejados
                  </h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${isOverTime ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-blue-500/20 bg-blue-500/10 text-blue-200'}`}>
                  {isOverTime ? 'Acima do limite' : 'Dentro do teto de 150s'}
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Tempo de mesa</p>
                  <p className={`text-xs font-bold ${isOverTime ? 'text-red-300' : 'text-gray-300'}`}>
                    {totalTime}s usados / {Math.max(150 - totalTime, 0)}s livres
                  </p>
                </div>
                <div className="h-4 overflow-hidden rounded-full border border-white/5 bg-gray-800">
                  <div
                    className={`h-full transition-all duration-700 ${isOverTime ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                    style={{ width: `${timePercent}%` }}
                  ></div>
                </div>
                {isOverTime ? (
                  <p className="mt-2 flex items-center gap-2 text-xs font-bold text-red-300">
                    <AlertTriangle size={12} /> O plano atual estoura o limite da regra. Priorize cortar trajetos ou dividir objetivos.
                  </p>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {rounds.map((round, index) => {
                  const roundMissions = (round.missions || []).map((missionId) => missionMap[missionId]).filter(Boolean);
                  const roundAttachments = attachmentsByRoundId[round.id] || [];
                  const roundHistory = roundRunsById[round.id] || [];
                  const latestRoundRun = roundHistory[0] || null;
                  const avgRecentTime = roundHistory.length > 0
                    ? roundHistory.slice(0, 3).reduce((sum, item) => sum + (item.time || 0), 0) / Math.min(3, roundHistory.length)
                    : null;
                  const bestTime = roundHistory.length > 0
                    ? Math.min(...roundHistory.map((item) => item.time || Number.MAX_SAFE_INTEGER))
                    : null;
                  const hasStructure = roundMissions.length > 0 && roundAttachments.length > 0;
                  const roundEfficiency = round.estimatedTime > 0
                    ? (round.totalPoints || 0) / round.estimatedTime
                    : null;

                  return (
                    <div
                      key={round.id}
                      className={`relative rounded-[24px] border p-5 transition-colors ${hasStructure ? 'border-cyan-500/20 bg-gradient-to-br from-[#131c2d] via-[#111722] to-[#0f131b]' : 'border-white/10 bg-black/25'}`}
                    >
                      {!readonly ? (
                        <button
                          onClick={() => onDeleteRound(round.id)}
                          className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/30 p-2 text-gray-400 transition-colors hover:text-red-400"
                          title="Apagar round"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}

                      <div className="pr-10">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-black text-white">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-black text-white">{round.name}</h4>
                              <MetaChip tone={getBaseTone(round.startBase)}>
                                <Flag size={10} /> {round.startBase || 'Base livre'}
                              </MetaChip>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-gray-400">
                              {roundMissions.length > 0
                                ? `${roundMissions.length} missao(oes) ligadas a esta saida.`
                                : 'Adicione missoes para deixar o objetivo da saida claro.'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <MetricCard
                            label="Pontos"
                            value={round.totalPoints || 0}
                            helper="teto atual"
                            tone="border-green-500/20 bg-green-500/10 text-green-200"
                            icon={<Calculator size={14} className="text-green-300" />}
                          />
                          <MetricCard
                            label="Tempo"
                            value={formatSeconds(round.estimatedTime)}
                            helper="estimado"
                            tone="border-blue-500/20 bg-blue-500/10 text-blue-200"
                            icon={<Timer size={14} className="text-blue-300" />}
                          />
                          <MetricCard
                            label="Eficiencia"
                            value={roundEfficiency ? `${roundEfficiency.toFixed(1)} pts/s` : '--'}
                            helper="valor por segundo"
                            tone="border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                            icon={<TrendingUp size={14} className="text-cyan-300" />}
                          />
                          <MetricCard
                            label="Ultimo treino"
                            value={latestRoundRun ? formatSeconds(latestRoundRun.time) : '--'}
                            helper={latestRoundRun ? formatDateOnly(latestRoundRun.date) : 'sem registro'}
                            tone="border-purple-500/20 bg-purple-500/10 text-purple-200"
                            icon={<Trophy size={14} className="text-purple-300" />}
                          />
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Missoes desta saida</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {roundMissions.length > 0 ? roundMissions.map((mission) => (
                                <MetaChip key={mission.id} tone="border-white/10 bg-white/5 text-gray-200">
                                  {mission.image ? <ImageIcon size={10} /> : <Target size={10} />}
                                  {mission.code ? `${mission.code} - ${mission.name}` : mission.name}
                                </MetaChip>
                              )) : <span className="text-xs italic text-gray-500">Sem missao vinculada.</span>}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Anexos e historico</p>
                              <div className="flex flex-wrap gap-2">
                                {roundAttachments.length > 0 ? <MetaChip tone="border-cyan-500/20 bg-cyan-500/10 text-cyan-200"><Wrench size={10} /> {roundAttachments.length} anexo(s)</MetaChip> : null}
                                {roundsWithRecordedRun.has(round.id) ? <MetaChip tone="border-purple-500/20 bg-purple-500/10 text-purple-200"><Trophy size={10} /> treino salvo</MetaChip> : null}
                              </div>
                            </div>
                            <div className="mt-3 space-y-2 text-xs text-gray-300">
                              <p>
                                {roundAttachments.length > 0
                                  ? `Garras conectadas: ${roundAttachments.map((attachment) => attachment.name).join(', ')}.`
                                  : 'Nenhum anexo conectado ainda. Vale associar o mecanismo certo a esta saida.'}
                              </p>
                              <p>
                                {latestRoundRun
                                  ? `Ultimo tempo: ${formatSeconds(latestRoundRun.time)}. Media recente: ${formatAverageSeconds(avgRecentTime)}. Melhor marca: ${formatSeconds(bestTime)}.`
                                  : 'Ainda nao ha treino salvo deste round. Registre tempos para comparar evolucao.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {!readonly ? (
                          <form onSubmit={(event) => onSaveRoundRun(event, round)} className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                            <div className="relative min-w-[120px] flex-1">
                              <input
                                name="time"
                                type="number"
                                placeholder={round.estimatedTime}
                                value={roundFormValues[round.id] !== undefined ? roundFormValues[round.id] : ''}
                                onChange={(event) => onRoundFormValueChange(round.id, event.target.value)}
                                className={`w-full rounded-xl border bg-black/30 px-3 py-2.5 pr-10 text-center text-sm text-white outline-none transition-colors ${activeTimer?.roundId === round.id ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-blue-500'}`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">seg</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onToggleTimer(round)}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${activeTimer?.roundId === round.id ? 'bg-red-500 text-white animate-pulse' : 'border border-white/10 bg-white/5 text-gray-200 hover:bg-white hover:text-black'}`}
                              title="Cronometro"
                            >
                              {activeTimer?.roundId === round.id ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                              {activeTimer?.roundId === round.id ? 'Parar' : 'Cronometrar'}
                            </button>
                            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-500">
                              <Check size={14} /> Salvar tempo
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {rounds.length === 0 ? (
                <div className="mt-6">
                  <EmptyState text='Nenhuma saida planejada ainda. Comecem criando rounds com nome claro, base, missoes e tempo estimado.' />
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-[#151520] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Performance</p>
                    <h3 className="mt-2 flex items-center gap-2 text-lg font-black text-white">
                      <TrendingUp className="text-green-400" /> Evolucao da equipe
                    </h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-200">
                    Historico vivo
                  </span>
                </div>
                <div className="[&>div]:mb-0">
                  {scoreChart}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Prioridades imediatas</p>
                    <h3 className="mt-2 text-lg font-black text-white">Proximo passo da equipe</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-200">
                    Curadoria tecnica
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  {actionPriorities.length > 0 ? actionPriorities.map((item) => (
                    <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-2 text-xs leading-relaxed">{item.detail}</p>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                      <p className="text-sm font-bold text-white">Base competitiva bem montada</p>
                      <p className="mt-2 text-xs leading-relaxed text-green-100">
                        O painel esta consistente: rounds documentados, tempo controlado e historico alimentado. Agora o foco pode ser repetir e refinar.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Melhor treino geral</p>
                    <p className="mt-3 text-lg font-black text-white">
                      {bestScoreRun ? `${bestScoreRun.score || 0} pts` : '--'}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400">
                      {bestScoreRun ? `Em ${formatSeconds(bestScoreRun.time)} no dia ${formatDateOnly(bestScoreRun.date)}.` : 'Sem treino geral salvo ainda.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Round mais rapido</p>
                    <p className="mt-3 text-lg font-black text-white">
                      {fastestRound ? fastestRound.name : '--'}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400">
                      {fastestRound ? `${formatSeconds(fastestRound.estimatedTime)} planejados.` : 'Sem round suficiente para comparar.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#13212c] via-[#111820] to-[#0f1218] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_35%)] pointer-events-none"></div>
            <div className="relative z-10 grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                  <Map size={12} /> Strategy Table Studio
                </span>
                <h3 className="mt-4 text-3xl font-black leading-tight text-white">Mesa de estrategia com contexto de treino</h3>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
                  A mesa nao precisa ser so um quadro de desenho. Use esta area para testar trajetos, registrar retornos para a base e alinhar visualmente onde cada round entra na partida.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Rounds no mapa"
                  value={rounds.length}
                  helper={rounds.length > 0 ? 'saidas prontas para desenhar' : 'cadastre rounds para usar a mesa'}
                  icon={<Flag size={14} className="text-cyan-300" />}
                />
                <MetricCard
                  label="Anexos ligados"
                  value={linkedRoundIds.size}
                  helper={linkedRoundIds.size > 0 ? 'round(s) com mecanismo associado' : 'conecte garras a saidas'}
                  tone="border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                  icon={<Wrench size={14} className="text-cyan-300" />}
                />
                <MetricCard
                  label="Ultimo treino"
                  value={latestGeneralRun ? `${latestGeneralRun.score || 0} pts` : '--'}
                  helper={latestGeneralRun ? formatDateTime(latestGeneralRun.date) : 'sem historico consolidado'}
                  tone="border-green-500/20 bg-green-500/10 text-green-200"
                  icon={<Trophy size={14} className="text-green-300" />}
                />
                <MetricCard
                  label="Codigo base"
                  value={activeCommandCode ? 'Definido' : 'Pendente'}
                  helper={activeCommandCode ? activeCommandCode.title : 'defina a programacao oficial'}
                  tone="border-blue-500/20 bg-blue-500/10 text-blue-200"
                  icon={<Laptop size={14} className="text-blue-300" />}
                />
              </div>
            </div>
          </section>
          <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Como usar bem</p>
                    <h3 className="mt-2 text-lg font-black text-white">Fluxo recomendado da mesa</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-200">
                    Tatica visual
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-sm text-gray-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Desenhe a rota principal de cada saida e marque retornos para a base com uma cor fixa da equipe.</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Use outra cor para riscos, colisao com modelos, cruzamento de anexo e pontos de ajuste fino.</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Volte para os cards de rounds e registre o tempo depois de testar no tapete real.</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Se um desenho virou decisao de torneio, salve tambem um treino geral para o grafico acompanhar a melhora.</div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Conexoes rapidas</p>
                    <h3 className="mt-2 text-lg font-black text-white">O que a mesa deve representar</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-200">
                    Mapa vivo
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <p className="text-sm font-bold text-white">Round com maior valor</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-100">
                      {topRound ? `${topRound.name} lidera com ${topRound.totalPoints || 0} pontos. Desenhe primeiro a rota dele.` : 'Cadastre rounds para definir a saida de maior impacto.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                    <p className="text-sm font-bold text-white">Anexos que precisam aparecer</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-100">
                      {attachments.length > 0 ? `${attachments.length} anexo(s) ja estao documentados. Vale desenhar onde entram e saem da mesa.` : 'Ainda nao ha anexos salvos. A mesa fica mais forte quando o mecanismo tambem aparece na estrategia.'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                    <p className="text-sm font-bold text-white">Historico que fecha o ciclo</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-100">
                      {latestGeneralRun ? `Ultimo treino consolidado: ${latestGeneralRun.score || 0} pts em ${formatSeconds(latestGeneralRun.time)}.` : 'Depois de testar rotas no mapa, salve um treino geral para medir se a estrategia ficou melhor.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#151520] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <StrategyBoard />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RobotRoundsPanel;

import React, { useMemo, useState } from 'react';
import { Crown, Medal, Search, ShieldCheck, Sparkles, Target, Trophy, Users, X } from 'lucide-react';

const GOAL_XP = 420;

const FILTERS = [
  { id: 'all', label: 'Todos', helper: 'grid completo' },
  { id: 'goal', label: 'Meta batida', helper: 'ja voando alto' },
  { id: 'attention', label: 'Quase la', helper: 'precisam de impulso' },
  { id: 'podium', label: 'Podio', helper: 'hall da fama' },
];

const podiumStyles = [
  {
    card: 'border-yellow-400/35 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.24),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))]',
    badge: 'border-yellow-400/40 bg-yellow-400/15 text-yellow-100',
    icon: 'text-yellow-300',
    glow: 'shadow-[0_24px_60px_rgba(250,204,21,0.18)]',
    progress: 'from-yellow-300 via-amber-300 to-orange-300',
  },
  {
    card: 'border-slate-300/25 bg-[radial-gradient(circle_at_top,rgba(226,232,240,0.18),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]',
    badge: 'border-slate-300/35 bg-slate-200/10 text-slate-100',
    icon: 'text-slate-200',
    glow: 'shadow-[0_24px_60px_rgba(148,163,184,0.15)]',
    progress: 'from-slate-200 via-slate-300 to-cyan-200',
  },
  {
    card: 'border-orange-400/25 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.2),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]',
    badge: 'border-orange-400/30 bg-orange-400/15 text-orange-100',
    icon: 'text-orange-200',
    glow: 'shadow-[0_24px_60px_rgba(251,146,60,0.15)]',
    progress: 'from-orange-300 via-amber-300 to-yellow-200',
  },
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'NG';

const getFilterCount = (filterId, sortedStudents, rankingStats, podiumStudents) => {
  if (filterId === 'goal') return rankingStats.goalCount;
  if (filterId === 'attention') return rankingStats.attentionCount;
  if (filterId === 'podium') return podiumStudents.length;
  return sortedStudents.length;
};

const RankingPanel = ({ students, setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const sortedStudents = useMemo(
    () =>
      [...students].sort(
        (left, right) =>
          (right.xp || 0) - (left.xp || 0) || (left.name || '').localeCompare(right.name || '', 'pt-BR')
      ),
    [students]
  );

  const rankingStats = useMemo(() => {
    const totalXP = sortedStudents.reduce((sum, student) => sum + (student.xp || 0), 0);
    const goalCount = sortedStudents.filter((student) => (student.xp || 0) >= GOAL_XP).length;
    const attentionCount = sortedStudents.length - goalCount;
    const totalGap = sortedStudents.reduce((sum, student) => sum + Math.max(0, GOAL_XP - (student.xp || 0)), 0);
    const nextUnlockStudent = [...sortedStudents]
      .filter((student) => (student.xp || 0) < GOAL_XP)
      .sort((left, right) => Math.max(0, GOAL_XP - (left.xp || 0)) - Math.max(0, GOAL_XP - (right.xp || 0)))[0] || null;

    return {
      totalXP,
      averageXP: sortedStudents.length ? Math.round(totalXP / sortedStudents.length) : 0,
      goalCount,
      attentionCount,
      totalGap,
      leader: sortedStudents[0] || null,
      coveragePercentage: sortedStudents.length ? Math.round((goalCount / sortedStudents.length) * 100) : 0,
      squadCharge: sortedStudents.length ? Math.min(100, Math.round((totalXP / (sortedStudents.length * GOAL_XP)) * 100)) : 0,
      nextUnlockStudent,
    };
  }, [sortedStudents]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredStudents = useMemo(
    () =>
      sortedStudents.filter((student, index) => {
        const studentText = [student.name, student.turma].filter(Boolean).join(' ').toLowerCase();
        const matchesQuery = !normalizedQuery || studentText.includes(normalizedQuery);
        const xp = student.xp || 0;
        const matchesFilter =
          filter === 'all'
            ? true
            : filter === 'goal'
              ? xp >= GOAL_XP
              : filter === 'attention'
                ? xp < GOAL_XP
                : index < 3;

        return matchesQuery && matchesFilter;
      }),
    [filter, normalizedQuery, sortedStudents]
  );

  const podiumStudents = sortedStudents.slice(0, 3);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#07070c]/92 p-4 backdrop-blur-md animate-in fade-in">
      <div className="newgears-major-panel relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,24,0.98),rgba(10,10,18,0.98))] shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.12),transparent_22%)]" />

        <button
          onClick={() => setActiveTab('dashboard')}
          className="absolute right-4 top-4 z-10 rounded-xl border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="Fechar ranking"
        >
          <X size={22} />
        </button>

        <div className="relative border-b border-white/10 px-5 pb-4 pt-5 md:px-6">
          <div className="flex flex-col gap-4 pr-12">
            <div className="grid gap-4 xl:grid-cols-[1.42fr,0.58fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-100">
                  <Sparkles size={12} />
                  Ranking da temporada
                </div>
                <h2 className="mt-3 text-2xl font-black text-white md:text-[2rem]">Ranking XP da New Gears</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-300">
                  O ranking agora funciona como um painel de energia da equipe. Da para enxergar quem esta puxando a temporada, quem esta quase desbloqueando a meta e onde vale mandar reforco.
                </p>

                <div className="mt-4 grid gap-2.5 md:grid-cols-3">
                  <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-400/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100/80">Bateria da equipe</p>
                        <p className="mt-2 text-2xl font-black text-white">{rankingStats.squadCharge}%</p>
                      </div>
                      <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2.5 text-cyan-100">
                        <ShieldCheck size={18} />
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300" style={{ width: `${Math.max(8, rankingStats.squadCharge)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-cyan-50/80">Media de {rankingStats.averageXP} XP por aluno na temporada.</p>
                  </div>

                  <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/80">Meta 420</p>
                        <p className="mt-2 text-2xl font-black text-white">{rankingStats.goalCount}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-2.5 text-emerald-100">
                        <Trophy size={18} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-bold text-white">{rankingStats.coveragePercentage}% do time acima da linha de meta</p>
                    <p className="mt-2 text-xs text-emerald-50/80">{rankingStats.attentionCount} aluno(s) ainda em zona de impulso.</p>
                  </div>

                  <div className="rounded-[22px] border border-rose-400/20 bg-rose-400/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-100/80">Proxima virada</p>
                        <p className="mt-2 text-base font-black text-white truncate">
                          {rankingStats.nextUnlockStudent?.name || 'Equipe blindada'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-2.5 text-rose-100">
                        <Target size={18} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-white">
                      {rankingStats.nextUnlockStudent
                        ? `${Math.max(0, GOAL_XP - (rankingStats.nextUnlockStudent.xp || 0))} XP para subir de fase.`
                        : 'Todo mundo ja passou da meta minima.'}
                    </p>
                    <p className="mt-2 text-xs text-rose-50/80">Foco ideal para o proximo empurrao do time.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Radar rapido</p>
                <div className="mt-3 rounded-[22px] border border-yellow-400/20 bg-yellow-400/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-100/80">MVP da semana</p>
                      <p className="mt-1.5 text-lg font-black text-white">{rankingStats.leader?.name || 'Aquecendo a pista'}</p>
                    </div>
                    <div className="rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-2.5 text-yellow-200">
                      <Crown size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-yellow-50/85">
                    {rankingStats.leader ? `${rankingStats.leader.xp || 0} XP acumulados no topo do grid.` : 'Sem alunos cadastrados ainda.'}
                  </p>
                </div>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Energia coletiva</p>
                    <p className="mt-2 text-2xl font-black text-white">{rankingStats.totalXP}</p>
                    <p className="mt-2 text-xs text-gray-400">XP total ja gerado pela equipe nesta temporada.</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">XP para fechar a meta</p>
                    <p className="mt-2 text-2xl font-black text-white">{rankingStats.totalGap}</p>
                    <p className="mt-2 text-xs text-gray-400">Falta total para levar todo mundo ao piso recomendado.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto custom-scrollbar px-5 py-5 md:px-6">
          <div className="grid gap-5 xl:grid-cols-[1.02fr,1.98fr]">
            <section className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.16))] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Hall da fama</p>
                  <h3 className="mt-1.5 text-lg font-black text-white">Quem esta puxando a fila</h3>
                </div>
                <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-2.5 text-yellow-200">
                  <Trophy size={18} />
                </div>
              </div>

              <div className="mt-3 rounded-[20px] border border-white/10 bg-white/5 p-3 text-sm text-gray-300">
                O podio funciona como o cartaz principal da equipe. Aqui aparecem quem abriu caminho, segurou consistencia e virou referencia para o resto do grupo.
              </div>

              <div className="mt-4 grid gap-3">
                {podiumStudents.length > 0 ? (
                  podiumStudents.map((student, index) => {
                    const style = podiumStyles[index] || podiumStyles[2];
                    const xp = student.xp || 0;
                    const progress = Math.min(100, Math.round((xp / GOAL_XP) * 100));
                    return (
                      <article
                        key={student.id}
                        className={`rounded-[24px] border p-4 transition-all hover:-translate-y-1 ${style.card} ${style.glow}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[16px] border border-white/10 bg-black/30">
                              {student.avatarImage ? (
                                <img src={student.avatarImage} alt={student.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-black text-white">{getInitials(student.name)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-base font-black text-white">{student.name}</p>
                              <p className="mt-1 text-xs text-gray-300">{student.turma || 'Equipe principal'}</p>
                            </div>
                          </div>
                          <div className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${style.badge}`}>
                            #{index + 1}
                          </div>
                        </div>

                        <div className="mt-3 rounded-[18px] border border-white/10 bg-black/25 p-3">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">XP acumulado</p>
                              <p className={`mt-1.5 text-2xl font-black ${style.icon}`}>{xp}</p>
                            </div>
                            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold text-white">
                              <span className="inline-flex items-center gap-2">
                                <Medal size={14} className={style.icon} />
                                {xp >= GOAL_XP ? `${Math.max(0, xp - GOAL_XP)} XP acima da meta` : `${GOAL_XP - xp} XP para a meta`}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                            <div className={`h-full rounded-full bg-gradient-to-r ${style.progress}`} style={{ width: `${Math.max(8, progress)}%` }} />
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-gray-400">
                    Assim que os alunos estiverem cadastrados, o hall da fama aparece aqui automaticamente.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.18))] p-4">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
                <div className="grid gap-3 xl:grid-cols-[1fr,0.72fr]">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Pista completa</p>
                    <h3 className="mt-1.5 text-lg font-black text-white">Todos os pilotos da temporada</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
                      Use busca e filtros para encontrar rapido quem ja virou referencia, quem esta pedindo impulso e quem esta mais perto de desbloquear a proxima faixa.
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-fuchsia-400/20 bg-fuchsia-400/10 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/80">Proximo boost recomendado</p>
                    <p className="mt-2 text-base font-black text-white">{rankingStats.nextUnlockStudent?.name || 'Nenhum boost urgente'}</p>
                    <p className="mt-2 text-xs leading-relaxed text-fuchsia-50/80">
                      {rankingStats.nextUnlockStudent
                        ? `${Math.max(0, GOAL_XP - (rankingStats.nextUnlockStudent.xp || 0))} XP separam esse aluno da linha de meta.`
                        : 'A equipe inteira ja esta acima da faixa de seguranca.'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
                  <label className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 lg:min-w-[300px]">
                    <Search size={16} className="text-gray-500" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar por nome ou turma"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {FILTERS.map((option) => {
                      const isActive = filter === option.id;
                      const count = getFilterCount(option.id, sortedStudents, rankingStats, podiumStudents);

                      return (
                        <button
                          key={option.id}
                          onClick={() => setFilter(option.id)}
                          className={`rounded-[16px] border px-3.5 py-2 text-left transition-all ${
                            isActive
                              ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-100 shadow-[0_12px_30px_rgba(34,211,238,0.12)]'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="block text-[11px] font-black uppercase tracking-[0.16em]">
                            {option.label} · {count}
                          </span>
                          <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] opacity-75">{option.helper}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const position = sortedStudents.findIndex((candidate) => candidate.id === student.id) + 1;
                    const xp = student.xp || 0;
                    const goalProgress = Math.min(100, Math.round((xp / GOAL_XP) * 100));
                    const isGoalMet = xp >= GOAL_XP;
                    const xpGap = Math.max(0, GOAL_XP - xp);

                    return (
                      <article
                        key={student.id}
                        className={`rounded-[22px] border p-3.5 transition-all hover:-translate-y-0.5 ${
                          isGoalMet
                            ? 'border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_40%),linear-gradient(180deg,rgba(16,185,129,0.08),rgba(0,0,0,0.12))]'
                            : 'border-orange-400/20 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_40%),linear-gradient(180deg,rgba(251,146,60,0.08),rgba(0,0,0,0.12))]'
                        }`}
                      >
                        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr),210px] xl:items-center">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-white/10 bg-black/30">
                              {student.avatarImage ? (
                                <img src={student.avatarImage} alt={student.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-black text-white">{getInitials(student.name)}</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">
                                  #{position}
                                </span>
                                <p className="truncate text-base font-black text-white">{student.name}</p>
                                {student.turma && (
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
                                    {student.turma}
                                  </span>
                                )}
                              </div>

                              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                                <span
                                  className={`rounded-full border px-2.5 py-1 font-bold uppercase tracking-[0.16em] ${
                                    isGoalMet
                                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                                      : 'border-orange-300/25 bg-orange-300/10 text-orange-100'
                                  }`}
                                >
                                  {isGoalMet ? 'Pronto para puxar o time' : `${xpGap} XP para subir de fase`}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                  {goalProgress}% da trilha 420
                                </span>
                              </div>

                              <div className="mt-3">
                                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                                  <div
                                    className={`h-full rounded-full ${
                                      isGoalMet
                                        ? 'bg-gradient-to-r from-emerald-300 via-green-300 to-cyan-300'
                                        : 'bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200'
                                    }`}
                                    style={{ width: `${Math.max(8, goalProgress)}%` }}
                                  />
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {isGoalMet ? 'Pode apoiar colegas e puxar consistencia.' : 'Vale focar em tarefas com mais impacto nesta semana.'}
                                  </span>
                                  <span>{GOAL_XP} XP = linha de meta</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[20px] border border-white/10 bg-black/25 p-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Reserva de XP</p>
                            <p className={`mt-2 text-2xl font-black ${isGoalMet ? 'text-emerald-300' : 'text-orange-200'}`}>
                              {xp}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-gray-400">
                              {isGoalMet
                                ? `${Math.max(0, xp - GOAL_XP)} XP de folga para manter a lideranca.`
                                : `${xpGap} XP faltando para encaixar no piso recomendado.`}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-[26px] border border-dashed border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-lg font-black text-white">Nenhum aluno encontrado</p>
                    <p className="mt-2 text-sm text-gray-400">Ajuste a busca ou o filtro para visualizar outro recorte do ranking.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPanel;

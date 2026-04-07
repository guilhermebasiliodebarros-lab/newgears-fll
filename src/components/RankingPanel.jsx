import React, { useMemo, useState } from 'react';
import { Crown, Medal, Search, ShieldCheck, Sparkles, Target, Trophy, Users, X } from 'lucide-react';

const GOAL_XP = 420;

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'goal', label: 'Meta batida' },
  { id: 'attention', label: 'Atencao' },
  { id: 'podium', label: 'Podio' },
];

const podiumStyles = [
  {
    card: 'border-yellow-400/30 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]',
    badge: 'border-yellow-400/40 bg-yellow-400/15 text-yellow-200',
    icon: 'text-yellow-300',
    glow: 'shadow-[0_18px_40px_rgba(250,204,21,0.16)]',
  },
  {
    card: 'border-slate-300/20 bg-[radial-gradient(circle_at_top,rgba(226,232,240,0.14),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]',
    badge: 'border-slate-300/30 bg-slate-200/10 text-slate-100',
    icon: 'text-slate-200',
    glow: 'shadow-[0_18px_40px_rgba(148,163,184,0.14)]',
  },
  {
    card: 'border-amber-500/25 bg-[radial-gradient(circle_at_top,rgba(217,119,6,0.18),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]',
    badge: 'border-amber-500/30 bg-amber-500/15 text-amber-100',
    icon: 'text-amber-300',
    glow: 'shadow-[0_18px_40px_rgba(217,119,6,0.14)]',
  },
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'NG';

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

    return {
      totalXP,
      averageXP: sortedStudents.length ? Math.round(totalXP / sortedStudents.length) : 0,
      goalCount,
      attentionCount,
      totalGap,
      leader: sortedStudents[0] || null,
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#12131c] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_22%)]" />

        <button
          onClick={() => setActiveTab('dashboard')}
          className="absolute right-5 top-5 z-10 rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="Fechar ranking"
        >
          <X size={22} />
        </button>

        <div className="relative border-b border-white/10 px-6 pb-6 pt-7 md:px-8">
          <div className="flex flex-col gap-5 pr-14">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-yellow-200">
                  <Sparkles size={12} />
                  Temporada em andamento
                </div>
                <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Ranking de XP da equipe</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
                  Veja quem esta puxando a equipe, quem ja bateu a meta minima e onde vale concentrar reforco para levar todo mundo forte ao torneio.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:min-w-[340px]">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">XP total</p>
                  <p className="mt-3 text-3xl font-black text-white">{rankingStats.totalXP}</p>
                  <p className="mt-2 text-xs text-gray-400">Media de {rankingStats.averageXP} XP por aluno</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Meta 420</p>
                  <p className="mt-3 text-3xl font-black text-emerald-300">{rankingStats.goalCount}</p>
                  <p className="mt-2 text-xs text-gray-400">{rankingStats.attentionCount} em zona de atencao</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[26px] border border-cyan-400/20 bg-cyan-400/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100/80">Lider da temporada</p>
                    <p className="mt-2 text-lg font-black text-white">{rankingStats.leader?.name || 'Equipe em aquecimento'}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200">
                    <Crown size={20} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-cyan-50/80">
                  {rankingStats.leader ? `${rankingStats.leader.xp || 0} XP acumulados no topo do grid.` : 'Sem alunos cadastrados ainda.'}
                </p>
              </div>

              <div className="rounded-[26px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100/80">Cobertura da meta</p>
                    <p className="mt-2 text-lg font-black text-white">
                      {sortedStudents.length ? Math.round((rankingStats.goalCount / sortedStudents.length) * 100) : 0}% da equipe
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-emerald-200">
                    <ShieldCheck size={20} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-emerald-50/80">Meta minima de {GOAL_XP} XP usada como referencia de prontidao.</p>
              </div>

              <div className="rounded-[26px] border border-rose-400/20 bg-rose-400/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-100/80">XP para alinhar a equipe</p>
                    <p className="mt-2 text-lg font-black text-white">{rankingStats.totalGap}</p>
                  </div>
                  <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-rose-200">
                    <Target size={20} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-rose-50/80">Quanto falta no total para levar todos ao piso recomendado.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto custom-scrollbar px-6 py-6 md:px-8">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_1.85fr]">
            <section className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Podio</p>
                  <h3 className="mt-2 text-xl font-black text-white">Quem esta puxando a fila</h3>
                </div>
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-yellow-200">
                  <Trophy size={20} />
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {podiumStudents.length > 0 ? (
                  podiumStudents.map((student, index) => {
                    const style = podiumStyles[index] || podiumStyles[2];
                    return (
                      <article
                        key={student.id}
                        className={`rounded-[26px] border p-5 transition-all ${style.card} ${style.glow}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                              {student.avatarImage ? (
                                <img src={student.avatarImage} alt={student.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-black text-white">{getInitials(student.name)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-lg font-black text-white">{student.name}</p>
                              <p className="mt-1 text-xs text-gray-300">{student.turma || 'Equipe principal'}</p>
                            </div>
                          </div>
                          <div className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${style.badge}`}>
                            #{index + 1}
                          </div>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">XP acumulado</p>
                            <p className={`mt-2 text-3xl font-black ${style.icon}`}>{student.xp || 0}</p>
                          </div>
                          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-bold text-white">
                            <Medal size={14} className={style.icon} />
                            {Math.max(0, (student.xp || 0) - GOAL_XP)} XP acima da meta
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-gray-400">
                    Assim que os alunos estiverem cadastrados, o podio aparece aqui automaticamente.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Grid completo</p>
                    <h3 className="mt-2 text-xl font-black text-white">Todos os pilotos da temporada</h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 lg:min-w-[260px]">
                    <Search size={16} className="text-gray-500" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar por nome ou turma"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((option) => {
                    const isActive = filter === option.id;
                    const count =
                      option.id === 'all'
                        ? sortedStudents.length
                        : option.id === 'goal'
                          ? rankingStats.goalCount
                          : option.id === 'attention'
                            ? rankingStats.attentionCount
                            : podiumStudents.length;

                    return (
                      <button
                        key={option.id}
                        onClick={() => setFilter(option.id)}
                        className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-all ${
                          isActive
                            ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {option.label} · {count}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 space-y-3">
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
                        className={`rounded-[24px] border p-4 transition-all ${
                          isGoalMet
                            ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-400/30'
                            : 'border-rose-500/15 bg-rose-500/5 hover:border-rose-400/30'
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                              {student.avatarImage ? (
                                <img src={student.avatarImage} alt={student.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-black text-white">{getInitials(student.name)}</span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
                                  #{position}
                                </span>
                                <p className="truncate text-base font-black text-white">{student.name}</p>
                                {student.turma && (
                                  <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                    {student.turma}
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                <span
                                  className={`rounded-full border px-2.5 py-1 font-bold uppercase tracking-[0.16em] ${
                                    isGoalMet
                                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                                      : 'border-rose-400/25 bg-rose-400/10 text-rose-200'
                                  }`}
                                >
                                  {isGoalMet ? 'Meta batida' : `${xpGap} XP para a meta`}
                                </span>
                                <span className="text-gray-500">{goalProgress}% do piso recomendado</span>
                              </div>
                            </div>
                          </div>

                          <div className="min-w-[150px] rounded-[20px] border border-white/10 bg-black/25 px-4 py-3 text-left lg:text-right">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Saldo</p>
                            <p className={`mt-2 text-2xl font-black ${isGoalMet ? 'text-emerald-300' : 'text-rose-300'}`}>
                              {xp} XP
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                            <div
                              className={`h-full rounded-full ${
                                isGoalMet ? 'bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-300' : 'bg-gradient-to-r from-rose-500 via-orange-400 to-yellow-300'
                              }`}
                              style={{ width: `${goalProgress}%` }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              Posicao consolidada no ranking
                            </span>
                            <span>{GOAL_XP} XP = linha de corte</span>
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

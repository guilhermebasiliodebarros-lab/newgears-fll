import React, { useMemo } from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  CalendarDays,
  CheckCircle,
  Clock,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';

const MOOD_OPTIONS = [
  {
    level: 100,
    title: 'Turbo mode',
    description: 'Estou pronto para treino forte e decisao rapida.',
    helper: 'Boa hora para puxar ritmo e ajudar quem estiver chegando mais lento.',
    icon: BatteryFull,
    cardClass: 'border-emerald-400/25 bg-emerald-400/10 hover:border-emerald-300/45 hover:bg-emerald-400/15',
    badgeClass: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200',
    iconWrapClass: 'border-emerald-300/20 bg-emerald-300/12 text-emerald-200',
    dotClass: 'bg-emerald-400',
  },
  {
    level: 75,
    title: 'Focado',
    description: 'Estou bem e consigo manter constancia no treino.',
    helper: 'Bom nivel para executar com qualidade e segurar a rotina.',
    icon: BatteryMedium,
    cardClass: 'border-cyan-400/25 bg-cyan-400/10 hover:border-cyan-300/45 hover:bg-cyan-400/15',
    badgeClass: 'border-cyan-400/30 bg-cyan-400/12 text-cyan-200',
    iconWrapClass: 'border-cyan-300/20 bg-cyan-300/12 text-cyan-200',
    dotClass: 'bg-cyan-400',
  },
  {
    level: 50,
    title: 'Modo economia',
    description: 'Vou render melhor com foco e menos atrito.',
    helper: 'Sinal de ajuste. Vale redistribuir carga ou proteger tempo de concentracao.',
    icon: BatteryLow,
    cardClass: 'border-amber-400/25 bg-amber-400/10 hover:border-amber-300/45 hover:bg-amber-400/15',
    badgeClass: 'border-amber-400/30 bg-amber-400/12 text-amber-200',
    iconWrapClass: 'border-amber-300/20 bg-amber-300/12 text-amber-200',
    dotClass: 'bg-amber-400',
  },
  {
    level: 25,
    title: 'Preciso de apoio',
    description: 'Hoje estou com a bateria baixa e preciso de ajuda.',
    helper: 'Sinal de cuidado. O tecnico consegue ajustar missao, pausa ou apoio de dupla.',
    icon: BatteryWarning,
    cardClass: 'border-rose-400/25 bg-rose-400/10 hover:border-rose-300/45 hover:bg-rose-400/15',
    badgeClass: 'border-rose-400/30 bg-rose-400/12 text-rose-200',
    iconWrapClass: 'border-rose-300/20 bg-rose-300/12 text-rose-200',
    dotClass: 'bg-rose-400',
  },
];

const TRAINING_DAYS = new Set([1, 3]);

const formatDateLabel = (date) =>
  new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  }).format(date);

const startOfLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const getMoodMeta = (level) => MOOD_OPTIONS.find((option) => option.level === level) || MOOD_OPTIONS[MOOD_OPTIONS.length - 1];

const getNextTrainingDate = (baseDate) => {
  const next = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 12, 0, 0, 0);

  for (let offset = 1; offset <= 7; offset += 1) {
    next.setDate(baseDate.getDate() + offset);
    if (TRAINING_DAYS.has(next.getDay())) {
      return new Date(next);
    }
  }

  return next;
};

const getAverageTone = (average) => {
  if (average >= 80) {
    return {
      label: 'Equipe acesa',
      helper: 'Clima bom para acelerar execucao e decisao.',
      pill: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200',
      panel: 'border-emerald-400/20 bg-emerald-400/10',
      icon: BatteryFull,
    };
  }

  if (average >= 60) {
    return {
      label: 'Base estavel',
      helper: 'A equipe esta bem, mas ainda vale cuidar da distribuicao.',
      pill: 'border-cyan-400/30 bg-cyan-400/12 text-cyan-200',
      panel: 'border-cyan-400/20 bg-cyan-400/10',
      icon: BatteryMedium,
    };
  }

  if (average >= 40) {
    return {
      label: 'Pedir ajuste',
      helper: 'Bom momento para baixar atrito e organizar prioridade.',
      pill: 'border-amber-400/30 bg-amber-400/12 text-amber-200',
      panel: 'border-amber-400/20 bg-amber-400/10',
      icon: BatteryLow,
    };
  }

  if (average > 0) {
    return {
      label: 'Energia baixa',
      helper: 'A equipe pede apoio mais ativo antes de escalar o treino.',
      pill: 'border-rose-400/30 bg-rose-400/12 text-rose-200',
      panel: 'border-rose-400/20 bg-rose-400/10',
      icon: BatteryWarning,
    };
  }

  return {
    label: 'Sem leitura',
    helper: 'Ainda nao houve check-in hoje.',
    pill: 'border-white/10 bg-white/5 text-gray-300',
    panel: 'border-white/10 bg-white/5',
    icon: BatteryCharging,
  };
};

const TeamCheckInModal = ({
  isOpen,
  onClose,
  teamMoods,
  students,
  teamAverage,
  viewAsStudent,
  onSubmit,
  localTodayStr,
  rewardXp = 2,
}) => {
  const todayDate = useMemo(() => startOfLocalDate(localTodayStr), [localTodayStr]);
  const dayOfWeek = todayDate.getDay();
  const isTrainingDay = TRAINING_DAYS.has(dayOfWeek);
  const nextTrainingDate = useMemo(() => getNextTrainingDate(todayDate), [todayDate]);

  const sortedMoods = useMemo(
    () =>
      [...teamMoods].sort(
        (left, right) => (left.level || 0) - (right.level || 0) || (left.studentName || '').localeCompare(right.studentName || '', 'pt-BR')
      ),
    [teamMoods]
  );

  const participation = students.length ? Math.round((teamMoods.length / students.length) * 100) : 0;
  const missingStudents = useMemo(() => {
    const checkedIds = new Set(teamMoods.map((mood) => mood.studentId));
    return students
      .filter((student) => !checkedIds.has(student.id))
      .sort((left, right) => (left.name || '').localeCompare(right.name || '', 'pt-BR'));
  }, [students, teamMoods]);

  const currentMood = viewAsStudent ? teamMoods.find((mood) => mood.studentId === viewAsStudent.id) || null : null;
  const currentMoodMeta = currentMood ? getMoodMeta(currentMood.level) : null;
  const CurrentMoodIcon = currentMoodMeta?.icon || BatteryCharging;
  const lowEnergyCount = teamMoods.filter((mood) => mood.level <= 50).length;
  const highEnergyCount = teamMoods.filter((mood) => mood.level >= 75).length;
  const averageTone = getAverageTone(teamAverage);
  const AverageIcon = averageTone.icon;

  const optionCounts = useMemo(
    () =>
      MOOD_OPTIONS.map((option) => ({
        ...option,
        count: teamMoods.filter((mood) => mood.level === option.level).length,
      })),
    [teamMoods]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#12131c] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_22%)]" />

        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="Fechar check-in"
        >
          <X size={22} />
        </button>

        <div className="relative border-b border-white/10 px-6 pb-6 pt-7 md:px-8">
          <div className="flex flex-col gap-4 pr-14">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                  <Sparkles size={12} />
                  Check-in da equipe
                </div>
                <h3 className="mt-4 text-3xl font-black text-white md:text-4xl">
                  {viewAsStudent ? 'Como esta sua bateria hoje?' : 'Mapa de energia do treino'}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
                  {viewAsStudent
                    ? `Seu registro libera ${rewardXp} XP e ajuda o treino a nascer na energia certa. Responda com honestidade para o tecnico ajustar rota, carga e apoio.`
                    : 'Veja rapidamente o humor da equipe, quem ja respondeu e onde vale intervir antes de puxar o treino.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-300">
                  <CalendarDays size={14} className="mr-2 inline-flex" />
                  {formatDateLabel(todayDate)}
                </div>
                <div className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] ${isTrainingDay ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200' : 'border-amber-400/30 bg-amber-400/12 text-amber-200'}`}>
                  <Clock size={14} className="mr-2 inline-flex" />
                  {isTrainingDay ? 'Dia liberado' : 'Fora do treino'}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Participacao</p>
                <p className="mt-3 text-3xl font-black text-white">
                  {teamMoods.length}
                  <span className="ml-2 text-sm text-gray-500">/ {students.length || 0}</span>
                </p>
                <p className="mt-2 text-xs text-gray-400">{participation}% da equipe respondeu hoje</p>
              </div>

              <div className={`rounded-[24px] border p-4 ${averageTone.panel}`}>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Media do time</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-3xl font-black text-white">{teamMoods.length ? `${teamAverage}%` : '--'}</p>
                  <div className={`rounded-2xl border p-3 ${averageTone.pill}`}>
                    <AverageIcon size={18} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-300">{averageTone.label}. {averageTone.helper}</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Radar de apoio</p>
                <p className="mt-3 text-3xl font-black text-white">{lowEnergyCount}</p>
                <p className="mt-2 text-xs text-gray-400">{highEnergyCount} em energia alta e {Math.max(0, missingStudents.length)} ainda sem resposta</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto custom-scrollbar px-6 py-6 md:px-8">
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              {viewAsStudent ? (
                currentMood ? (
                  <div className="space-y-5">
                    <div className={`rounded-[26px] border p-5 ${currentMoodMeta.badgeClass}`}>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">Check-in concluido</p>
                          <h4 className="mt-2 text-2xl font-black text-white">Leitura registrada com sucesso</h4>
                          <p className="mt-3 text-sm leading-relaxed text-white/80">
                            Seu status de hoje ficou em <strong>{currentMood.level}%</strong>, no modo <strong>{currentMoodMeta.title}</strong>. Os {rewardXp} XP ja entram como incentivo de consistencia.
                          </p>
                        </div>
                        <div className={`rounded-[24px] border p-4 ${currentMoodMeta.iconWrapClass}`}>
                          <CurrentMoodIcon size={28} />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Sua leitura</p>
                        <p className="mt-3 text-xl font-black text-white">{currentMoodMeta.title}</p>
                        <p className="mt-2 text-sm text-gray-300">{currentMoodMeta.helper}</p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Proximo check-in</p>
                        <p className="mt-3 text-xl font-black text-white">{formatDateLabel(nextTrainingDate)}</p>
                        <p className="mt-2 text-sm text-gray-300">A equipe reabre o check-in no proximo treino oficial.</p>
                      </div>
                    </div>
                  </div>
                ) : !isTrainingDay ? (
                  <div className="space-y-5">
                    <div className="rounded-[26px] border border-amber-400/25 bg-amber-400/10 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-100/80">Janela fechada</p>
                          <h4 className="mt-2 text-2xl font-black text-white">Check-in liberado so nos dias de treino</h4>
                          <p className="mt-3 text-sm leading-relaxed text-amber-50/85">
                            O registro fica aberto nas segundas e quartas para manter a leitura do time alinhada ao treino real.
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">
                          <Clock size={28} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Proxima abertura</p>
                      <p className="mt-3 text-2xl font-black text-white">{formatDateLabel(nextTrainingDate)}</p>
                      <p className="mt-2 text-sm text-gray-300">Assim que o treino abrir, sua resposta ja volta a valer {rewardXp} XP.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-[26px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-100/80">Leitura individual</p>
                          <h4 className="mt-2 text-2xl font-black text-white">Escolha como voce chega para o treino</h4>
                          <p className="mt-3 text-sm leading-relaxed text-emerald-50/85">
                            Nao tem resposta certa. O objetivo e dar visibilidade real para o tecnico ajustar missao, intensidade e apoio de equipe.
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100">
                          <BatteryCharging size={28} />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {MOOD_OPTIONS.map((option) => {
                        const Icon = option.icon;

                        return (
                          <button
                            key={option.level}
                            onClick={() => onSubmit(option.level)}
                            className={`group rounded-[24px] border p-5 text-left transition-all ${option.cardClass}`}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex items-start gap-4">
                                <div className={`rounded-[20px] border p-3 transition-all ${option.iconWrapClass}`}>
                                  <Icon size={24} />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-lg font-black text-white">{option.title}</p>
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${option.badgeClass}`}>
                                      {option.level}%
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm text-gray-200">{option.description}</p>
                                  <p className="mt-2 text-xs text-gray-400">{option.helper}</p>
                                </div>
                              </div>
                              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white">
                                +{rewardXp} XP
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-5">
                  <div className="rounded-[26px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100/80">Painel do tecnico</p>
                        <h4 className="mt-2 text-2xl font-black text-white">Leitura rapida do clima da equipe</h4>
                        <p className="mt-3 text-sm leading-relaxed text-cyan-50/85">
                          Use este mapa para enxergar quem precisa de suporte, quem ainda nao entrou no radar e se o treino pode subir ritmo ou precisa de ajuste fino.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-100">
                        <Target size={28} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {optionCounts.map((option) => {
                      const Icon = option.icon;
                      return (
                        <div key={option.level} className={`rounded-[24px] border p-4 ${option.badgeClass}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-[18px] border p-2 ${option.iconWrapClass}`}>
                                <Icon size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-white">{option.title}</p>
                                <p className="mt-1 text-xs text-white/80">{option.description}</p>
                              </div>
                            </div>
                            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-black text-white">
                              {option.count}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Leitura do dia</p>
                        <p className="mt-2 text-lg font-black text-white">
                          {teamMoods.length > 0 ? `${highEnergyCount} com energia alta e ${lowEnergyCount} pedindo ajuste.` : 'Nenhum check-in registrado ate agora.'}
                        </p>
                      </div>
                      <div className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] ${averageTone.pill}`}>
                        {averageTone.label}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Quem ja respondeu</p>
                    <h4 className="mt-2 text-xl font-black text-white">Painel de respostas do dia</h4>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-gray-300">
                    <Users size={20} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {sortedMoods.length > 0 ? (
                    sortedMoods.map((mood) => {
                      const moodMeta = getMoodMeta(mood.level);

                      return (
                        <div key={mood.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${moodMeta.dotClass}`} />
                                <p className="truncate text-sm font-black text-white">{mood.studentName}</p>
                              </div>
                              <p className="mt-2 text-xs text-gray-400">{moodMeta.title} - {moodMeta.helper}</p>
                            </div>
                            <div className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${moodMeta.badgeClass}`}>
                              {mood.level}%
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 p-6 text-center">
                      <p className="text-base font-black text-white">Sem respostas ainda</p>
                      <p className="mt-2 text-sm text-gray-400">Quando os alunos fizerem check-in, a leitura aparece aqui em tempo real.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Pendencias</p>
                    <h4 className="mt-2 text-xl font-black text-white">Quem ainda falta entrar no radar</h4>
                  </div>
                  <div className={`rounded-2xl border p-3 ${missingStudents.length ? 'border-amber-400/20 bg-amber-400/10 text-amber-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>
                    {missingStudents.length ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {missingStudents.length > 0 ? (
                    missingStudents.map((student) => (
                      <div
                        key={student.id}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-300"
                      >
                        {student.name}
                      </div>
                    ))
                  ) : (
                    <div className="w-full rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                      Todo mundo respondeu. A equipe ja esta totalmente mapeada para o treino de hoje.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCheckInModal;

import React, { useEffect, useState } from 'react';
import LogoNewGears from './LogoNewGears';
import Countdown from './Countdown';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCheck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Crown,
  Loader2,
  MapPin,
  Maximize,
  Megaphone,
  Pause,
  Play,
  Radio,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserCircle,
  Users,
  X,
} from 'lucide-react';

const SLIDE_DURATION = 9000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const CAPTAIN_NAMES = new Set(['Sofia', 'Heloise']);
const STATION_ORDER = ['Engenharia', 'Inova\u00e7\u00e3o', 'Gest\u00e3o'];
const DEFAULT_PANEL_ACCENT = 'from-white/6 via-transparent to-transparent';

const getTvContentLimits = (viewportHeight) => {
  if (viewportHeight <= 860) {
    return { station: 3, kanban: 2, events: 4, ranking: 6, approved: 4 };
  }

  if (viewportHeight <= 980) {
    return { station: 4, kanban: 3, events: 5, ranking: 8, approved: 5 };
  }

  return { station: 5, kanban: 4, events: 6, ranking: 8, approved: 6 };
};

const TV_SLIDES = [
  { id: 0, label: 'Equipe', title: 'Equipe da Semana', description: 'Rodizio oficial exibido com a mesma atmosfera do sistema.', Icon: Users, accent: 'from-[#122347] via-[#1b1238] to-[#0a1120]' },
  { id: 1, label: 'Foco', title: 'Foco da Semana', description: 'As tres frentes aparecem com leitura imediata do que precisa ser entregue.', Icon: Target, accent: 'from-[#13223f] via-[#21103a] to-[#0a1020]' },
  { id: 2, label: 'Kanban', title: 'Painel de Tarefas', description: 'Backlog, execucao, revisao e entregas em um quadro unico.', Icon: ClipboardList, accent: 'from-[#11203b] via-[#1a1235] to-[#0a101d]' },
  { id: 3, label: 'Desempenho', title: 'Desempenho do Robo', description: 'Tela de palco para apresentar evolucao, consistencia e ritmo de treino.', Icon: TrendingUp, accent: 'from-[#10233f] via-[#1a1238] to-[#09101d]' },
  { id: 4, label: 'Agenda', title: 'Agenda da Equipe', description: 'Eventos e proximos compromissos agora entram na mesma linguagem visual.', Icon: CalendarDays, accent: 'from-[#102441] via-[#1a1137] to-[#09101d]' },
  { id: 5, label: 'Ranking', title: 'Raio-X da Equipe', description: 'XP, alcance e entregas com visual alinhado ao logo da equipe.', Icon: Trophy, accent: 'from-[#122548] via-[#1f1037] to-[#0a101e]' },
  { id: 6, label: 'Aprovados', title: 'Missoes Concluidas', description: 'Os destaques da semana ganham uma vitrine celebratoria dentro da identidade New Gears.', Icon: CheckCircle, accent: 'from-[#132440] via-[#23103b] to-[#0a1120]' },
];

const STATION_META = {
  Engenharia: {
    label: 'Engenharia',
    helper: 'Mecanica, anexos, codigo e repeticao de mesa.',
    Icon: Rocket,
    text: 'text-[#6293E9]',
    border: 'border-[#6293E9]/24',
    pill: 'border-[#6293E9]/22 bg-[#6293E9]/10 text-[#dce8ff]',
    iconWrap: 'border-[#6293E9]/20 bg-[#6293E9]/12 text-[#6293E9]',
    panelAccent: 'from-[#6293E9]/18 via-[#5D58D3]/10 to-transparent',
    strip: 'from-[#6293E9] to-[#5D58D3]',
  },
  'Inovação': {
    label: 'Inovacao',
    helper: 'Pesquisa, narrativa, iteracao e defesa do projeto.',
    Icon: Sparkles,
    text: 'text-[#820AAF]',
    border: 'border-[#820AAF]/24',
    pill: 'border-[#820AAF]/22 bg-[#820AAF]/10 text-[#f3ddff]',
    iconWrap: 'border-[#820AAF]/20 bg-[#820AAF]/12 text-[#c871ff]',
    panelAccent: 'from-[#820AAF]/18 via-[#D01BF1]/10 to-transparent',
    strip: 'from-[#5D58D3] to-[#820AAF]',
  },
  'Gestão': {
    label: 'Gestao',
    helper: 'Organizacao, ritmo, comunicacao e decisao de equipe.',
    Icon: BookOpen,
    text: 'text-[#D01BF1]',
    border: 'border-[#D01BF1]/24',
    pill: 'border-[#D01BF1]/22 bg-[#D01BF1]/10 text-[#ffe0ff]',
    iconWrap: 'border-[#D01BF1]/20 bg-[#D01BF1]/12 text-[#ff91ff]',
    panelAccent: 'from-[#D01BF1]/18 via-[#820AAF]/10 to-transparent',
    strip: 'from-[#820AAF] to-[#D01BF1]',
  },
};

const KANBAN_COLUMNS = [
  { status: 'todo', title: 'A Fazer', Icon: AlertTriangle, border: 'border-[#6293E9]/24', pill: 'border-[#6293E9]/22 bg-[#6293E9]/10 text-[#dce8ff]', iconWrap: 'border-[#6293E9]/20 bg-[#6293E9]/12 text-[#6293E9]', panelAccent: 'from-[#6293E9]/16 via-[#5D58D3]/10 to-transparent' },
  { status: 'doing', title: 'Fazendo', Icon: Loader2, border: 'border-[#5D58D3]/24', pill: 'border-[#5D58D3]/22 bg-[#5D58D3]/10 text-[#e3dcff]', iconWrap: 'border-[#5D58D3]/20 bg-[#5D58D3]/12 text-[#9d93ff]', panelAccent: 'from-[#5D58D3]/16 via-[#820AAF]/10 to-transparent' },
  { status: 'review', title: 'Em Revisao', Icon: Search, border: 'border-[#820AAF]/24', pill: 'border-[#820AAF]/22 bg-[#820AAF]/10 text-[#f3ddff]', iconWrap: 'border-[#820AAF]/20 bg-[#820AAF]/12 text-[#c871ff]', panelAccent: 'from-[#820AAF]/16 via-[#D01BF1]/10 to-transparent' },
  { status: 'done', title: 'Feito', Icon: CheckCircle, border: 'border-[#D01BF1]/24', pill: 'border-[#D01BF1]/22 bg-[#D01BF1]/10 text-[#ffe0ff]', iconWrap: 'border-[#D01BF1]/20 bg-[#D01BF1]/12 text-[#ff91ff]', panelAccent: 'from-[#D01BF1]/16 via-[#820AAF]/10 to-transparent' },
];

const RANK_TONES = [
  { card: 'border-[#D01BF1]/28 bg-[#D01BF1]/12 shadow-[0_0_32px_rgba(208,27,241,0.16)]', badge: 'border-[#D01BF1]/30 bg-[#D01BF1]/16 text-[#ffe0ff]', value: 'text-[#ffe0ff]' },
  { card: 'border-[#820AAF]/28 bg-[#820AAF]/12 shadow-[0_0_28px_rgba(130,10,175,0.14)]', badge: 'border-[#820AAF]/30 bg-[#820AAF]/16 text-[#f1d8ff]', value: 'text-[#f1d8ff]' },
  { card: 'border-[#5D58D3]/28 bg-[#5D58D3]/12 shadow-[0_0_24px_rgba(93,88,211,0.14)]', badge: 'border-[#5D58D3]/30 bg-[#5D58D3]/16 text-[#e6e0ff]', value: 'text-[#e6e0ff]' },
];

const pad = (value) => String(value).padStart(2, '0');
const getLocalDateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatCompactNumber = (value) => Number(value || 0).toLocaleString('pt-BR');

const getEventTone = (type = '') => {
  if (type === 'Visita') return { pill: 'border-[#6293E9]/22 bg-[#6293E9]/10 text-[#dce8ff]', panelAccent: 'from-[#6293E9]/18 via-[#5D58D3]/10 to-transparent', iconWrap: 'border-[#6293E9]/20 bg-[#6293E9]/12 text-[#6293E9]' };
  if (type === 'Especialista') return { pill: 'border-[#820AAF]/22 bg-[#820AAF]/10 text-[#f3ddff]', panelAccent: 'from-[#820AAF]/18 via-[#D01BF1]/10 to-transparent', iconWrap: 'border-[#820AAF]/20 bg-[#820AAF]/12 text-[#c871ff]' };
  if (type === 'Reunião') return { pill: 'border-[#5D58D3]/22 bg-[#5D58D3]/10 text-[#e3dcff]', panelAccent: 'from-[#5D58D3]/18 via-[#820AAF]/10 to-transparent', iconWrap: 'border-[#5D58D3]/20 bg-[#5D58D3]/12 text-[#9d93ff]' };
  if (type === 'Treino') return { pill: 'border-[#D01BF1]/22 bg-[#D01BF1]/10 text-[#ffe0ff]', panelAccent: 'from-[#D01BF1]/18 via-[#820AAF]/10 to-transparent', iconWrap: 'border-[#D01BF1]/20 bg-[#D01BF1]/12 text-[#ff91ff]' };
  return { pill: 'border-white/12 bg-white/5 text-white/82', panelAccent: 'from-white/10 via-transparent to-transparent', iconWrap: 'border-white/12 bg-white/6 text-white/80' };
};

const TvPanel = ({ className = '', accentClass = DEFAULT_PANEL_ACCENT, compact = false, children }) => (
  <section className={`newgears-major-panel relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(14,18,34,0.98),rgba(9,12,24,0.96))] ${compact ? 'p-3.5' : 'p-4'} shadow-[0_20px_56px_rgba(0,0,0,0.28)] ${className}`}>
    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentClass}`} />
    <div className="relative z-10 flex h-full flex-col">{children}</div>
  </section>
);

const TvMetricCard = ({ label, value, helper, tone = 'border-white/12 bg-black/24 text-white', compact = false }) => (
  <div className={`newgears-mini-hud border shadow-[0_16px_34px_rgba(0,0,0,0.16)] ${compact ? 'px-3 py-3' : 'px-3.5 py-3.5'} ${tone}`}>
    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-200/60">{label}</p>
    <p className={`font-black leading-tight text-white ${compact ? 'mt-2 text-base md:text-lg' : 'mt-2.5 text-lg md:text-xl'}`}>{value}</p>
    <p className={`${compact ? 'mt-1.5 text-[11px]' : 'mt-2 text-xs'} leading-relaxed text-slate-100/72`}>{helper}</p>
  </div>
);

const TvEmptyState = ({ Icon, title, description, compact = false }) => (
  <div className={`flex flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/20 px-4 py-5 text-center ${compact ? 'min-h-[110px]' : 'min-h-[170px]'}`}>
    <div className={`flex items-center justify-center rounded-[18px] border border-white/12 bg-white/6 ${compact ? 'h-12 w-12' : 'h-14 w-14'}`}>
      <Icon size={compact ? 22 : 24} className="text-white/72" />
    </div>
    <h3 className={`${compact ? 'mt-3 text-base' : 'mt-4 text-lg'} font-black text-white`}>{title}</h3>
    <p className={`${compact ? 'mt-2 text-xs' : 'mt-3 text-sm'} max-w-md leading-relaxed text-slate-200/66`}>{description}</p>
  </div>
);

const TvSlideHero = ({ slideMeta, slideNumber, weekLabel, insights, compact = false }) => {
  const Icon = slideMeta.Icon;

  return (
    <section className={`newgears-workspace-hero newgears-hud-shell relative overflow-hidden rounded-[30px] border border-white/12 bg-gradient-to-br ${slideMeta.accent} ${compact ? 'p-3.5' : 'p-4'} shadow-[0_24px_80px_rgba(0,0,0,0.3)]`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.045)_0%,transparent_26%,transparent_74%,rgba(255,255,255,0.04)_100%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,26px_26px,26px_26px]" />
      <div className="pointer-events-none absolute left-4 top-4 h-16 w-16 border-l-2 border-t-2 border-[#6293E9]/24" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-16 w-16 border-b-2 border-r-2 border-[#D01BF1]/24" />
      <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-[#6293E9]/18 blur-3xl" />
      <div className="pointer-events-none absolute right-[-24px] top-[-10px] h-36 w-36 rounded-full bg-[#D01BF1]/16 blur-3xl" />

      <div className="relative z-10 grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="newgears-kicker inline-flex items-center gap-2 border border-white/18 bg-black/24 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_12px_24px_rgba(0,0,0,0.22)]"><Radio size={12} />Modo TV</span>
            <span className="newgears-status-strip inline-flex items-center gap-2 border border-[#6293E9]/20 bg-[#6293E9]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#dce8ff]"><Icon size={12} />Canal {String(slideNumber).padStart(2, '0')}</span>
            <span className="newgears-status-strip inline-flex items-center gap-2 border border-[#D01BF1]/20 bg-[#D01BF1]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#ffe0ff]"><Shield size={12} />{weekLabel}</span>
          </div>

          <div className="mt-3 max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300/60">{slideMeta.label}</p>
            <h2 className={`newgears-display mt-2 font-black leading-[0.96] text-white ${compact ? 'text-[1.55rem] md:text-[1.8rem]' : 'text-[1.8rem] md:text-[2.2rem]'}`}>{slideMeta.title}</h2>
            <p className={`mt-2 max-w-3xl leading-relaxed text-slate-100/84 ${compact ? 'line-clamp-2 text-[11px]' : 'line-clamp-2 text-xs md:text-sm'}`}>{slideMeta.description}</p>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {insights.map((item) => (
            <TvMetricCard key={item.label} label={item.label} value={item.value} helper={item.helper} tone={item.tone} compact={compact} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TvModePanel = ({ isTvMode, setIsTvMode, standalone = false, currentWeekData, students, missions, tasks, events, outreachEvents, ScoreEvolutionChart }) => {
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const [isFullscreenActive, setIsFullscreenActive] = useState(() => (typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false));
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 1080));
  const slidesCount = TV_SLIDES.length;

  const safeStudents = Array.isArray(students) ? students : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const safeOutreachEvents = Array.isArray(outreachEvents) ? outreachEvents : [];

  const closeTvMode = () => {
    if (!standalone) {
      setIsTvMode(false);
    }
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch {
      if (!standalone) return;
    }

    if (standalone && typeof window !== 'undefined') {
      try {
        window.close();
      } catch {
        // Ignore close failures and fallback to in-app navigation below.
      }

      const baseUrl = new URL(window.location.href);
      baseUrl.searchParams.delete('view');
      window.location.href = baseUrl.toString();
    }
  };

  const toggleBrowserFullscreen = async () => {
    if (typeof document === 'undefined') return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await document.documentElement.requestFullscreen();
    } catch {
      return;
    }
  };

  useEffect(() => {
    if (!isTvMode) return;
    setSlide(0);
    setIsPaused(false);
    setAutoProgress(0);
  }, [isTvMode]);

  useEffect(() => {
    if (!isTvMode || isPaused) return;
    setAutoProgress(0);

    const startedAt = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setAutoProgress(Math.min(100, (elapsed / SLIDE_DURATION) * 100));
    }, 120);

    const slideTimer = setTimeout(() => setSlide((current) => (current + 1) % slidesCount), SLIDE_DURATION);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(slideTimer);
    };
  }, [isTvMode, isPaused, slide, slidesCount]);

  useEffect(() => {
    if (!isTvMode) return;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') return setSlide((current) => (current + 1) % slidesCount);
      if (event.key === 'ArrowLeft') return setSlide((current) => (current - 1 + slidesCount) % slidesCount);
      if (event.key === ' ') {
        event.preventDefault();
        return setIsPaused((current) => !current);
      }
      if (/^[1-7]$/.test(event.key)) setSlide(Number(event.key) - 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTvMode, slidesCount]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleFullscreenChange = () => setIsFullscreenActive(Boolean(document.fullscreenElement));

    handleFullscreenChange();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isTvMode || typeof document === 'undefined') return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isTvMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => setViewportHeight(window.innerHeight);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resolveStudentName = (value) => {
    if (!value) return 'Vago';
    if (typeof value === 'object' && value.name) return value.name;
    const matchedStudent = safeStudents.find((student) => student.id === value);
    return matchedStudent?.name || value;
  };

  const todayDate = getLocalDateKey();
  const todayStart = new Date(`${todayDate}T00:00:00`);
  const displayDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const isCompactViewport = viewportHeight <= 980;
  const isShortViewport = viewportHeight <= 860;
  const isUltraCompactViewport = viewportHeight <= 920;
  const tvContentLimits = getTvContentLimits(viewportHeight);

  const getEventDateTime = (event) => {
    const safeTime = event?.time && /^\d{2}:\d{2}$/.test(event.time) ? event.time : '18:00';
    const parsed = new Date(`${event?.date || todayDate}T${safeTime}:00`);
    return Number.isNaN(parsed.getTime()) ? new Date(`${todayDate}T18:00:00`) : parsed;
  };

  const getRelativeEventLabel = (event) => {
    const eventDay = new Date(getEventDateTime(event));
    eventDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((eventDay.getTime() - todayStart.getTime()) / DAY_IN_MS);
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanha';
    if (diffDays > 1) return `Em ${diffDays} dias`;
    return `${Math.abs(diffDays)} dias atras`;
  };

  const formatEventDate = (event) => getEventDateTime(event).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  const sortedStudents = [...safeStudents].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const allUpcomingEvents = [...safeEvents].filter((event) => getEventDateTime(event).getTime() >= todayStart.getTime()).sort((a, b) => getEventDateTime(a) - getEventDateTime(b));
  const upcomingEvents = allUpcomingEvents.slice(0, tvContentLimits.events);
  const approvedStudents = safeStudents.filter((student) => student.submission?.status === 'approved');
  const waitingReviewCount = safeStudents.filter((student) => student.submission?.status === 'pending').length;
  const stationAssignmentsTotal = STATION_ORDER.reduce((sum, stationKey) => sum + ((currentWeekData?.assignments?.[stationKey] || []).length), 0);
  const missionCount = STATION_ORDER.filter((stationKey) => missions?.[stationKey]?.text?.trim()).length;

  const tasksByStatus = {
    todo: safeTasks.filter((task) => task.status === 'todo').length,
    doing: safeTasks.filter((task) => task.status === 'doing').length,
    review: safeTasks.filter((task) => task.status === 'review').length,
    done: safeTasks.filter((task) => task.status === 'done').length,
  };

  const totalXP = safeStudents.reduce((sum, student) => sum + (student.xp || 0), 0);
  const totalTasksDone = tasksByStatus.done;
  const totalImpact = safeOutreachEvents.reduce((sum, event) => sum + (event.people || 0), 0);
  const activeSlide = TV_SLIDES[slide] || TV_SLIDES[0];
  const nextSlide = TV_SLIDES[(slide + 1) % slidesCount];
  const spotlightEvent = allUpcomingEvents[0] || null;
  const countdownTarget = spotlightEvent ? `${spotlightEvent.date}T${spotlightEvent.time && /^\d{2}:\d{2}$/.test(spotlightEvent.time) ? spotlightEvent.time : '18:00'}:00` : '2026-12-01T08:00:00';
  const countdownTitle = spotlightEvent ? `PROXIMO ${String(spotlightEvent.type || 'EVENTO').toUpperCase()}` : 'TORNEIO FLL';
  const secondsRemaining = Math.max(1, Math.ceil((SLIDE_DURATION * (1 - autoProgress / 100)) / 1000));
  const stationVisibleLimit = tvContentLimits.station;
  const useDenseRankingGrid = sortedStudents.length > 10;
  const useDenseApprovedGrid = approvedStudents.length > 10;

  const slideInsights = {
    0: [
      { label: 'Semana', value: currentWeekData?.weekName || 'Sem leitura', helper: 'rodizio ativo no modo TV', tone: 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' },
      { label: 'Escalados', value: stationAssignmentsTotal, helper: 'pessoas distribuidas na semana', tone: 'border-[#5D58D3]/20 bg-[#5D58D3]/10 text-[#e3dcff]' },
      { label: 'Frentes', value: STATION_ORDER.length, helper: 'engenharia, inovacao e gestao', tone: 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]' },
    ],
    1: [
      { label: 'Missoes', value: missionCount, helper: 'frentes com foco definido', tone: 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' },
      { label: 'Janela', value: currentWeekData?.weekName || 'Temporada', helper: 'ciclo exibido na TV', tone: 'border-[#820AAF]/20 bg-[#820AAF]/10 text-[#f3ddff]' },
      { label: 'Equipe', value: safeStudents.length, helper: 'participantes acompanhando', tone: 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]' },
    ],
    2: [
      { label: 'Cards', value: safeTasks.length, helper: 'itens no quadro', tone: 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' },
      { label: 'Concluidas', value: tasksByStatus.done, helper: 'entregas registradas', tone: 'border-[#820AAF]/20 bg-[#820AAF]/10 text-[#f3ddff]' },
      { label: 'Revisao', value: tasksByStatus.review, helper: 'esperando validacao', tone: 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]' },
    ],
    3: [
      { label: 'Leitura', value: 'Mesa', helper: 'grafico em destaque de apresentacao', tone: 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' },
      { label: 'Proximo', value: spotlightEvent ? getRelativeEventLabel(spotlightEvent) : 'Sem agenda', helper: spotlightEvent ? (spotlightEvent.type || 'evento') : 'nenhum compromisso futuro', tone: 'border-[#5D58D3]/20 bg-[#5D58D3]/10 text-[#e3dcff]' },
      { label: 'Semana', value: currentWeekData?.weekName || 'Temporada', helper: 'janela atual da equipe', tone: 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]' },
    ],
    4: [
      { label: 'Eventos', value: upcomingEvents.length, helper: 'compromissos visiveis', tone: 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' },
      { label: 'Spotlight', value: spotlightEvent ? formatEventDate(spotlightEvent) : 'Livre', helper: spotlightEvent ? getRelativeEventLabel(spotlightEvent) : 'sem evento em destaque', tone: 'border-[#820AAF]/20 bg-[#820AAF]/10 text-[#f3ddff]' },
      { label: 'Local', value: spotlightEvent?.location || 'A definir', helper: 'proximo ponto de encontro', tone: 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]' },
    ],
    5: [
      { label: 'XP total', value: formatCompactNumber(totalXP), helper: 'potencia acumulada da equipe', tone: 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' },
      { label: 'Alcance', value: formatCompactNumber(totalImpact), helper: 'pessoas alcancadas nas acoes', tone: 'border-[#820AAF]/20 bg-[#820AAF]/10 text-[#f3ddff]' },
      { label: 'Entregas', value: totalTasksDone, helper: 'cards concluidos no kanban', tone: 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]' },
    ],
    6: [
      { label: 'Aprovados', value: approvedStudents.length, helper: 'missoes validadas pela equipe', tone: 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' },
      { label: 'Em analise', value: waitingReviewCount, helper: 'entregas aguardando retorno', tone: 'border-[#820AAF]/20 bg-[#820AAF]/10 text-[#f3ddff]' },
      { label: 'Equipe', value: safeStudents.length, helper: 'pessoas aparecendo na vitrine', tone: 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]' },
    ],
  };

  if (!isTvMode) return null;

  return (
    <div className={`newgears-shell relative z-[200] flex flex-col overflow-hidden bg-[linear-gradient(135deg,#050913_0%,#091121_16%,#101633_42%,#181132_68%,#080b12_100%)] text-white ${standalone ? 'min-h-screen' : 'fixed inset-0'}`}>
      <div className="newgears-floating-layer">
        <div className="newgears-orb newgears-orb--cyan" />
        <div className="newgears-orb newgears-orb--yellow" />
        <div className="newgears-orb newgears-orb--pink" />
        <div className="newgears-orb newgears-orb--lime" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(98,147,233,0.2),transparent_18%),radial-gradient(circle_at_92%_8%,rgba(208,27,241,0.18),transparent_20%),radial-gradient(circle_at_84%_26%,rgba(130,10,175,0.16),transparent_18%),radial-gradient(circle_at_16%_84%,rgba(93,88,211,0.14),transparent_18%)]" />

      <header className={`newgears-toolbar-shell newgears-hud-shell relative z-10 border border-white/12 bg-[linear-gradient(145deg,rgba(15,18,35,0.96),rgba(11,16,31,0.95))] shadow-[0_20px_60px_rgba(0,0,0,0.28)] ${isCompactViewport ? 'mx-3 mt-3 px-3 py-2' : 'mx-4 mt-4 px-4 py-2.5'}`}>
        <div className={`flex flex-col ${isCompactViewport ? 'gap-2' : 'gap-2.5'}`}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className={`newgears-logo-hub shrink-0 ${isUltraCompactViewport ? 'w-10 px-1.5 py-1' : 'w-12 px-2 py-1.5'}`}>
                <LogoNewGears />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="newgears-kicker inline-flex items-center gap-1.5 border border-white/18 bg-black/24 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-white"><Radio size={11} />Modo TV</span>
                  {!isUltraCompactViewport ? <span className="newgears-status-strip inline-flex items-center gap-1.5 border border-[#6293E9]/20 bg-[#6293E9]/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#dce8ff]"><Shield size={11} />Painel oficial</span> : null}
                </div>

                <h1 className={`newgears-display mt-1.5 font-black text-white ${isUltraCompactViewport ? 'text-[1.22rem] md:text-[1.45rem]' : 'text-[1.42rem] md:text-[1.72rem]'}`}>NEW GEARS TV</h1>
                <p className="mt-1 text-[10px] text-slate-200/70">{displayDate} | {currentWeekData?.weekName || 'Temporada FLL'} | Slide {slide + 1}/{slidesCount}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 xl:items-end">
              <div className="flex flex-wrap justify-end gap-1.5">
                <span className={`newgears-status-strip inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] ${isPaused ? 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' : 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]'}`}>{isPaused ? 'Pausado' : 'No ar'}</span>
                <span className="newgears-status-strip inline-flex items-center gap-1.5 border border-[#5D58D3]/20 bg-[#5D58D3]/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#e3dcff]">{activeSlide.label}</span>
                {!isUltraCompactViewport ? <span className="newgears-status-strip inline-flex items-center gap-1.5 border border-[#820AAF]/20 bg-[#820AAF]/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#f3ddff]">{nextSlide.label}</span> : null}
              </div>
              <Countdown targetDate={countdownTarget} title={countdownTitle} compact={true} dense={true} />
            </div>
          </div>

          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`newgears-status-strip inline-flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${isPaused ? 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' : 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]'}`}>
                <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-[#6293E9]' : 'bg-[#D01BF1] animate-pulse'}`} />
                {isPaused ? 'Transmissao pausada' : 'Transmissao no ar'}
              </span>

              <span className="newgears-status-strip inline-flex items-center gap-1.5 border border-[#5D58D3]/20 bg-[#5D58D3]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#e3dcff]"><activeSlide.Icon size={12} />{activeSlide.title}</span>
              {!isUltraCompactViewport ? <span className="newgears-status-strip inline-flex items-center gap-1.5 border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/78"><ChevronRight size={12} />Proximo: {nextSlide.label}</span> : null}
            </div>

            <div className={`w-full ${isCompactViewport ? 'max-w-[360px]' : 'max-w-[460px]'}`}>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#6293E9_0%,#5D58D3_34%,#820AAF_68%,#D01BF1_100%)] transition-[width] duration-100" style={{ width: `${autoProgress}%` }} />
              </div>
              <p className="mt-1.5 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300/62">{isPaused ? 'Pausado manualmente' : `Troca em ${secondsRemaining}s`} | Espaco pausa | Setas | 1-7</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`newgears-stage relative z-10 flex-1 min-h-0 ${isCompactViewport ? 'px-3 pb-2.5 pt-2' : 'px-4 pb-3.5 pt-2.5'}`}>
        <div className="h-full animate-in fade-in duration-700">
          <div className={`flex h-full flex-col ${isCompactViewport ? 'gap-2.5' : 'gap-3.5'}`}>
            <TvSlideHero slideMeta={activeSlide} slideNumber={slide + 1} weekLabel={currentWeekData?.weekName || 'Temporada FLL'} insights={slideInsights[slide] || []} compact={isCompactViewport} />

            <div className="min-h-0 flex-1">
              {slide === 0 && (
                <div className={`grid h-full min-h-0 ${isCompactViewport ? 'gap-3' : 'gap-4'} xl:grid-cols-3`}>
                  {STATION_ORDER.map((stationKey) => {
                    const meta = STATION_META[stationKey];
                    const Icon = meta.Icon;
                    const stationStudents = currentWeekData?.assignments?.[stationKey] || [];
                    const visibleStationStudents = stationStudents.slice(0, stationVisibleLimit);
                    const hiddenStudentsCount = Math.max(stationStudents.length - visibleStationStudents.length, 0);

                    return (
                      <TvPanel key={stationKey} className={meta.border} accentClass={meta.panelAccent} compact={isCompactViewport}>
                        <div className="flex items-start justify-between gap-2.5 border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`rounded-[16px] border p-2.5 ${meta.iconWrap}`}><Icon size={18} /></div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Frente ativa</p>
                              <h3 className={`mt-1 text-[1.35rem] font-black ${meta.text}`}>{meta.label}</h3>
                            </div>
                          </div>

                          <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${meta.pill}`}>{stationStudents.length} escalados</span>
                        </div>

                        <p className="mt-2 text-[11px] leading-relaxed text-slate-200/72 line-clamp-2">{meta.helper}</p>
                        <div className="mt-3 h-1 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]"><div className={`h-full w-full rounded-full bg-gradient-to-r ${meta.strip} opacity-90`} /></div>

                        <div className="mt-3 flex-1 space-y-2 overflow-hidden">
                          {stationStudents.length === 0 ? (
                            <TvEmptyState Icon={Icon} title="Sem escalados nesta frente" description="Assim que a equipe tecnica distribuir o rodizio da semana, este bloco mostra os nomes em destaque." compact={isCompactViewport} />
                          ) : (
                            visibleStationStudents.map((studentValue, index) => {
                              const studentName = resolveStudentName(studentValue);
                              const isLeader = stationKey === 'Gest\u00e3o' && studentName !== 'Vago' && !CAPTAIN_NAMES.has(studentName);

                              return (
                                <div key={`${stationKey}-${studentName}-${index}`} className={`rounded-[18px] border p-2.5 ${isLeader ? 'border-[#D01BF1]/28 bg-[#D01BF1]/12 shadow-[0_0_24px_rgba(208,27,241,0.12)]' : 'border-white/10 bg-black/22'}`}>
                                  <div className="flex items-center gap-2.5">
                                    <div className={`flex shrink-0 items-center justify-center rounded-[14px] border h-9 w-9 ${isLeader ? 'border-[#D01BF1]/26 bg-[#D01BF1]/16 text-[#ffe0ff]' : meta.iconWrap}`}>
                                      {isLeader ? <Crown size={16} /> : <UserCircle size={16} />}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-[15px] font-black text-white">{studentName}</p>
                                      {!isShortViewport ? <p className="mt-0.5 text-[10px] text-slate-200/60">{isLeader ? 'Lideranca visivel nesta semana' : 'Escalado no ciclo atual'}</p> : null}
                                    </div>

                                    {isLeader ? <span className="rounded-full border border-[#D01BF1]/22 bg-[#D01BF1]/12 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#ffe0ff]">Lider</span> : null}
                                  </div>
                                </div>
                              );
                            })
                          )}

                          {hiddenStudentsCount > 0 ? (
                            <div className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-white/72">
                              +{hiddenStudentsCount} pessoas nesta frente
                            </div>
                          ) : null}
                        </div>
                      </TvPanel>
                    );
                  })}
                </div>
              )}

              {slide === 1 && (
                <div className={`grid h-full min-h-0 ${isCompactViewport ? 'gap-3' : 'gap-4'} xl:grid-cols-3`}>
                  {STATION_ORDER.map((stationKey) => {
                    const meta = STATION_META[stationKey];
                    const Icon = meta.Icon;
                    const missionText = missions?.[stationKey]?.text?.trim();

                    return (
                      <TvPanel key={stationKey} className={meta.border} accentClass={meta.panelAccent} compact={isCompactViewport}>
                        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-[18px] border p-3 ${meta.iconWrap}`}><Icon size={20} /></div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Missao principal</p>
                              <h3 className={`mt-1 text-2xl font-black ${meta.text}`}>{meta.label}</h3>
                            </div>
                          </div>

                          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${meta.pill}`}>Semana atual</span>
                        </div>

                        <div className={`mt-4 flex-1 rounded-[24px] border border-white/10 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${isCompactViewport ? 'p-4' : 'p-5'}`}>
                          {missionText ? (
                            <>
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/52">Foco em tela</p>
                              <p className={`${isCompactViewport ? 'mt-3 text-lg' : 'mt-4 text-xl'} font-black italic leading-relaxed text-white line-clamp-5`}>"{missionText}"</p>
                            </>
                          ) : (
                            <TvEmptyState Icon={Target} title="Foco ainda nao definido" description="Quando a equipe cadastrar a missao desta frente, ela aparece aqui com leitura de palco." compact={true} />
                          )}
                        </div>

                        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                          <div className="newgears-mini-hud border border-white/10 bg-black/22 px-4 py-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300/58">Contexto</p>
                            <p className="mt-3 text-sm font-black text-white">Direcao da semana</p>
                            <p className="mt-2 text-xs leading-relaxed text-slate-100/70">Este bloco resume a entrega que deve puxar a frente na rodada atual.</p>
                          </div>

                          <div className={`newgears-mini-hud border px-4 py-4 ${meta.pill}`}>
                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-100/66">Tom da frente</p>
                            <p className="mt-3 text-sm font-black text-white">{meta.label}</p>
                            <p className="mt-2 text-xs leading-relaxed text-slate-100/74">{meta.helper}</p>
                          </div>
                        </div>
                      </TvPanel>
                    );
                  })}
                </div>
              )}

              {slide === 2 && (
                <div className={`grid h-full min-h-0 ${isCompactViewport ? 'gap-3' : 'gap-4'} md:grid-cols-2 xl:grid-cols-4`}>
                  {KANBAN_COLUMNS.map((column) => {
                    const columnTasks = safeTasks.filter((task) => task.status === column.status);
                    const visibleColumnTasks = columnTasks.slice(0, tvContentLimits.kanban);
                    const hiddenTasksCount = Math.max(columnTasks.length - visibleColumnTasks.length, 0);
                    const ColumnIcon = column.Icon;

                    return (
                      <TvPanel key={column.status} className={`${column.border} min-h-0`} accentClass={column.panelAccent} compact={isCompactViewport}>
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-[18px] border p-3 ${column.iconWrap}`}><ColumnIcon size={20} className={column.status === 'doing' ? 'animate-spin' : ''} /></div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Coluna ativa</p>
                              <h3 className="mt-1 text-2xl font-black text-white">{column.title}</h3>
                            </div>
                          </div>

                          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${column.pill}`}>{columnTasks.length} cards</span>
                        </div>

                        <div className="mt-4 flex-1 space-y-2.5 overflow-hidden">
                          {columnTasks.length === 0 ? (
                            <TvEmptyState Icon={ColumnIcon} title="Sem cards nesta coluna" description="Quando a equipe mover tarefas para esta etapa, elas aparecem aqui com destaque para leitura rapida." compact={isCompactViewport} />
                          ) : (
                            visibleColumnTasks.map((task) => (
                              <div key={task.id} className="rounded-[20px] border border-white/10 bg-black/22 p-3 shadow-[0_14px_28px_rgba(0,0,0,0.16)]">
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${column.pill}`}>{task.author || 'Equipe'}</span>
                                  {task.tag ? <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">{task.tag}</span> : null}
                                </div>

                                <p className="mt-3 line-clamp-4 text-sm font-black leading-snug text-white">{task.text}</p>
                              </div>
                            ))
                          )}

                          {hiddenTasksCount > 0 ? (
                            <div className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-white/72">
                              +{hiddenTasksCount} cards fora do quadro
                            </div>
                          ) : null}
                        </div>
                      </TvPanel>
                    );
                  })}
                </div>
              )}

              {slide === 3 && (
                <TvPanel className="h-full min-h-0 border-[#5D58D3]/24" accentClass="from-[#5D58D3]/16 via-[#820AAF]/10 to-transparent" compact={isCompactViewport}>
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Rounds completos</p>
                      <h3 className="mt-1 text-xl font-black text-white">Gabarito em 2:30</h3>
                    </div>

                    <span className="rounded-full border border-[#5D58D3]/20 bg-[#5D58D3]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#e3dcff]">Leitura de palco</span>
                  </div>

                  <div className="mt-3 min-h-0 flex-1">
                    <ScoreEvolutionChart isTvMode={true} tvModeVariant="full_rounds" />
                  </div>
                </TvPanel>
              )}

              {slide === 4 && (
                upcomingEvents.length === 0 ? (
                  <TvPanel className="h-full border-[#6293E9]/24" accentClass="from-[#6293E9]/18 via-[#820AAF]/10 to-transparent" compact={isCompactViewport}>
                    <TvEmptyState Icon={CalendarDays} title="Nenhum evento futuro no radar" description="Assim que a equipe cadastrar novos compromissos, esta agenda em modo TV mostra o destaque principal e os proximos passos do calendario." compact={isCompactViewport} />
                  </TvPanel>
                ) : (
                  <div className={`grid h-full min-h-0 ${isCompactViewport ? 'gap-3' : 'gap-4'} xl:grid-cols-[320px,minmax(0,1fr)]`}>
                    <TvPanel className="border-[#820AAF]/24" accentClass={getEventTone(spotlightEvent?.type).panelAccent} compact={isCompactViewport}>
                      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                        <div className={`rounded-[18px] border p-3 ${getEventTone(spotlightEvent?.type).iconWrap}`}><CalendarDays size={20} /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Evento spotlight</p>
                          <h3 className="mt-1 text-2xl font-black text-white">{spotlightEvent?.title || 'Compromisso da equipe'}</h3>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${getEventTone(spotlightEvent?.type).pill}`}>{spotlightEvent?.type || 'Evento'}</span>
                        <p className={`${isCompactViewport ? 'mt-3 text-2xl' : 'mt-4 text-3xl'} font-black leading-tight text-white`}>{getRelativeEventLabel(spotlightEvent)}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-100/72">{formatEventDate(spotlightEvent)} | {spotlightEvent?.time || 'Sem horario'}</p>
                        <p className="mt-4 text-sm font-black text-white">{spotlightEvent?.location || 'Local ainda nao definido'}</p>
                      </div>

                      <div className="mt-4 grid gap-2.5">
                        <div className="newgears-mini-hud border border-white/10 bg-black/22 px-4 py-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300/58">Janela</p>
                          <p className="mt-2.5 text-lg font-black text-white">{allUpcomingEvents.length} eventos</p>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-100/70">Calendario resumido para caber inteiro em tela.</p>
                        </div>

                        <div className="newgears-mini-hud border border-white/10 bg-black/22 px-4 py-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-300/58">Recado</p>
                          <p className="mt-2.5 text-xs font-black text-white">Agenda pronta para coach, equipe e apresentacao.</p>
                        </div>
                      </div>
                    </TvPanel>

                    <TvPanel className="min-h-0 border-[#6293E9]/24" accentClass="from-[#6293E9]/18 via-[#5D58D3]/10 to-transparent" compact={isCompactViewport}>
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Proximos compromissos</p>
                          <h3 className="mt-1 text-2xl font-black text-white">Fila de eventos da equipe</h3>
                        </div>

                        <span className="rounded-full border border-[#6293E9]/20 bg-[#6293E9]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#dce8ff]">{upcomingEvents.length} cards</span>
                      </div>

                      <div className="mt-4 grid flex-1 min-h-0 grid-cols-1 gap-3 overflow-hidden md:grid-cols-2 xl:grid-cols-3">
                        {upcomingEvents.map((eventItem, index) => {
                          const eventTone = getEventTone(eventItem.type);
                          const isToday = eventItem.date === todayDate;

                          return (
                            <div key={eventItem.id || `${eventItem.date}-${eventItem.title}-${index}`} className={`rounded-[22px] border p-3.5 ${isToday ? 'border-[#D01BF1]/30 bg-[#D01BF1]/12 shadow-[0_0_24px_rgba(208,27,241,0.12)]' : 'border-white/10 bg-black/22'}`}>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${eventTone.pill}`}>{eventItem.type || 'Evento'}</span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/72">{getRelativeEventLabel(eventItem)}</span>
                              </div>

                              <h4 className="mt-3 text-base font-black leading-tight text-white line-clamp-2">{eventItem.title}</h4>

                              <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-xs text-slate-100/72">
                                <div className="flex items-center gap-2"><Calendar size={13} className="text-[#6293E9]" />{formatEventDate(eventItem)}</div>
                                <div className="flex items-center gap-2"><Clock size={13} className="text-[#D01BF1]" />{eventItem.time || 'Sem horario'}</div>
                                {eventItem.location ? <div className="flex items-center gap-2"><MapPin size={13} className="text-[#820AAF]" /><span className="truncate">{eventItem.location}</span></div> : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {allUpcomingEvents.length > upcomingEvents.length ? (
                        <div className="mt-3 rounded-[18px] border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-white/72">
                          +{allUpcomingEvents.length - upcomingEvents.length} eventos fora da tela resumida
                        </div>
                      ) : null}
                    </TvPanel>
                  </div>
                )
              )}

              {slide === 5 && (
                <div className={`grid h-full min-h-0 ${isCompactViewport ? 'gap-3' : 'gap-4'} xl:grid-cols-[minmax(0,1.2fr),280px]`}>
                  <TvPanel className="min-h-0 border-[#D01BF1]/24" accentClass="from-[#D01BF1]/18 via-[#820AAF]/10 to-transparent" compact={isCompactViewport}>
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Ranking oficial</p>
                        <h3 className="mt-1 text-xl font-black text-white">Leitura geral de XP</h3>
                      </div>

                      <span className="rounded-full border border-[#D01BF1]/20 bg-[#D01BF1]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#ffe0ff]">Equipe {sortedStudents.length}</span>
                    </div>

                    <div className="mt-3 grid flex-1 min-h-0 gap-2 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
                      {sortedStudents.map((student, index) => {
                        const rankTone = RANK_TONES[index] || { card: 'border-white/10 bg-black/22', badge: 'border-white/10 bg-white/6 text-white/84', value: 'text-white' };

                        return (
                          <div key={student.id} className={`rounded-[18px] border shadow-[0_14px_30px_rgba(0,0,0,0.16)] ${useDenseRankingGrid ? 'p-2.5' : 'p-3'} ${rankTone.card}`}>
                            <div className="flex items-center gap-2.5">
                              <span className={`inline-flex shrink-0 items-center justify-center border font-black ${useDenseRankingGrid ? 'h-9 w-9 rounded-[14px] text-sm' : 'h-10 w-10 rounded-[15px] text-base'} ${rankTone.badge}`}>#{index + 1}</span>

                              {student.avatarImage ? (
                                <img src={student.avatarImage} alt="Avatar" className={`${useDenseRankingGrid ? 'h-9 w-9 rounded-[14px]' : 'h-10 w-10 rounded-[15px]'} border border-white/12 object-cover`} />
                              ) : (
                                <div className={`flex items-center justify-center border border-white/12 bg-black/20 ${useDenseRankingGrid ? 'h-9 w-9 rounded-[14px]' : 'h-10 w-10 rounded-[15px]'}`}><UserCircle size={useDenseRankingGrid ? 18 : 20} className="text-white/72" /></div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className={`truncate font-black text-white ${useDenseRankingGrid ? 'text-sm' : 'text-[15px]'}`}>{student.name}</p>
                                <p className="mt-0.5 text-[10px] text-slate-100/64">{student.station || 'Equipe'}</p>
                              </div>

                              <span className={`font-black ${useDenseRankingGrid ? 'text-base' : 'text-lg'} ${rankTone.value}`}>{formatCompactNumber(student.xp || 0)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TvPanel>

                  <div className="grid min-h-0 gap-3">
                    <TvPanel className="border-[#6293E9]/24" accentClass="from-[#6293E9]/18 via-[#5D58D3]/10 to-transparent" compact={isCompactViewport}>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Potencia total</p>
                      <p className="mt-3 text-4xl font-black text-white">{formatCompactNumber(totalXP)}</p>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-100/72">XP acumulado da equipe com leitura compacta para caber inteiro na TV.</p>
                    </TvPanel>

                    <TvPanel className="border-[#820AAF]/24" accentClass="from-[#820AAF]/18 via-[#D01BF1]/10 to-transparent" compact={isCompactViewport}>
                      <div className="grid gap-2">
                        <div className="newgears-mini-hud border border-white/10 bg-black/22 px-3 py-3">
                          <div className="flex items-center gap-2"><Megaphone size={16} className="text-[#820AAF]" /><p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Alcance</p></div>
                          <p className="mt-2 text-2xl font-black text-white">{formatCompactNumber(totalImpact)}</p>
                          <p className="mt-1 text-[11px] text-slate-100/70">Pessoas alcancadas.</p>
                        </div>

                        <div className="newgears-mini-hud border border-white/10 bg-black/22 px-3 py-3">
                          <div className="flex items-center gap-2"><CheckCheck size={16} className="text-[#D01BF1]" /><p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Entregas</p></div>
                          <p className="mt-2 text-2xl font-black text-white">{totalTasksDone}</p>
                          <p className="mt-1 text-[11px] text-slate-100/70">Cards concluidos.</p>
                        </div>

                        <div className="newgears-mini-hud border border-white/10 bg-black/22 px-3 py-3">
                          <div className="flex items-center gap-2"><CheckCircle size={16} className="text-[#6293E9]" /><p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Missoes aprovadas</p></div>
                          <p className="mt-2 text-2xl font-black text-white">{approvedStudents.length}</p>
                          <p className="mt-1 text-[11px] text-slate-100/70">Prontas para vitrine.</p>
                        </div>
                      </div>
                    </TvPanel>
                  </div>
                </div>
              )}

              {slide === 6 && (
                <div className={`grid h-full min-h-0 ${isCompactViewport ? 'gap-3' : 'gap-4'} xl:grid-cols-[240px,minmax(0,1fr)]`}>
                  <TvPanel className="border-[#820AAF]/24" accentClass="from-[#820AAF]/18 via-[#D01BF1]/10 to-transparent" compact={isCompactViewport}>
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
                      <div className="rounded-[16px] border border-[#820AAF]/20 bg-[#820AAF]/12 p-2.5 text-[#c871ff]"><Sparkles size={18} /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Vitrine da semana</p>
                        <h3 className="mt-1 text-xl font-black text-white">Painel de destaque</h3>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/56">Aprovados</p>
                        <p className="mt-2 text-3xl font-black text-white">{approvedStudents.length}</p>
                        <p className="mt-1 text-[11px] text-slate-100/72">Prontos para celebracao.</p>
                      </div>

                      <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/56">Em analise</p>
                        <p className="mt-2 text-3xl font-black text-white">{waitingReviewCount}</p>
                        <p className="mt-1 text-[11px] text-slate-100/72">Aguardando retorno.</p>
                      </div>

                      <div className="rounded-[20px] border border-white/10 bg-black/20 p-3 text-[11px] leading-relaxed text-slate-100/72">
                        Cards compactados para mostrar todos os destaques no mesmo slide.
                      </div>
                    </div>
                  </TvPanel>

                  <TvPanel className="min-h-0 border-[#D01BF1]/24" accentClass="from-[#D01BF1]/18 via-[#820AAF]/10 to-transparent" compact={isCompactViewport}>
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/58">Missoes validadas</p>
                        <h3 className="mt-1 text-xl font-black text-white">Hall da rodada</h3>
                      </div>

                      <span className="rounded-full border border-[#D01BF1]/20 bg-[#D01BF1]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#ffe0ff]">Aprovados {approvedStudents.length}</span>
                    </div>

                    {approvedStudents.length === 0 ? (
                      <div className="mt-3 flex-1">
                        <TvEmptyState Icon={CheckCircle} title="Nenhuma missao aprovada ainda" description="Quando a equipe validar entregas, elas aparecem aqui em uma vitrine mais forte e alinhada ao visual da plataforma." compact={isCompactViewport} />
                      </div>
                    ) : (
                      <div className="mt-3 grid flex-1 min-h-0 grid-cols-2 gap-2 overflow-hidden md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {approvedStudents.map((student) => (
                          <div key={student.id} className={`rounded-[20px] border border-[#D01BF1]/24 bg-[linear-gradient(160deg,rgba(29,11,39,0.94),rgba(13,14,26,0.96))] text-center shadow-[0_18px_42px_rgba(0,0,0,0.2)] ${useDenseApprovedGrid ? 'p-2.5' : 'p-3'}`}>
                            {student.avatarImage ? (
                              <img src={student.avatarImage} alt="Avatar" className={`mx-auto border-2 border-[#D01BF1]/30 object-cover shadow-[0_0_24px_rgba(208,27,241,0.14)] ${useDenseApprovedGrid ? 'h-12 w-12 rounded-[14px]' : 'h-16 w-16 rounded-[18px]'}`} />
                            ) : (
                              <div className={`mx-auto flex items-center justify-center border-2 border-[#D01BF1]/30 bg-[#D01BF1]/10 shadow-[0_0_24px_rgba(208,27,241,0.12)] ${useDenseApprovedGrid ? 'h-12 w-12 rounded-[14px]' : 'h-16 w-16 rounded-[18px]'}`}><UserCircle size={useDenseApprovedGrid ? 22 : 30} className="text-[#ffe0ff]" /></div>
                            )}

                            <h4 className={`mt-2.5 font-black text-white ${useDenseApprovedGrid ? 'text-sm leading-tight' : 'text-base'}`}>{student.name}</h4>
                            <p className="mt-1 text-[10px] text-slate-100/68">{student.station || 'Equipe'}</p>

                            <span className="mt-2 inline-flex rounded-full border border-[#D01BF1]/20 bg-[#D01BF1]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#ffe0ff]">
                              {student.submission?.date ? `Aprovado ${student.submission.date}` : 'Aprovado'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TvPanel>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className={`newgears-toolbar-shell newgears-hud-shell relative z-10 border border-white/12 bg-[linear-gradient(145deg,rgba(15,18,35,0.96),rgba(11,16,31,0.94))] shadow-[0_18px_48px_rgba(0,0,0,0.24)] ${isCompactViewport ? 'mx-3 mb-3 px-3 py-2' : 'mx-4 mb-4 px-3.5 py-2.5'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-300/70">
            <span className={`newgears-status-strip inline-flex items-center gap-1.5 border px-2.5 py-1.5 ${isPaused ? 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff]' : 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff]'}`}>
              <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-[#6293E9]' : 'bg-[#D01BF1] animate-pulse'}`} />
              {isPaused ? 'Pausado' : 'Ao vivo'}
            </span>

            {!isUltraCompactViewport ? <span className="newgears-status-strip inline-flex items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-1.5 text-white/78"><ChevronRight size={12} />Navegacao pronta</span> : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => setSlide((current) => (current - 1 + slidesCount) % slidesCount)} className="newgears-workspace-action inline-flex items-center gap-1.5 border border-white/10 bg-white/6 px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.14)] transition-all hover:bg-white/12" title="Canal anterior"><ChevronLeft size={14} />{!isUltraCompactViewport ? 'Anterior' : null}</button>

            <button onClick={() => setIsPaused((current) => !current)} className={`newgears-workspace-action inline-flex items-center gap-1.5 border px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] shadow-[0_8px_18px_rgba(0,0,0,0.14)] transition-all ${isPaused ? 'border-[#6293E9]/20 bg-[#6293E9]/10 text-[#dce8ff] hover:bg-[#6293E9]/16' : 'border-[#D01BF1]/20 bg-[#D01BF1]/10 text-[#ffe0ff] hover:bg-[#D01BF1]/16'}`} title={isPaused ? 'Retomar auto-play' : 'Pausar TV'}>{isPaused ? <Play size={14} /> : <Pause size={14} />}{!isUltraCompactViewport ? (isPaused ? 'Retomar' : 'Pausar') : null}</button>

            <button onClick={toggleBrowserFullscreen} className="newgears-workspace-action inline-flex items-center gap-1.5 border border-white/10 bg-white/6 px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.14)] transition-all hover:bg-white/12" title="Alternar tela cheia"><Maximize size={14} />{!isUltraCompactViewport ? (isFullscreenActive ? 'Janela' : 'Tela cheia') : null}</button>

            <div className="flex flex-wrap items-center gap-1.5">
              {TV_SLIDES.map((item, index) => (
                <button key={item.id} onClick={() => setSlide(index)} className={`newgears-workspace-action inline-flex items-center gap-1.5 border px-2 py-2 text-[10px] font-black uppercase tracking-[0.14em] shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition-all ${index === slide ? 'border-[#6293E9]/24 bg-[linear-gradient(135deg,rgba(98,147,233,0.16),rgba(208,27,241,0.14))] text-white' : 'border-white/10 bg-white/5 text-white/74 hover:bg-white/10 hover:text-white'}`}>
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${index === slide ? 'border-white/20 bg-white/12' : 'border-white/10 bg-black/20'}`}>{index + 1}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setSlide((current) => (current + 1) % slidesCount)} className="newgears-workspace-action inline-flex items-center gap-1.5 border border-white/10 bg-white/6 px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.14)] transition-all hover:bg-white/12" title="Proximo canal">{!isUltraCompactViewport ? 'Proximo' : null}<ChevronRight size={14} /></button>
            <button onClick={closeTvMode} className="newgears-workspace-action inline-flex items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/78 shadow-[0_8px_18px_rgba(0,0,0,0.14)] transition-all hover:bg-white/10 hover:text-white"><X size={14} />{!isUltraCompactViewport ? 'Sair' : null}</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TvModePanel;

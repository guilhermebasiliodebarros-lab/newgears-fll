import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, setDoc, collectionGroup, orderBy, limit, writeBatch, runTransaction } from "firebase/firestore";
import { auth, db, FIREBASE_AUTH_ENABLED } from './firebase'; // Reutiliza o mesmo projeto Firebase
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { loadReportsSession } from './services/weeklyReports';
import useTeamRecords from './hooks/useTeamRecords';
import useWorkspaceClock from './hooks/useWorkspaceClock';
import useWeeklyReports from './hooks/useWeeklyReports';
import useSeasonEvaluations from './hooks/useSeasonEvaluations';
const WeeklyReportsView = lazy(() => import('./views/WeeklyReportsView'));
const ReportRecipientsView = lazy(() => import('./views/ReportRecipientsView'));
import WeeklyReportsSummary from './components/WeeklyReportsSummary';
import WorkspaceBriefing from './components/WorkspaceBriefing';
import WorkspaceSearch from './components/WorkspaceSearch';
import { DialogSurface, NotificationToast, PanelSkeleton, SectionDisclosure } from './components/InterfacePrimitives';
import WorkspaceActionQueue from './components/WorkspaceActionQueue';
import SeasonPlanningPanel from './components/SeasonPlanningPanel';
import AttendancePanel from './components/AttendancePanel';
import TaskReviewForm from './components/TaskReviewForm';
import SeasonTransitionChecklist from './components/SeasonTransitionChecklist';
import TournamentSelectionNotice from './components/TournamentSelectionNotice';
import GearExperienceProvider from './components/GearExperienceProvider';
import AttachmentRoundPicker from './components/AttachmentRoundPicker';
import { attachmentRoundNames } from './utils/attachmentRounds';
import DraftForm from './components/DraftForm';
import { createDraftRecord } from './services/draftRecords';
import { saveTeamCheckIn, CHECK_IN_REWARD_XP } from './services/teamCheckIn';
import GearCompanion from './components/GearCompanion';
import { GearAvatar } from './components/GearMascot';
import { celebrateGearContribution, gearItem, gearDay, GEAR_CONTRIBUTIONS } from './utils/gearShop';
import './components/GearExperience.css';
import { publishTournamentSelection, saveTournamentCandidate, tournamentDraftId, tournamentSelectionError } from './services/tournamentSelection';
import { changeTaskStage, updateTaskPeople, setTaskBlock } from './services/taskWorkflow';
import { validateTaskGearReward } from './services/taskGearRewards';
import TaskBlockForm from './components/TaskBlockForm';
import ReminderInbox from './components/ReminderInbox';
import { applyRotation, undoRotation, saveAttendance, assertActiveSeason, transitionSeason } from './services/teamProcesses';
import { buildRotationSchedule, resolvePlanningConfig, validatePlanning, isActiveStudent, SEASON_COLLECTIONS, validDate, dateKey } from './utils/teamProcesses';
import Countdown from './components/Countdown';
import LogoNewGears from './components/LogoNewGears';
import WorkspaceSidebar from './components/WorkspaceSidebar';
import { workshopMember } from './utils/gearWorkshop';
import { WorkspaceHero, WorkspaceSectionHeading, WorkspaceScene, WorkspaceContent, WorkspaceCollapsible, WorkspacePanelToolbar, SeasonModeControl } from './components/WorkspaceChrome';
const StrategyView = lazy(() => import('./views/StrategyView'));
const RoundsView = lazy(() => import('./views/RoundsView'));
const LogbookView = lazy(() => import('./views/LogbookView'));
const KanbanView = lazy(() => import('./views/KanbanView'));
import { normalizeTaskRecord, normalizeEventRecord, normalizeWorkspaceRecord, recordDay, recordDate } from './utils/workspaceRecords';
import { deleteRobotRound, applyOfficialCode, saveEvaluation } from './services/workspaceMutations';
const ScoreEvolutionChart = lazy(() => import('./components/ScoreEvolutionChart'));
import { ScoreEvolutionChartContext } from './hooks/useScoreEvolutionChartContext';
import { studentAttendanceStats, studentLevel } from './utils/studentMetrics';
import { adjustStudentXp, undoStudentXp, reviewLeaderPenalty, saveSchoolGrades, claimEnglishReward, changeStudentBadge } from './services/studentXp';
import { readInlineMedia } from './utils/inlineMedia';
import { legacySessionIdentity } from './utils/legacySession';
import { browserStorage } from './utils/browserStorage';
import { reportClientIssue, setDiagnosticsContext } from './services/clientDiagnostics';
const AgendaView = lazy(() => import('./views/AgendaView'));
const FinalSprintView = lazy(() => import('./views/FinalSprintView'));
import { FINAL_SPRINT_FRONTS } from './constants/finalSprintFronts';
const ActivityHistoryView = lazy(() => import('./views/ActivityHistoryView'));
const SeasonHistoryView = lazy(() => import('./views/SeasonHistoryView'));
const PublicShowcaseAdminView = lazy(() => import('./views/PublicShowcaseAdminView'));
const GiroKnowledgeView = lazy(() => import('./views/GiroKnowledgeView'));
const PublicTeamView = lazy(() => import('./views/PublicTeamView'));
const PublicTvModeView = lazy(() => import('./views/PublicTvModeView'));
import { STATION_KEYS } from './constants/workspace';
import { DEFAULT_PROJECT_SUMMARY, PROJECT_MAIN_DOC_ID, resolveProjectSummary } from './utils/projectSummary';
import { buildTrainingGallery, DEFAULT_PUBLIC_SHOWCASE_SETTINGS, resolvePublicShowcaseSettings } from './utils/publicShowcase';
import { FINAL_SPRINT_REPORT_NOTE_MAX_LENGTH, PRESENTATION_EVALUATION_CRITERIA, PRESENTATION_EVALUATION_CRITERIA_VERSION, WEEKLY_EVALUATION_CRITERIA, getFinalSprintEvaluationWeek, getStudentTournamentSelection, parseFinalSprintReportScore } from './utils/finalSprintEvaluations';
import {
  SCHOOL_REPORT_STAGE_CONFIG,
  SCHOOL_REPORT_SUBJECTS,
  calculateSchoolReportXp,
  getSchoolGradeXp,
  getSchoolStageRecord,
  parseSchoolGrade
} from './utils/schoolReport';
import { 
  User, 
  Menu,
  SlidersHorizontal,
  LogOut, 
  Calendar, 
  CheckCircle, 
  X, 
  ChevronRight, 
  ChevronDown,
  ChevronLeft,
  Pause,
  Upload, 
  Bot, 
  Cpu, 
  Trophy, 
  Medal, 
  Briefcase, // <--- Ícone que faltava para o modal de especialista
  Star, 
  Shield, 
  Target, 
  BookOpen, 
  Award, 
  Smile, 
  Pencil, 
  Image as ImageIcon, 
  ListTodo, 
  Calculator, 
  Timer, // <--- Agora só tem um aqui!
  ThumbsUp, 
  AlertTriangle, 
  GraduationCap, 
  Gavel, 
  Search,
  Battery, 
  BatteryFull, 
  BatteryMedium, 
  BatteryLow, 
  BatteryWarning, 
  BatteryCharging,
  Wrench, 
  ThermometerSnowflake, 
  RotateCcw, 
  HeartHandshake, 
  BarChart, 
  Zap, 
  Crown,
  FileText,
  UserCircle,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  Rocket,
  Lightbulb,     
  Brain,          
  LayoutDashboard, 
  Settings,
  Microscope,  // <--- O Culpado de agora (Inovação)
  Gamepad2,    // <--- Provavelmente vai pedir em seguida (Robot Game)
  Megaphone,   // <--- Provavelmente vai pedir em seguida (Marketing/Social)
  Laptop,      // <--- Provavelmente vai pedir em seguida (Programação)
  Code,
  BarChart3,   // <--- O Culpado de agora
  PieChart,    // <--- Provavelmente vai pedir em seguida (Gráfico de Pizza)
  TrendingUp,  // <--- Provavelmente vai pedir em seguida (Tendência de alta)
  Flag,
  Tag,
  MailCheck,
  Ghost,
  MessageSquare, // <--- O Culpado de agora (Comentários)
  Share2,        // <--- Provavelmente usado para compartilhar estratégia
  Download,      // <--- Provavelmente usado para baixar PDF
  Plus,          // <--- Botão de "Nova Estratégia" (+)
  Trash2,        // <--- Botão de Lixeira (Apagar estratégia)
  Edit3,
  GitCommit,     // <--- O Culpado de agora
  GitBranch,     // <--- Provavelmente vai pedir em seguida (Versões/Ramos)
  GitPullRequest,// <--- Provavelmente vai pedir em seguida (Solicitação de Mudança)
  GitMerge,
  Users,       // <--- O Culpado de agora (Lista da Equipe)
  UserPlus,    // <--- Provavelmente vai pedir em seguida (Adicionar Aluno)
  UserCheck,   // <--- Provavelmente vai pedir em seguida (Presença/Status)
  UserX,       // <--- Provavelmente vai pedir em seguida (Remover Aluno)
  ClipboardList,
  AlertCircle,   // <--- O Culpado de agora (Erro/Aviso)
  Check,         // <--- Provavelmente vai pedir em seguida (Sucesso/Visto)
  Info,          // <--- Provavelmente vai pedir em seguida (Informação)
  HelpCircle,    // <--- Provavelmente vai pedir em seguida (Ajuda)
  XCircle,
  CheckSquare, // <--- O Culpado de agora (Checkbox marcado)
  Square,
  Loader2,
  Scale,         // <--- O Culpado de agora (Avaliação)
  Crop,          // <--- Ícone de Corte
  CheckCheck,    // <--- Provavelmente vai pedir em seguida (Aprovado Duplo)
  ExternalLink,  // <--- Provavelmente vai pedir em seguida (Abrir Arquivo em outra aba)
  FileWarning,
  Book,          // <--- Ícone do Diário
  Play,          // <--- NOVO: Ícone de Play para o Cronômetro
  Clock,         // <--- NOVO: Ícone de Relógio (Agenda)
  MapPin,        // <--- NOVO: Ícone de Localização (Agenda)
  MonitorPlay,   // <--- NOVO: Ícone do Modo TV
  Maximize,      // <--- NOVO: Expandir gráfico
  Minimize,      // <--- NOVO: Minimizar gráfico
  Sparkles,
  Globe2,
  History,
  Palette,
} from 'lucide-react';

const TeamOperationsView = lazy(() => import('./views/TeamOperationsView'));
const PitStopModal = lazy(() => import('./components/PitStopModal'));
const RankingPanel = lazy(() => import('./components/RankingPanel'));
const TeamCheckInModal = lazy(() => import('./components/TeamCheckInModal'));
const FullScheduleModal = lazy(() => import('./components/FullScheduleModal'));
const TvModePanel = lazy(() => import('./components/TvModePanel'));
const RubricViewPanel = lazy(() => import('./components/RubricView'));
const JudgePresentationView = lazy(() => import('./components/JudgePresentationView'));
const ChampionCommandCenter = lazy(() => import('./components/ChampionCommandCenter'));
const CompetitionPrepPanel = lazy(() => import('./components/CompetitionPrepPanel'));
const JudgeStoryPanel = lazy(() => import('./components/JudgeStoryPanel'));
const InnovationStrategyPanel = lazy(() => import('./components/InnovationStrategyPanel'));
const RobotDesignStrategyPanel = lazy(() => import('./components/RobotDesignStrategyPanel'));
const RobotRoundsPanel = lazy(() => import('./components/RobotRoundsPanel'));
const ConfettiBurst = lazy(() => import('react-confetti'));
const GearShopView = lazy(() => import('./views/GearShopView'));
const RotationOperationsPanel = lazy(() => import('./components/RotationOperationsPanel'));
const StudentManagementPanel = lazy(() => import('./components/RotationOperationsPanel').then((module) => ({ default: module.StudentManagementPanel })));
const FinalSprintEvaluationsView = lazy(() => import('./views/FinalSprintEvaluationsView'));
const readStoredTheme = () => {
  if (typeof window === 'undefined') return 'classic';
  return browserStorage.getItem('newgears_visual_theme') === 'gold' ? 'gold' : 'classic';
};

const LazyPanelFallback = ({ label = 'Carregando esta \u00e1rea...', minHeightClass = '' }) => <PanelSkeleton label={label} className={minHeightClass} />;

const LazyOverlayFallback = ({ label = 'Carregando modo...' }) => (
  <div className="fixed inset-0 z-[210] flex items-center justify-center bg-[#05060a]/96 px-6 text-center text-white backdrop-blur-sm">
    <div className="rounded-[30px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-400/20 bg-cyan-400/10">
        <Loader2 size={28} className="animate-spin text-cyan-300" />
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/70">Preparando ambiente</p>
      <p className="mt-2 text-sm text-slate-200/80">{label}</p>
    </div>
  </div>
);


// --- CONFIGURAÇÃO DE NÍVEIS ---

const LEVELS = [

    { name: "Novato", min: 0, max: 999, color: "text-gray-400" },

    { name: "Aprendiz", min: 1000, max: 2499, color: "text-blue-400" },

    { name: "Veterano", min: 2500, max: 4999, color: "text-purple-400" },

    { name: "Mestre FLL", min: 5000, max: 50000, color: "text-yellow-400" }

];
// --- LISTA DE TÉCNICOS (ADMINISTRADORES) ---
const ADMIN_USERS = [
  { user: "Guilherme", pass: "dti2@15!!" },
  { user: "Felipe", pass: "dti2@15!!" },
  { user: "admin", pass: "admin123" }
];

const DEFAULT_INNOVATION_RUBRIC = {
  identificacao: 1,
  design: 1,
  criacao: 1,
  iteracao: 1,
  comunicacao: 1
};

const DEFAULT_ROBOT_DESIGN_RUBRIC = {
  identificacao: 1,
  design: 1,
  criacao: 1,
  iteracao: 1,
  comunicacao: 1
};

const normalizeRubricValues = (data, defaults) => ({
  ...defaults,
  ...Object.fromEntries(
    Object.keys(defaults).map((key) => [key, parseInt(data?.[key] ?? defaults[key], 10)])
  )
});

const ADMIN_PANEL_DEFAULTS = {
  hero: false,
  compact: false,
  dashboard: false,
  prep: true,
  judge: true,
  stats: true,
  achievements: true
};

const STUDENT_PANEL_DEFAULTS = {
  hero: true,
  dashboard: false,
  prep: true,
  judge: true,
  stats: true,
  achievements: true
};

const EVENT_TYPE_OPTIONS = [
  { value: 'Visita', label: 'Visita Tecnica' },
  { value: 'Especialista', label: 'Mentoria / Especialista' },
  { value: 'Reunião', label: 'Reuniao Extra' },
  { value: 'Treino', label: 'Treino' },
  { value: 'Prazo', label: 'Prazo / Entrega' },
  { value: 'Competição', label: 'Competicao' },
  { value: 'Outro', label: 'Outro' }
];

const EVENT_PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Rotina' },
  { value: 'alta', label: 'Alta prioridade' },
  { value: 'critica', label: 'Critica' }
];

const EVENT_STATUS_OPTIONS = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'concluido', label: 'Concluido' }
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const STUDENT_TASKS_LABEL = 'Tarefas';
const STUDENT_TASKS_OPEN_LABEL = 'Abrir Tarefas';
const STUDENT_TASKS_SHORT_LABEL = 'Minhas Tarefas';
const STUDENT_TASKS_VIEW_LABEL = 'Ver Tarefas';

const readStoredPrefs = (storageKey, defaults) => {
  if (typeof window === 'undefined') return defaults;

  try {
    const raw = browserStorage.getItem(storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
};

const readStoredUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = browserStorage.getItem("roboquest_user");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? legacySessionIdentity(parsed) : null;
  } catch {
    return null;
  }
};

const normalizeLooseToken = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const BADGE_TOKEN_ALIASES = {
  pitstop: 'pitstop',
  pit_stop: 'pitstop',
  pit_stop_f1: 'pitstop',
  engineer: 'engineer',
  engenheiro: 'engineer',
  engenheiro_minimalista: 'engineer',
  ice_blood: 'ice_blood',
  sangue_frio: 'ice_blood',
  repetition: 'repetition',
  repeticao: 'repetition',
  rei_da_repeticao: 'repetition',
  helper: 'helper',
  ajuda: 'helper',
  braco_direito: 'helper',
  data_keeper: 'data_keeper',
  dados: 'data_keeper',
  guardiao_dos_dados: 'data_keeper',
  legend: 'legend',
  lenda: 'legend',
  lenda_do_xp: 'legend',
  ambassador: 'ambassador',
  embaixador: 'ambassador',
  mission_captain: 'mission_captain',
  capitao_das_missoes: 'mission_captain',
  robot_driver: 'robot_driver',
  piloto_do_robo: 'robot_driver',
  code_debugger: 'code_debugger',
  cacador_de_bugs: 'code_debugger',
  innovation_scout: 'innovation_scout',
  explorador_de_inovacao: 'innovation_scout',
  core_values: 'core_values',
  valores_fll: 'core_values',
  pit_presenter: 'pit_presenter',
  voz_dos_juizes: 'pit_presenter',
  logbook_keeper: 'logbook_keeper',
  guardiao_do_diario: 'logbook_keeper',
  strategy_builder: 'strategy_builder',
  arquiteto_da_estrategia: 'strategy_builder',
  robot_design_lead: 'robot_design_lead',
  designer_do_robo: 'robot_design_lead',
  mission_pathfinder: 'mission_pathfinder',
  mapa_das_missoes: 'mission_pathfinder',
  table_strategy: 'table_strategy',
  estrategista_de_mesa: 'table_strategy',
  reliability_tester: 'reliability_tester',
  teste_10x: 'reliability_tester',
  round_programmer: 'round_programmer',
  programador_de_round: 'round_programmer',
  autonomous_coder: 'round_programmer',
  autonomo_preciso: 'round_programmer',
  pit_mechanic: 'pit_mechanic',
  mecanico_de_pit: 'pit_mechanic',
  sensor_calibrator: 'pit_mechanic',
  calibrador_de_sensores: 'pit_mechanic',
  quick_prototyper: 'quick_prototyper',
  prototipador_rapido: 'quick_prototyper',
  team_spirit: 'team_spirit',
  espirito_de_equipe: 'team_spirit',
  coopertition_guardian: 'team_spirit',
  guardiao_da_coopertition: 'team_spirit',
  gracious_professional: 'gracious_professional',
  profissional_gentil: 'gracious_professional',
  discovery_spark: 'discovery_spark',
  descoberta_fll: 'discovery_spark',
  inclusion_builder: 'inclusion_builder',
  inclusao_em_acao: 'inclusion_builder',
  impact_maker: 'impact_maker',
  impacto_real: 'impact_maker',
  feedback_hunter: 'feedback_hunter',
  cacador_de_feedback: 'feedback_hunter',
  innovation_validator: 'innovation_validator',
  validador_de_solucao: 'innovation_validator',
  judge_room_ready: 'judge_room_ready',
  sala_dos_juizes_ready: 'judge_room_ready',
  tournament_scout: 'tournament_scout',
  scout_de_torneio: 'tournament_scout',
  bioglow_explorer: 'bioglow_explorer',
  explorador_bioglow: 'bioglow_explorer',
  rulebook_reader: 'rulebook_reader',
  leitor_do_livro_de_regras: 'rulebook_reader',
  mission_model_master: 'mission_model_master',
  mestre_dos_modelos: 'mission_model_master',
  sensor_surgeon: 'sensor_surgeon',
  cirurgiao_de_sensores: 'sensor_surgeon',
  round_analyst: 'round_analyst',
  analista_de_rounds: 'round_analyst',
  design_iterator: 'design_iterator',
  iterador_fll: 'design_iterator',
  launch_captain: 'launch_captain',
  capitao_de_lancamento: 'launch_captain',
  rookie_mentor: 'rookie_mentor',
  mentor_dos_novatos: 'rookie_mentor',
  pit_anchor: 'pit_anchor',
  ancora_do_pit: 'pit_anchor',
  field_reset_master: 'field_reset_master',
  mestre_do_reset: 'field_reset_master',
  pressure_driver: 'pressure_driver',
  piloto_de_pressao: 'pressure_driver',
  badge_beggar: 'badge_beggar',
  badge_do_mendigo: 'badge_beggar',
  mendigo_de_badge: 'badge_beggar',
  laugh_only: 'laugh_only',
  so_risada: 'laugh_only',
  professional_laughter: 'laugh_only',
  risada_profissional: 'laugh_only',
  premium_laziness: 'premium_laziness',
  preguica_premium: 'premium_laziness',
  little_work_fc: 'little_work_fc',
  pouco_trabalho_fc: 'little_work_fc',
  chair_referee: 'chair_referee',
  fiscal_de_cadeira: 'chair_referee',
  disappeared_at_crunch_time: 'disappeared_at_crunch_time',
  sumiu_na_hora_h: 'disappeared_at_crunch_time',
  audience_coach: 'audience_coach',
  coach_da_arquibancada: 'audience_coach',
  maybe_master: 'maybe_master',
  mestre_do_talvez: 'maybe_master',
  battery_two_percent: 'battery_two_percent',
  bateria_dois_por_cento: 'battery_two_percent',
  decorative_presence: 'decorative_presence',
  presenca_decorativa: 'decorative_presence',
  secretary: 'secretary',
  secretario: 'secretary',
  secretaria: 'secretary',
  ghost: 'ghost',
  fantasma: 'ghost',
  fantamas: 'ghost',
};

const normalizeBadgeToken = (value) => {
  const token = normalizeLooseToken(value);
  if (!token) return '';
  return BADGE_TOKEN_ALIASES[token] || token;
};

const normalizeStudentBadges = (badges) => {
  const unique = (items) => [...new Set(items.map(normalizeBadgeToken).filter(Boolean))];

  if (Array.isArray(badges)) return unique(badges);
  if (typeof badges === 'string') {
    const looseToken = normalizeLooseToken(badges);
    const separatorParts = badges.split(/[,;|]+/).map((item) => item.trim()).filter(Boolean);

    if (BADGE_TOKEN_ALIASES[looseToken]) return unique([badges]);
    if (separatorParts.length > 1) return unique(separatorParts.flatMap((item) => normalizeStudentBadges(item)));

    return unique(badges.split(/\s+/));
  }
  if (!badges || typeof badges !== 'object') return [];

  const mappedBadges = Object.entries(badges).flatMap(([key, value]) => {
    const keyId = normalizeBadgeToken(key);

    if (value === true) return keyId ? [keyId] : [];
    if (typeof value === 'string' || Array.isArray(value)) return normalizeStudentBadges(value);

    if (value && typeof value === 'object') {
      const explicitId = normalizeBadgeToken(value.id);
      const explicitEnabled = value.unlocked ?? value.active ?? value.awarded ?? value.enabled ?? true;

      if (explicitId && explicitEnabled) return [explicitId];
      if (keyId && (value.unlocked === true || value.active === true || value.awarded === true || value.enabled === true)) return [keyId];
    }

    return [];
  });

  return unique(mappedBadges);
};

const normalizeStudentRecord = (student) => {
  if (!student || typeof student !== 'object') return student;
  return {
    ...student,
    name: typeof student.name === 'string' && student.name.trim() ? student.name : 'Integrante sem nome',
    station: typeof student.station === 'string' ? student.station : '',
    xp: Number.isFinite(Number(student.xp)) ? Number(student.xp) : 0,
    joinedAt: recordDay(student.joinedAt),
    badges: normalizeStudentBadges(student.badges),
    xpLossNotifications: normalizeXpLossNotifications(student.xpLossNotifications),
  };
};

const normalizeXpLossNotifications = (notifications) => {
  if (!Array.isArray(notifications)) return [];

  return notifications
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => ({
      id: item.id || `${item.date || 'xp'}-${item.amount || 0}-${index}`,
      amount: Number(item.amount) || 0,
      reason: typeof item.reason === 'string' ? item.reason : '',
      date: item.date || '',
      createdAt: item.createdAt || null,
    }))
    .filter((item) => item.amount < 0);
};

const formatXpLossDate = (dateValue) => {
  if (!dateValue) return 'Data nao registrada';

  const date = dateValue instanceof Date
    ? dateValue
    : typeof dateValue.toDate === 'function'
      ? dateValue.toDate()
      : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatShortDateLabel = (dateValue) => {
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split('-');
    return `${day}/${month}/${year}`;
  }

  return formatXpLossDate(dateValue);
};

const XP_LOSS_ALERT_REPEAT_MS = 5 * 60 * 1000;
const XP_LOSS_DELETE_WAIT_DAYS = 5;
const BADGE_XP_BONUS = 100;
const getBadgeXpBonus = (badge) => Number.isFinite(badge?.xpBonus) ? badge.xpBonus : BADGE_XP_BONUS;
const LEADER_PENALTY_XP = -5;
const XP_SOURCE_LABELS = {
  badge: 'Badge',
  manual_reward: 'Recompensa manual',
  penalty: 'Penalidade',
  correction: 'Correcao',
  activity: 'Atividade aprovada',
  english_challenge: 'Desafio de ingles',
  check_in: 'Check-in',
  compliment: 'Elogio',
  school_report: 'Notas escolares',
  station_week: 'Fechamento de semana',
  undo: 'Desfazer',
};
const WEEKLY_STATION_KEYS = [STATION_KEYS.ENGINEERING, STATION_KEYS.INNOVATION, STATION_KEYS.MANAGEMENT];
const getXpSourceLabel = (source) => XP_SOURCE_LABELS[source] || 'Manual';

const getXpLossDate = (dateValue) => {
  if (!dateValue) return null;

  const date = dateValue instanceof Date
    ? dateValue
    : typeof dateValue.toDate === 'function'
      ? dateValue.toDate()
      : new Date(dateValue);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getXpLossMood = (amount) => {
  const xpLost = Math.abs(Number(amount) || 0);
  if (xpLost <= 5) return { emoji: '😬', label: 'Leve', tone: 'border-yellow-400/25 bg-yellow-400/10 text-yellow-100', bar: 'from-yellow-300 to-amber-400' };
  if (xpLost <= 10) return { emoji: '😕', label: 'Atencao', tone: 'border-orange-400/25 bg-orange-400/10 text-orange-100', bar: 'from-orange-300 to-orange-500' };
  if (xpLost <= 20) return { emoji: '😟', label: 'Cuidado', tone: 'border-red-300/25 bg-red-400/10 text-red-100', bar: 'from-red-300 to-red-500' };
  if (xpLost <= 35) return { emoji: '😰', label: 'Impacto alto', tone: 'border-rose-300/25 bg-rose-500/10 text-rose-100', bar: 'from-rose-300 to-fuchsia-500' };
  return { emoji: '😱', label: 'Perda critica', tone: 'border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100', bar: 'from-fuchsia-300 to-red-500' };
};

const getXpLossDeleteState = (notice, now = new Date()) => {
  const lossDate = getXpLossDate(notice?.date);
  if (!lossDate) return { canDelete: false, label: 'Aguarde 5 dias para apagar' };

  const unlockDate = new Date(lossDate);
  unlockDate.setDate(unlockDate.getDate() + XP_LOSS_DELETE_WAIT_DAYS);

  if (now >= unlockDate) return { canDelete: true, label: 'Pode apagar' };

  const remainingDays = Math.max(1, Math.ceil((unlockDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  return { canDelete: false, label: `Libera em ${remainingDays} dia(s)` };
};


const getNoticeTime = (notice) => {
  const date = getXpLossDate(notice?.date || notice?.createdAt);
  return date ? date.getTime() : 0;
};

const getPenaltyRequestTime = (request) => {
  const date = getXpLossDate(request?.requestedAt || request?.reviewedAt || request?.createdAt);
  return date ? date.getTime() : 0;
};

const isNoticeInsideRange = (notice, startDate, endDate) => {
  const noticeDate = getXpLossDate(notice?.date || notice?.createdAt);
  if (!noticeDate || !startDate || !endDate) return false;
  return noticeDate >= startDate && noticeDate <= endDate;
};

const buildTeamXpLossEvents = (students = [], records = []) => {
  const events = [];
  const seen = new Set();

  const addEvent = (event, key) => {
    if (!event || event.amount >= 0 || !key || seen.has(key)) return;
    seen.add(key);
    events.push(event);
  };

  records.forEach((record) => {
    const amount = Number(record?.amount) || 0;
    addEvent({
      id: record.id,
      noticeId: record.noticeId || record.id,
      studentId: record.studentId || '',
      studentName: record.studentName || 'Aluno',
      amount,
      reason: record.reason || '',
      date: record.date || record.createdAt || '',
      createdAt: record.createdAt || record.date || '',
    }, record.noticeId || record.id);
  });

  students.forEach((student) => {
    normalizeXpLossNotifications(student?.xpLossNotifications).forEach((notice) => {
      addEvent({
        ...notice,
        studentId: student.id,
        studentName: student.name,
      }, notice.id);
    });
  });

  return events.sort((left, right) => getNoticeTime(right) - getNoticeTime(left));
};

const getStationKanbanTag = (station) => {
  if (station === STATION_KEYS.ENGINEERING) return 'engenharia';
  if (station === STATION_KEYS.INNOVATION) return 'inovacao';
  if (station === STATION_KEYS.MANAGEMENT) return 'gestao';
  return 'geral';
};

const hasStudentBadge = (student, badgeId) => normalizeStudentBadges(student?.badges).includes(badgeId);

const getStoredStudentSnapshot = (user) => {
  if (!user || user.type !== 'student') return null;

  if (user.data && typeof user.data === 'object') return normalizeStudentRecord(user.data);
  if (user.student && typeof user.student === 'object') return normalizeStudentRecord(user.student);

  return null;
};

const normalizeLookupValue = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
};

const STUDENT_NAME_LOOKUP_ALIASES = {
  benjamin: 'benjamim',
};

const normalizeStudentNameLookupValue = (value) => {
  const normalized = normalizeLookupValue(value).replace(/\s+/g, ' ');
  return normalized
    .split(' ')
    .map((part) => STUDENT_NAME_LOOKUP_ALIASES[part] || part)
    .join(' ');
};

const studentNamesMatch = (left, right) => {
  const normalizedLeft = normalizeStudentNameLookupValue(left);
  const normalizedRight = normalizeStudentNameLookupValue(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
};

const resolveStudentFromStoredUser = (user, students) => {
  if (!user || user.type !== 'student' || !Array.isArray(students) || students.length === 0) {
    return null;
  }

  const snapshot = getStoredStudentSnapshot(user);
  const studentId = snapshot?.id || user.studentId || user.id || null;

  if (studentId) {
    const matchById = students.find((student) => student.id === studentId);
    if (matchById) return matchById;
  }

  const username = normalizeLookupValue(snapshot?.username || user.username);
  if (username) {
    const matchByUsername = students.find((student) => normalizeLookupValue(student.username) === username);
    if (matchByUsername) return matchByUsername;
  }

  const studentName = normalizeStudentNameLookupValue(snapshot?.name || user.name);
  if (studentName) {
    const matchByName = students.find((student) => normalizeStudentNameLookupValue(student.name) === studentName);
    if (matchByName) return matchByName;
  }

  return null;
};

const persistStoredUser = (user) => {
  if (typeof window === 'undefined') return;

  try {
    if (!user) {
      browserStorage.removeItem("roboquest_user");
      return;
    }

    browserStorage.setItem("roboquest_user", JSON.stringify(legacySessionIdentity(user)));
  } catch {
    // Ignore storage errors so the interface keeps working.
  }
};

const getNetworkConnection = () => {
  if (typeof navigator === 'undefined') return null;
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

const detectLiteMode = () => {
  if (typeof window === 'undefined') return false;

  const connection = getNetworkConnection();
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const saveDataEnabled = Boolean(connection?.saveData);
  const slowConnection = ['slow-2g', '2g', '3g'].includes(connection?.effectiveType || '');
  const lowMemoryDevice = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const lowCpuDevice = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;

  return prefersReducedMotion || saveDataEnabled || slowConnection || lowMemoryDevice || lowCpuDevice;
};

const getNextOrSameWeekday = (dateObj, weekday) => {
  const result = new Date(dateObj);
  const diff = (weekday - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + diff);
  return result;
};

const Header = ({ title, userType, onLogout }) => (
  <>
    <div className="flex justify-between items-center my-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${userType === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {userType.toUpperCase()}
        </span>
      </div>
      <button onClick={onLogout} className="bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
        <LogOut size={16}/> Sair
      </button>
    </div>
  </>
);

const formatSchoolXpChange = (xp) => (xp > 0 ? `+${xp}` : `${xp}`);

const buildSchoolGradeDraft = (stageRecord) => Object.fromEntries(
  SCHOOL_REPORT_SUBJECTS.map((subj) => [subj, stageRecord?.grades?.[subj] ?? ''])
);

const getSchoolGradeBadgeTone = (rawValue, gradeXp) => {
  const hasValue = `${rawValue ?? ''}`.trim() !== '';

  if (!hasValue) return 'border-white/10 bg-white/5 text-gray-500';
  if (gradeXp === null) return 'border-red-500/20 bg-red-500/10 text-red-300';
  if (gradeXp < 0) return 'border-red-500/20 bg-red-500/10 text-red-300';
  if (gradeXp >= 10) return 'border-green-500/20 bg-green-500/10 text-green-300';
  if (gradeXp >= 7) return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300';

  return 'border-purple-500/20 bg-purple-500/10 text-purple-300';
};

const SchoolGradesForm = ({ data, onSubmit }) => {
  const stageId = data.stageId || 'etapa1';
  const stageMeta = SCHOOL_REPORT_STAGE_CONFIG[stageId] || SCHOOL_REPORT_STAGE_CONFIG.etapa1;
  const stageRecord = getSchoolStageRecord(data.student, stageId);
  const stageHasGrades = Boolean(stageRecord?.grades && Object.keys(stageRecord.grades).length > 0);
  const previousStageXp = stageRecord?.xpApplied ?? calculateSchoolReportXp(stageRecord?.grades || {});
  const [gradeDraft, setGradeDraft] = useState(() => buildSchoolGradeDraft(stageRecord));

  const parsedGrades = useMemo(() => {
    const nextGrades = {};

    SCHOOL_REPORT_SUBJECTS.forEach((subj) => {
      const rawValue = `${gradeDraft[subj] ?? ''}`.trim();
      const grade = parseSchoolGrade(rawValue);

      if (rawValue && grade !== null) {
        nextGrades[subj] = grade;
      }
    });

    return nextGrades;
  }, [gradeDraft]);

  const invalidSubjects = useMemo(() => SCHOOL_REPORT_SUBJECTS.filter((subj) => {
    const rawValue = `${gradeDraft[subj] ?? ''}`.trim();
    return rawValue && parseSchoolGrade(rawValue) === null;
  }), [gradeDraft]);

  const stageXp = calculateSchoolReportXp(parsedGrades);
  const xpDelta = stageXp - previousStageXp;

  const handleGradeChange = (subj, value) => {
    setGradeDraft((prev) => ({ ...prev, [subj]: value }));
  };

  return (
    <form onSubmit={onSubmit}>
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white"><GraduationCap className="text-yellow-500"/> Boletim SESI - {stageMeta.label}</h3>
      <p className="text-xs text-gray-400 mb-4">Insira as notas do aluno(a) <strong className="text-white">{data.student.name}</strong> para a <strong className="text-yellow-300">{stageMeta.label}</strong>.</p>

      <div className={`mb-4 rounded-xl border p-3 text-xs ${stageHasGrades ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100'}`}>
        <p className="font-bold uppercase tracking-[0.16em]">{stageMeta.periodLabel}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-white/80">
          {stageHasGrades
            ? 'Esta etapa ja foi lancada. Se voce corrigir alguma nota, o sistema recalcula so a diferenca de XP.'
            : 'As notas desta etapa ficam separadas da outra para evitar lancamento duplicado.'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100/70">XP da etapa</p>
          <p className="mt-1 text-2xl font-black text-yellow-200">{stageXp}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Ja aplicado</p>
          <p className="mt-1 text-2xl font-black text-white">{previousStageXp}</p>
        </div>
        <div className={`rounded-xl border p-3 ${xpDelta < 0 ? 'border-red-500/20 bg-red-500/10' : 'border-emerald-500/20 bg-emerald-500/10'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${xpDelta < 0 ? 'text-red-100/70' : 'text-emerald-100/70'}`}>Vai entrar agora</p>
          <p className={`mt-1 text-2xl font-black ${xpDelta < 0 ? 'text-red-200' : 'text-emerald-200'}`}>{formatSchoolXpChange(xpDelta)}</p>
        </div>
      </div>

      <div className="bg-black/50 border border-white/20 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {SCHOOL_REPORT_SUBJECTS.map((subj) => {
            const rawValue = gradeDraft[subj] ?? '';
            const gradeXp = getSchoolGradeXp(rawValue);
            const hasValue = `${rawValue}`.trim() !== '';
            const badgeLabel = !hasValue
              ? '--'
              : gradeXp === null
                ? 'invalida'
                : `${formatSchoolXpChange(gradeXp)} XP`;

            return (
              <div key={subj} className="flex min-w-0 flex-col">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="min-w-0 truncate text-[10px] text-gray-400 uppercase font-bold" title={subj}>{subj}</label>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${getSchoolGradeBadgeTone(rawValue, gradeXp)}`}>
                    {badgeLabel}
                  </span>
                </div>
                <input
                  name={`grade_${subj}`}
                  type="text"
                  inputMode="decimal"
                  pattern="^(10([,.]0+)?|[0-9]([,.][0-9]+)?)$"
                  value={rawValue}
                  onChange={(event) => handleGradeChange(subj, event.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:border-yellow-500 outline-none font-mono text-sm"
                  placeholder="0,0"
                  title="Use valores de 0 a 10. Ex: 8,5"
                  autoComplete="off"
                />
              </div>
            );
          })}
        </div>
        {invalidSubjects.length > 0 && (
          <p className="mt-3 text-[11px] font-bold text-red-300">
            Confira: {invalidSubjects.join(', ')} deve usar valor de 0 a 10, com ponto ou virgula.
          </p>
        )}
      </div>

      <div className="bg-white/5 p-4 rounded-xl text-xs text-gray-400 mb-6">
        <p className="font-bold text-white mb-2">Bonus de XP por Materia:</p>
        <div className="grid grid-cols-2 gap-2">
          <p>Nota 10 = <span className="text-green-500 font-bold">+10 XP</span></p>
          <p>Nota 9.0 a 9.9 = <span className="text-cyan-500 font-bold">+7 XP</span></p>
          <p>Nota 8.0 a 8.9 = <span className="text-purple-500 font-bold">+5 XP</span></p>
          <p>Nota 7.9 ou menos = <span className="text-red-400 font-bold">-2 XP</span></p>
        </div>
      </div>
      <button
        disabled={invalidSubjects.length > 0}
        className={`w-full font-bold py-3 rounded-lg shadow-lg shadow-yellow-900/20 ${invalidSubjects.length > 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-500 text-black'}`}
      >
        Salvar {stageMeta.label}
      </button>
    </form>
  );
};

const getLogbookEntryDate = (entry) => {
      return recordDate(entry?.date) || new Date(0);
  };
const sortLogbookEntries = (entries) => [...entries].sort((left, right) => getLogbookEntryDate(right) - getLogbookEntryDate(left));
const getLogbookStudentId = (entry) => {
      if (!entry?.refPath) return null;
      const pathParts = entry.refPath.split('/');
      return pathParts.length > 1 ? pathParts[1] : null;
  };
const buildLocalDate = (year, monthIndex, day, hour = 12, minute = 0, second = 0, millisecond = 0) =>
      new Date(year, monthIndex, day, hour, minute, second, millisecond);
const parseLocalDateValue = (dateString, endOfDay = false) => {
      const normalizedDay = recordDay(dateString);
      if (!normalizedDay) return null;

      const [year, month, day] = normalizedDay.split('-').map(Number);
      if (!year || !month || !day) return null;

      return buildLocalDate(
        year,
        month - 1,
        day,
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 999 : 0
      );
  };
const getCurrentLevel = (xp) => studentLevel(xp, LEVELS);

function App() {
  const workspaceNow = useWorkspaceClock();
  const moodDate = gearDay(new Date(workspaceNow));
  // === TODOS OS ESTADOS (HOOKS) ===
  const [currentUser, setCurrentUser] = useState(() => FIREBASE_AUTH_ENABLED ? null : readStoredUser());
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(FIREBASE_AUTH_ENABLED);
  const reportsWorkspace = useWeeklyReports(currentUser);

  const [isAdmin, setIsAdmin] = useState(() => !FIREBASE_AUTH_ENABLED && readStoredUser()?.type === 'admin');

  const [viewAsStudent, setViewAsStudent] = useState(() => FIREBASE_AUTH_ENABLED ? null : getStoredStudentSnapshot(readStoredUser()));

  useEffect(() => {
    if (!FIREBASE_AUTH_ENABLED) return undefined;
    let generation = 0;
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (account) => {
      const attempt = ++generation;
      setCurrentUser(null); setIsAdmin(false); setViewAsStudent(null);
      if (!account) { setLoginBusy(false); return; }
      setLoginBusy(true);
      try {
        const { user } = await loadReportsSession();
        if (!mounted || attempt !== generation || auth.currentUser?.uid !== user.uid) return;
        const student = user.role === 'student' ? { id: user.studentId, name: user.name, email: user.email } : null;
        const session = { type: user.role, uid: user.uid, name: user.name, email: user.email, studentId: user.studentId, ...(student ? { data: student } : {}) };
        setCurrentUser(session); setIsAdmin(user.role === 'admin'); setViewAsStudent(student);
        browserStorage.setItem('roboquest_user', JSON.stringify(legacySessionIdentity(session)));
        setLoginError('');
      } catch (error) {
        if (!mounted || attempt !== generation) return;
        setLoginError(error.message || 'Não foi possível validar sua conta.');
        await signOut(auth).catch(() => {});
      } finally {
        if (mounted && attempt === generation) setLoginBusy(false);
      }
    }, () => {
      if (!mounted) return;
      setCurrentUser(null); setIsAdmin(false); setViewAsStudent(null);
      setLoginError('Não foi possível restaurar a sessão. Confira a conexão e entre novamente.');
      setLoginBusy(false);
    });
    return () => { mounted = false; generation += 1; unsubscribe(); };
  }, []);

  const [logoutCountdown, setLogoutCountdown] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [taskComposerRequest, setTaskComposerRequest] = useState(0);
  const completeTaskComposerRequest = useCallback(() => setTaskComposerRequest(0), []);
  const closeWorkspaceMenu = useCallback(() => setWorkspaceMenuOpen(false), []);
  const [badgeStudent, setBadgeStudent] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(() => detectLiteMode());
  const [visualTheme, setVisualTheme] = useState(() => readStoredTheme());
  const prevXpRef = useRef(null);
  const confettiTimeoutRef = useRef(null);
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [teamMoodSnapshot, setTeamMoods] = useState({});

  const [adminPanelState, setAdminPanelState] = useState(() => readStoredPrefs('newgears_admin_panel_prefs_v2', ADMIN_PANEL_DEFAULTS));
  const [studentPanelState, setStudentPanelState] = useState(() => readStoredPrefs('newgears_student_panel_prefs_v2', STUDENT_PANEL_DEFAULTS));
  const [studentMissionMode, setStudentMissionMode] = useState(() => {
    if (typeof window === 'undefined') return 'compact';
    return browserStorage.getItem('newgears_student_mission_mode') || 'compact';
  });
  const getStandaloneView = () => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('view') || '';
  };
  const [isPublicMode, setIsPublicMode] = useState(() => getStandaloneView() === 'public');
  const [focusedReportId, setFocusedReportId] = useState(() => new URLSearchParams(window.location.search).get('report') || '');
  const [adminTab, setAdminTabValue] = useState(() => new URLSearchParams(window.location.search).has('report') ? 'weekly_reports' : 'overview');
  const [workspaceSeason, setWorkspaceSeason] = useState(() => browserStorage.getItem('newgears_workspace_season') === 'rotation' ? 'rotation' : 'final');
  const [isSavingWorkspaceSeason, setIsSavingWorkspaceSeason] = useState(false);
  const [activeTeamSeasonId, setActiveTeamSeasonId] = useState(() => browserStorage.getItem('newgears_active_season_id') || null);
  const [activeTeamSeasonName, setActiveTeamSeasonName] = useState(() => browserStorage.getItem('newgears_active_season_name') || 'Temporada atual');
  const [seasonLifecycleReady, setSeasonLifecycleReady] = useState(() => Boolean(browserStorage.getItem('newgears_active_season_id')));
  const [workspaceSeasonLoaded, setWorkspaceSeasonLoaded] = useState(false);
  const [seasonRecords, setTeamSeasons] = useState([]);
  const teamSeasons = currentUser?.type === 'admin' && isAdmin ? seasonRecords : [];
  const [isTransitioningSeason, setIsTransitioningSeason] = useState(false);
  const [seasonTransitionLock, setSeasonTransitionLock] = useState(null);
  const [studentTab, setStudentTabValue] = useState(() => new URLSearchParams(window.location.search).has('report') ? 'weekly_reports' : 'overview');
  const setAdminTab = useCallback((next) => {
    if (next !== adminTab) setAdminPanelState((previous) => previous.dashboard ? { ...previous, dashboard: false } : previous);
    setAdminTabValue(next);
  }, [adminTab]);
  const setStudentTab = useCallback((next) => {
    if (next !== studentTab) setStudentPanelState((previous) => previous.dashboard ? { ...previous, dashboard: false } : previous);
    setStudentTabValue(next);
  }, [studentTab]);
  const openWeeklyReports = (reportId = '') => {
    setFocusedReportId(reportId);
    setAdminTab('weekly_reports'); setStudentTab('weekly_reports');
    const url = new URL(window.location.href);
    if (reportId) url.searchParams.set('report', reportId); else url.searchParams.delete('report');
    window.history.replaceState({}, '', url);
  };
  const [isTvMode, setIsTvMode] = useState(() => getStandaloneView() === 'tv');
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [isCommandCenterMode, setIsCommandCenterMode] = useState(false);
  const [strategySubTab, setStrategySubTab] = useState('innovation');
  const [robotSubTab, setRobotSubTab] = useState('overview');
  const [missionsList, setMissionsList] = useState([]);
  const [decisionMatrix, setDecisionMatrix] = useState([]);
  const [prototypeIterations, setPrototypeIterations] = useState([]);
  const [allStudents, setStudents] = useState([]);
  const students = useMemo(() => allStudents.filter(isActiveStudent), [allStudents]);
  const teamMoods = useMemo(() => teamMoodSnapshot.date === moodDate ? (teamMoodSnapshot.rows || []).filter((mood) => (!seasonLifecycleReady || !mood.seasonId || mood.seasonId === activeTeamSeasonId) && students.some((student) => student.id === mood.studentId)) : [], [teamMoodSnapshot, moodDate, seasonLifecycleReady, activeTeamSeasonId, students]);

  const [planningConfig, setPlanningConfig] = useState(null);
  const effectivePlanning = useMemo(() => resolvePlanningConfig(planningConfig, students, !activeTeamSeasonId), [planningConfig, students, activeTeamSeasonId]);
  const rotationSchedule = useMemo(() => buildRotationSchedule(students, effectivePlanning), [students, effectivePlanning]);
  const currentWeekData = useMemo(() => {
    const now = new Date(workspaceNow);
    return rotationSchedule.find((week) => now >= parseLocalDateValue(week.startDate) && now <= parseLocalDateValue(week.endDate, true))
      || rotationSchedule.find((week) => parseLocalDateValue(week.startDate) > now) || rotationSchedule.at(-1) || null;
  }, [rotationSchedule, workspaceNow]);
  const [rotationApplications, setRotationApplications] = useState([]);
  const [isProcessingRotation, setIsProcessingRotation] = useState(false);
  const [isSavingPlanning, setIsSavingPlanning] = useState(false);
  const [tasks, setTasks] = useState([]);


  const [finalSprintAssignmentsRetry, setFinalSprintAssignmentsRetry] = useState(0);
  const evaluationWorkspace = useSeasonEvaluations({ db, user: currentUser, technical: currentUser?.type === 'admin' && isAdmin, studentId: viewAsStudent?.id, seasonId: activeTeamSeasonId, ready: workspaceSeasonLoaded });
  const finalSprintEvaluations = evaluationWorkspace.records;

  const [selectionRetry, setSelectionRetry] = useState(0);

  const assignmentWorkspace = useTeamRecords({ db, user: currentUser, studentId: viewAsStudent?.id, technical: isAdmin, seasonId: seasonLifecycleReady ? activeTeamSeasonId : null,
    enabled: isAdmin ? adminTab === 'sprint' : studentTab === 'sprint', attempt: finalSprintAssignmentsRetry, collectionName: 'finalSprintAssignments' });
  const finalSprintAssignments = assignmentWorkspace.records;
  const finalSprintAssignmentsState = assignmentWorkspace;
  const selectionWorkspace = useTeamRecords({ db, user: currentUser, studentId: viewAsStudent?.id, technical: isAdmin, seasonId: seasonLifecycleReady ? activeTeamSeasonId : null,
    enabled: workspaceSeasonLoaded, attempt: selectionRetry, collectionName: 'finalSprintSelectionScores' });
  const finalSprintSelections = selectionWorkspace.records;
  const selectionReadError = selectionWorkspace.error;
  const [tournamentDraftState, setTournamentDraftState] = useState({ seasonId: '', loading: true, error: false, record: null });
  const tournamentDraftReady = selectionWorkspace.ready && tournamentDraftState.seasonId === (activeTeamSeasonId || 'legacy') && !tournamentDraftState.loading && !tournamentDraftState.error;
  const ownTournamentSelection = getStudentTournamentSelection({ user: currentUser, studentId: viewAsStudent?.id, selections: finalSprintSelections, seasonId: activeTeamSeasonId || 'legacy' });
  const [logbookEntries, setLogbookEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [adminProfile, setAdminProfile] = useState({ name: 'Tecnico', avatarImage: null, specialty: '' });
  const [isCropping, setIsCropping] = useState(false);
  const [cropImgSrc, setCropImgSrc] = useState(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [experts, setExperts] = useState([]);
  const [expertContacts, setExpertContacts] = useState([]);
  const [robotVersions, setRobotVersions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [attendanceSessions, setAttendanceSessions] = useState([]);
  const [xpLossRecords, setXpLossRecords] = useState([]);
  const [leaderPenaltyRequests, setLeaderPenaltyRequests] = useState([]);
  const [teamSeasonStats, setTeamSeasonStats] = useState({ successfulWeekIds: [], successfulWeeks: 0 });
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerDisplay, setTimerDisplay] = useState(0); 
  const [roundDraftsByActor, setRoundDraftsByActor] = useState({});
  const roundDraftIdentity = JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId]);
  const roundFormValues = roundDraftsByActor[roundDraftIdentity] || {};
  const setRoundFormValues = (value) => setRoundDraftsByActor((current) => ({ ...current, [roundDraftIdentity]: typeof value === 'function' ? value(current[roundDraftIdentity] || {}) : value }));
  const FULL_ROUND_TIMER_ID = '__full_round__';
  const FULL_ROUND_TIME_KEY = '__full_round_time__';
  const FULL_ROUND_SCORE_KEY = '__full_round_score__';
  const [pitStopRecords, setPitStopRecords] = useState([]);
  const [innovationRubric, setInnovationRubric] = useState(DEFAULT_INNOVATION_RUBRIC);
  const [robotDesignRubric, setRobotDesignRubric] = useState(DEFAULT_ROBOT_DESIGN_RUBRIC);
  const [outreachEvents, setOutreachEvents] = useState([]);
  const [projectSummary, setProjectSummary] = useState(DEFAULT_PROJECT_SUMMARY);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [showcaseSettings, setShowcaseSettings] = useState(DEFAULT_PUBLIC_SHOWCASE_SETTINGS);
  const [modal, setModal] = useState({ type: null, data: null });
  const [notification, setNotification] = useState(null);
  const [xpPenaltyReason, setXpPenaltyReason] = useState('');
  const [xpPenaltyShouldNotify, setXpPenaltyShouldNotify] = useState(true);
  const [xpLossAlertState, setXpLossAlertNotice] = useState(null);
  const xpLossAlertNotice = currentUser?.type === 'student' && xpLossAlertState?.studentId === viewAsStudent?.id
    && normalizeXpLossNotifications(viewAsStudent?.xpLossNotifications).some((notice) => notice.id === xpLossAlertState.id) ? xpLossAlertState : null;
  const notificationTimeoutRef = useRef(null);
  const xpLossLastAlertAtRef = useRef(new Map());
  const showStudentXpLossNotice = useCallback((student) => {
    const now = Date.now();
    const next = normalizeXpLossNotifications(student?.xpLossNotifications).reverse().find((notice) => now - (xpLossLastAlertAtRef.current.get(student.id + ':' + notice.id) || 0) >= XP_LOSS_ALERT_REPEAT_MS);
    if (!next) return;
    xpLossLastAlertAtRef.current.set(student.id + ':' + next.id, now);
    setXpLossAlertNotice({ ...next, studentId: student.id });
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false); 
  const [agendaSearchQuery, setAgendaSearchQuery] = useState('');
  const [agendaTypeFilter, setAgendaTypeFilter] = useState('all');
  const [agendaScopeFilter, setAgendaScopeFilter] = useState('all');
  const [adminLogbookSelection, setAdminLogbookStudentId] = useState(null);
  const adminLogbookStudentId = students.some((student) => student.id === adminLogbookSelection) ? adminLogbookSelection
    : sortLogbookEntries(logbookEntries).map(getLogbookStudentId).find((id) => students.some((student) => student.id === id)) || students[0]?.id || null;
  const [adminLogbookSearchQuery, setAdminLogbookSearchQuery] = useState('');
  const [adminLogbookStudentQuery, setAdminLogbookStudentQuery] = useState('');
  const [adminLogbookWeekFilter, setAdminLogbookWeekFilter] = useState('all');
  const [studentLogbookSearchQuery, setStudentLogbookSearchQuery] = useState('');
  const [studentLogbookWeekFilter, setStudentLogbookWeekFilter] = useState('all');
  const [studentDiaryDrafts, setStudentDiaryDrafts] = useState({});
  const diaryStudentId = currentUser?.studentId || currentUser?.data?.id || '';
  const diaryDraftIdentity = JSON.stringify([diaryStudentId || currentUser?.name, activeTeamSeasonId, currentWeekData?.id]);
  const studentLogbookDraft = studentDiaryDrafts[diaryDraftIdentity] ?? (() => { try { return browserStorage.getItem(`newgears_logbook_draft_${diaryStudentId}`) || ''; } catch { return ''; } })();
  const setStudentLogbookDraft = (value) => {
      const next = typeof value === 'function' ? value(studentLogbookDraft) : value;
      if (!next.trim()) { try { browserStorage.removeItem(`newgears_logbook_draft_${diaryStudentId}`); } catch { /* The form reports browser storage failures. */ } }
      setStudentDiaryDrafts((current) => ({ ...current, [diaryDraftIdentity]: next }));
  };
  const [leaderTaskDraft, setLeaderTaskDraft] = useState({ text: '', studentId: '', station: STATION_KEYS.MANAGEMENT, dueDate: '' });
  const [leaderPenaltyDraft, setLeaderPenaltyDraft] = useState({ studentId: '', reason: '', evidenceFile: null });
  const [leaderPenaltyFileInputKey, setLeaderPenaltyFileInputKey] = useState(0);
  const isTvOnlyView = getStandaloneView() === 'tv';
  const isPublicTvMode = getStandaloneView() === 'public-tv';
  const today = dateKey(new Date(workspaceNow));
  const isLogbookViewActive = isAdmin ? adminTab === 'logbook' : studentTab === 'logbook';

  const isActivityHistoryActive = currentUser?.type === 'admin' && isAdmin && adminTab === 'history';
  const isPitStopModalOpen = modal.type === 'pitstop';
  const dashboardNeedsStrategyData = isAdmin
    ? adminTab === 'overview' && adminPanelState.dashboard && (adminPanelState.prep || adminPanelState.judge || adminPanelState.stats || adminPanelState.achievements)
    : studentTab === 'overview' && studentPanelState.dashboard && (studentPanelState.prep || studentPanelState.judge || studentPanelState.stats || studentPanelState.achievements);
  const dashboardNeedsRobotData = isAdmin
    ? adminTab === 'overview' && adminPanelState.dashboard && (adminPanelState.prep || adminPanelState.judge || adminPanelState.stats)
    : studentTab === 'overview' && studentPanelState.dashboard && (studentPanelState.prep || studentPanelState.judge || studentPanelState.stats);
  const shouldLoadStrategyWorkspaceData =
    isTvOnlyView
    || isPublicMode
    || isPublicTvMode
    || isTvMode
    || isJudgeMode
    || isCommandCenterMode
    || ((adminTab === 'strategy' || studentTab === 'strategy') && ['innovation', 'prototype', 'judge_practice'].includes(strategySubTab))
    || dashboardNeedsStrategyData;
  const shouldLoadRobotWorkspaceData =
    isTvOnlyView
    || isPublicMode
    || isPublicTvMode
    || isTvMode
    || isJudgeMode
    || isCommandCenterMode
    || adminTab === 'rounds'
    || adminTab === 'showcase'
    || studentTab === 'rounds'
    || ['roundForm', 'missionForm', 'attachmentForm', 'attachmentView', 'robotForm', 'robotView', 'codeForm', 'codeView', 'pitstop'].includes(modal.type)
    || ((adminTab === 'strategy' || studentTab === 'strategy') && ['robot_design', 'judge_practice'].includes(strategySubTab))
    || dashboardNeedsRobotData;
  useEffect(() => {
    setDiagnosticsContext({ area: currentUser?.type ? (isAdmin ? adminTab : studentTab) : isPublicMode ? 'public' : isTvOnlyView || isPublicTvMode ? 'tv' : 'startup', role: currentUser?.type === 'admin' ? 'technical' : currentUser?.type === 'student' ? 'student' : 'visitor' });
  }, [currentUser?.type, isAdmin, adminTab, studentTab, isPublicMode, isTvOnlyView, isPublicTvMode]);
  const [missions, setMissions] = useState({
    [STATION_KEYS.ENGINEERING]: { text: 'Definir estrategia do robo.', deadline: today },
    [STATION_KEYS.INNOVATION]: { text: 'Pesquisar especialistas.', deadline: today },
    [STATION_KEYS.MANAGEMENT]: { text: 'Atualizar o cronograma.', deadline: today }
  });

  useEffect(() => {
      browserStorage.setItem('newgears_admin_panel_prefs_v2', JSON.stringify(adminPanelState));
  }, [adminPanelState]);

  useEffect(() => {
      browserStorage.setItem('newgears_student_panel_prefs_v2', JSON.stringify(studentPanelState));
  }, [studentPanelState]);

  useEffect(() => {
      browserStorage.setItem('newgears_student_mission_mode', studentMissionMode);
  }, [studentMissionMode]);

  useEffect(() => {
      browserStorage.setItem('newgears_visual_theme', visualTheme);
      document.documentElement.dataset.newgearsTheme = visualTheme;
  }, [visualTheme]);

  useEffect(() => {
      if (typeof window === 'undefined') return;

      const syncPublicMode = () => {
          setIsPublicMode(new URLSearchParams(window.location.search).get('view') === 'public');
      };

      window.addEventListener('popstate', syncPublicMode);
      return () => window.removeEventListener('popstate', syncPublicMode);
  }, []);

  useEffect(() => {
      if (typeof window === 'undefined') return;

      const syncLiteMode = () => {
          setIsLiteMode(detectLiteMode());
      };

      const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      const connection = getNetworkConnection();

      syncLiteMode();

      if (motionQuery?.addEventListener) {
          motionQuery.addEventListener('change', syncLiteMode);
      } else if (motionQuery?.addListener) {
          motionQuery.addListener(syncLiteMode);
      }

      connection?.addEventListener?.('change', syncLiteMode);
      window.addEventListener('online', syncLiteMode);
      window.addEventListener('offline', syncLiteMode);

      return () => {
          if (motionQuery?.removeEventListener) {
              motionQuery.removeEventListener('change', syncLiteMode);
          } else if (motionQuery?.removeListener) {
              motionQuery.removeListener(syncLiteMode);
          }

          connection?.removeEventListener?.('change', syncLiteMode);
          window.removeEventListener('online', syncLiteMode);
          window.removeEventListener('offline', syncLiteMode);
      };
  }, []);

  const openImmersiveMode = async (setter) => {
      setter(true);
      try {
          if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen();
          }
      } catch {
          return;
      }
  };

  const closeImmersiveMode = async (setter) => {
      setter(false);
      try {
          if (document.fullscreenElement) {
              await document.exitFullscreen();
          }
      } catch {
          return;
      }
  };

  const openJudgeMode = () => {
      void openImmersiveMode(setIsJudgeMode);
  };

  const closeJudgeMode = () => {
      void closeImmersiveMode(setIsJudgeMode);
  };

  const openCommandCenterMode = () => {
      void openImmersiveMode(setIsCommandCenterMode);
  };

  const closeCommandCenterMode = () => {
      void closeImmersiveMode(setIsCommandCenterMode);
  };

  const openTvMode = () => {
      if (typeof window === 'undefined') return;
      const tvUrl = new URL(window.location.href);
      tvUrl.searchParams.set('view', 'tv');
      const openedWindow = window.open(tvUrl.toString(), '_blank', 'noopener,noreferrer');
      if (!openedWindow) {
          window.location.href = tvUrl.toString();
      }
  };

  const gearActorId = currentUser?.type === 'student' && !isAdmin ? String(currentUser.studentId || currentUser.data?.id || viewAsStudent?.id || '') : '';

  const saveNewContribution = (type, data, draftId) => createDraftRecord({ db, path: [GEAR_CONTRIBUTIONS[type].collection], draftId, data: { ...data, createdByStudentId: gearActorId, author: data.author || viewAsStudent?.name || adminProfile?.name || 'Técnico', createdAt: data.createdAt || new Date().toISOString() } });

  const recordActivity = async ({
      action,
      category = 'default',
      title = '',
      detail = '',
      entityId = '',
  }) => {
      if (!db || !currentUser) return;

      const actorName = viewAsStudent?.name
          || (currentUser?.type === 'admin' ? adminProfile?.name : currentUser?.name)
          || 'Equipe';

      try {
          await addDoc(collection(db, "activityLogs"), {
              seasonId: activeTeamSeasonId || 'legacy',
              action,
              category,
              title: `${title || ''}`.trim(),
              detail: `${detail || ''}`.trim(),
              entityId: `${entityId || ''}`,
              actorName,
              actorId: viewAsStudent?.id || '',
              actorType: currentUser?.type || 'team',
              createdAt: new Date().toISOString()
          });
      } catch (error) {
          console.error("Erro ao registrar historico:", error);
      }
  };

  const recordXpOrigin = async ({
      student,
      amount,
      source = 'manual_reward',
      mode = 'reward',
      reason = '',
      notifyStudent = false,
      badgeId = '',
      badgeName = '',
      referenceRecordId = '',
  }) => {
      if (!db || !student?.id) return null;

      const createdBy = currentUser?.type === 'admin'
          ? (adminProfile?.name || currentUser?.name || 'Tecnico')
          : (viewAsStudent?.name || currentUser?.name || 'Equipe');

      try {
          return await addDoc(collection(db, "xpRecords"), {
              seasonId: activeTeamSeasonId || 'legacy',
              studentId: student.id,
              studentName: student.name || 'Aluno',
              amount: Number(amount) || 0,
              source,
              sourceLabel: getXpSourceLabel(source),
              mode,
              reason: `${reason || ''}`.trim(),
              notifyStudent: Boolean(notifyStudent),
              badgeId,
              badgeName,
              referenceRecordId,
              createdAt: new Date().toISOString(),
              createdBy
          });
      } catch (error) {
          console.error("Erro ao registrar origem de XP:", error);
          return null;
      }
  };

  const syncStudentLocally = (student) => {
      const normalizedStudent = normalizeStudentRecord(student);

      setStudents(prevStudents =>
        prevStudents.map(existingStudent => existingStudent.id === normalizedStudent.id ? normalizedStudent : existingStudent)
      );
      setBadgeStudent(prevStudent => prevStudent?.id === normalizedStudent.id ? normalizedStudent : prevStudent);
      setViewAsStudent(prevStudent => prevStudent?.id === normalizedStudent.id ? normalizedStudent : prevStudent);

      return normalizedStudent;
  };

  const showNotification = useCallback((msg, type = 'success', action = null, duration = 3000) => {
      if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
      }

      setNotification({ msg, type, action }); 
      notificationTimeoutRef.current = setTimeout(() => setNotification(null), action ? 7000 : type === 'error' ? Math.max(8000, duration) : duration);
  }, [])

  const getFinalSprintAssignmentDocId = (studentId, frontId, seasonId = activeTeamSeasonId || 'legacy') => encodeURIComponent(`${seasonId}__${studentId}__${frontId}`);

  const handleToggleFinalSprintFront = async (frontId) => {
      if (currentUser?.type === 'admin' || !viewAsStudent?.id) return;
      const front = FINAL_SPRINT_FRONTS.find((item) => item.id === frontId);
      if (!front) return;
      const studentId = String(viewAsStudent.id);
      const existing = finalSprintAssignments.find((item) => item.frontId === frontId && String(item.studentId) === studentId);
      if (existing && existing.active !== false) return;
      const activeSelectionCount = finalSprintAssignments.filter((item) => String(item.studentId) === studentId && item.active !== false).length;
      if (activeSelectionCount >= 4) {
          showNotification('Você já escolheu as quatro frentes. Essas escolhas ficam registradas até o torneio.', 'error');
          return;
      }
      const assignmentRef = doc(db, 'finalSprintAssignments', existing?.id || getFinalSprintAssignmentDocId(studentId, frontId));
      const now = new Date().toISOString();
      const nextActive = true;

      try {
          await setDoc(assignmentRef, {
              studentId,
              studentName: viewAsStudent.name || currentUser.name || 'Aluno',
              seasonId: activeTeamSeasonId || 'legacy',
              frontId,
              frontLabel: front.title,
              active: nextActive,
              status: existing?.status || 'planned',
              createdAt: existing?.createdAt || now,
              updatedAt: now,
          }, { merge: true });
          showNotification(nextActive ? `Você entrou na frente ${front.title}.` : 'Sua participação nesta frente foi encerrada. As atualizações ficaram guardadas.', 'success');
      } catch (error) {
          console.error('Erro ao atualizar participação da reta final:', error);
          showNotification('Não foi possível atualizar sua participação.', 'error');
      }
  };

  const handleSaveFinalSprintProgress = async (frontId, draft) => {
      if (currentUser?.type === 'admin' || !viewAsStudent?.id) return false;
      const front = FINAL_SPRINT_FRONTS.find((item) => item.id === frontId);
      const studentId = String(viewAsStudent.id);
      const existing = finalSprintAssignments.find((item) => item.frontId === frontId && String(item.studentId) === studentId);
      if (!front || !existing || existing.active === false) return false;
      if (!`${draft.commitment || ''}`.trim()) {
          showNotification('Escreva seu próximo passo antes de salvar.', 'error');
          return false;
      }
      const allowedStatuses = ['planned', 'in_progress', 'done'];
      const now = new Date().toISOString();

      try {
          await setDoc(doc(db, 'finalSprintAssignments', existing.id || getFinalSprintAssignmentDocId(studentId, frontId)), {
              studentId,
              studentName: viewAsStudent.name || currentUser.name || 'Aluno',
              seasonId: activeTeamSeasonId || 'legacy',
              frontId,
              frontLabel: front.title,
              commitment: `${draft.commitment || ''}`.trim().slice(0, 240),
              progressNote: `${draft.progressNote || ''}`.trim().slice(0, 1000),
              status: allowedStatuses.includes(draft.status) ? draft.status : 'planned',
              active: true,
              updatedAt: now,
          }, { merge: true });
          showNotification('Atualização da frente salva.', 'success');
          return true;
      } catch (error) {
          console.error('Erro ao salvar atualização da reta final:', error);
          showNotification('Não foi possível salvar a atualização.', 'error');
          return false;
      }
  };

  const getFinalSprintEvaluationDocId = (type, studentId, periodId = '', seasonId = activeTeamSeasonId || 'legacy') => encodeURIComponent(`${seasonId}__${type}__${studentId}__${periodId}`);
  const getFinalSprintEvaluationTotal = (ratings, criteria) => {
      if (!ratings || !criteria.every(({ id }) => ratings[id] !== null && ratings[id] !== undefined && ratings[id] !== '' && Number.isInteger(Number(ratings[id])) && Number(ratings[id]) >= 0 && Number(ratings[id]) <= 5)) return null;
      return criteria.reduce((total, { id }) => total + Number(ratings[id]), 0);
  };

  const handleSaveWeeklyEvaluation = async ({ student, week, draft }) => {
      if (currentUser?.type !== 'admin' || !isAdmin || !student?.id || !week?.id || evaluationWorkspace.loading || evaluationWorkspace.error) return false;
      const total = getFinalSprintEvaluationTotal(draft.ratings, WEEKLY_EVALUATION_CRITERIA);
      if (total === null || !`${draft.improvement || ''}`.trim()) {
          showNotification('Complete as notas e registre um próximo ponto a melhorar.', 'error');
          return false;
      }
      const studentId = String(student.id);
      const existing = finalSprintEvaluations.find((item) => item.type === 'weekly' && String(item.studentId) === studentId && item.weekId === week.id);
      const now = new Date().toISOString();
      try {
          const evaluation = {
              type: 'weekly',
              seasonId: activeTeamSeasonId || 'legacy',
              status: 'complete',
              studentId,
              studentName: student.name || 'Aluno',
              weekId: week.id,
              weekLabel: week.label,
              ratings: Object.fromEntries(WEEKLY_EVALUATION_CRITERIA.map(({ id }) => [id, Number(draft.ratings[id])])),
              total,
              strengths: `${draft.strengths || ''}`.trim().slice(0, 600),
              improvement: `${draft.improvement || ''}`.trim().slice(0, 600),
              evaluatorName: currentUser.name || 'Perfil técnico',
              createdAt: existing?.createdAt || now,
              updatedAt: now,
          };
          const evaluationId = existing?.id || getFinalSprintEvaluationDocId('weekly', studentId, week.id);
          await saveEvaluation({ db, user: currentUser, id: evaluationId, evaluation, expected: existing });
          showNotification(`Avaliação semanal de ${student.name || 'aluno'} salva.`, 'success');
          return true;
      } catch (error) {
          console.error('Erro ao salvar avaliação semanal da reta final:', error);
          showNotification(error.message || 'Não foi possível salvar a avaliação semanal.', 'error');
          return false;
      }
  };

  const handleSavePresentationEvaluation = async ({ student, draft }) => {
      if (currentUser?.type !== 'admin' || !isAdmin || !student?.id || evaluationWorkspace.loading || evaluationWorkspace.error) return false;
      const total = getFinalSprintEvaluationTotal(draft.ratings, PRESENTATION_EVALUATION_CRITERIA);
      if (total === null || !`${draft.improvement || ''}`.trim()) {
          showNotification('Complete as notas e registre um próximo ponto a melhorar.', 'error');
          return false;
      }
      const studentId = String(student.id);
      const existing = finalSprintEvaluations.find((item) => item.type === 'presentation' && String(item.studentId) === studentId);
      const now = new Date().toISOString();
      try {
          const evaluation = {
              type: 'presentation',
              criteriaVersion: PRESENTATION_EVALUATION_CRITERIA_VERSION,
              seasonId: activeTeamSeasonId || 'legacy',
              status: 'complete',
              studentId,
              studentName: student.name || 'Aluno',
              presentedAt: draft.presentedAt || now.slice(0, 10),
              ratings: Object.fromEntries(PRESENTATION_EVALUATION_CRITERIA.map(({ id }) => [id, Number(draft.ratings[id])])),
              total,
              strengths: `${draft.strengths || ''}`.trim().slice(0, 600),
              improvement: `${draft.improvement || ''}`.trim().slice(0, 600),
              evaluatorName: currentUser.name || 'Perfil técnico',
              createdAt: existing?.createdAt || now,
              updatedAt: now,
          };
          const evaluationId = existing?.id || getFinalSprintEvaluationDocId('presentation', studentId);
          // Replace the ratings map as a whole so removed criteria do not survive a reevaluation.
          await saveEvaluation({ db, user: currentUser, id: evaluationId, evaluation, expected: existing });
          showNotification(`Avaliação da apresentação de ${student.name || 'aluno'} salva.`, 'success');
          return true;
      } catch (error) {
          console.error('Erro ao salvar avaliação da apresentação:', error);
          showNotification(error.message || 'Não foi possível salvar a avaliação da apresentação.', 'error');
          return false;
      }
  };

  const handleSaveReportEvaluation = async ({ student, draft }) => {
      if (currentUser?.type !== 'admin' || !isAdmin || !student?.id || evaluationWorkspace.loading || evaluationWorkspace.error) return false;
      const total = parseFinalSprintReportScore(draft.score);
      if (total === null) {
          showNotification('Informe uma nota de 0 a 10 para a avaliação do relatório.', 'error');
          return false;
      }
      const studentId = String(student.id);
      const existing = finalSprintEvaluations.find((item) => item.type === 'report' && String(item.studentId) === studentId);
      const now = new Date().toISOString();
      const evaluation = {
          type: 'report',
          seasonId: activeTeamSeasonId || 'legacy',
          status: 'complete',
          studentId,
          studentName: student.name || 'Aluno',
          total,
          note: `${draft.note || ''}`.trim().slice(0, FINAL_SPRINT_REPORT_NOTE_MAX_LENGTH),
          evaluatorName: currentUser.name || 'Perfil técnico',
          createdAt: existing?.createdAt || now,
          updatedAt: now,
      };
      const evaluationId = existing?.id || getFinalSprintEvaluationDocId('report', studentId);
      try {
          await saveEvaluation({ db, user: currentUser, id: evaluationId, evaluation, expected: existing });
          showNotification(`Avaliação do relatório de ${student.name || 'aluno'} salva.`, 'success');
          return true;
      } catch (error) {
          console.error('Erro ao salvar avaliação do relatório:', error);
          showNotification(error.message || 'Não foi possível salvar a avaliação do relatório.', 'error');
          return false;
      }
  };

  const handleSaveFinalSprintSelection = async ({ student, draft }) => {
      if (currentUser?.type !== 'admin' || !isAdmin || !student?.id || !tournamentDraftReady) return false;
      try {
          await saveTournamentCandidate({ db, seasonId: activeTeamSeasonId || 'legacy', studentId: student.id, selected: draft.selectedForTournament === true, selections: finalSprintSelections, expectedRevision: tournamentDraftState.record?.revision || 0, knownDraft: tournamentDraftState.record, actor: currentUser.name || 'Técnico' });
          showNotification('Lista em preparação salva. Os alunos serão avisados após a divulgação.', 'success');
          return true;
      } catch (error) {
          const message = tournamentSelectionError(error);
          showNotification(message, 'error');
          throw new Error(message);
      }
  };

  const handlePublishTournamentSelection = async ({ studentIds, revision }) => {
      if (currentUser?.type !== 'admin' || !isAdmin || !tournamentDraftReady) return false;
      try {
          await publishTournamentSelection({ db, seasonId: activeTeamSeasonId || 'legacy', selections: finalSprintSelections, expectedRevision: revision, expectedStudentIds: studentIds, knownDraft: tournamentDraftState.record, actor: currentUser.name || 'Técnico' });
          showNotification(studentIds.length ? 'Convocação divulgada! Os participantes já podem receber a mensagem.' : 'Convocação retirada. Os avisos dos participantes foram removidos.', 'success');
          return true;
      } catch (error) {
          const message = tournamentSelectionError(error);
          showNotification(message, 'error');
          throw new Error(message);
      }
  };

  const openPublicMode = () => {
      if (typeof window === 'undefined') return;
      const publicUrl = new URL(window.location.href);
      publicUrl.searchParams.set('view', 'public');
      window.history.pushState({}, '', publicUrl);
      setIsPublicMode(true);
  };

  const closePublicMode = () => {
      if (typeof window === 'undefined') return;
      const loginUrl = new URL(window.location.href);
      if (loginUrl.searchParams.get('view') === 'public') {
          loginUrl.searchParams.delete('view');
      }
      window.history.pushState({}, '', loginUrl);
      setIsPublicMode(false);
  };

  const openPublicTvMode = () => {
      if (typeof window === 'undefined') return;
      const publicTvUrl = new URL(window.location.href);
      publicTvUrl.searchParams.set('view', 'public-tv');
      const openedWindow = window.open(publicTvUrl.toString(), '_blank', 'noopener,noreferrer');
      if (!openedWindow) {
          window.location.href = publicTvUrl.toString();
      }
  };

  const closePublicTvMode = () => {
      if (typeof window === 'undefined') return;
      const publicUrl = new URL(window.location.href);
      publicUrl.searchParams.set('view', 'public');
      window.location.href = publicUrl.toString();
  };

  const toggleVisualTheme = () => {
      setVisualTheme((currentTheme) => currentTheme === 'gold' ? 'classic' : 'gold');
  };

// --- LISTA DE BADGES (VERSÃƒÆ’O FINAL) ---
  const BADGES_LIST = [
    { id: 'pitstop', name: 'Pit Stop F1', icon: <Timer size={20}/>, color: 'text-red-500', desc: 'Troca de anexo em menos de 3s.' },
    { id: 'engineer', name: 'Engenheiro Minimalista', icon: <Wrench size={20}/>, color: 'text-gray-400', desc: 'Solução mecânica simples e genial.' },
    { id: 'ice_blood', name: 'Sangue Frio', icon: <ThermometerSnowflake size={20}/>, color: 'text-blue-400', desc: 'Manteve a calma no erro crítico.' },
    { id: 'repetition', name: 'Rei da Repetição', icon: <RotateCcw size={20}/>, color: 'text-green-500', desc: '10 acertos seguidos na mesa.' },
    { id: 'helper', name: 'Braço Direito', icon: <HeartHandshake size={20}/>, color: 'text-pink-500', desc: 'Ajudou o time em qualquer situação.' },
    { id: 'data_keeper', name: 'Guardião dos Dados', icon: <BarChart size={20}/>, color: 'text-blue-500', desc: 'Trouxe estatísticas reais pro Projeto.' },
    { id: 'legend', name: 'Lenda do XP', icon: <Zap size={20}/>, color: 'text-yellow-400', desc: 'Destaque absoluto no Ranking de XP.' },
    { id: 'ambassador', name: 'Embaixador', icon: <Crown size={20}/>, color: 'text-purple-500', desc: 'Liderou pelo exemplo e uniu a equipe.' },
    { id: 'mission_captain', name: 'Capitao das Missoes', icon: <Target size={20}/>, color: 'text-emerald-400', desc: 'Organizou estrategia de missoes e ajudou o time a pontuar melhor.' },
    { id: 'robot_driver', name: 'Piloto do Robo', icon: <Gamepad2 size={20}/>, color: 'text-cyan-400', desc: 'Conduziu treinos de mesa com foco, precisao e calma.' },
    { id: 'code_debugger', name: 'Cacador de Bugs', icon: <Code size={20}/>, color: 'text-indigo-400', desc: 'Encontrou e corrigiu falhas importantes no codigo do robo.' },
    { id: 'innovation_scout', name: 'Explorador de Inovacao', icon: <Microscope size={20}/>, color: 'text-fuchsia-400', desc: 'Pesquisou ideias, usuarios ou especialistas para fortalecer o projeto.' },
    { id: 'core_values', name: 'Valores FLL', icon: <Shield size={20}/>, color: 'text-green-400', desc: 'Praticou descoberta, inclusao, impacto e trabalho em equipe.' },
    { id: 'pit_presenter', name: 'Voz dos Juizes', icon: <MessageSquare size={20}/>, color: 'text-orange-400', desc: 'Explicou projeto, robo ou processo com clareza para a banca.' },
    { id: 'logbook_keeper', name: 'Guardiao do Diario', icon: <Book size={20}/>, color: 'text-sky-400', desc: 'Registrou testes, decisoes e aprendizados no diario de engenharia.' },
    { id: 'strategy_builder', name: 'Arquiteto da Estrategia', icon: <Lightbulb size={20}/>, color: 'text-amber-400', desc: 'Transformou uma ideia solta em plano real de execucao FLL.' },
    { id: 'robot_design_lead', name: 'Designer do Robo', icon: <Bot size={20}/>, color: 'text-slate-300', desc: 'Explicou escolhas mecanicas, modularidade e iteracoes do robo.' },
    { id: 'mission_pathfinder', name: 'Mapa das Missoes', icon: <Rocket size={20}/>, color: 'text-blue-300', desc: 'Montou rotas de mesa alinhadas com pontuacao e risco.' },
    { id: 'table_strategy', name: 'Estrategista de Mesa', icon: <Flag size={20}/>, color: 'text-lime-400', desc: 'Priorizou missoes por tempo, anexos e chance de acerto.' },
    { id: 'reliability_tester', name: 'Teste 10x', icon: <CheckCheck size={20}/>, color: 'text-emerald-300', desc: 'Validou uma solucao com repeticoes e dados confiaveis.' },
    { id: 'round_programmer', name: 'Programador de Round', icon: <Laptop size={20}/>, color: 'text-cyan-300', desc: 'Programou uma saida completa com objetivo, tempo e repeticao.' },
    { id: 'pit_mechanic', name: 'Mecanico de Pit', icon: <Settings size={20}/>, color: 'text-teal-300', desc: 'Organizou anexos, troca rapida e prontidao da mesa.' },
    { id: 'quick_prototyper', name: 'Prototipador Rapido', icon: <Wrench size={20}/>, color: 'text-orange-300', desc: 'Testou uma ideia fisica rapido e registrou o aprendizado.' },
    { id: 'team_spirit', name: 'Espirito de Equipe', icon: <HeartHandshake size={20}/>, color: 'text-rose-300', desc: 'Puxou energia boa, colaboracao e foco coletivo no treino.' },
    { id: 'gracious_professional', name: 'Profissional Gentil', icon: <Smile size={20}/>, color: 'text-pink-300', desc: 'Defendeu ideias com respeito, escuta e maturidade FLL.' },
    { id: 'discovery_spark', name: 'Descoberta FLL', icon: <Search size={20}/>, color: 'text-yellow-300', desc: 'Aprendeu algo novo e trouxe esse conhecimento para o time.' },
    { id: 'inclusion_builder', name: 'Inclusao em Acao', icon: <Users size={20}/>, color: 'text-violet-300', desc: 'Fez alguem participar melhor do treino, projeto ou robo.' },
    { id: 'impact_maker', name: 'Impacto Real', icon: <Globe2 size={20}/>, color: 'text-green-300', desc: 'Conectou a solucao de inovacao com usuarios ou comunidade.' },
    { id: 'feedback_hunter', name: 'Cacador de Feedback', icon: <MessageSquare size={20}/>, color: 'text-fuchsia-300', desc: 'Buscou retorno externo e transformou em melhoria concreta.' },
    { id: 'innovation_validator', name: 'Validador de Solucao', icon: <Microscope size={20}/>, color: 'text-purple-300', desc: 'Testou a ideia do projeto com evidencia, criterio e iteracao.' },
    { id: 'judge_room_ready', name: 'Sala dos Juizes Ready', icon: <MonitorPlay size={20}/>, color: 'text-indigo-300', desc: 'Ensaiou apresentacao, respostas e transicoes para os juizes.' },
    { id: 'tournament_scout', name: 'Scout de Torneio', icon: <Trophy size={20}/>, color: 'text-amber-300', desc: 'Observou regras, tendencias ou estrategias para preparar o torneio.' },
    { id: 'bioglow_explorer', name: 'Explorador Bioglow', icon: <Sparkles size={20}/>, color: 'text-emerald-300', desc: 'Estudou a temporada Bioglow e conectou missoes, projeto e estrategia.' },
    { id: 'rulebook_reader', name: 'Leitor do Livro de Regras', icon: <BookOpen size={20}/>, color: 'text-sky-300', desc: 'Consultou regra oficial antes de decidir pontuacao, construcao ou estrategia.' },
    { id: 'mission_model_master', name: 'Mestre dos Modelos', icon: <ClipboardList size={20}/>, color: 'text-lime-300', desc: 'Montou, revisou ou explicou modelos de missao com cuidado competitivo.' },
    { id: 'sensor_surgeon', name: 'Cirurgiao de Sensores', icon: <Cpu size={20}/>, color: 'text-cyan-200', desc: 'Calibrou sensores e melhorou a confiabilidade do robo na mesa.' },
    { id: 'round_analyst', name: 'Analista de Rounds', icon: <BarChart3 size={20}/>, color: 'text-blue-200', desc: 'Usou tempos, acertos e erros para melhorar a proxima saida.' },
    { id: 'design_iterator', name: 'Iterador FLL', icon: <GitBranch size={20}/>, color: 'text-violet-300', desc: 'Transformou teste ruim em versao melhor, com aprendizado registrado.' },
    { id: 'launch_captain', name: 'Capitao de Lancamento', icon: <Rocket size={20}/>, color: 'text-orange-300', desc: 'Preparou base, alinhamento e primeira acao do robo com consistencia.' },
    { id: 'rookie_mentor', name: 'Mentor dos Novatos', icon: <UserPlus size={20}/>, color: 'text-green-200', desc: 'Ajudou alguem novo a participar de robo, projeto ou valores da equipe.' },
    { id: 'pit_anchor', name: 'Ancora do Pit', icon: <Megaphone size={20}/>, color: 'text-yellow-200', desc: 'Segurou a apresentacao no pit com presenca, ordem e escuta.' },
    { id: 'field_reset_master', name: 'Mestre do Reset', icon: <BatteryCharging size={20}/>, color: 'text-teal-200', desc: 'Deixou robo, anexos e mesa prontos para repetir teste sem bagunca.' },
    { id: 'pressure_driver', name: 'Piloto de Pressao', icon: <Gamepad2 size={20}/>, color: 'text-red-300', desc: 'Executou round sob pressao mantendo ritmo, foco e tomada de decisao.' },
    { id: 'badge_beggar', name: 'Badge do Mendigo', icon: <HelpCircle size={20}/>, color: 'text-zinc-300', desc: 'Pediu badge com tanta persistencia que ganhou uma badge para pedir menos.', xpBonus: 0 },
    { id: 'laugh_only', name: 'So Risada', icon: <Smile size={20}/>, color: 'text-pink-200', desc: 'Ficou rindo do caos e ajudou pelo menos o clima da equipe.', xpBonus: 0 },
    { id: 'premium_laziness', name: 'Preguica Premium', icon: <Pause size={20}/>, color: 'text-slate-300', desc: 'Economizou energia com uma dedicacao quase olimpica.', xpBonus: 0 },
    { id: 'little_work_fc', name: 'Pouco Trabalho FC', icon: <BatteryLow size={20}/>, color: 'text-orange-200', desc: 'Entregou pouco, opinou muito e saiu com estilo questionavel.', xpBonus: 0 },
    { id: 'chair_referee', name: 'Fiscal de Cadeira', icon: <Eye size={20}/>, color: 'text-cyan-200', desc: 'Acompanhou tudo sentado, julgando com muita propriedade.', xpBonus: 0 },
    { id: 'disappeared_at_crunch_time', name: 'Sumiu na Hora H', icon: <EyeOff size={20}/>, color: 'text-violet-200', desc: 'Foi visto antes do trabalho comecar e depois virou misterio.', xpBonus: 0 },
    { id: 'audience_coach', name: 'Coach da Arquibancada', icon: <Megaphone size={20}/>, color: 'text-yellow-200', desc: 'Deu instrucoes valiosas sem correr o risco de executar nenhuma.', xpBonus: 0 },
    { id: 'maybe_master', name: 'Mestre do Talvez', icon: <HelpCircle size={20}/>, color: 'text-blue-200', desc: 'Prometeu ajudar daqui a pouco, em algum momento, talvez.', xpBonus: 0 },
    { id: 'battery_two_percent', name: 'Bateria 2%', icon: <BatteryWarning size={20}/>, color: 'text-red-200', desc: 'Chegou no treino com energia suficiente para respirar e reclamar.', xpBonus: 0 },
    { id: 'decorative_presence', name: 'Presenca Decorativa', icon: <UserCircle size={20}/>, color: 'text-gray-300', desc: 'Esteve presente no ambiente. A produtividade ainda esta em analise.', xpBonus: 0 },
    { id: 'secretary', name: 'Secretário', icon: <MailCheck size={20}/>, color: 'text-sky-200', desc: 'Se tem pendência, já mandou e-mail. Cobra, questiona e acompanha tudo: a caixa de entrada que lute!', xpBonus: 0 },
    { id: 'ghost', name: 'Fantasma', icon: <Ghost size={20}/>, color: 'text-violet-200', desc: 'Entrou na call no modo invisível e se apresentou: “Oi, eu sou o fantasma.” Câmera misteriosa, presença confirmada!', xpBonus: 0 },
  ];

  // --- DESAFIO DE INGLÊS: Função do Técnico ---
  const toggleEnglishChallenge = async (student) => {
      if (!isAdmin) return;
      try {
          const studentRef = doc(db, "students", student.id);
          const newState = !student.englishChallengeUnlocked; // Inverte o estado atual
          
          await updateDoc(studentRef, {
              englishChallengeUnlocked: newState
          });

          // Atualiza a tela na hora
          setStudents(prev => prev.map(s => 
              s.id === student.id ? { ...s, englishChallengeUnlocked: newState } : s
          ));
      } catch (error) {
          console.error("Erro ao liberar desafio de inglês:", error);
      }
  };

  // --- DESAFIO DE INGLÊS: Função do Aluno ---
  const claimEnglishXP = async () => {
    if (!viewAsStudent?.englishChallengeUnlocked) return;
    try {
      const result = await claimEnglishReward({ db, user: currentUser, studentId: viewAsStudent.id, seasonId: activeTeamSeasonId });
      syncStudentLocally(result.student);
      showNotification('Great job! +20 XP pelo desafio de ingl\u00eas.');
    } catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel resgatar o desafio.', 'error'); }
  };
  const toggleBadge = async (student, badgeId) => {
    if (!isAdmin || !student?.id) return;
    const badge = BADGES_LIST.find((item) => item.id === badgeId);
    if (!badge) return;
    try {
      const result = await changeStudentBadge({ db, user: currentUser, studentId: student.id, seasonId: activeTeamSeasonId, badgeId,
        badgeName: badge.name, bonus: getBadgeXpBonus(badge), removing: hasStudentBadge(student, badgeId), normalizeBadges: normalizeStudentBadges, normalizeAchievementId: (entry) => normalizeBadgeToken(entry.badgeId || entry.id || entry.badgeName) });
      syncStudentLocally(result.student);
      void recordActivity({ action: result.amount < 0 ? 'corrigiu uma conquista' : 'entregou uma conquista', category: 'team', title: badge.name, entityId: student.id });
      showNotification('Conquista atualizada.', 'success', { label: 'Desfazer', onClick: async () => {
        try { const restored = await undoStudentXp({ db, user: currentUser, studentId: student.id, seasonId: activeTeamSeasonId, recordId: result.recordId }); syncStudentLocally(restored.student); showNotification('Altera\u00e7\u00e3o desfeita.'); }
        catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel desfazer.', 'error'); }
      } });
      return result.student;
    } catch (error) { showNotification(error.message || 'Erro ao atualizar conquista.', 'error'); return null; }
  };
  // --- LÓGICA DA CHUVA DE CONFETES (LEVEL UP E GRANDES GANHOS DE XP) ---

  useEffect(() => {
      return () => {
          if (confettiTimeoutRef.current) {
              clearTimeout(confettiTimeoutRef.current);
          }
          if (notificationTimeoutRef.current) {
              clearTimeout(notificationTimeoutRef.current);
          }
      };
  }, []);

  useEffect(() => {
      if (viewAsStudent) {
          const currentXp = viewAsStudent.xp || 0;

          // 1. Descobre o nível atual baseado no XP do aluno
          const currentLevelObj = getCurrentLevel(currentXp);
          // Encontra a posição numérica desse nível (0 = Novato, 1 = Aprendiz, etc)
          const currentLevelIndex = LEVELS.findIndex(l => l.name === currentLevelObj.name);
          
          // 2. Busca na memória qual foi o último nível que esse aluno assistiu
          const storageKey = `last_seen_level_${viewAsStudent.id}`;
          const lastSeenLevel = browserStorage.getItem(storageKey);

          let triggerConfetti = false;
          let msg = "";

          // 3. Se não for o primeiro carregamento da tela, verifica as vitórias
          if (prevXpRef.current?.studentId === viewAsStudent.id) {
              const prevXp = prevXpRef.current.xp;
              const gainedXp = currentXp - prevXp;

              // Condição A: Subiu de nível!
              if (lastSeenLevel !== null && currentLevelIndex > parseInt(lastSeenLevel)) {
                  triggerConfetti = true;
                  msg = `🎉 PARABÉNS! Você alcançou o nível ${currentLevelObj.name.toUpperCase()}!`;
              } 
              // Condição B: Recebeu recompensa de Fechamento de Semana (35 ou 50 XP) ou outra bonificação alta
              else if (gainedXp >= 35) {
                  triggerConfetti = true;
                  msg = `🎉 RECOMPENSA COLETADA! Você ganhou +${gainedXp} XP!`;
              }
          }

          if (triggerConfetti) {
              if (msg) showNotification(msg, "success");

              if (!isLiteMode) {
                  setShowConfetti(true);

                  if (confettiTimeoutRef.current) {
                      clearTimeout(confettiTimeoutRef.current);
                  }

                  // Desliga os confetes mais cedo para reduzir custo visual em dispositivos lentos
                  confettiTimeoutRef.current = setTimeout(() => setShowConfetti(false), 4500);
              }
          }

          // 4. Salva o nível atual para não repetir a animação toda hora
          browserStorage.setItem(storageKey, currentLevelIndex.toString());
          
          // Atualiza o valor anterior para a próxima renderização
          prevXpRef.current = { studentId: viewAsStudent.id, xp: currentXp };
      } else {
          // Se deslogar, limpa a memória temporária do XP
          prevXpRef.current = null;
      }
  }, [isLiteMode, viewAsStudent, showNotification]);

  const getTodayMoodDate = () => gearDay();

  // Função para carregar a bateria de hoje do banco
  useEffect(() => {
      if (!db || !currentUser?.type) return;
      const today = moodDate;
      
      // Cria uma "escuta" no banco para ver os humores de hoje em tempo real
      const q = query(collection(db, "dailyMoods"), where("date", "==", today));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const moods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTeamMoods({ date: today, rows: moods });
      });
      return () => unsubscribe();
  }, [moodDate, currentUser?.uid, currentUser?.type]);

  // Função para Salvar o Humor


  // Cálculo da Média da Equipe (Para você ver)
  const teamAverage = teamMoods.length > 0 
      ? Math.round(teamMoods.reduce((acc, curr) => acc + curr.level, 0) / teamMoods.length) 
      : 0;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (loginBusy) return;
    if (FIREBASE_AUTH_ENABLED) {
        setLoginBusy(true);
        try {
            await signInWithEmailAndPassword(auth, loginUser.trim().toLowerCase(), loginPass);
            // A sessão e o papel são obtidos no servidor pelo observador de Firebase Auth.
        } catch (error) {
            setLoginError(error.code === 'auth/too-many-requests'
                ? 'Muitas tentativas. Aguarde um pouco e tente novamente.'
                : error.code === 'auth/network-request-failed'
                    ? 'Não foi possível conectar. Confira a internet.'
                    : ['auth/operation-not-allowed', 'auth/unauthorized-domain', 'auth/configuration-not-found'].includes(error.code)
                        ? 'O técnico precisa concluir a configuração do Firebase Authentication.'
                        : 'E-mail ou senha incorretos.');
            setLoginBusy(false);
        }
        return;
    }
    
    // Normaliza (remove espaços e deixa minúsculo) para evitar erros de digitação
    const userClean = loginUser.trim().toLowerCase();
    const passClean = loginPass.trim();

    // 1. Lógica de login de Admin (SIMPLIFICADA)
    // TODO: Substituir por Firebase Auth. Por enquanto, uma verificação simples.
    let adminFound = ADMIN_USERS.find(a => a.user.toLowerCase() === userClean && a.pass === passClean);

    // Verifica se tem senha personalizada no Firebase
    if (!adminFound && adminProfile?.password) {
        // Pode logar usando "admin", "tecnico" ou o próprio nome configurado no perfil
        const allowedUsers = ['admin', 'tecnico', (adminProfile?.name || '').toLowerCase().trim()];
        if (allowedUsers.includes(userClean) && passClean === adminProfile.password) {
            adminFound = { user: adminProfile.name || 'Tecnico' };
        }
    }

    if (adminFound) {
        // Logou com sucesso!
        const userObj = { type: 'admin', name: adminFound.user };
        setCurrentUser(userObj);
        setIsAdmin(true);
        setViewAsStudent(null);
        browserStorage.setItem("roboquest_user", JSON.stringify(legacySessionIdentity(userObj))); // Salva na memória
        return;
    }
    // 2. Tenta logar como Aluno (busca no array 'students' que já existe no seu código)
    // Nota: Certifique-se de que o cadastro de aluno salva 'username' e 'password'
    const studentFound = students.find(s => 
        isActiveStudent(s) && s.username && s.username.toLowerCase().trim() === userClean && s.password === passClean
    );

    if (studentFound) {
        const userObj = { type: 'student', data: studentFound };
        setCurrentUser(userObj);
        setIsAdmin(false); // Remove flag de admin
        setViewAsStudent(studentFound); // Força a visão para este aluno
        browserStorage.setItem("roboquest_user", JSON.stringify(legacySessionIdentity(userObj))); // Salva na memória
    } else {
        // Log para ajudar a descobrir o erro (veja no F12)        setLoginError("Usuário ou senha incorretos.");
    }
  };

  const handleLogout = useCallback(async () => {
      if (FIREBASE_AUTH_ENABLED) {
          try { await signOut(auth); }
          catch { showNotification('Não foi possível encerrar a sessão. Tente novamente.', 'error'); return; }
      }
      setCurrentUser(null);
      setIsAdmin(false);
      setViewAsStudent(null);
      setLogoutCountdown(null);
      setLoginUser("");
      setLoginPass("");
      xpLossLastAlertAtRef.current = new Map();
      setXpLossAlertNotice(null);
      browserStorage.removeItem("roboquest_user"); // Limpa a memória
        browserStorage.removeItem("roboquest_last_activity"); // Limpa o controle de tempo
  }, [showNotification]);
  // ----------------------------------


    useEffect(() => {
      let warningTimeoutId;
      let countdownIntervalId;
      let throttleTimer;

      // O técnico (admin) não deve ser deslogado por inatividade
      if (currentUser?.type === 'admin') return;

      const TIMEOUT_MINUTES = 30; // 30 minutos totais
      const WARNING_SECONDS = 60; // Aviso nos últimos 60 segundos
      
      const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;
      const WARNING_MS = WARNING_SECONDS * 1000;
      const IDLE_TIME_BEFORE_WARNING = TIMEOUT_MS - WARNING_MS;

      const checkInactivity = () => {
        const lastActivity = browserStorage.getItem("roboquest_last_activity");
        const now = new Date().getTime();
        
        if (lastActivity) {
            const timeIdle = now - parseInt(lastActivity);
            if (timeIdle >= TIMEOUT_MS) { void handleLogout(); return; }
            // Se houve atividade recente (outra aba), não mostra o aviso e reseta
            if (timeIdle < IDLE_TIME_BEFORE_WARNING) {
                resetTimer();
                return;
            }
        }
        
        let timeLeft = WARNING_SECONDS;
        setLogoutCountdown(timeLeft);
        
        countdownIntervalId = setInterval(() => {
            timeLeft -= 1;
            
            // Verifica se a outra aba foi mexida durante a contagem
            const currentLastActivity = browserStorage.getItem("roboquest_last_activity");
            const currentNow = new Date().getTime();
            if (currentLastActivity && (currentNow - parseInt(currentLastActivity)) < IDLE_TIME_BEFORE_WARNING) {
                clearInterval(countdownIntervalId);
                setLogoutCountdown(null);
                resetTimer();
                return;
            }

            if (timeLeft <= 0) {
                clearInterval(countdownIntervalId);
                setLogoutCountdown(null);
                handleLogout();
                alert("Sessão encerrada por inatividade (30 minutos). Por favor, faça login novamente para sua segurança.");
            } else {
                setLogoutCountdown(timeLeft);
            }
        }, 1000);
      };

      const resetTimer = () => {
        if (currentUser) {
          browserStorage.setItem("roboquest_last_activity", new Date().getTime().toString());
          clearTimeout(warningTimeoutId);
          clearInterval(countdownIntervalId);
          setLogoutCountdown(null);
          warningTimeoutId = setTimeout(checkInactivity, IDLE_TIME_BEFORE_WARNING);
        }
      };

      const handleActivity = () => {
        if (!throttleTimer) {
          resetTimer();
          throttleTimer = setTimeout(() => { throttleTimer = null; }, 5000);
        }
      };

      if (currentUser) {
        const lastActivity = Number(browserStorage.getItem('roboquest_last_activity'));
        const now = Date.now();
        const last = Number.isFinite(lastActivity) && lastActivity > 0 ? lastActivity : now;
        if (last === now) browserStorage.setItem('roboquest_last_activity', String(now));
        warningTimeoutId = setTimeout(checkInactivity, Math.max(0, IDLE_TIME_BEFORE_WARNING - (now - last)));
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('scroll', handleActivity);
      }

      return () => {
        clearTimeout(warningTimeoutId);
        clearInterval(countdownIntervalId);
        clearTimeout(throttleTimer);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
        window.removeEventListener('scroll', handleActivity);
      };
    }, [currentUser, handleLogout]);


  // --- LÓGICA DE NOTIFICAÇÕES DA AGENDA EM TEMPO REAL ---
  const getLocalYYYYMMDD = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };
  const localTodayObj = new Date(workspaceNow);
  const localTodayStr = getLocalYYYYMMDD(localTodayObj);
  const localTomorrowObj = new Date(workspaceNow);
  localTomorrowObj.setDate(localTodayObj.getDate() + 1);
  const localTomorrowStr = getLocalYYYYMMDD(localTomorrowObj);
  const officialStudentDeadlineObj = getNextOrSameWeekday(localTodayObj, [...effectivePlanning.trainingDays].sort((a, b) => ((b + 6) % 7) - ((a + 6) % 7))[0] ?? 3);
  const officialStudentDeadlineStr = getLocalYYYYMMDD(officialStudentDeadlineObj);
  const localTodayStart = new Date(localTodayObj.getFullYear(), localTodayObj.getMonth(), localTodayObj.getDate());

  const parseAgendaDate = (dateString) => {
      const normalizedDay = recordDay(dateString);
      if (!normalizedDay) return null;
      const [year, month, day] = normalizedDay.split('-').map(Number);
      if (!year || !month || !day) return null;
      return new Date(year, month - 1, day);
  };

  const getEventDateTime = (event) => {
      const eventDate = parseAgendaDate(event?.date);
      if (!eventDate) return new Date(0);

      const safeTime = event?.time || '23:59';
      const [hours, minutes] = safeTime.split(':').map(Number);
      eventDate.setHours(Number.isFinite(hours) ? hours : 23, Number.isFinite(minutes) ? minutes : 59, 0, 0);
      return eventDate;
  };

  const compareEventsByDate = (left, right) => getEventDateTime(left) - getEventDateTime(right);

  const formatAgendaDate = (dateString, options = {}) => {
      const parsed = parseAgendaDate(dateString);
      if (!parsed) return 'Data nao definida';
      return parsed.toLocaleDateString('pt-BR', options);
  };

  const getAgendaDayOffset = (dateString) => {
      const parsed = parseAgendaDate(dateString);
      if (!parsed) return Number.POSITIVE_INFINITY;
      return Math.round((parsed - localTodayStart) / DAY_IN_MS);
  };

  const getAgendaRelativeLabel = (dateString) => {
      const dayOffset = getAgendaDayOffset(dateString);
      if (!Number.isFinite(dayOffset)) return 'Data não definida';

      if (dayOffset === 0) return 'Hoje';
      if (dayOffset === 1) return 'Amanha';
      if (dayOffset === -1) return 'Ontem';
      if (dayOffset > 1) return `Em ${dayOffset} dias`;
      return `${Math.abs(dayOffset)} dias atras`;
  };

  const getEventPriorityValue = (event) => event?.priority || 'normal';
  const getEventStatusValue = (event) => event?.status || (event?.date && event.date < localTodayStr ? 'concluido' : 'confirmado');

  const getEventTypeMeta = (type) => {
      if (type === 'Especialista') {
          return {
              label: 'Especialista',
              tone: 'border-purple-500/20 bg-purple-500/10 text-purple-200',
              accent: 'from-purple-500/25 via-fuchsia-500/10 to-transparent'
          };
      }

      if (type === 'Visita') {
          return {
              label: 'Visita Tecnica',
              tone: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
              accent: 'from-blue-500/25 via-cyan-500/10 to-transparent'
          };
      }

      if (type === 'Reunião') {
          return {
              label: 'Reuniao',
              tone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100',
              accent: 'from-yellow-500/25 via-amber-500/10 to-transparent'
          };
      }

      if (type === 'Treino') {
          return {
              label: 'Treino',
              tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
              accent: 'from-emerald-500/25 via-green-500/10 to-transparent'
          };
      }

      if (type === 'Prazo') {
          return {
              label: 'Prazo',
              tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100',
              accent: 'from-orange-500/25 via-red-500/10 to-transparent'
          };
      }

      if (type === 'Competição') {
          return {
              label: 'Competicao',
              tone: 'border-red-500/20 bg-red-500/10 text-red-100',
              accent: 'from-red-500/25 via-pink-500/10 to-transparent'
          };
      }

      return {
          label: type || 'Outro',
          tone: 'border-white/10 bg-white/5 text-gray-200',
          accent: 'from-white/15 via-white/5 to-transparent'
      };
  };

  const getEventPriorityMeta = (priority) => {
      if (priority === 'critica') {
          return { label: 'Critica', tone: 'border-red-500/20 bg-red-500/10 text-red-100' };
      }

      if (priority === 'alta') {
          return { label: 'Alta prioridade', tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100' };
      }

      return { label: 'Rotina', tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' };
  };

  const getEventStatusMeta = (status) => {
      if (status === 'planejado') {
          return { label: 'Planejado', tone: 'border-white/10 bg-white/5 text-gray-200' };
      }

      if (status === 'concluido') {
          return { label: 'Concluido', tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' };
      }

      return { label: 'Confirmado', tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200' };
  };

  const matchesAgendaScope = (event, scope) => {
      const dayOffset = getAgendaDayOffset(event.date);

      if (scope === 'urgent') return dayOffset >= 0 && dayOffset <= 1;
      if (scope === 'week') return dayOffset >= 0 && dayOffset <= 7;
      if (scope === 'upcoming') return dayOffset >= 0;
      if (scope === 'past') return dayOffset < 0;
      return true;
  };

  const getLogbookEntryWordCount = (entry) => {
      if (entry?.wordCount) return entry.wordCount;
      return (entry?.text || '').trim().split(/\s+/).filter(Boolean).length;
  };

  const getLogbookEntryPreview = (entry, maxLength = 200) => {
      const text = entry?.text?.trim() || '';
      if (text.length <= maxLength) return text;
      return `${text.slice(0, maxLength).trim()}...`;
  };

  const getLogbookEntryTags = (entry) => {
      if (Array.isArray(entry?.tags) && entry.tags.length > 0) return entry.tags;
      return Array.from(new Set(((entry?.text || '').match(/#[^\s#]+/g) || []).map((tag) => tag.toLowerCase())));
  };

  const buildLogbookWeekOptions = (entries) => {
      const options = sortLogbookEntries(entries).reduce((acc, entry) => {
          const value = String(entry.weekId ?? 'general');
          if (acc.some((option) => option.value === value)) return acc;

          acc.push({
              value,
              label: entry.weekName || `Semana ${entry.weekId || 'Geral'}`
          });
          return acc;
      }, []);

      if (currentWeekData && !options.some((option) => option.value === String(currentWeekData.id))) {
          options.unshift({ value: String(currentWeekData.id), label: currentWeekData.weekName || 'Semana atual' });
      }

      return [{ value: 'all', label: 'Todas as semanas' }, ...options];
  };

  const groupLogbookEntriesByWeek = (entries) => {
      const grouped = sortLogbookEntries(entries).reduce((acc, entry) => {
          const key = String(entry.weekId ?? 'general');

          if (!acc[key]) {
              acc[key] = {
                  key,
                  weekId: entry.weekId ?? 0,
                  weekName: entry.weekName || `Semana ${entry.weekId || 'Geral'}`,
                  entries: []
              };
          }

          acc[key].entries.push(entry);
          return acc;
      }, {});

      return Object.values(grouped).sort((left, right) => {
          if ((right.weekId || 0) !== (left.weekId || 0)) return (right.weekId || 0) - (left.weekId || 0);
          return getLogbookEntryDate(right.entries[0]) - getLogbookEntryDate(left.entries[0]);
      });
  };

  const eventsToday = events.filter(e => e.date === localTodayStr);
  const eventsTomorrow = events.filter(e => e.date === localTomorrowStr);
  const urgentEventsCount = eventsToday.length + eventsTomorrow.length;

  // --- LÓGICA DE NOTIFICAÇÕES DO KANBAN ---
  const urgentTasks = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate <= localTodayStr);
  const urgentTasksCount = urgentTasks.length;

  const renderUrgentEventsBanner = () => {
    const items = [...eventsToday.map((event) => ({ id: 'today-' + event.id, label: event.title, detail: 'Hoje' + (event.time ? ' \u00b7 ' + event.time : ''), tab: 'agenda' })),
      ...eventsTomorrow.map((event) => ({ id: 'tomorrow-' + event.id, label: event.title, detail: 'Amanh\u00e3', tab: 'agenda' })),
      ...urgentTasks.map((task) => ({ id: 'task-' + task.id, label: task.text, detail: 'Prazo da tarefa', tab: 'kanban' }))];
    if (!items.length) return null;
    return <details className="ng-attention-strip"><summary><AlertCircle size={17} /><span>{items.length} {items.length === 1 ? 'ponto de aten\u00e7\u00e3o' : 'pontos de aten\u00e7\u00e3o'} da equipe</span><ChevronDown size={15} /></summary>
      <div>{items.map((item) => <button type="button" key={item.id} onClick={() => isAdmin ? setAdminTab(item.tab) : setStudentTab(item.tab)}><span><strong>{item.label}</strong><small>{item.detail}</small></span><ChevronRight size={15} /></button>)}</div>
    </details>;
  };

  // --- NOVO: Sincroniza dados do aluno logado com o Firebase em tempo real ---


  useEffect(() => {
    if (currentUser?.type !== 'student' || !viewAsStudent?.id) return undefined;
    const timer = setInterval(() => showStudentXpLossNotice(viewAsStudent), XP_LOSS_ALERT_REPEAT_MS);
    return () => clearInterval(timer);
  }, [currentUser?.type, viewAsStudent, showStudentXpLossNotice]);

// --- FUNÇÃO DE CRONOGRAMA OFICIAL (12 ALUNOS) ---
  // Usamos useMemo para reconectar os dados assim que os alunos carregarem do Firebase

  const getAttendanceStats = (student) => studentAttendanceStats(student)

  const getNextLevel = (xp) => { const current = getCurrentLevel(xp); const next = LEVELS[LEVELS.indexOf(current) + 1]; return next ? next : null; }

 // 1. Sincronização com Firebase (Carrega os dados)
  useEffect(() => {
    if (!db || (FIREBASE_AUTH_ENABLED && !currentUser?.type && !isPublicMode && !isPublicTvMode && !isTvOnlyView)) return;

    // Função auxiliar para criar ouvintes seguros
    const createListener = (colName, setter, mapRecord = (record) => record) => {
        const source = collection(db, colName);
        const studentId = currentUser?.studentId || currentUser?.data?.id;
        const scoped = currentUser?.type === 'student' && studentId && ['xpLossRecords', 'leaderPenaltyRequests'].includes(colName) ? query(source, where(colName === 'xpLossRecords' ? 'studentId' : 'requestedByLeaderId', '==', studentId)) : source;
        return onSnapshot(scoped, (snapshot) => {
            const data = snapshot.docs.map((docSnap) => mapRecord(normalizeWorkspaceRecord(colName, { ...docSnap.data(), id: docSnap.id })));
            console.log(`✅ ${colName} carregados com sucesso:`, data.length);
            setter(SEASON_COLLECTIONS.includes(colName) && seasonLifecycleReady ? data.filter((record) => !record.seasonId || record.seasonId === activeTeamSeasonId) : data);
        }, (error) => {
            reportClientIssue(error, { area: colName });
            console.error(`❌ ERRO CRÍTICO em ${colName}:`, error);
            showNotification(`Erro de conexão: ${error.code}`, "error");
        });
    };

    const unsubStudents = createListener("students", (records) => {
      setStudents(records);
      if (currentUser?.type !== 'student') return;
      const identity = currentUser.studentId || currentUser.data?.id;
      if (records.some((student) => student.id === identity && student.status === 'inactive')) {
        setCurrentUser(null); setViewAsStudent(null); setIsAdmin(false); persistStoredUser(null);
        setLoginError('Seu cadastro foi arquivado. Pe\u00e7a ao t\u00e9cnico para reativ\u00e1-lo.');
        if (FIREBASE_AUTH_ENABLED) void signOut(auth).catch(() => {});
        return;
      }
      const fresh = resolveStudentFromStoredUser(currentUser, records.filter(isActiveStudent));
      if (fresh) { setViewAsStudent(fresh); showStudentXpLossNotice(fresh); }
    }, normalizeStudentRecord);

    const unsubXpLossRecords = currentUser?.type ? createListener("xpLossRecords", setXpLossRecords) : () => {};
    const unsubLeaderPenaltyRequests = currentUser?.type ? createListener("leaderPenaltyRequests", setLeaderPenaltyRequests) : () => {};
    const unsubGalleryPhotos = createListener("publicGalleryPhotos", setGalleryPhotos);
    

    // Listeners para as Rubricas
    const unsubInnovationRubric = onSnapshot(doc(db, "settings", "rubric_innovation"), (docSnap) => {
        if (docSnap.exists()) {
            setInnovationRubric(normalizeRubricValues(docSnap.data(), DEFAULT_INNOVATION_RUBRIC));
        }
    });
    const unsubRobotDesignRubric = onSnapshot(doc(db, "settings", "rubric_robot_design"), (docSnap) => {
        if (docSnap.exists()) {
            setRobotDesignRubric(normalizeRubricValues(docSnap.data(), DEFAULT_ROBOT_DESIGN_RUBRIC));
        }
    });
    
    const unsubAdminProfile = onSnapshot(doc(db, "settings", "admin_profile"), (docSnap) => {
        if (docSnap.exists()) {
            setAdminProfile(docSnap.data());
        }
    });

    const unsubTeamStats = onSnapshot(doc(db, "settings", "team_stats"), (docSnap) => {
        if (!docSnap.exists()) {
            setTeamSeasonStats({ successfulWeekIds: [], successfulWeeks: 0 });
            return;
        }

        const data = docSnap.data();
        const successfulWeekIds = Array.isArray(data.successfulWeekIds) ? data.successfulWeekIds.map(String) : [];

        setTeamSeasonStats({
            ...data,
            successfulWeekIds,
            successfulWeeks: Math.max(Number(data.successfulWeeks) || 0, successfulWeekIds.length)
        });
    });

    const unsubPublicShowcase = onSnapshot(doc(db, "settings", "public_showcase"), (docSnap) => {
        setShowcaseSettings(resolvePublicShowcaseSettings(docSnap.exists() ? docSnap.data() : {}));
    });

    const unsubWorkspaceSeason = onSnapshot(doc(db, "settings", "workspace_season"), (docSnap) => {
        const seasonData = docSnap.exists() ? docSnap.data() : {};
        const season = seasonData.activeSeason || 'final';
        setPlanningConfig(seasonData.planningConfig || null);
        setSeasonTransitionLock(seasonData.transitionLock || null);
        const normalizedSeason = season === 'rotation' ? 'rotation' : 'final';
        setWorkspaceSeason(normalizedSeason);
        browserStorage.setItem('newgears_workspace_season', normalizedSeason);
        const activeSeasonId = typeof seasonData.activeSeasonId === 'string' ? seasonData.activeSeasonId : null;
        const activeSeasonName = typeof seasonData.activeSeasonName === 'string' && seasonData.activeSeasonName.trim() ? seasonData.activeSeasonName : 'Temporada atual';
        setActiveTeamSeasonId(activeSeasonId);
        setActiveTeamSeasonName(activeSeasonName);
        setSeasonLifecycleReady(Boolean(seasonData.activeSeasonId));
        if (activeSeasonId) browserStorage.setItem('newgears_active_season_id', activeSeasonId);
        else browserStorage.removeItem('newgears_active_season_id');
        browserStorage.setItem('newgears_active_season_name', activeSeasonName);
        setWorkspaceSeasonLoaded(true);
    });
    // ... e não esqueça de adicionar no return para limpar:
    // return () => { ... unsubProject(); };
    
    return () => {
        unsubStudents();

        unsubXpLossRecords();
        unsubLeaderPenaltyRequests();
        unsubGalleryPhotos();
        unsubInnovationRubric();
        unsubRobotDesignRubric();
        unsubAdminProfile();
        unsubTeamStats();
        unsubPublicShowcase();
        unsubWorkspaceSeason();
    };
  }, [seasonLifecycleReady, activeTeamSeasonId, currentUser, isPublicMode, isPublicTvMode, isTvOnlyView, showStudentXpLossNotice, showNotification]);

  useEffect(() => {
    if (!db || currentUser?.type !== 'admin' || !isAdmin) return undefined;
    return onSnapshot(collection(db, 'teamSeasons'), (snapshot) => {
      setTeamSeasons(snapshot.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id })).sort((left, right) => String(right.closedAt || right.startedAt || '').localeCompare(String(left.closedAt || left.startedAt || ''))));
    }, (error) => console.error('Não foi possível carregar o histórico de temporadas:', error));
  }, [currentUser?.type, isAdmin]);

  useEffect(() => {
    if (!db || (FIREBASE_AUTH_ENABLED && !currentUser?.type) || isPublicMode || isPublicTvMode) return undefined;
    const listenToSeasonCollection = (collectionName, setter, normalize = (record) => record) => {
      const source = collection(db, collectionName);
      const sourceQuery = !['attendanceSessions', 'rotationApplications'].includes(collectionName) && seasonLifecycleReady && activeTeamSeasonId
        ? query(source, where('seasonId', '==', activeTeamSeasonId))
        : source;
      return onSnapshot(sourceQuery, (snapshot) => {
        setter(snapshot.docs.map((docSnap) => normalize({ ...docSnap.data(), id: docSnap.id })).filter((record) => !seasonLifecycleReady || !record.seasonId || record.seasonId === activeTeamSeasonId));
      }, (error) => {
        console.error(`Não foi possível carregar ${collectionName} da temporada:`, error);
        showNotification('Não foi possível carregar os dados da temporada ativa.', 'error');
      });
    };

    const unsubscribeTasks = listenToSeasonCollection('tasks', setTasks, normalizeTaskRecord);
    const unsubscribeEvents = listenToSeasonCollection('events', setEvents, normalizeEventRecord);
    const unsubscribeAttendance = listenToSeasonCollection('attendanceSessions', setAttendanceSessions);
    const unsubscribeRotations = listenToSeasonCollection('rotationApplications', setRotationApplications);
    return () => {
      unsubscribeTasks();
      unsubscribeEvents();
      unsubscribeAttendance();
      unsubscribeRotations();
    };
  }, [seasonLifecycleReady, activeTeamSeasonId, currentUser?.uid, currentUser?.type, isPublicMode, isPublicTvMode, isTvOnlyView, showNotification]);

  useEffect(() => {
    if (!db || !shouldLoadStrategyWorkspaceData || (FIREBASE_AUTH_ENABLED && !currentUser?.type && !isPublicMode && !isPublicTvMode && !isTvOnlyView)) return;

    const createListener = (colName, setter) => {
        const source = collection(db, colName);
        const studentId = currentUser?.studentId || currentUser?.data?.id;
        const scoped = currentUser?.type === 'student' && studentId && ['xpLossRecords', 'leaderPenaltyRequests'].includes(colName) ? query(source, where(colName === 'xpLossRecords' ? 'studentId' : 'requestedByLeaderId', '==', studentId)) : source;
        return onSnapshot(scoped, (snapshot) => {
            const data = snapshot.docs.map(doc => normalizeWorkspaceRecord(colName, { ...doc.data(), id: doc.id }));
            setter(SEASON_COLLECTIONS.includes(colName) && seasonLifecycleReady ? data.filter((record) => !record.seasonId || record.seasonId === activeTeamSeasonId) : data);
        }, (error) => {
            reportClientIssue(error, { area: colName });
            console.error(`Erro critico em ${colName}:`, error);
            showNotification(`Erro de conexao: ${error.code}`, "error");
        });
    };

    const unsubExperts = createListener("experts", setExperts);
    const unsubExpertContacts = createListener("expertContacts", setExpertContacts);
    const unsubMatrix = createListener("decisionMatrix", setDecisionMatrix);
    const unsubOutreach = createListener("outreach", setOutreachEvents);
    const unsubPrototypeIterations = createListener("prototypeIterations", setPrototypeIterations);

    let hasProjectMain = false;

    const unsubProjectMain = onSnapshot(doc(db, "project", PROJECT_MAIN_DOC_ID), (docSnap) => {
        hasProjectMain = docSnap.exists();

        if (docSnap.exists()) {
            setProjectSummary(resolveProjectSummary({
                mainSummary: { ...docSnap.data(), id: docSnap.id }
            }));
        }
    });

    const unsubProjectFallback = onSnapshot(collection(db, "project"), (snapshot) => {
        if (hasProjectMain) return;

        const legacySummaries = snapshot.docs
            .filter((docSnap) => docSnap.id !== PROJECT_MAIN_DOC_ID)
            .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }));

        setProjectSummary(resolveProjectSummary({ legacySummaries }));
    });

    return () => {
        unsubExperts();
        unsubExpertContacts();
        unsubMatrix();
        unsubOutreach();
        unsubPrototypeIterations();
        unsubProjectMain();
        unsubProjectFallback();
    };
  }, [shouldLoadStrategyWorkspaceData, seasonLifecycleReady, activeTeamSeasonId, currentUser?.uid, currentUser?.type, currentUser?.studentId, currentUser?.data?.id, isPublicMode, isPublicTvMode, isTvOnlyView, showNotification]);

  useEffect(() => {
    if (!db || !shouldLoadRobotWorkspaceData || (FIREBASE_AUTH_ENABLED && !currentUser?.type && !isPublicMode && !isPublicTvMode && !isTvOnlyView)) return;

    const createListener = (colName, setter) => {
        const source = collection(db, colName);
        const studentId = currentUser?.studentId || currentUser?.data?.id;
        const scoped = currentUser?.type === 'student' && studentId && ['xpLossRecords', 'leaderPenaltyRequests'].includes(colName) ? query(source, where(colName === 'xpLossRecords' ? 'studentId' : 'requestedByLeaderId', '==', studentId)) : source;
        return onSnapshot(scoped, (snapshot) => {
            const data = snapshot.docs.map(doc => normalizeWorkspaceRecord(colName, { ...doc.data(), id: doc.id }));
            setter(SEASON_COLLECTIONS.includes(colName) && seasonLifecycleReady ? data.filter((record) => !record.seasonId || record.seasonId === activeTeamSeasonId) : data);
        }, (error) => {
            reportClientIssue(error, { area: colName });
            console.error(`Erro critico em ${colName}:`, error);
            showNotification(`Erro de conexao: ${error.code}`, "error");
        });
    };

    const unsubRobot = createListener("robotVersions", setRobotVersions);
    const unsubAttachments = createListener("attachments", setAttachments);
    const unsubCodeSnippets = createListener("codeSnippets", setCodeSnippets);
    const unsubRounds = createListener("rounds", setRounds);
    const unsubScoreHistory = createListener("score_history", setScoreHistory);

    const unsubMissions = onSnapshot(collection(db, "missions"), (snapshot) => {
        setMissionsList(snapshot.docs.map(doc => normalizeWorkspaceRecord('missions', { ...doc.data(), id: doc.id })));
    });

    return () => {
        unsubRobot();
        unsubAttachments();
        unsubCodeSnippets();
        unsubRounds();
        unsubScoreHistory();
        unsubMissions();
    };
  }, [shouldLoadRobotWorkspaceData, seasonLifecycleReady, activeTeamSeasonId, currentUser?.uid, currentUser?.type, currentUser?.studentId, currentUser?.data?.id, isPublicMode, isPublicTvMode, isTvOnlyView, showNotification]);

  useEffect(() => {
    if (!db || !isLogbookViewActive) return;

    let unsubLogbook;

    if (isAdmin) {
        const logbookQuery = query(collectionGroup(db, 'logbook'));
        unsubLogbook = onSnapshot(logbookQuery, (snapshot) => {
            const entries = snapshot.docs.map(doc => normalizeWorkspaceRecord('logbook', { ...doc.data(), id: doc.id, refPath: doc.ref.path }));
            setLogbookEntries(entries.filter((entry) => !seasonLifecycleReady || !entry.seasonId || entry.seasonId === activeTeamSeasonId).sort((a, b) => (b.weekId || 0) - (a.weekId || 0)));
        });
    } else if (viewAsStudent?.id) {
        const logbookQuery = query(collection(db, 'students', viewAsStudent.id, 'logbook'));
        unsubLogbook = onSnapshot(logbookQuery, (snapshot) => {
            const entries = snapshot.docs.map(doc => normalizeWorkspaceRecord('logbook', { ...doc.data(), id: doc.id, refPath: doc.ref.path }));
            setLogbookEntries(entries.filter((entry) => !seasonLifecycleReady || !entry.seasonId || entry.seasonId === activeTeamSeasonId).sort((a, b) => (b.weekId || 0) - (a.weekId || 0)));
        });
    }

    return () => {
        if (unsubLogbook) unsubLogbook();
    };
  }, [isAdmin, isLogbookViewActive, viewAsStudent?.id, seasonLifecycleReady, activeTeamSeasonId]);

  useEffect(() => {
    if (!db || !isActivityHistoryActive) return;

    const historyQuery = query(collection(db, "activityLogs"), orderBy("createdAt", "desc"), limit(160));
    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
        setActivityLogs(snapshot.docs.map(docSnap => normalizeWorkspaceRecord('activityLogs', { ...docSnap.data(), id: docSnap.id })).filter((record) => !seasonLifecycleReady || !record.seasonId || record.seasonId === activeTeamSeasonId));
    }, (error) => {
        console.error("Erro ao carregar historico de alteracoes:", error);
    });

    return () => unsubscribe();
  }, [isActivityHistoryActive, seasonLifecycleReady, activeTeamSeasonId]);

  useEffect(() => {
    if (!db || currentUser?.type !== 'admin' || !isAdmin) return;
    const seasonId = activeTeamSeasonId || 'legacy';
    return onSnapshot(doc(db, 'finalSprintTournamentDrafts', tournamentDraftId(seasonId)), (snapshot) => {
      setTournamentDraftState({ seasonId, loading: false, error: false, record: snapshot.exists() ? snapshot.data() : null });
    }, () => {
      setTournamentDraftState({ seasonId, loading: false, error: true, record: null });
    });
  }, [currentUser?.type, isAdmin, activeTeamSeasonId, selectionRetry]);

  useEffect(() => {
    if (!db || !isPitStopModalOpen) return;

    const pitStopQuery = collection(db, "pitstop_records");
    const unsubPitStop = onSnapshot(pitStopQuery, (snapshot) => {
        setPitStopRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => {
        unsubPitStop();
    };
  }, [isPitStopModalOpen]);

  // --- LÓGICA DO CRONÔMETRO ---
  useEffect(() => {
    let interval;
    if (activeTimer) {
        interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((now - activeTimer.start) / 1000);
            setTimerDisplay(diff);
        }, 200);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const toggleTimer = (round) => {
    const isFullRoundTimer = round.id === FULL_ROUND_TIMER_ID;
    const targetField = isFullRoundTimer ? FULL_ROUND_TIME_KEY : round.id;

    if (activeTimer?.roundId === round.id) {
        // PARAR
        const preciseTime = Math.floor((Date.now() - activeTimer.start) / 1000);
        setRoundFormValues(prev => ({ ...prev, [targetField]: preciseTime }));
        setActiveTimer(null);
        setTimerDisplay(0);
    } else {
        // INICIAR
        setActiveTimer({ roundId: round.id, start: Date.now(), name: round.name });
        setTimerDisplay(0);
    }
  };


  // --- FIM DOS USE EFFECTS ---

  const handleSaveShowcaseSettings = async (nextSettings) => {
      const normalizedSettings = {
          ...resolvePublicShowcaseSettings(nextSettings),
          updatedAt: new Date().toISOString()
      };

      try {
          await setDoc(doc(db, "settings", "public_showcase"), normalizedSettings, { merge: true });
          setShowcaseSettings(normalizedSettings);
          void recordActivity({
              action: 'atualizou a vitrine publica',
              category: 'showcase',
              title: normalizedSettings.tournamentName,
              detail: 'Data do torneio e links publicos revisados.',
              entityId: 'public_showcase'
          });
          showNotification("Vitrine publica atualizada!", "success");
      } catch (error) {
          console.error("Erro ao salvar vitrine publica:", error);
          showNotification("Nao foi possivel salvar a vitrine.", "error");
          throw error;
      }
  };

  const handleAddGalleryPhoto = async ({ title, detail, date, image }) => {
      const photoData = {
          title: `${title || ''}`.trim(),
          detail: `${detail || ''}`.trim(),
          date,
          image,
          showInPublicGallery: true,
          isFeatured: false,
          displayOrder: galleryPhotos.length + robotVersions.length + attachments.length,
          createdAt: new Date().toISOString(),
          createdBy: adminProfile?.name || currentUser?.name || 'Equipe'
      };

      try {
          const photoRef = await addDoc(collection(db, "publicGalleryPhotos"), photoData);
          void recordActivity({
              action: 'adicionou uma foto na vitrine',
              category: 'showcase',
              title: photoData.title,
              detail: photoData.detail || 'Novo registro de treino.',
              entityId: photoRef.id
          });
          showNotification("Foto adicionada na galeria!", "success");
      } catch (error) {
          console.error("Erro ao adicionar foto na galeria:", error);
          showNotification("Nao foi possivel enviar a foto.", "error");
          throw error;
      }
  };

  const handleToggleGalleryPhoto = async (photo) => {
      const nextVisibility = !photo.isPublic;

      try {
          await updateDoc(doc(db, photo.sourceCollection, photo.sourceId), {
              showInPublicGallery: nextVisibility,
              ...(nextVisibility ? {} : { isFeatured: false })
          });
          void recordActivity({
              action: nextVisibility ? 'exibiu uma foto na vitrine' : 'ocultou uma foto da vitrine',
              category: 'showcase',
              title: photo.title,
              detail: photo.type,
              entityId: photo.sourceId
          });
          showNotification(nextVisibility ? "Foto exibida na vitrine!" : "Foto ocultada da vitrine.", "success");
      } catch (error) {
          console.error("Erro ao alterar visibilidade da foto:", error);
          showNotification("Nao foi possivel alterar a foto.", "error");
          throw error;
      }
  };

  const handleToggleFeaturedGalleryPhoto = async (photo) => {
      const nextFeatured = !photo.isFeatured;
      const featuredPhotos = [
          ...galleryPhotos.map((item) => ({ ...item, sourceCollection: 'publicGalleryPhotos' })),
          ...robotVersions.map((item) => ({ ...item, sourceCollection: 'robotVersions' })),
          ...attachments.map((item) => ({ ...item, sourceCollection: 'attachments' }))
      ].filter((item) => item.image && item.isFeatured && !(item.sourceCollection === photo.sourceCollection && item.id === photo.sourceId));

      try {
          await Promise.all([
              ...featuredPhotos.map((item) => updateDoc(doc(db, item.sourceCollection, item.id), { isFeatured: false })),
              updateDoc(doc(db, photo.sourceCollection, photo.sourceId), {
                  isFeatured: nextFeatured,
                  ...(nextFeatured ? { showInPublicGallery: true } : {})
              })
          ]);
          void recordActivity({
              action: nextFeatured ? 'marcou uma foto como destaque' : 'removeu o destaque de uma foto',
              category: 'showcase',
              title: photo.title,
              detail: photo.type,
              entityId: photo.sourceId
          });
          showNotification(nextFeatured ? "Foto marcada como destaque!" : "Destaque removido da foto.", "success");
      } catch (error) {
          console.error("Erro ao alterar destaque da foto:", error);
          showNotification("Nao foi possivel alterar o destaque.", "error");
          throw error;
      }
  };

  const persistGalleryPhotoOrder = async (nextPhotos, activity) => {
      const batch = writeBatch(db);
      nextPhotos.forEach((item, index) => {
          batch.update(doc(db, item.sourceCollection, item.sourceId), { displayOrder: index });
      });

      try {
          await batch.commit();
          void recordActivity({
              category: 'showcase',
              ...activity
          });
          showNotification("Ordem das fotos atualizada!", "success");
      } catch (error) {
          console.error("Erro ao reordenar fotos:", error);
          showNotification("Nao foi possivel reordenar as fotos.", "error");
          throw error;
      }
  };

  const getOrderedGalleryPhotos = () => buildTrainingGallery({
      galleryPhotos,
      robotVersions,
      attachments,
      includeHidden: true,
      prioritizeFeatured: false
  });

  const handleMoveGalleryPhoto = async (photo, direction) => {
      const orderedPhotos = getOrderedGalleryPhotos();
      const currentIndex = orderedPhotos.findIndex((item) => item.id === photo.id);
      const nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedPhotos.length) return;

      const nextPhotos = [...orderedPhotos];
      const [movedPhoto] = nextPhotos.splice(currentIndex, 1);
      nextPhotos.splice(nextIndex, 0, movedPhoto);

      await persistGalleryPhotoOrder(nextPhotos, {
          action: direction < 0 ? 'moveu uma foto para cima na vitrine' : 'moveu uma foto para baixo na vitrine',
          title: photo.title,
          detail: photo.type,
          entityId: photo.sourceId
      });
  };

  const handleReorderGalleryPhotos = async (sourcePhotoId, targetPhotoId) => {
      const orderedPhotos = getOrderedGalleryPhotos();
      const sourceIndex = orderedPhotos.findIndex((item) => item.id === sourcePhotoId);
      const targetIndex = orderedPhotos.findIndex((item) => item.id === targetPhotoId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;

      const nextPhotos = [...orderedPhotos];
      const [movedPhoto] = nextPhotos.splice(sourceIndex, 1);
      nextPhotos.splice(targetIndex, 0, movedPhoto);

      await persistGalleryPhotoOrder(nextPhotos, {
          action: 'reordenou fotos da vitrine por arraste',
          title: movedPhoto.title,
          detail: `${movedPhoto.type} movida para a posicao ${targetIndex + 1}.`,
          entityId: movedPhoto.sourceId
      });
  };

  const handleDeleteGalleryPhoto = async (photo) => {
      if (photo.sourceCollection !== 'publicGalleryPhotos') return;

      try {
          await deleteDoc(doc(db, "publicGalleryPhotos", photo.sourceId));
          void recordActivity({
              action: 'excluiu uma foto da vitrine',
              category: 'showcase',
              title: photo.title,
              detail: photo.type,
              entityId: photo.sourceId
          });
          showNotification("Foto excluida da galeria.", "success");
      } catch (error) {
          console.error("Erro ao excluir foto da galeria:", error);
          showNotification("Nao foi possivel excluir a foto.", "error");
          throw error;
      }
  };

  const handleTeamCheckInSubmit = async (level) => {
      if (!viewAsStudent || currentUser?.type !== 'student') return false;
      if (!effectivePlanning.trainingDays.includes(new Date().getDay())) {
          showNotification('Check-in liberado nos dias de treino configurados.', 'error');
          return false;
      }
      try {
          const result = await saveTeamCheckIn({ db, user: currentUser, studentId: viewAsStudent.id, level, date: getTodayMoodDate(), seasonId: activeTeamSeasonId || 'legacy' });
          celebrateGearContribution({ type: 'checkin', sourceId: result.sourceId, studentId: gearActorId, record: result.record });
          syncStudentLocally({ ...viewAsStudent, xp: result.xp });
          setShowBatteryModal(false);
          if (!result.duplicate) await recordXpOrigin({ student: viewAsStudent, amount: CHECK_IN_REWARD_XP, source: 'check_in', mode: 'reward', reason: 'Check-in da equipe' });
          showNotification(result.duplicate ? 'Seu check-in de hoje já estava registrado. Seus Gears foram conferidos.' : `Check-in registrado! +${CHECK_IN_REWARD_XP} XP. O Giro está confirmando seus Gears.`, 'success');
          return true;
      } catch (error) {
          console.error('Erro ao salvar check-in:', error);
          showNotification(error.message || 'Não foi possível salvar o check-in.', 'error');
          return false;
      }
  };

  const convertBase64 = (file) => readInlineMedia(file);
  const convertExpertContactEvidence = (file) => readInlineMedia(file, { allowPdf: true });

  // --- FUNÇÃO ESPECÍFICA PARA FOTO DE PERFIL (COM CROP) ---
  const handleProfilePicSelect = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const base64 = await convertBase64(file);
      if (!input.isConnected) return;
      setCropImgSrc(base64); setCropScale(1); setCropPos({ x: 0, y: 0 }); setIsCropping(true);
    } catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel abrir a foto.', 'error'); }
    finally { input.value = ''; }
  };

  // --- SALVAR O RECORTE ---
  const handleCropSave = () => {
      const canvas = document.createElement('canvas');
      const size = 200; // Tamanho padrão do avatar
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = cropImgSrc;
      img.onload = () => {
          // Preenche fundo (caso a imagem seja transparente)
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, size, size);
          
          // Desenha a imagem com as transformações do usuário
          ctx.drawImage(img, cropPos.x, cropPos.y, img.naturalWidth * cropScale, img.naturalHeight * cropScale);
          
          const resultBase64 = canvas.toDataURL('image/jpeg', 0.9);
          
          // Atualiza o modal de aluno com a nova imagem recortada
          setModal(prev => ({ ...prev, data: { ...prev.data, avatarImage: resultBase64 } }));
          
          setIsCropping(false);
          setCropImgSrc(null);
      };
  };

  // --- ACTIONS ---

  // --- FUNÇÕES DO KANBAN (TAREFAS) ---
  const createKanbanTask = async ({ text, dueDate = '', tag = 'geral', priority = 'normal', gearReward = 0, author, ...extraData }) => {
      if (!text) return;

      const resolvedAuthor = author || (isAdmin ? "Tecnico" : (viewAsStudent?.name || "Equipe"));

      const taskRef = doc(collection(db, "tasks"));
      const taskData = {
          text,
          seasonId: activeTeamSeasonId || 'legacy',
          status: 'todo',
          createdAt: new Date().toISOString(),
          author: resolvedAuthor,
          createdBy: isAdmin ? adminProfile?.name || 'Técnico' : viewAsStudent?.name || 'Equipe',
          createdById: currentUser?.uid || viewAsStudent?.id || '',
          participants: students.filter((student) => resolvedAuthor.split(',').map((name) => name.trim()).includes(student.name)).map((student) => ({ id: student.id, name: student.name })),
          dueDate,
          tag,
          priority,
          gearReward: isAdmin ? validateTaskGearReward(Number(gearReward)) : 0,
          ...extraData
      };
      await runTransaction(db, async (transaction) => {
        await assertActiveSeason(transaction, db, activeTeamSeasonId || 'legacy');
        transaction.set(taskRef, taskData);
      });
      void recordActivity({
          action: 'criou uma tarefa',
          category: 'kanban',
          title: text,
          detail: dueDate ? `Prazo: ${dueDate}` : 'Sem prazo definido',
          entityId: taskRef.id
      });
  };

  const handleAddTask = async ({ text, dueDate = '', tag = 'geral', priority = 'normal', gearReward = 0 }) => {
      const normalizedText = text.trim();
      if (!normalizedText) return false;

      try {
          await createKanbanTask({
              text: normalizedText,
              dueDate,
              tag,
              priority,
              gearReward,
          });
          return true;
      } catch (error) {
          console.error("Erro ao criar tarefa:", error);
          showNotification(error.message || 'Não foi possível criar a tarefa.', 'error');
          return false;
      }
  }

  const handleWeeklyLeaderTaskSubmit = async (event) => {
      event.preventDefault();
      if (!viewAsStudent?.id) return;

      const text = leaderTaskDraft.text.trim();
      if (!text) {
          showNotification("Descreva a tarefa que o lider vai abrir.", "error");
          return;
      }

      const assignedStudent = students.find((student) => student.id === leaderTaskDraft.studentId);
      const station = leaderTaskDraft.station || STATION_KEYS.MANAGEMENT;

      try {
          await createKanbanTask({
              text,
              dueDate: leaderTaskDraft.dueDate || currentWeekData?.endDate || localTodayStr,
              tag: getStationKanbanTag(station),
              priority: 'alta',
              author: assignedStudent?.name || "Equipe",
              createdByLeaderId: viewAsStudent.id,
              createdByLeaderName: viewAsStudent.name,
              leaderWeekId: String(currentWeekData?.id || ''),
              leaderWeekName: currentWeekData?.weekName || '',
              station
          });

          setLeaderTaskDraft(prev => ({ ...prev, text: '', studentId: '' }));
          showNotification("Tarefa criada pelo lider no Kanban!", "success");
      } catch (error) {
          console.error("Erro ao criar tarefa do lider:", error);
          showNotification("Erro ao criar tarefa.", "error");
      }
  }

  // --- FUNCOES DA LIDERANCA ---
  const handleWeeklyLeaderPenaltySubmit = async (event) => {
      event.preventDefault();

      if (!isWeeklyLeader || !viewAsStudent?.id) {
          showNotification("Apenas o lider da semana pode aplicar essa penalizacao.", "error");
          return;
      }

      const targetStudent = students.find((student) => student.id === leaderPenaltyDraft.studentId);
      const cleanReason = leaderPenaltyDraft.reason.trim();

      if (!targetStudent) {
          showNotification("Selecione o aluno penalizado.", "error");
          return;
      }

      if (targetStudent.id === viewAsStudent.id) {
          showNotification("O lider nao pode se penalizar por este painel.", "error");
          return;
      }

      if (!cleanReason) {
          showNotification("Escreva o motivo da penalizacao.", "error");
          return;
      }

      const now = new Date();
      const leaderWeekId = String(currentWeekData?.id || '');
      const leaderWeekName = currentWeekData?.weekName || '';
      let evidenceImage = '';
      let evidenceFileName = '';
      let evidenceMimeType = '';

      try {
          if (leaderPenaltyDraft.evidenceFile) {
              evidenceImage = await convertExpertContactEvidence(leaderPenaltyDraft.evidenceFile);
              evidenceFileName = leaderPenaltyDraft.evidenceFile.name || 'evidencia.jpg';
              evidenceMimeType = leaderPenaltyDraft.evidenceFile.type || 'image/jpeg';
          }

          await addDoc(collection(db, "leaderPenaltyRequests"), {
              seasonId: activeTeamSeasonId || 'legacy',
              studentId: targetStudent.id,
              studentName: targetStudent.name,
              amount: LEADER_PENALTY_XP,
              reason: cleanReason,
              evidenceImage,
              evidenceFileName,
              evidenceMimeType,
              status: 'pending',
              requestedAt: now.toISOString(),
              requestedByLeaderId: viewAsStudent.id,
              requestedByLeaderName: viewAsStudent.name,
              leaderWeekId,
              leaderWeekName
          });

          void recordActivity({
              action: 'solicitou penalidade da lideranca',
              category: 'team',
              title: `Revisao de ${LEADER_PENALTY_XP} XP para ${targetStudent.name}`,
              detail: `${leaderWeekName || 'Semana atual'} | ${cleanReason}${evidenceImage ? ' | com foto' : ''}`,
              entityId: targetStudent.id
          });

          setLeaderPenaltyDraft({ studentId: '', reason: '', evidenceFile: null });
          setLeaderPenaltyFileInputKey(prev => prev + 1);
          showNotification(`Pedido enviado ao tecnico. ${targetStudent.name} ainda nao perdeu XP.`, "success");
      } catch (error) {
          console.error("Erro ao solicitar penalizacao do lider:", error);
          showNotification(error.message || "Erro ao enviar penalizacao para revisao.", "error");
      }
  }

  const handleLeaderPenaltyReview = async (request, decision) => {
    if (!isAdmin || !request?.id) return;
    try {
      const approved = decision === 'approved';
      const result = await reviewLeaderPenalty({ db, user: currentUser, seasonId: activeTeamSeasonId || 'legacy', id: request.id, approved, actor: adminProfile?.name || currentUser.name });
      if (result.student) syncStudentLocally(result.student);
      void recordActivity({ action: approved ? 'aprovou penalidade' : 'rejeitou penalidade', category: 'team', title: request.studentName || 'Aluno', entityId: request.studentId });
      showNotification(approved ? 'Penalidade registrada com o XP atualizado.' : 'Solicita\u00e7\u00e3o rejeitada.');
    } catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel revisar a penalidade.', 'error'); }
  }

  // --- FUNÇÕES DA GARRA / ANEXO ---
  const handleAttachmentSubmit = async (e, { draftId } = {}) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const roundIds = [...new Set(fd.getAll('roundIds'))].filter((id) => rounds.some((round) => round.id === id));
      if (!roundIds.length) { showNotification('Selecione pelo menos uma saída para esta garra.', 'error'); return false; }
      
      let img = modal.data?.image || null; 
      if (selectedFile) img = await convertBase64(selectedFile); 
      
      const attachmentData = { 
          name: fd.get('name'), 
          roundIds,
          roundId: roundIds[0],
          date: fd.get('date'), 
          changes: fd.get('changes'), 
          image: img,
          author: modal.data?.author || viewAsStudent?.name || "Tecnico"
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "attachments", modal.data.id), attachmentData);
          } else {
              const attachmentRef = await saveNewContribution('attachment', attachmentData, draftId);
              celebrateGearContribution({ type: 'attachment', sourceId: attachmentRef.id, studentId: gearActorId, record: attachmentData });
          }
          void recordActivity({
              action: modal.data?.id ? 'atualizou um anexo do robo' : 'registrou um novo anexo do robo',
              category: 'robot',
              title: attachmentData.name,
              detail: attachmentData.changes,
              entityId: modal.data?.id || ''
          });
          closeModal(); 
          showNotification("Garra/Anexo salva com sucesso!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar anexo:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleDeleteAttachment = async (e, id) => {
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja excluir esta garra/anexo?")) {
          try {
              const attachment = attachments.find((item) => item.id === id);
              await deleteDoc(doc(db, "attachments", id));
              void recordActivity({
                  action: 'excluiu um anexo do robo',
                  category: 'robot',
                  title: attachment?.name || 'Anexo do robo',
                  entityId: id
              });
              showNotification("Garra excluida!");
          } catch (error) {
              console.error("Erro ao excluir anexo:", error);
              showNotification("Erro ao excluir anexo.", "error");
          }
      }
  };

  // --- FUNÇÕES DO COFRE DE CÓDIGOS ---
  const handleCodeSubmit = async (e, { draftId } = {}) => {
      e.preventDefault(); 
      const fd = new FormData(e.target); 
      const shouldSetAsOfficial = isAdmin && fd.get('setAsOfficial') === 'on';
      
      let img = modal.data?.image || null; 
      if (selectedFile) img = await convertBase64(selectedFile); 
      
      const codeData = { 
          title: fd.get('title'), 
          description: fd.get('description'), 
          date: modal.data?.date || new Date().toISOString().split('T')[0], 
          image: img,
          author: modal.data?.author || viewAsStudent?.name || "Tecnico"
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "codeSnippets", modal.data.id), codeData);

              if (shouldSetAsOfficial) {
                  await applyOfficialCode({ db, user: currentUser, seasonId: activeTeamSeasonId || 'legacy', id: modal.data.id, knownIds: codeSnippets.map((item) => item.id) });
              }
          } else {
              const newSnippetRef = await saveNewContribution('code', { ...codeData, applied: false }, draftId);

              celebrateGearContribution({ type: 'code', sourceId: newSnippetRef.id, studentId: gearActorId, record: codeData });

              if (shouldSetAsOfficial) {
                  await applyOfficialCode({ db, user: currentUser, seasonId: activeTeamSeasonId || 'legacy', id: newSnippetRef.id, knownIds: codeSnippets.map((item) => item.id) });
              }
          }
          void recordActivity({
              action: modal.data?.id ? 'atualizou uma programacao' : 'adicionou uma nova programacao',
              category: 'programming',
              title: codeData.title,
              detail: shouldSetAsOfficial ? 'Definida como programacao oficial da equipe.' : 'Salva no cofre de codigos.',
              entityId: modal.data?.id || ''
          });
          closeModal(); 
          showNotification(shouldSetAsOfficial ? "Codigo salvo e definido como oficial!" : "Codigo salvo no cofre!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar codigo:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleDeleteCode = async (e, id) => {
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja excluir este código?")) {
          try { 
              const snippet = codeSnippets.find((item) => item.id === id);
              await deleteDoc(doc(db, "codeSnippets", id)); 
              void recordActivity({
                  action: 'excluiu uma programacao',
                  category: 'programming',
                  title: snippet?.title || 'Programacao da equipe',
                  entityId: id
              });
              showNotification("Código excluído!"); 
          } catch (error) {
              console.error("Erro ao excluir código:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleApplyCodeSnippet = async (snippet) => {
    try {
      await applyOfficialCode({ db, user: currentUser, seasonId: activeTeamSeasonId || 'legacy', id: snippet.id, knownIds: codeSnippets.map((item) => item.id) });
      setCodeSnippets((previous) => previous.map((item) => ({ ...item, applied: item.id === snippet.id })));
      setModal((previous) => ({ ...previous, data: previous.data ? { ...previous.data, applied: true } : previous.data }));
      void recordActivity({ action: 'definiu a programa\u00e7\u00e3o oficial', category: 'programming', title: snippet.title, entityId: snippet.id });
      showNotification('Programa oficial atualizado.');
    } catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel aplicar o programa.', 'error'); }
  };

  const persistTaskStage = async (task, status, details = {}) => {
    const result = await changeTaskStage({ db, id: task.id, status, expectedStatus: task.status, expectedGearReward: task.gearReward || 0, isAdmin, actor: isAdmin ? adminProfile?.name || 'Técnico' : viewAsStudent?.name || 'Equipe', actorId: currentUser?.uid || (isAdmin ? currentUser?.name || 'tecnico' : viewAsStudent?.id || ''), seasonId: activeTeamSeasonId || 'legacy', details });
    void recordActivity({ action: 'atualizou uma tarefa', category: 'kanban', title: task.text, detail: 'Novo status: ' + status, entityId: task.id });
    showNotification(result?.rewardedStudents ? `Tarefa aprovada! ${result.coinsPerStudent} Gears para cada um dos ${result.rewardedStudents} participante(s).` : 'Etapa da tarefa atualizada.');
  };
  const moveTask = async (id, newStatus) => {
    const task = tasks.find((item) => item.id === id);
    if (!task || task.status === newStatus) return;
    if (!isAdmin && (newStatus === 'done' || task.status === 'review' || task.status === 'done')) { showNotification('Apenas o técnico pode aprovar, devolver ou reabrir tarefas revisadas.', 'error'); return; }
    if (newStatus === 'review' || (task.status === 'review' && (newStatus === 'doing' || (newStatus === 'done' && task.gearReward > 0 && !task.gearRewardPaidAt)))) { setModal({ type: 'taskTransition', data: { task, status: newStatus } }); return; }
    try { await persistTaskStage(task, newStatus); } catch (error) { showNotification(error.message, 'error'); }
  };

  const removeTask = async (id) => {
      if(window.confirm("Excluir tarefa permanentemente?")) {
          const task = tasks.find(t => t.id === id);
          await deleteDoc(doc(db, "tasks", id));
          void recordActivity({
              action: 'excluiu uma tarefa',
              category: 'kanban',
              title: task?.text || 'Tarefa da equipe',
              entityId: id
          });
      }
  }

  const handleTaskPeople = async (id, mode, person) => {
    try {
      await updateTaskPeople({ db, id, mode, person, students: allStudents, seasonId: activeTeamSeasonId || 'legacy', isAdmin });
      showNotification('Responsáveis atualizados. A autoria original foi preservada.');
    } catch (error) { showNotification(error.message, 'error'); }
  };
  const currentTaskPerson = () => viewAsStudent ? { id: viewAsStudent.id, name: viewAsStudent.name } : null;
  const takeoverTask = (id) => viewAsStudent && window.confirm('Assumir esta tarefa e substituir os participantes atuais?') && handleTaskPeople(id, 'takeover', currentTaskPerson());
  const joinTask = (id) => viewAsStudent && handleTaskPeople(id, 'join', currentTaskPerson());
  const leaveTask = (id) => viewAsStudent && handleTaskPeople(id, 'leave', currentTaskPerson());
  const assignTaskToStudent = (id, name) => {
    if (!isAdmin) return;
    const student = students.find((item) => item.name === name);
    return handleTaskPeople(id, 'assign', student ? { id: student.id, name: student.name } : null);
  };

  // --- FUNÇÃO PARA SALVAR DIÁRIO DE BORDO ---
  const handleLogbookSubmit = async (e, { draftId } = {}) => {
      e.preventDefault();
      const text = studentLogbookDraft.trim();
      // Se não tiver semana definida, pega a atual ou a 1
      const weekId = currentWeekData?.id || 1;
      const weekName = currentWeekData?.weekName || "Semana Inicial";

      if (!text || !viewAsStudent?.id) return; // Apenas alunos podem escrever

      try {
          // O caminho agora é uma subcoleção dentro do documento do aluno
          // The draft keeps a stable document ID through connection failures.
          
          // Usamos setDoc com um ID específico para evitar duplicatas na mesma semana?
          // Ou addDoc para permitir vários registros na semana?
          // Vamos usar addDoc para permitir vários insights na mesma semana.
          
          const tags = Array.from(new Set((text.match(/#[^\s#]+/g) || []).map((tag) => tag.toLowerCase())));
          const wordCount = text.split(/\s+/).filter(Boolean).length;

          const newEntry = {
              seasonId: activeTeamSeasonId || 'legacy',
              studentId: viewAsStudent.id,
              // Ainda salvamos o nome para a visualização consolidada do técnico
              studentName: viewAsStudent.name, 
              text: text,
              weekId: weekId,       // Para ordenar
              weekName: weekName,   // Para exibir bonitinho
              date: new Date().toISOString(),
              tags,
              wordCount
          };

          const entryRef = await createDraftRecord({ db, path: ['students', viewAsStudent.id, 'logbook'], data: newEntry, draftId });
          celebrateGearContribution({ type: 'logbook', sourceId: entryRef.id, studentId: gearActorId, record: newEntry });
          void recordActivity({
              action: 'registrou uma entrada no diario',
              category: 'team',
              title: weekName,
              detail: getLogbookEntryPreview(newEntry, 120)
          });

          setStudentLogbookDraft('');
          showNotification("Diário de Bordo atualizado! 📖");
          return true;
      } catch (error) {
          console.error("Erro ao salvar diário:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  // --- FUNÇÃO PARA EXCLUIR REGISTRO DO DIÁRIO ---
  const handleDeleteLogbookEntry = async (entry) => {
      if (!window.confirm("Tem certeza que deseja apagar este registro?")) return;

      try {
          // Se temos o caminho completo (refPath), usamos ele. 
          // Senão (caso antigo), tentamos montar o caminho se soubermos o ID do aluno.
          const path = entry.refPath || `students/${viewAsStudent?.id}/logbook/${entry.id}`;
          await deleteDoc(doc(db, path));
          showNotification("Registro apagado.");
      } catch (error) {
          console.error("Erro ao apagar registro:", error);
          showNotification("Erro ao apagar.", "error");
      }
  }

 // 2. A função de excluir:
const handleDeleteStudent = async (studentId) => {
    if (!isAdmin) return;
    const student = allStudents.find((item) => item.id === studentId);
    if (!student) return;
    const inactive = student.status === 'inactive';
    if (!window.confirm((inactive ? 'Reativar ' : 'Arquivar ') + student.name + '? Seu histórico será preservado.')) return;
    try {
      await updateDoc(doc(db, 'students', studentId), { status: inactive ? 'active' : 'inactive', archivedAt: inactive ? null : new Date().toISOString(), archivedBy: inactive ? null : adminProfile?.name || 'Técnico' });
      void recordActivity({ action: inactive ? 'reativou um integrante' : 'arquivou um integrante', category: 'team', title: student.name, entityId: studentId });
      showNotification(inactive ? 'Aluno reativado. Inclua-o no planejamento quando desejar.' : 'Aluno arquivado com histórico preservado.');
    } catch (error) { showNotification(error.message, 'error'); }
};

const handleDeleteRound = async (id) => {
    if (!window.confirm('Excluir esta sa\u00edda? O hist\u00f3rico dos treinos ser\u00e1 preservado.')) return;
    try { await deleteRobotRound({ db, user: currentUser, seasonId: activeTeamSeasonId || 'legacy', id }); showNotification('Sa\u00edda exclu\u00edda. Hist\u00f3rico preservado.'); }
    catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel excluir a sa\u00edda.', 'error'); }
  };
  
  // --- FUNÇÕES DE EXCLUSÃO (MATRIZ, ESPECIALISTAS, ROBÔ) ---
  const handleDeleteMatrix = async (id) => {
      if (window.confirm("Tem certeza que deseja excluir esta ideia da matriz?")) {
          try {
              await deleteDoc(doc(db, "decisionMatrix", id));
              showNotification("Ideia excluída com sucesso!");
          } catch (error) {
              console.error("Erro ao excluir ideia:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleDeleteExpert = async (e, id) => {
      e.stopPropagation(); // Evita abrir o modal de visualização ao clicar na lixeira
      if (window.confirm("Tem certeza que deseja excluir este especialista?")) {
          try {
              await deleteDoc(doc(db, "experts", id));
              showNotification("Especialista excluído!");
          } catch (error) {
              console.error("Erro ao excluir especialista:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleDeleteExpertContact = async (id) => {
      if (!window.confirm("Tem certeza que deseja excluir este contato realizado?")) return;

      try {
          const expertContact = expertContacts.find((item) => item.id === id);
          await deleteDoc(doc(db, "expertContacts", id));
          void recordActivity({
              action: 'excluiu um contato de prospeccao',
              category: 'team',
              title: expertContact?.name || 'Contato com especialista',
              detail: expertContact?.channel || '',
              entityId: id
          });
          showNotification("Contato excluido.");
      } catch (error) {
          console.error("Erro ao excluir contato:", error);
          showNotification("Erro ao excluir contato.", "error");
      }
  };

  const handleDeleteRobotVersion = async (e, id) => {
      e.stopPropagation(); // Evita abrir o modal de visualização
      if (window.confirm("Tem certeza que deseja excluir esta versão do robô?")) {
          try {
              const robotVersion = robotVersions.find((item) => item.id === id);
              await deleteDoc(doc(db, "robotVersions", id));
              void recordActivity({
                  action: 'excluiu uma versao do robo',
                  category: 'robot',
                  title: robotVersion?.version || 'Versao do robo',
                  entityId: id
              });
              showNotification("Versão do robô excluída!");
          } catch (error) {
              console.error("Erro ao excluir versão:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleDeleteMission = async (id) => {
      if (window.confirm("Tem certeza que deseja excluir esta missão? Ela será removida permanentemente do banco de dados.")) {
          try {
              const mission = missionsList.find((item) => item.id === id);
              await deleteDoc(doc(db, "missions", id));
              void recordActivity({
                  action: 'excluiu uma missao da mesa',
                  category: 'robot',
                  title: mission ? `${mission.code} - ${mission.name}` : 'Missao da mesa',
                  entityId: id
              });
              showNotification("Missão excluída com sucesso!");
              // Se estava editando essa mesma missão, limpa o formulário
              if (modal.data?.id === id) {
                  setModal({ type: 'missionForm', data: null });
                  setSelectedFile(null);
              }
          } catch (error) {
              console.error("Erro ao excluir missão:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  // --- FUNÇÃO CORRIGIDA COM LOGS ---
  const handleRegisterSubmit = async (e) => { 
      e.preventDefault(); 
      const fd = new FormData(e.target); 
      
      // Verifica se estamos editando ou criando
      const isEditing = modal.data?.id;

      // A imagem agora já vem processada e redimensionada pelo Crop e está em modal.data.avatarImage
      const avatarImage = modal.data?.avatarImage || null;

      // Cria o objeto de dados do aluno
      const studentData = { 
          name: fd.get('name'), 
          turma: fd.get('turma'), 
          specialty: (fd.get('specialty') || '').toString().trim(),
          username: fd.get('username'), 
          password: fd.get('password'), 
          avatarImage: avatarImage, // Novo campo para a foto
          // Mantém os outros campos se estiver editando
          ...(!isEditing ? { status: 'active', xp: 0, totalClasses: 0, attendedClasses: 0, station: null, submission: null, badges: [], englishChallengeUnlocked: false, joinedAt: new Date().toISOString() } : {}),

      };

      try {
          if (isEditing) {
              // Atualiza aluno existente
              const studentRef = doc(db, "students", modal.data.id);
              await updateDoc(studentRef, studentData);
              showNotification("Dados do aluno atualizados!");
          } else {
              // Cria novo aluno
              await addDoc(collection(db, "students"), studentData);
              showNotification("Aluno cadastrado com acesso!"); 
          }
          void recordActivity({
              action: isEditing ? 'atualizou o perfil de um integrante' : 'cadastrou um novo integrante',
              category: 'team',
              title: studentData.name,
              detail: studentData.specialty || 'Perfil da equipe atualizado.',
              entityId: modal.data?.id || ''
          });
          
          closeModal(); 
      } catch (error) {
          console.error("Erro ao salvar aluno:", error);
          showNotification("Erro ao salvar. Veja o console (F12).", "error");
      }
  }

  // --- NOVO: SALVAR PROJETO DE INOVAÇÃO ---
  const handleProjectSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      // Processa a imagem
      let img = projectSummary?.image || null;
      if (selectedFile) img = await convertBase64(selectedFile);

      const projectData = {
          title: fd.get('title'),
          problem: fd.get('problem'),
          solution: fd.get('solution'),
          impact: fd.get('impact'), // Novo campo importante
          sharing: fd.get('sharing'),
          image: img
      };

      try {
          await setDoc(doc(db, "project", PROJECT_MAIN_DOC_ID), projectData, { merge: true });
          setProjectSummary({ ...projectData, id: PROJECT_MAIN_DOC_ID });
          void recordActivity({
              action: 'atualizou o projeto de inovacao',
              category: 'team',
              title: projectData.title,
              detail: projectData.solution,
              entityId: PROJECT_MAIN_DOC_ID
          });
          closeModal();
          showNotification("Projeto de Inovacao atualizado!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar projeto:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  // --- FUNÇÕES DE OUTREACH (IMPACTO) ---
  const handleOutreachSubmit = async (e, { draftId } = {}) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      const outreachData = {
              seasonId: activeTeamSeasonId || 'legacy',
          name: fd.get('name'),
          type: fd.get('type'),
          people: parseInt(fd.get('people')),
          date: fd.get('date'),
          feedback: fd.get('feedback')
      };

      try {
          const outreachRef = await saveNewContribution('outreach', outreachData, draftId);
          celebrateGearContribution({ type: 'outreach', sourceId: outreachRef.id, studentId: gearActorId, record: outreachData });
          void recordActivity({
              action: 'registrou uma acao de impacto',
              category: 'team',
              title: outreachData.name,
              detail: `${outreachData.people || 0} pessoas alcancadas`,
              entityId: outreachRef.id
          });
          closeModal();
          showNotification("Evento de impacto registrado!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar impacto:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleDeleteOutreach = async (id) => {
      if (window.confirm("Tem certeza que deseja excluir este registro de impacto?")) {
          try {
              await deleteDoc(doc(db, "outreach", id));
              showNotification("Registro excluído com sucesso!");
          } catch (error) {
              console.error("Erro ao excluir impacto:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  }

  const handleAttendanceSave = async (draft) => {
    if (!isAdmin) throw new Error('Apenas o técnico pode salvar a chamada.');
    await saveAttendance({ db, seasonId: activeTeamSeasonId || 'legacy', ...draft, actor: adminProfile?.name || 'Técnico' });
    void recordActivity({ action: 'registrou ou corrigiu a chamada', category: 'team', title: draft.date, entityId: draft.date });
    showNotification('Chamada salva. Frequência atualizada em conjunto.');
  };

  const handleExpertSubmit = async (e, { draftId } = {}) => {
      e.preventDefault(); 
      const fd = new FormData(e.target);
      
      // Processa a imagem (se houver)
      let img = modal.data?.image || null; 
      if (selectedFile) img = await convertBase64(selectedFile); 
      
      const expertData = { 
          name: fd.get('name'), 
          role: fd.get('role'), 
          date: fd.get('date'), 
          impact: fd.get('impact'), 
          notes: fd.get('notes'), 
          applied: fd.get('applied') === 'on', 
          image: img 
      };

      try {
          if (modal.data?.id) {
              // Se já tem ID, atualiza (Editar)
              await updateDoc(doc(db, "experts", modal.data.id), expertData);
          } else {
              // Se não tem ID, cria novo (Salvar)
              const expertRef = await saveNewContribution('expert', expertData, draftId);
              celebrateGearContribution({ type: 'expert', sourceId: expertRef.id, studentId: gearActorId, record: expertData });
          }
          void recordActivity({
              action: modal.data?.id ? 'atualizou um especialista' : 'registrou um especialista',
              category: 'team',
              title: expertData.name,
              detail: expertData.role,
              entityId: modal.data?.id || ''
          });
          closeModal(); 
          showNotification("Especialista salvo no banco!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar especialista:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleExpertContactSubmit = async (e, { draftId } = {}) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const isEditing = Boolean(modal.data?.id);

      try {
          let evidence = modal.data?.evidence || null;
          let evidenceName = modal.data?.evidenceName || '';
          let evidenceType = modal.data?.evidenceType || '';

          if (selectedFile) {
              evidence = await convertExpertContactEvidence(selectedFile);
              evidenceName = selectedFile.name;
              evidenceType = evidence.startsWith('data:image/jpeg') ? 'image/jpeg' : (selectedFile.type || 'application/octet-stream');
          }

          const expertContactData = {
              seasonId: activeTeamSeasonId || 'legacy',
              name: `${fd.get('name') || ''}`.trim(),
              role: `${fd.get('role') || ''}`.trim(),
              channel: `${fd.get('channel') || ''}`.trim(),
              contactDetail: `${fd.get('contactDetail') || ''}`.trim(),
              date: fd.get('date'),
              status: `${fd.get('status') || 'sent'}`,
              notes: `${fd.get('notes') || ''}`.trim(),
              evidence,
              evidenceName,
              evidenceType,
              author: modal.data?.author || viewAsStudent?.name || adminProfile?.name || currentUser?.name || 'Equipe',
              createdAt: modal.data?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
          };

          let entityId = modal.data?.id || '';
          if (isEditing) {
              await updateDoc(doc(db, "expertContacts", modal.data.id), expertContactData);
          } else {
              const contactRef = await saveNewContribution('contact', expertContactData, draftId);
              celebrateGearContribution({ type: 'contact', sourceId: contactRef.id, studentId: gearActorId, record: expertContactData });
              entityId = contactRef.id;
          }
          void recordActivity({
              action: isEditing ? 'atualizou um contato de prospeccao' : 'registrou um contato de prospeccao',
              category: 'team',
              title: expertContactData.name,
              detail: `${expertContactData.channel} | ${expertContactData.status}`,
              entityId
          });
          closeModal();
          showNotification("Contato de prospeccao salvo!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar contato:", error);
          showNotification(error.message || "Erro ao salvar contato.", "error");
      }
  };

  const handleRobotSubmit = async (e, { draftId } = {}) => {
      e.preventDefault(); 
      const fd = new FormData(e.target); 
      
      let img = modal.data?.image || null; 
      if (selectedFile) img = await convertBase64(selectedFile); 
      
      const robotData = { 
          version: fd.get('version'), 
          name: fd.get('name'), 
          date: fd.get('date'), 
          changes: fd.get('changes'), 
          image: img 
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "robotVersions", modal.data.id), robotData);
          } else {
              const robotRef = await saveNewContribution('robot', robotData, draftId);
              celebrateGearContribution({ type: 'robot', sourceId: robotRef.id, studentId: gearActorId, record: robotData });
          }
          void recordActivity({
              action: modal.data?.id ? 'atualizou uma versao do robo' : 'registrou uma versao do robo',
              category: 'robot',
              title: `${robotData.version}${robotData.name ? ` - ${robotData.name}` : ''}`,
              detail: robotData.changes,
              entityId: modal.data?.id || ''
          });
          closeModal(); 
          showNotification("Versão do robô salva!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar robô:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleRoundSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const selectedMissions = Array.from(fd.getAll('missions'));
      
      // Calcula pontos somando as missões selecionadas
      const totalPoints = selectedMissions.reduce((acc, mid) => 
          acc + (missionsList.find(m => m.id === mid)?.points || 0), 0);

      const roundData = {
          name: fd.get('name'),
          startBase: fd.get('startBase'), // <--- SALVA A BASE ESCOLHIDA
          missions: selectedMissions,
          totalPoints
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "rounds", modal.data.id), roundData);
              showNotification("Saida atualizada!");
          } else {
              await addDoc(collection(db, "rounds"), roundData);
              showNotification("Saida salva!");
          }
          void recordActivity({
              action: modal.data?.id ? 'atualizou uma saida do robo' : 'planejou uma nova saida do robo',
              category: 'robot',
              title: roundData.name,
              detail: `${roundData.totalPoints} pontos planejados`,
              entityId: modal.data?.id || ''
          });
          closeModal();
      } catch (error) {
          console.error("Erro ao salvar round:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleMissionSubmit = async (e, { draftId } = {}) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      let img = modal.data?.image || null;
      if (selectedFile) img = await convertBase64(selectedFile);

      const missionData = {
          code: fd.get('code'),
          name: fd.get('name'),
          points: parseInt(fd.get('points')),
          image: img
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "missions", modal.data.id), missionData);
          } else {
              await createDraftRecord({ db, path: ['missions'], data: missionData, draftId });
          }
          void recordActivity({
              action: modal.data?.id ? 'atualizou uma missao da mesa' : 'cadastrou uma missao da mesa',
              category: 'robot',
              title: `${missionData.code} - ${missionData.name}`,
              detail: `${missionData.points} pontos`,
              entityId: modal.data?.id || ''
          });
          // Após salvar, não fecha o modal: apenas limpa para que você possa adicionar/ver outras
          setModal({ type: 'missionForm', data: null });
          setSelectedFile(null);
          showNotification("Missão salva!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar missão:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleGradesSubmit = async (event) => {
    event.preventDefault();
    if (currentUser?.type !== 'admin') return;
    const student = modal.data.student; const stageId = modal.data.stageId || 'etapa1';
    const fields = new FormData(event.target); const grades = {};
    for (const subject of SCHOOL_REPORT_SUBJECTS) {
      const raw = String(fields.get('grade_' + subject) ?? '').trim();
      if (!raw) continue;
      const value = parseSchoolGrade(raw);
      if (value === null) { showNotification('Confira as notas: use valores de 0 a 10.', 'error'); return; }
      grades[subject] = value;
    }
    try {
      const result = await saveSchoolGrades({ db, user: currentUser, actor: adminProfile?.name || currentUser.name, studentId: student.id, seasonId: activeTeamSeasonId || 'legacy', stageId, grades, expectedGrades: getSchoolStageRecord(student, stageId)?.grades || {} });
      syncStudentLocally(result.student); closeModal(); showNotification('Notas salvas e XP atualizado.');
    } catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel salvar as notas.', 'error'); }
  }

  const handleMatrixSubmit = async (e, { draftId } = {}) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      const ideaData = {
              seasonId: activeTeamSeasonId || 'legacy',
          name: fd.get('name'),
          impact: parseInt(fd.get('impact')),
          cost: parseInt(fd.get('cost')),
          feasibility: parseInt(fd.get('feasibility')),
          innovation: parseInt(fd.get('innovation'))
      };

      try {
          const ideaRef = await createDraftRecord({ db, path: ['decisionMatrix'], data: ideaData, draftId });
          void recordActivity({
              action: 'adicionou uma ideia na matriz',
              category: 'team',
              title: ideaData.name,
              detail: `Impacto ${ideaData.impact} | Viabilidade ${ideaData.feasibility}`,
              entityId: ideaRef.id
          });
          closeModal(); 
          showNotification("Ideia salva na matriz!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar ideia:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  // --- FUNÇÕES DA AGENDA ---
  const handleEventSubmit = async (e, { draftId } = {}) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const eventData = {
          seasonId: activeTeamSeasonId || 'legacy',
          title: fd.get('title'),
          date: fd.get('date'),
          time: fd.get('time'),
          type: fd.get('type'),
          priority: fd.get('priority') || 'normal',
          status: fd.get('status') || 'confirmado',
          location: fd.get('location'),
          description: fd.get('description'),
          author: modal.data?.author || viewAsStudent?.name || "Técnico"
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "events", modal.data.id), eventData);
          } else {
              await createDraftRecord({ db, path: ['events'], data: eventData, draftId });
          }
          void recordActivity({
              action: modal.data?.id ? 'atualizou um evento da agenda' : 'criou um evento na agenda',
              category: 'agenda',
              title: eventData.title,
              detail: `${eventData.date} as ${eventData.time}${eventData.location ? ` | ${eventData.location}` : ''}`,
              entityId: modal.data?.id || ''
          });
          closeModal();
          showNotification("Evento salvo na agenda!");
          return true;
      } catch (error) {
          console.error("Erro ao salvar evento:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleDeleteEvent = async (id) => {
      if(window.confirm("Deseja excluir este evento da agenda?")) {
          try {
              const event = events.find((item) => item.id === id);
              await deleteDoc(doc(db, "events", id));
              void recordActivity({
                  action: 'excluiu um evento da agenda',
                  category: 'agenda',
                  title: event?.title || 'Evento da equipe',
                  entityId: id
              });
              showNotification("Evento excluído.");
          } catch(error) {
              console.error("Erro ao excluir evento:", error);
          }
      }
  }

  const handleCycleEventStatus = async (event) => {
      if (!event?.id) return;

      const currentStatus = getEventStatusValue(event);
      const nextStatus = currentStatus === 'planejado'
          ? 'confirmado'
          : currentStatus === 'confirmado'
              ? 'concluido'
              : 'planejado';

      try {
          await updateDoc(doc(db, "events", event.id), { status: nextStatus });
          void recordActivity({
              action: 'alterou o status de um evento',
              category: 'agenda',
              title: event.title,
              detail: `Novo status: ${getEventStatusMeta(nextStatus).label}`,
              entityId: event.id
          });
          showNotification(`Evento atualizado para ${getEventStatusMeta(nextStatus).label.toLowerCase()}.`, nextStatus === 'concluido' ? 'success' : undefined);
      } catch (error) {
          console.error("Erro ao atualizar status do evento:", error);
          showNotification("Erro ao atualizar evento.", "error");
      }
  }

  // --- FUNÇÃO PARA APLICAR O RODÍZIO AUTOMATICAMENTE ---
  const handleApplyRotation = async () => {
    if (!isAdmin || !currentWeekData || isProcessingRotation) return;
    if (!window.confirm('Aplicar ' + currentWeekData.weekName + '? As entregas atuais serão preservadas.')) return;
    setIsProcessingRotation(true);
    try {
      await applyRotation({ db, seasonId: activeTeamSeasonId || 'legacy', week: currentWeekData, actor: adminProfile?.name || 'Técnico' });
      void recordActivity({ action: 'aplicou o rodízio semanal', category: 'team', title: currentWeekData.weekName });
      showNotification('Rodízio aplicado. Entregas preservadas.');
    } catch (error) { showNotification(error.message, 'error'); }
    finally { setIsProcessingRotation(false); }
  };
  const handleUndoRotation = async (application) => {
    if (!isAdmin || isProcessingRotation || !window.confirm('Restaurar as estações anteriores a esta aplicação?')) return;
    setIsProcessingRotation(true);
    try {
      await undoRotation({ db, applicationId: application.id, seasonId: activeTeamSeasonId || 'legacy', actor: adminProfile?.name || 'Técnico' });
      void recordActivity({ action: 'desfez uma aplicação do rodízio', category: 'team', title: application.weekName });
      showNotification('Distribuição anterior restaurada.');
    } catch (error) { showNotification(error.message, 'error'); }
    finally { setIsProcessingRotation(false); }
  };
  const handleSavePlanning = async (draft) => {
    if (!isAdmin || isSavingPlanning) return;
    setIsSavingPlanning(true);
    try {
      const config = validatePlanning(draft, students);
      await runTransaction(db, async (transaction) => {
        await assertActiveSeason(transaction, db, activeTeamSeasonId || 'legacy');
        transaction.set(doc(db, 'settings', 'workspace_season'), { planningConfig: config }, { merge: true });
      });
      setPlanningConfig(config);
      showNotification('Planejamento da temporada salvo.');
    } catch (error) { showNotification(error.message, 'error'); }
    finally { setIsSavingPlanning(false); }
  };

  // --- SALVAR PERFIL DO TECNICO ---
  const handleAdminProfileSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newPassword = fd.get('password');
      
      const dataToSave = {
          name: fd.get('name') || 'Tecnico',
          avatarImage: modal.data?.avatarImage || null,
          specialty: (fd.get('specialty') || '').toString().trim()
      };

      // Se digitou uma senha nova, envia pro banco
      if (newPassword && newPassword.trim() !== '') {
          dataToSave.password = newPassword.trim();
      }

      try {
          await setDoc(doc(db, "settings", "admin_profile"), dataToSave, { merge: true });
          closeModal();
          showNotification("Perfil do técnico atualizado com sucesso!");
      } catch (error) {
          console.error("Erro ao salvar perfil do técnico:", error);
          showNotification("Erro ao salvar perfil.", "error");
      }
  };


  // --- MODAIS ---

  const openNewStudentModal = (data = null) => { setSelectedFile(null); setModal({ type: 'newStudent', data }); }

  const openExpertModal = (data = null) => { setSelectedFile(null); setModal({ type: 'expertForm', data }); }
  const openExpertContactModal = (data = null) => { setSelectedFile(null); setModal({ type: 'expertContactForm', data }); };

  const openRobotModal = (data = null) => { setSelectedFile(null); setModal({ type: 'robotForm', data }); }
  const openAttachmentModal = (data = null) => { setSelectedFile(null); setModal({ type: 'attachmentForm', data }); } // <--- NOVO
  const openCodeModal = (data = null) => { setSelectedFile(null); setModal({ type: 'codeForm', data }); } // <--- NOVO

  const openNewRoundModal = () => setModal({ type: 'newRound' });
  const openEditRoundModal = (data) => setModal({ type: 'newRound', data });

  const openAttendanceModal = () => setModal({ type: 'attendance' });

  const openImageModal = (imgUrl) => setModal({ type: 'imageView', data: imgUrl });

  const openExpertView = (data) => setModal({ type: 'expertView', data });

  const openRobotView = (data) => setModal({ type: 'robotView', data });
  const openAttachmentView = (data) => setModal({ type: 'attachmentView', data }); // <--- NOVO
  const openCodeView = (data) => setModal({ type: 'codeView', data }); // <--- NOVO

  const openGradesModal = (student, stageId = 'etapa1') => setModal({ type: 'grades', data: { student, stageId } });

  const openProfileModal = (student) => setModal({ type: 'profile', data: student });
  const openPitStopModal = () => setModal({ type: 'pitstop' }); // <--- NOVO MODAL

  // Novos Modais

  const openMissionForm = (data = null) => { setSelectedFile(null); setModal({ type: 'missionForm', data }); }

  const openMatrixForm = () => setModal({ type: 'matrixForm' });
  const openOutreachForm = () => { setSelectedFile(null); setModal({ type: 'outreachForm' }); }


  const activeCommandCode = codeSnippets.find(code => code.applied);
  const isOfficialProgramBadgeOpen = localTodayObj.getMonth() >= 7;
  const totalImpactPeople = outreachEvents.reduce((sum, ev) => sum + (ev.people || 0), 0);
  const totalRoundTime = rounds.reduce((sum, round) => sum + (round.estimatedTime || 0), 0);
  const appliedExpertsCount = experts.filter(exp => exp.applied).length;
  const iterationRecords = robotVersions.length + attachments.length;
  const projectStoryFields = ['title', 'problem', 'solution', 'impact'].filter((field) => `${projectSummary?.[field] || ''}`.trim()).length;
  const innovationAverage = Object.values(normalizeRubricValues(innovationRubric, DEFAULT_INNOVATION_RUBRIC)).reduce((sum, value) => sum + value, 0) / 5;
  const robotAverage = Object.values(normalizeRubricValues(robotDesignRubric, DEFAULT_ROBOT_DESIGN_RUBRIC)).reduce((sum, value) => sum + value, 0) / 5;

  const runCommandCenterAction = (callback) => () => {
      closeCommandCenterMode();
      callback();
  };

  const commandCenterReadinessItems = [
      { label: 'Narrativa do Projeto', ready: projectStoryFields >= 4, detail: `${projectStoryFields}/4 blocos fechados`, icon: <FileText size={14} /> },
      { label: 'Especialistas Aplicados', ready: appliedExpertsCount >= 2, detail: `${appliedExpertsCount} sugestoes viraram acao`, icon: <Briefcase size={14} /> },
      { label: 'Impacto Real', ready: totalImpactPeople >= 30, detail: `${totalImpactPeople} pessoas alcancadas`, icon: <Megaphone size={14} /> },
      { label: 'Programacao Oficial', ready: Boolean(activeCommandCode), detail: activeCommandCode ? activeCommandCode.title : 'Escolha um codigo principal', icon: <Laptop size={14} /> },
      { label: 'Iteracoes Documentadas', ready: iterationRecords >= 4, detail: `${iterationRecords} registros do robo`, icon: <GitCommit size={14} /> },
      { label: 'Plano de Saidas', ready: rounds.length >= 3, detail: `${rounds.length} saidas planejadas`, icon: <Rocket size={14} /> },
      { label: 'Tempo Competitivo', ready: rounds.length > 0 && totalRoundTime <= 150, detail: rounds.length > 0 ? `${totalRoundTime}s estimados` : 'Planeje as saidas', icon: <Timer size={14} /> },
      { label: 'Rubricas Fortes', ready: innovationAverage >= 2.5 && robotAverage >= 2.5, detail: `Inovacao ${innovationAverage.toFixed(1)} | Robo ${robotAverage.toFixed(1)}`, icon: <Scale size={14} /> }
  ];

  const commandCenterReadinessScore = Math.round((commandCenterReadinessItems.filter(item => item.ready).length / commandCenterReadinessItems.length) * 100);
  const commandCenterReadinessTone = commandCenterReadinessScore >= 85
      ? { label: 'Pronto para juiz', color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/10' }
      : commandCenterReadinessScore >= 60
          ? { label: 'Competitivo', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10' }
          : { label: 'Em construcao', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/10' };

  const commandCenterCards = [
      { label: 'Prontidao', value: `${commandCenterReadinessScore}%`, helper: commandCenterReadinessTone.label, icon: <Crown size={18} />, accent: 'from-yellow-500/30 to-orange-500/10 border-yellow-500/20 text-yellow-400' },
      { label: 'Impacto', value: totalImpactPeople, helper: 'pessoas impactadas', icon: <Users size={18} />, accent: 'from-orange-500/30 to-transparent border-orange-500/20 text-orange-400' },
      { label: 'Iteracoes', value: iterationRecords, helper: 'registros de robo', icon: <GitCommit size={18} />, accent: 'from-blue-500/30 to-transparent border-blue-500/20 text-blue-400' },
      { label: 'Rubricas', value: `${((innovationAverage + robotAverage) / 2).toFixed(1)}/4`, helper: 'media geral da equipe', icon: <Award size={18} />, accent: 'from-purple-500/30 to-transparent border-purple-500/20 text-purple-400' }
  ];

  const commandCenterPriorityCards = [
      !activeCommandCode && { title: 'Definir a programacao oficial', description: 'Escolha um codigo principal para a equipe treinar sempre na mesma base.', action: runCommandCenterAction(() => openCodeModal()), actionLabel: 'Abrir cofre', tone: 'green', icon: <Laptop size={16} /> },
      projectStoryFields < 4 && { title: 'Fechar narrativa dos juizes', description: 'Complete problema, solucao e impacto para a equipe contar a historia sem improviso.', action: runCommandCenterAction(() => setModal({ type: 'projectForm' })), actionLabel: 'Editar projeto', tone: 'yellow', icon: <FileText size={16} /> },
      appliedExpertsCount < 2 && { title: 'Aplicar mais opinioes externas', description: 'Mostrem evidencias de especialistas que realmente mudaram o projeto ou o robo.', action: runCommandCenterAction(() => openExpertModal()), actionLabel: 'Novo especialista', tone: 'pink', icon: <Briefcase size={16} /> },
      totalImpactPeople < 30 && { title: 'Expandir o alcance', description: 'Uma equipe forte mostra impacto concreto e numero de pessoas alcancadas.', action: runCommandCenterAction(() => openOutreachForm()), actionLabel: 'Registrar impacto', tone: 'orange', icon: <Megaphone size={16} /> },
      totalRoundTime > 150 && rounds.length > 0 && { title: 'Cortar tempo das saidas', description: 'O plano atual passa do limite. Revisem trajetos, anexo e prioridade de missoes.', action: runCommandCenterAction(() => isAdmin ? setAdminTab('rounds') : setStudentTab('rounds')), actionLabel: 'Ver rounds', tone: 'red', icon: <Timer size={16} /> },
      iterationRecords < 4 && { title: 'Documentar mais iteracoes', description: 'Equipes campeas mostram a evolucao do robo com antes, depois e justificativa tecnica.', action: runCommandCenterAction(() => openRobotModal()), actionLabel: 'Nova versao', tone: 'blue', icon: <GitCommit size={16} /> }
  ].filter(Boolean).slice(0, 3);

  const commandCenterQuickActions = [
      { label: 'Projeto', onClick: runCommandCenterAction(() => setModal({ type: 'projectForm' })), icon: <Lightbulb size={14} />, style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500 hover:text-black' },
      { label: 'Especialista', onClick: runCommandCenterAction(() => openExpertModal()), icon: <Briefcase size={14} />, style: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500 hover:text-white' },
      { label: 'Impacto', onClick: runCommandCenterAction(() => openOutreachForm()), icon: <Megaphone size={14} />, style: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500 hover:text-white' },
      { label: 'Codigo', onClick: runCommandCenterAction(() => openCodeModal()), icon: <Laptop size={14} />, style: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500 hover:text-white' },
      { label: 'Juizes', onClick: runCommandCenterAction(() => openJudgeMode()), icon: <Gavel size={14} />, style: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-black' }
  ];

  const nextUpcomingEvent = [...events]
      .filter((event) => event.date >= localTodayStr)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const studentOpenTasksCount = viewAsStudent
      ? tasks.filter((task) => task.status !== 'done' && task.author && task.author.includes(viewAsStudent.name)).length
      : 0;

  const studentOverdueTasksCount = viewAsStudent
      ? tasks.filter((task) => task.status !== 'done' && task.dueDate && task.dueDate < localTodayStr && task.author && task.author.includes(viewAsStudent.name)).length
      : 0;

  const studentCurrentLevel = viewAsStudent ? getCurrentLevel(viewAsStudent.xp || 0) : null;
  const studentNextLevel = viewAsStudent ? getNextLevel(viewAsStudent.xp || 0) : null;
  const overallRubricAverage = ((innovationAverage + robotAverage) / 2).toFixed(1);
  const studentLevelProgress = viewAsStudent && studentCurrentLevel && studentNextLevel
      ? Math.min(100, ((viewAsStudent.xp - studentCurrentLevel.min) / (studentNextLevel.min - studentCurrentLevel.min)) * 100)
      : 100;
  const unlockedStudentBadges = BADGES_LIST.filter((badge) => hasStudentBadge(viewAsStudent, badge.id));
  const featuredStudentBadge = unlockedStudentBadges[0];
  const studentSpecialtyText = (viewAsStudent?.specialty || '').trim();
  const normalizedStudentSpecialty = studentSpecialtyText
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const specialtyMatchesEngineering = ['engenharia', 'mecanica', 'mecanico', 'robo', 'robot', 'programa', 'codigo', 'anexo', 'teste']
      .some((keyword) => normalizedStudentSpecialty.includes(keyword));
  const specialtyMatchesInnovation = ['inovacao', 'pesquisa', 'narrativa', 'projeto', 'impacto', 'criativa', 'criativo', 'ideia', 'solucao']
      .some((keyword) => normalizedStudentSpecialty.includes(keyword));
  const specialtyMatchesLeadership = ['gestao', 'lideranca', 'organizacao', 'comunicacao', 'ritmo', 'estrategia', 'lider']
      .some((keyword) => normalizedStudentSpecialty.includes(keyword));
  const matchedStudentSpecialtyCount = [specialtyMatchesEngineering, specialtyMatchesInnovation, specialtyMatchesLeadership].filter(Boolean).length;
  const studentProfileSpecialty = studentSpecialtyText
      || (featuredStudentBadge ? `Destaque: ${featuredStudentBadge.name}` : 'Especialidade em definicao');
  const studentProfileSpecialtyHelper = studentSpecialtyText
      ? 'identidade principal do competidor, fixa no perfil'
      : featuredStudentBadge
          ? 'sugestao visual baseada nas badges do aluno'
          : 'defina o melhor jogo do aluno no perfil';
  const studentStationTone = viewAsStudent?.station === STATION_KEYS.ENGINEERING
      ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200'
      : viewAsStudent?.station === STATION_KEYS.INNOVATION
          ? 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-200'
          : viewAsStudent?.station === STATION_KEYS.MANAGEMENT
              ? 'border-violet-500/20 bg-violet-500/10 text-violet-200'
              : 'border-white/10 bg-white/5 text-gray-200';
  const studentPrimarySeal = studentSpecialtyText && (normalizedStudentSpecialty.includes('tudo') || normalizedStudentSpecialty.includes('multi') || normalizedStudentSpecialty.includes('geral') || matchedStudentSpecialtyCount > 1)
      ? {
          label: 'Multidisciplinar',
          helper: 'Brilha em varias frentes',
          badgeClass: 'border-amber-300/30 bg-amber-400/14 text-amber-100',
          stampClass: 'border-amber-300/35 bg-amber-400/18 text-amber-100 shadow-[0_14px_28px_rgba(251,191,36,0.18)]',
          Icon: Sparkles
        }
      : studentSpecialtyText && specialtyMatchesEngineering
      ? {
          label: 'Engenharia',
          helper: 'Mecanica e testes',
          badgeClass: 'border-cyan-400/30 bg-cyan-500/14 text-cyan-100',
          stampClass: 'border-cyan-400/35 bg-cyan-500/18 text-cyan-100 shadow-[0_14px_28px_rgba(34,211,238,0.18)]',
          Icon: Wrench
        }
      : studentSpecialtyText && specialtyMatchesInnovation
          ? {
              label: STATION_KEYS.INNOVATION,
              helper: 'Ideia e narrativa',
              badgeClass: 'border-fuchsia-400/30 bg-fuchsia-500/14 text-fuchsia-100',
              stampClass: 'border-fuchsia-400/35 bg-fuchsia-500/18 text-fuchsia-100 shadow-[0_14px_28px_rgba(217,70,239,0.18)]',
              Icon: Microscope
            }
          : studentSpecialtyText && specialtyMatchesLeadership
              ? {
                  label: STATION_KEYS.MANAGEMENT,
                  helper: 'Lideranca e ritmo',
                  badgeClass: 'border-violet-400/30 bg-violet-500/14 text-violet-100',
                  stampClass: 'border-violet-400/35 bg-violet-500/18 text-violet-100 shadow-[0_14px_28px_rgba(139,92,246,0.18)]',
                  Icon: Crown
                }
              : studentSpecialtyText
                  ? {
                      label: 'Talento FLL',
                      helper: 'Especialidade personalizada',
                      badgeClass: 'border-emerald-300/30 bg-emerald-400/14 text-emerald-100',
                      stampClass: 'border-emerald-300/35 bg-emerald-400/18 text-emerald-100 shadow-[0_14px_28px_rgba(52,211,153,0.18)]',
                      Icon: Star
                    }
                  : featuredStudentBadge
                      ? {
                          label: 'Destaque FLL',
                          helper: 'Leitura sugerida por badges',
                          badgeClass: 'border-yellow-300/30 bg-yellow-400/14 text-yellow-100',
                          stampClass: 'border-yellow-300/35 bg-yellow-400/18 text-yellow-100 shadow-[0_14px_28px_rgba(250,204,21,0.18)]',
                          Icon: Medal
                        }
                      : {
                          label: 'Em evolucao',
                          helper: 'Especialidade ainda aberta',
                          badgeClass: 'border-white/15 bg-white/8 text-white',
                          stampClass: 'border-white/15 bg-white/10 text-white shadow-[0_14px_28px_rgba(148,163,184,0.16)]',
                          Icon: Users
                        };
  const StudentPrimarySealIcon = studentPrimarySeal.Icon;
  const totalTeamXP = students.reduce((sum, student) => sum + (student.xp || 0), 0);
  const totalTeamImpact = outreachEvents.reduce((sum, event) => sum + (event.people || 0), 0);
  const totalTeamTasksDone = tasks.filter((task) => task.status === 'done').length;
  const totalTeamExperts = experts.length;
  const totalTeamRounds = rounds.length;
  const totalTeamLogbookEntries = logbookEntries.length;
  const teamBestScore = scoreHistory.reduce((max, record) => Math.max(max, record.score || 0), 0);
  const officialProgramReady = isOfficialProgramBadgeOpen && activeCommandCode ? 1 : 0;
  const successfulTeamWeeksCount = Math.max(
      Number(teamSeasonStats.successfulWeeks) || 0,
      Array.isArray(teamSeasonStats.successfulWeekIds) ? teamSeasonStats.successfulWeekIds.length : 0
  );
  const teamAchievementsSummary = [
      { id: 'team_xp', name: 'Potencia Maxima', current: totalTeamXP, target: 6000, icon: <Zap size={14} className="text-yellow-300" /> },
      { id: 'team_impact', name: 'Voz da Mudanca', current: totalTeamImpact, target: 350, icon: <Megaphone size={14} className="text-orange-300" /> },
      { id: 'team_tasks', name: 'Maquina de Produtividade', current: totalTeamTasksDone, target: 300, icon: <CheckCheck size={14} className="text-emerald-300" /> },
      { id: 'team_experts', name: 'Mentes Conectadas', current: totalTeamExperts, target: 5, icon: <Briefcase size={14} className="text-violet-300" /> },
      { id: 'team_official_code', name: 'Programacao Oficial', current: officialProgramReady, target: 1, icon: <Laptop size={14} className="text-cyan-300" /> },
      { id: 'team_rounds', name: 'Estrategia de Mesa', current: totalTeamRounds, target: 6, icon: <Rocket size={14} className="text-blue-300" /> },
      { id: 'team_score', name: 'Recorde Competitivo', current: teamBestScore, target: 300, icon: <Trophy size={14} className="text-green-300" /> },
      { id: 'team_logbook', name: 'Diario Vivo', current: totalTeamLogbookEntries, target: 25, icon: <Book size={14} className="text-amber-300" /> },
      { id: 'team_readiness', name: 'Prontidao FLL', current: commandCenterReadinessScore, target: 85, icon: <Crown size={14} className="text-yellow-200" /> },
      { id: 'team_weekly_delivery', name: '40 Semanas Fechadas', current: successfulTeamWeeksCount, target: 40, icon: <CheckCircle size={14} className="text-lime-300" /> }
  ];
  const unlockedTeamAchievements = teamAchievementsSummary.filter((achievement) => achievement.current >= achievement.target);
  const nextTeamAchievement = teamAchievementsSummary
      .filter((achievement) => achievement.current < achievement.target)
      .sort((left, right) => (right.current / right.target) - (left.current / left.target))[0];
  const studentXpLossNotifications = viewAsStudent ? normalizeXpLossNotifications(viewAsStudent.xpLossNotifications) : [];
  const bisCycleIndex = currentWeekData?.id ? Math.max(0, Math.floor((Number(currentWeekData.id) - 1) / 2)) : 0;
  const bisCycleStartWeek = rotationSchedule[bisCycleIndex * 2] || currentWeekData;
  const bisCycleEndWeek = rotationSchedule[(bisCycleIndex * 2) + 1] || bisCycleStartWeek;
  const bisCycleStartDate = parseLocalDateValue(bisCycleStartWeek?.startDate || currentWeekData?.startDate);
  const bisCycleEndDate = parseLocalDateValue(bisCycleEndWeek?.endDate || currentWeekData?.endDate, true);
  const teamXpLossEvents = buildTeamXpLossEvents(students, xpLossRecords);
  const bisRewardLosses = teamXpLossEvents.filter((event) => isNoticeInsideRange(event, bisCycleStartDate, bisCycleEndDate));
  const isBisRewardAlive = bisRewardLosses.length === 0;
  const bisCycleLabel = bisCycleStartWeek && bisCycleEndWeek
      ? `${formatShortDateLabel(bisCycleStartWeek.startDate)} ate ${formatShortDateLabel(bisCycleEndWeek.endDate)}`
      : 'Ciclo em sincronizacao';
  const bisDaysRemaining = bisCycleEndDate
      ? Math.max(0, Math.ceil((bisCycleEndDate.getTime() - workspaceNow) / (24 * 60 * 60 * 1000)))
      : 0;
  const currentWeekStartDate = parseLocalDateValue(currentWeekData?.startDate);
  const currentWeekEndDate = parseLocalDateValue(currentWeekData?.endDate, true);
  const getStudentXpLossEvents = (student) => teamXpLossEvents
      .filter((event) => event.studentId === student?.id || studentNamesMatch(event.studentName, student?.name));
  const getCurrentWeekXpLosses = (student) => getStudentXpLossEvents(student)
      .filter((notice) => isNoticeInsideRange(notice, currentWeekStartDate, currentWeekEndDate));
  const studentWeeklyXpLosses = viewAsStudent ? getCurrentWeekXpLosses(viewAsStudent) : [];
  const hasStudentWeeklyRecurrence = studentWeeklyXpLosses.length >= 2;
  const disciplineRows = students.map((student) => {
      const xpLosses = getStudentXpLossEvents(student);
      const weeklyLosses = getCurrentWeekXpLosses(student);
      const totalLost = xpLosses.reduce((sum, notice) => sum + Math.abs(notice.amount || 0), 0);
      const weeklyLost = weeklyLosses.reduce((sum, notice) => sum + Math.abs(notice.amount || 0), 0);
      const latestNotice = [...xpLosses].sort((left, right) => getNoticeTime(right) - getNoticeTime(left))[0] || null;
      const stats = getAttendanceStats(student);

      return {
          student,
          xpLosses,
          weeklyLosses,
          totalLost,
          weeklyLost,
          latestNotice,
          attendanceStats: stats,
          recurrence: weeklyLosses.length >= 2,
      };
  });

  const disciplineAlerts = disciplineRows.filter((row) => row.recurrence || row.weeklyLost >= 20);
  const totalWeeklyXpLost = disciplineRows.reduce((sum, row) => sum + row.weeklyLost, 0);
  const pendingLeaderPenaltyRequests = leaderPenaltyRequests
      .filter((request) => (request.status || 'pending') === 'pending')
      .sort((left, right) => getPenaltyRequestTime(right) - getPenaltyRequestTime(left));
  const consistencyRanking = disciplineRows
      .map((row) => {
          const studentTasks = tasks.filter((task) => task.author && task.author.includes(row.student.name));
          const doneTasks = studentTasks.filter((task) => task.status === 'done').length;
          const overdueTasks = studentTasks.filter((task) => task.status !== 'done' && task.dueDate && task.dueDate < localTodayStr).length;
          const score = Math.max(0, Math.min(120,
              100
              + doneTasks * 3
              - row.weeklyLosses.length * 15
              - row.weeklyLost
              - overdueTasks * 8
              - row.attendanceStats.absences * 5
          ));

          return { ...row, doneTasks, overdueTasks, consistencyScore: Math.round(score) };
      })
      .sort((left, right) => right.consistencyScore - left.consistencyScore || (right.student.xp || 0) - (left.student.xp || 0));
  const isWeeklyLeader = Boolean(
      viewAsStudent?.id
      && currentWeekData?.assignments?.[STATION_KEYS.MANAGEMENT]?.some((student) => student.id === viewAsStudent.id || studentNamesMatch(student.name, viewAsStudent.name))
      && !effectivePlanning.captainIds.includes(viewAsStudent.id)
  );
  const weeklyLeaderStationStatuses = WEEKLY_STATION_KEYS.map((station) => {
      const mission = missions?.[station] || {};
      const hasText = Boolean(mission.text?.trim());
      const hasDeadline = Boolean(mission.deadline);

      return {
          station,
          hasText,
          hasDeadline,
          ready: hasText && hasDeadline
      };
  });
  const getWeeklyLeaderStationStatus = (station) => weeklyLeaderStationStatuses.find((item) => item.station === station) || { station, hasText: false, hasDeadline: false, ready: false };
  const weeklyLeaderMissionReadyCount = weeklyLeaderStationStatuses.filter((item) => item.ready).length;
  const weeklyLeaderMissingStations = weeklyLeaderStationStatuses.filter((item) => !item.ready);
  const weeklyLeaderTasks = isWeeklyLeader
      ? tasks.filter((task) => task.createdByLeaderId === viewAsStudent.id && task.leaderWeekId === String(currentWeekData?.id || ''))
      : [];
  const weeklyLeaderPenaltyRequests = isWeeklyLeader
      ? leaderPenaltyRequests
          .filter((request) =>
              request.requestedByLeaderId === viewAsStudent.id
              && request.leaderWeekId === String(currentWeekData?.id || '')
          )
          .sort((left, right) => getPenaltyRequestTime(right) - getPenaltyRequestTime(left))
      : [];
  const weeklyLeaderPendingPenaltyRequests = weeklyLeaderPenaltyRequests.filter((request) => (request.status || 'pending') === 'pending');
  const weeklyLeaderKanbanReady = weeklyLeaderTasks.length > 0;
  const weeklyLeaderPendingCount = weeklyLeaderMissingStations.length + (weeklyLeaderKanbanReady ? 0 : 1);
  const hasWeeklyLeaderPendingWork = isWeeklyLeader && weeklyLeaderPendingCount > 0;
  const weeklyLeaderPendingSummary = [
      weeklyLeaderMissingStations.length > 0 ? `${weeklyLeaderMissingStations.length} estacao(oes) sem foco e prazo` : null,
      weeklyLeaderKanbanReady ? null : 'criar pelo menos 1 tarefa no Kanban'
  ].filter(Boolean).join(' + ');
  const studentHeroFooter = viewAsStudent ? (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr,0.95fr,0.95fr,1fr]">
          <button
              onClick={() => openProfileModal(viewAsStudent)}
              className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm text-left transition-all hover:bg-white/10 h-full flex flex-col"
          >
              <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                      <GearAvatar student={viewAsStudent} className="h-20 w-20" />

                      <div className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-[16px] border ${studentPrimarySeal.stampClass}`}>
                          <StudentPrimarySealIcon size={16} />
                      </div>
                  </div>

                  <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Passaporte FLL</p>
                              <h3 className="text-lg font-black text-white leading-tight mt-2 truncate">{viewAsStudent.name}</h3>
                              {viewAsStudent.gearAppearance?.title ? <p className="mt-1 text-[10px] font-bold text-cyan-200">{gearItem(viewAsStudent.gearAppearance.title)?.name}</p> : null}
                              <p className={`mt-2 text-xs font-semibold leading-relaxed ${viewAsStudent?.station === STATION_KEYS.ENGINEERING ? 'text-cyan-200' : viewAsStudent?.station === STATION_KEYS.INNOVATION ? 'text-fuchsia-200' : viewAsStudent?.station === STATION_KEYS.MANAGEMENT ? 'text-violet-200' : 'text-slate-200'}`}>
                                  {studentProfileSpecialty}
                              </p>
                          </div>

                          <div className={`hidden md:flex flex-col rounded-[18px] border px-3 py-2 text-right ${studentPrimarySeal.badgeClass}`}>
                              <span className="inline-flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                                  <StudentPrimarySealIcon size={14} />
                                  {studentPrimarySeal.label}
                              </span>
                              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-80">{studentPrimarySeal.helper}</span>
                          </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] font-bold uppercase tracking-[0.16em]">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-200">{viewAsStudent.turma || 'Turma nao definida'}</span>
                          <span className={`rounded-full border px-3 py-1 ${studentStationTone}`}>Estacao {viewAsStudent.station || 'Equipe'}</span>
                      </div>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Selo fixo do aluno • estacao muda por semana</p>
                  </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Nivel atual</p>
                      <p className={`mt-2 text-sm font-black ${studentCurrentLevel?.color || 'text-white'}`}>{studentCurrentLevel?.name || 'Equipe'}</p>
                      <p className="mt-1 text-[11px] text-gray-400">{viewAsStudent.xp || 0} XP acumulados</p>
                  </div>
                  <div className={`rounded-2xl border p-3 ${studentPrimarySeal.badgeClass}`}>
                      <p className="text-[10px] uppercase tracking-[0.16em] font-bold opacity-80">Especialidade fixa</p>
                      <p className="mt-2 text-sm font-black">{studentSpecialtyText ? 'Assinatura do aluno' : featuredStudentBadge ? 'Sugestao inicial' : 'Em definicao'}</p>
                      <p className="mt-1 text-[11px] leading-relaxed opacity-90">{studentProfileSpecialtyHelper}</p>
                  </div>
              </div>
          </button>

          <div className={`rounded-[24px] border p-4 backdrop-blur-sm md:col-span-2 xl:col-span-3 ${
              isBisRewardAlive
                  ? 'border-emerald-400/25 bg-emerald-500/10'
                  : 'border-red-500/25 bg-red-500/10'
          }`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                          isBisRewardAlive
                              ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
                              : 'border-red-400/25 bg-red-500/10 text-red-100'
                      }`}>
                          <span>🍫</span> Recompensa coletiva
                      </span>
                      <h3 className="mt-3 text-xl font-black text-white">
                          {isBisRewardAlive ? 'Caixa de Bis em jogo' : 'Caixa de Bis travada neste ciclo'}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-300">
                          {isBisRewardAlive
                              ? `Se ninguem perder XP ate o fim do ciclo, a equipe ganha uma Caixa de Bis.`
                              : `Alguem perdeu XP neste ciclo, entao a Caixa de Bis fica para a proxima janela de 2 semanas.`}
                      </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center lg:min-w-[420px]">
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">Ciclo</p>
                          <p className="mt-2 text-[11px] font-black leading-tight text-white">{bisCycleLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">Perdas</p>
                          <p className={`mt-2 text-xl font-black ${isBisRewardAlive ? 'text-emerald-100' : 'text-red-100'}`}>{bisRewardLosses.length}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">Faltam</p>
                          <p className="mt-2 text-xl font-black text-white">{bisDaysRemaining}d</p>
                      </div>
                  </div>
              </div>
          </div>

          {studentXpLossNotifications.length > 0 && (
              <div className="rounded-[24px] border border-red-500/25 bg-red-500/10 p-4 backdrop-blur-sm md:col-span-2 xl:col-span-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-100">
                              <AlertTriangle size={12} /> Notificacoes de XP
                          </span>
                          <h3 className="mt-3 text-lg font-black text-white">Voce perdeu XP</h3>
                          <p className="mt-1 text-xs leading-relaxed text-red-100/80">Confira a data, quanto saiu e o motivo registrado pelo tecnico.</p>
                      </div>
                      <span className="rounded-full border border-red-400/25 bg-black/20 px-3 py-1 text-xs font-black text-red-100">
                          {studentXpLossNotifications.length} aviso(s)
                      </span>
                  </div>

                  <div className="mt-4 grid gap-2">
                      {studentXpLossNotifications.map((notice) => {
                          const mood = getXpLossMood(notice.amount);
                          const deleteState = getXpLossDeleteState(notice);

                          return (
                              <div key={notice.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 md:flex-row md:items-start md:justify-between">
                                  <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${mood.tone}`}>
                                              <span>{mood.emoji}</span> {notice.amount} XP
                                          </span>
                                          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                              {formatXpLossDate(notice.date)}
                                          </span>
                                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                              {deleteState.label}
                                          </span>
                                      </div>
                                      <p className="mt-2 text-sm font-bold leading-relaxed text-white break-words">{notice.reason || 'Sem motivo informado.'}</p>
                                  </div>
                                  <button
                                      type="button"
                                      onClick={() => dismissXpLossNotification(notice.id)}
                                      disabled={!deleteState.canDelete}
                                      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-all ${
                                          deleteState.canDelete
                                              ? 'border-white/10 bg-white/5 text-gray-300 hover:border-red-400/35 hover:bg-red-500/15 hover:text-red-100'
                                              : 'cursor-not-allowed border-white/5 bg-white/[0.03] text-gray-600'
                                      }`}
                                      title={deleteState.canDelete ? 'Apagar notificacao' : deleteState.label}
                                  >
                                      <Trash2 size={13} /> Apagar
                                  </button>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">XP e nivel</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-200">
                      <Trophy size={12} /> {viewAsStudent.xp || 0} XP
                  </span>
              </div>
              <p className={`text-lg font-black mt-3 ${studentCurrentLevel?.color || 'text-white'}`}>{studentCurrentLevel?.name || 'Equipe'}</p>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden mt-4">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500" style={{ width: `${studentLevelProgress}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                  {studentNextLevel ? `${Math.max(0, studentNextLevel.min - (viewAsStudent.xp || 0))} XP para ${studentNextLevel.name}` : 'Nivel maximo atingido.'}
              </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Badges</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-100">
                      <Medal size={12} /> {unlockedStudentBadges.length}/{BADGES_LIST.length}
                  </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                  {unlockedStudentBadges.slice(0, 4).map((badge) => (
                      <button
                          key={badge.id}
                          type="button"
                          title={`${badge.name}: ${badge.desc}`}
                          aria-label={`${badge.name}: ${badge.desc}`}
                          className={`group relative inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-yellow-400/10 focus:outline-none focus-visible:border-yellow-300/50 focus-visible:bg-yellow-400/10 ${badge.color}`}
                      >
                          {badge.icon}
                      </button>
                  ))}
                  {unlockedStudentBadges.length === 0 && (
                      <span className="text-xs text-gray-500">Nenhuma badge desbloqueada ainda.</span>
                  )}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                  {unlockedStudentBadges.length > 0 ? 'Suas conquistas principais continuam visiveis aqui no topo.' : 'Conquiste badges nas entregas para fortalecer seu perfil.'}
              </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Conquistas da equipe</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-200">
                      <Crown size={12} /> {unlockedTeamAchievements.length}/{teamAchievementsSummary.length}
                  </span>
              </div>
              <div tabIndex={0} role="region" aria-label="Conquistas da equipe" className="space-y-2 mt-4 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {teamAchievementsSummary.map((achievement) => {
                      const progress = Math.min(100, (achievement.current / achievement.target) * 100);
                      const isUnlocked = achievement.current >= achievement.target;
                      const remaining = Math.max(0, achievement.target - achievement.current);
                      const achievementHint = isUnlocked
                          ? `${achievement.name}: desbloqueada pela equipe.`
                          : `${achievement.name}: ${achievement.desc || 'Complete a meta coletiva.'} Progresso: ${achievement.current}/${achievement.target}. Falta ${remaining}.`;

                      return (
                          <div
                              key={achievement.id}
                              title={achievementHint}
                              aria-label={achievementHint}
                              className={`rounded-2xl border p-3 ${isUnlocked ? 'border-emerald-400/25 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}
                          >
                              <div className="flex items-center justify-between gap-3">
                                  <span className={`inline-flex items-center gap-2 text-xs font-bold ${isUnlocked ? 'text-emerald-100' : 'text-white'}`}>
                                      {achievement.icon}
                                      {achievement.name}
                                  </span>
                                  <span className={`text-[10px] font-bold ${isUnlocked ? 'text-emerald-200' : 'text-gray-400'}`}>
                                      {isUnlocked ? 'Desbloqueada' : `${achievement.current}/${achievement.target}`}
                                  </span>
                              </div>
                              <p className="mt-2 text-[11px] leading-snug text-gray-400">
                                  {isUnlocked ? 'Meta coletiva conquistada pela equipe.' : achievement.desc}
                              </p>
                              <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden mt-3">
                                  <div className={`h-full rounded-full ${isUnlocked ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gradient-to-r from-gray-500 to-slate-400'}`} style={{ width: `${progress}%` }}></div>
                              </div>
                              {!isUnlocked && (
                                  <p className="mt-1.5 text-[10px] font-bold text-gray-500">Falta {remaining} para desbloquear.</p>
                              )}
                          </div>
                      );
                  })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                  Badges coletivas ficam visiveis para acompanhar o quanto falta para desbloquear cada meta da equipe.
              </p>
          </div>
      </div>
  ) : null;

  const adminHeroMetrics = [
      { label: 'Prontidao FLL', value: `${commandCenterReadinessScore}%`, helper: commandCenterReadinessTone.label, icon: <Crown size={16} />, tone: `${commandCenterReadinessTone.border} ${commandCenterReadinessTone.bg} ${commandCenterReadinessTone.color}` },
      { label: 'Rubricas', value: `${overallRubricAverage}/4`, helper: 'placar atual da equipe', icon: <Scale size={16} />, tone: 'border-purple-500/20 bg-purple-500/10 text-purple-300' },
      { label: 'Alertas', value: urgentTasksCount, helper: urgentTasksCount > 0 ? 'tarefas pedindo resposta' : 'fluxo do time em paz', icon: <AlertTriangle size={16} />, tone: 'border-orange-500/20 bg-orange-500/10 text-orange-300' },
      { label: 'Proximo Evento', value: nextUpcomingEvent ? nextUpcomingEvent.date.split('-').reverse().join('/') : 'Sem agenda', helper: nextUpcomingEvent ? nextUpcomingEvent.title : 'cadastre o proximo marco', icon: <CalendarDays size={16} />, tone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300' }
  ];

  const currentFinalSprintWeek = getFinalSprintEvaluationWeek();
  const currentWeekEvaluationIds = new Set(finalSprintEvaluations
      .filter((entry) => entry.type === 'weekly' && entry.weekId === currentFinalSprintWeek.id && entry.status === 'complete')
      .map((entry) => String(entry.studentId)));
  const pendingWeeklyEvaluationCount = Math.max(0, students.filter((student) => student?.id && !currentWeekEvaluationIds.has(String(student.id))).length);

  const incompleteStudentRecords = students
      .map((student) => ({
        ...student,
        missingFields: [
          !String(student.name || '').trim() && 'nome',
          !String(student.turma || '').trim() && 'turma',
          !String(student.username || '').trim() && 'usuário',
          !String(student.password || '').trim() && 'senha de acesso',
        ].filter(Boolean),
      }))
      .filter((student) => student.missingFields.length > 0);

  const handleWorkspaceSeasonChange = async (season) => {
      if (currentUser?.type !== 'admin' || !['rotation', 'final'].includes(season)) return;
      setWorkspaceSeason(season);
      setAdminTab(season === 'rotation' ? 'rotation' : 'sprint');
      browserStorage.setItem('newgears_workspace_season', season);
      if (!db) return;

      setIsSavingWorkspaceSeason(true);
      try {
          await setDoc(doc(db, 'settings', 'workspace_season'), { activeSeason: season }, { merge: true });
      } catch (error) {
          console.error('Não foi possível salvar a temporada ativa:', error);
          showNotification('A temporada foi alterada neste painel, mas não foi possível sincronizar com a equipe.', 'error');
      } finally {
          setIsSavingWorkspaceSeason(false);
      }
  };

  const handleSeasonTransition = async (event) => {
    event.preventDefault();
    if (!isAdmin || !workspaceSeasonLoaded || isTransitioningSeason) return;
    const form = new FormData(event.currentTarget);
    const options = seasonTransitionLock?.options || { currentName: String(form.get('currentSeasonName') || '').trim(), nextName: String(form.get('nextSeasonName') || '').trim(), studentIds: form.getAll('nextStudentIds').map(String), startDate: String(form.get('nextStartDate') || ''), carryTasks: form.has('carryTasks'), carryEvents: form.has('carryEvents'), carryProject: form.has('carryProject') };
    if (!options.currentName || !options.nextName || !validDate(options.startDate) || !options.studentIds.length || !form.has('reviewedTransition')) { showNotification('Confira os nomes, a data e os integrantes da próxima equipe.', 'error'); return; }
    if (reportsWorkspace.enabled && (reportsWorkspace.loading || reportsWorkspace.error)) { showNotification('Aguarde os relatórios carregarem antes de encerrar.', 'error'); return; }
    setIsTransitioningSeason(true);
    try {
      const next = await transitionSeason({ db, seasonId: activeTeamSeasonId || 'legacy', options, actor: adminProfile?.name || 'Técnico', weeklyStats: teamSeasonStats, planningConfig: effectivePlanning, reportCount: reportsWorkspace.reports.filter((item) => (item.seasonId || 'legacy') === (activeTeamSeasonId || 'legacy')).length });
      setActiveTeamSeasonId(next.id); setActiveTeamSeasonName(next.name); setSeasonLifecycleReady(true); setWorkspaceSeason('rotation');
      browserStorage.setItem('newgears_active_season_id', next.id); browserStorage.setItem('newgears_active_season_name', next.name); browserStorage.setItem('newgears_workspace_season', 'rotation');
      setModal({ type: null, data: null }); setAdminTab('rotation'); showNotification('Temporada arquivada e próximo ciclo preparado.');
    } catch (error) { showNotification(error.message + ' Reabra o encerramento para retomar, se necessário.', 'error'); }
    finally { setIsTransitioningSeason(false); }
  };

  const adminHeroActions = workspaceSeason === 'rotation'
      ? [
          { label: 'Gerenciar alunos', onClick: () => setAdminTab('students'), icon: <Users size={14} />, style: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20 hover:bg-emerald-400 hover:text-black' },
          { label: 'Abrir rodízio', onClick: () => setAdminTab('rotation'), icon: <RotateCcw size={14} />, style: 'bg-blue-500/10 text-blue-200 border-blue-500/20 hover:bg-blue-400 hover:text-black' },
          { label: 'Kanban da Semana', onClick: () => setAdminTab('kanban'), icon: <ClipboardList size={14} />, style: 'bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500 hover:text-white' },
          { label: 'Agenda', onClick: () => setAdminTab('agenda'), icon: <CalendarDays size={14} />, style: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500 hover:text-white' }
      ]
      : [
          { label: 'Gerenciar alunos', onClick: () => setAdminTab('students'), icon: <Users size={14} />, style: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20 hover:bg-emerald-400 hover:text-black' },
          { label: 'Avaliar a Semana', onClick: () => setAdminTab('evaluations'), icon: <ClipboardList size={14} />, style: 'bg-amber-500/10 text-amber-200 border-amber-500/20 hover:bg-amber-400 hover:text-black' },
          { label: 'Kanban da Semana', onClick: () => setAdminTab('kanban'), icon: <ClipboardList size={14} />, style: 'bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500 hover:text-white' },
          { label: 'Agenda', onClick: () => setAdminTab('agenda'), icon: <CalendarDays size={14} />, style: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500 hover:text-white' }
      ];

  const studentHeroMetrics = [
      { label: 'Nivel', value: studentCurrentLevel?.name || 'Equipe', helper: 'faixa de XP da temporada', icon: <Trophy size={16} />, tone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300' },
      { label: 'Tarefas Abertas', value: studentOpenTasksCount, helper: studentOpenTasksCount > 0 ? 'frente pessoal da semana' : 'sem pendencias abertas', icon: <ClipboardList size={16} />, tone: 'border-orange-500/20 bg-orange-500/10 text-orange-300' },
      { label: 'Atrasos', value: studentOverdueTasksCount, helper: studentOverdueTasksCount > 0 ? 'vale recuperar o ritmo' : 'timeline limpa', icon: <AlertTriangle size={16} />, tone: 'border-red-500/20 bg-red-500/10 text-red-300' },
      { label: 'Rubrica da Equipe', value: `${overallRubricAverage}/4`, helper: 'placar da temporada', icon: <Scale size={16} />, tone: 'border-purple-500/20 bg-purple-500/10 text-purple-300' }
  ];

  const studentHeroActions = [
      { label: 'Minha Missao', onClick: () => setStudentTab('mission'), icon: <Rocket size={14} />, style: 'bg-white/10 text-white border-white/15 hover:bg-white hover:text-black' },
      { label: 'Meu Feedback', onClick: () => setStudentTab('feedback'), icon: <MessageSquare size={14} />, style: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/20 hover:bg-cyan-400 hover:text-black' },
      { label: 'Rubricas', onClick: () => setStudentTab('rubrics'), icon: <Scale size={14} />, style: 'bg-purple-500/10 text-purple-200 border-purple-500/20 hover:bg-purple-500 hover:text-white' },
      { label: STUDENT_TASKS_LABEL, onClick: () => setStudentTab('kanban'), icon: <ClipboardList size={14} />, style: 'bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500 hover:text-white' },
      { label: 'Agenda', onClick: () => setStudentTab('agenda'), icon: <CalendarDays size={14} />, style: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500 hover:text-white' }
  ];

  const adminWorkspaceTabs = [
      { id: 'giro_knowledge', label: 'Biblioteca do Giro', icon: <BookOpen size={16} />, description: 'Cadastre rúbricas, orientações do torneio e materiais para o Giro consultar.', pill: 'Materiais', pillTone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100', activeClass: 'bg-cyan-300 text-slate-950 shadow-lg', inactiveClass: 'text-gray-400 hover:text-cyan-200 hover:bg-cyan-300/10' },
      { id: 'overview', label: 'Visão geral', icon: <LayoutDashboard size={16} />, description: 'Resumo da equipe, indicadores e preparação para o torneio.' },
      { id: 'shop', label: 'Loja New Gears', icon: <Sparkles size={16} />, description: 'Conheça o Giro e personalize seu perfil com Gears conquistados nas contribuições.', pill: 'Giro', pillTone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100', activeClass: 'bg-cyan-300 text-slate-950 shadow-lg', inactiveClass: 'text-gray-400 hover:text-cyan-200 hover:bg-cyan-300/10' },
      { id: 'students', label: 'Alunos', icon: <Users size={16} />, description: 'Cadastro, estações e acompanhamento individual da equipe.', pill: `${students.length} alunos`, badge: incompleteStudentRecords.length || null, pillTone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200', activeClass: 'bg-emerald-400 text-black shadow-lg shadow-emerald-900/20', inactiveClass: 'text-gray-300 hover:text-emerald-200 hover:bg-emerald-500/10' },
      { id: 'rotation', label: 'Rodízio', icon: <LayoutDashboard size={16} />, description: 'Escala semanal e distribuição planejada para o rodízio da equipe.', pill: currentWeekData?.weekName || 'Escala semanal', pillTone: 'border-blue-400/20 bg-blue-400/10 text-blue-100', activeClass: 'bg-blue-400 text-black shadow-lg shadow-blue-900/20', inactiveClass: 'text-gray-400 hover:text-blue-200 hover:bg-blue-400/10' },
      { id: 'weekly_reports', label: 'Relatórios Semanais', icon: <FileText size={16} />, description: 'Pesquisas e desenvolvimentos compartilhados por toda a equipe.', badge: reportsWorkspace.unreadReports.length || null, pillTone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100', activeClass: 'bg-cyan-300 text-black shadow-lg', inactiveClass: 'text-gray-400 hover:text-cyan-200 hover:bg-cyan-300/10' },
      { id: 'report_recipients', label: 'Integrantes / Notificações', icon: <Users size={16} />, description: 'Gerencie os destinatários dos avisos de novos relatórios.', pillTone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100', activeClass: 'bg-cyan-300 text-black shadow-lg', inactiveClass: 'text-gray-400 hover:text-cyan-200 hover:bg-cyan-300/10' },
      { id: 'sprint', label: 'Reta final', icon: <Flag size={16} />, description: 'Frentes de trabalho e preparação para o torneio de dezembro.', pillTone: 'border-amber-500/20 bg-amber-500/10 text-amber-200', activeClass: 'bg-amber-400 text-black shadow-lg shadow-amber-900/20', inactiveClass: 'text-gray-400 hover:text-amber-300 hover:bg-amber-500/10' },
      { id: 'evaluations', label: 'Avaliações', icon: <ClipboardList size={16} />, description: 'Avalie a semana às sextas e acompanhe a preparação para o torneio.', badge: pendingWeeklyEvaluationCount > 0 ? pendingWeeklyEvaluationCount : null, pillTone: 'border-rose-500/20 bg-rose-500/10 text-rose-200', activeClass: 'bg-rose-400 text-black shadow-lg shadow-rose-900/20', inactiveClass: 'text-gray-400 hover:text-rose-300 hover:bg-rose-500/10' },
      { id: 'strategy', label: 'Estrategia', icon: <Lightbulb size={16} />, description: 'Projeto, impacto, ideias e narrativa que os juizes entendem rapido.', pillTone: 'border-purple-500/20 bg-purple-500/10 text-purple-200', activeClass: 'bg-purple-500 text-white shadow-lg shadow-purple-900/20', inactiveClass: 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/10' },
      { id: 'rounds', label: 'Robo', icon: <ListTodo size={16} />, description: 'Saidas, anexos, codigo e evolucao do robo em linguagem de equipe.', pillTone: 'border-blue-500/20 bg-blue-500/10 text-blue-200', activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20', inactiveClass: 'text-gray-400 hover:text-blue-300 hover:bg-blue-500/10' },
      { id: 'rubrics', label: 'Rubricas', icon: <Scale size={16} />, description: 'Placar oficial da equipe com leitura simples e proximo passo.', pill: `${overallRubricAverage}/4`, pillTone: 'border-gray-400/20 bg-gray-400/10 text-gray-100', activeClass: 'bg-gray-300 text-black shadow-lg shadow-gray-900/20', inactiveClass: 'text-gray-400 hover:text-white hover:bg-white/5' },
      { id: 'discipline', label: 'Disciplina', icon: <Shield size={16} />, description: 'Perdas de XP, reincidencia e ranking de consistencia da equipe.', badge: (pendingLeaderPenaltyRequests.length + disciplineAlerts.length) > 0 ? pendingLeaderPenaltyRequests.length + disciplineAlerts.length : null, pillTone: pendingLeaderPenaltyRequests.length > 0 || disciplineAlerts.length > 0 ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200', activeClass: 'bg-red-500 text-white shadow-lg shadow-red-900/20', inactiveClass: 'text-gray-400 hover:text-red-300 hover:bg-red-500/10' },
      { id: 'kanban', label: 'Kanban', icon: <ClipboardList size={16} />, description: 'Fluxo da semana, prioridades e entregas sem cara de planilha.', badge: urgentTasksCount > 0 ? urgentTasksCount : null, pillTone: 'border-orange-500/20 bg-orange-500/10 text-orange-200', activeClass: 'bg-orange-500 text-white shadow-lg shadow-orange-900/20', inactiveClass: 'text-gray-400 hover:text-orange-300 hover:bg-orange-500/10' },
      { id: 'logbook', label: 'Diario', icon: <Book size={16} />, description: 'Memoria viva do time com testes, aprendizados e mini vitorias.', pillTone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200', activeClass: 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20', inactiveClass: 'text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10' },
      { id: 'agenda', label: 'Agenda', icon: <CalendarDays size={16} />, description: 'Prazos, encontros e checkpoints da equipe em modo missao.', badge: urgentEventsCount > 0 ? urgentEventsCount : null, pillTone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200', activeClass: 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/20', inactiveClass: 'text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10' },
      { id: 'showcase', label: 'Vitrine', icon: <MonitorPlay size={16} />, description: 'Curadoria das fotos, torneio e QR Codes exibidos para a escola.', pill: `${galleryPhotos.length} fotos`, pillTone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200', activeClass: 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20', inactiveClass: 'text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10' },
      { id: 'history', label: 'Historico', icon: <History size={16} />, description: 'Registro coletivo com autor, data e alteracoes feitas no sistema.', pillTone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200', activeClass: 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-900/20', inactiveClass: 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10' },
      { id: 'operations', label: 'Evolução', icon: <BarChart3 size={16} />, description: 'Indicadores da equipe, backups e lembretes automáticos.', pill: 'Acompanhamento', pillTone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100', activeClass: 'bg-cyan-300 text-slate-950 shadow-lg', inactiveClass: 'text-gray-400 hover:text-cyan-200 hover:bg-cyan-500/10' },
      { id: 'season_history', label: 'Temporadas', icon: <History size={16} />, description: 'Consulte tarefas, agenda e avaliações de ciclos anteriores.', pill: `${teamSeasons.filter((season) => season.status === 'archived').length} arquivos`, pillTone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100', activeClass: 'bg-cyan-300 text-slate-950 shadow-lg', inactiveClass: 'text-gray-400 hover:text-cyan-200 hover:bg-cyan-300/10' }
  ].filter((tab) => !['history', 'report_recipients', 'season_history', 'operations', 'giro_knowledge'].includes(tab.id) || currentUser?.type === 'admin');

  const studentWorkspaceTabs = [
      { id: 'overview', label: 'Visão geral', icon: <LayoutDashboard size={16} />, description: 'Seu perfil, conquistas, progresso e resumo da equipe.' },
      { id: 'shop', label: 'Loja New Gears', icon: <Sparkles size={16} />, description: 'Conheça o Giro e personalize seu perfil com Gears conquistados nas contribuições.', pill: 'Giro', pillTone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100', activeClass: 'bg-cyan-300 text-slate-950 shadow-lg', inactiveClass: 'text-gray-400 hover:text-cyan-200 hover:bg-cyan-300/10' },
      { id: 'weekly_reports', label: 'Relatórios Semanais', icon: <FileText size={16} />, description: 'Compartilhe seu relatório e consulte os registros da equipe.', badge: reportsWorkspace.unreadReports.length || null, pillTone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100', activeClass: 'bg-cyan-300 text-black shadow-lg', inactiveClass: 'text-gray-400 hover:text-cyan-200 hover:bg-cyan-300/10' },
      { id: 'sprint', label: 'Reta final', icon: <Flag size={16} />, description: 'Escolha onde contribuir e mantenha seus próximos passos registrados.', pillTone: 'border-amber-500/20 bg-amber-500/10 text-amber-200', activeClass: 'bg-amber-400 text-black shadow-lg shadow-amber-900/20', inactiveClass: 'text-gray-400 hover:text-amber-300 hover:bg-amber-500/10' },
      { id: 'feedback', label: 'Meu feedback', icon: <MessageSquare size={16} />, description: 'Consulte seus pontos fortes e o próximo passo recomendado.', pillTone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200', activeClass: 'bg-cyan-300 text-black shadow-lg shadow-cyan-900/20', inactiveClass: 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10' },
      { id: 'mission', label: 'Minha Missao', icon: <Rocket size={16} />, description: 'Seu foco da semana, status da entrega e proximo passo.', pill: viewAsStudent?.station || 'Equipe', pillTone: 'border-white/10 bg-white/5 text-gray-200', activeClass: 'bg-white text-black shadow-lg', inactiveClass: 'text-gray-400 hover:text-white hover:bg-white/5' },
      { id: 'strategy', label: 'Estrategia', icon: <Lightbulb size={16} />, description: 'Entenda o projeto, o impacto e o caminho competitivo do time.', pillTone: 'border-purple-500/20 bg-purple-500/10 text-purple-200', activeClass: 'bg-purple-500 text-white shadow-lg shadow-purple-900/20', inactiveClass: 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/10' },
      { id: 'rubrics', label: 'Rubricas', icon: <Scale size={16} />, description: 'Veja o placar da equipe e onde subir de nivel.', pill: `${overallRubricAverage}/4`, pillTone: 'border-gray-400/20 bg-gray-400/10 text-gray-100', activeClass: 'bg-gray-300 text-black shadow-lg shadow-gray-900/20', inactiveClass: 'text-gray-400 hover:text-white hover:bg-white/5' },
      { id: 'rounds', label: 'Robo', icon: <ListTodo size={16} />, description: 'Rounds, estrategia de mesa, codigo e anexos do robo.', pillTone: 'border-blue-500/20 bg-blue-500/10 text-blue-200', activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20', inactiveClass: 'text-gray-400 hover:text-blue-300 hover:bg-blue-500/10' },
      { id: 'kanban', label: STUDENT_TASKS_LABEL, icon: <ClipboardList size={16} />, description: 'Seu quadro da semana para agir sem se perder nas entregas.', badge: urgentTasksCount > 0 ? urgentTasksCount : null, pillTone: 'border-orange-500/20 bg-orange-500/10 text-orange-200', activeClass: 'bg-orange-500 text-white shadow-lg shadow-orange-900/20', inactiveClass: 'text-gray-400 hover:text-orange-300 hover:bg-orange-500/10' },
      { id: 'logbook', label: 'Diario', icon: <Book size={16} />, description: 'Guarde o que aprendeu, testou e melhorou na temporada.', pillTone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200', activeClass: 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20', inactiveClass: 'text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10' },
      { id: 'agenda', label: 'Agenda', icon: <CalendarDays size={16} />, description: 'Prazos, encontros e marcos importantes da equipe.', badge: urgentEventsCount > 0 ? urgentEventsCount : null, pillTone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200', activeClass: 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/20', inactiveClass: 'text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10' },
  ];

  const workspaceSceneTopPaddingMap = {
      shop: 'pt-10 md:pt-12',
      sprint: 'pt-10 md:pt-12',
      evaluations: 'pt-10 md:pt-12',
      feedback: 'pt-10 md:pt-12',
      rotation: 'pt-10 md:pt-12',
      students: 'pt-10 md:pt-12',
      season_history: 'pt-10 md:pt-12',
      strategy: 'pt-10 md:pt-12',
      rounds: 'pt-10 md:pt-12',
      rubrics: 'pt-10 md:pt-12',
      kanban: 'pt-10 md:pt-12',
      logbook: 'pt-10 md:pt-12',
      agenda: 'pt-10 md:pt-12',
      showcase: 'pt-10 md:pt-12',
      history: 'pt-10 md:pt-12',
  };

  const getWorkspaceSceneTopPadding = (tabId) => workspaceSceneTopPaddingMap[tabId] || 'pt-10 md:pt-12';

  const currentWorkspaceTabs = isAdmin ? adminWorkspaceTabs : studentWorkspaceTabs;
  const currentWorkspaceTab = currentWorkspaceTabs.find((tab) => tab.id === (isAdmin ? adminTab : studentTab));
  const workspaceProfileStudent = viewAsStudent || (currentUser?.type === 'student' ? currentUser.data || { name: currentUser.name } : null);
  const navigateWorkspace = (tabId) => {
      if (isAdmin) setAdminTab(tabId); else setStudentTab(tabId);
      requestAnimationFrame(() => {
          const content = document.getElementById('workspace-content');
          content?.focus({ preventScroll: true });
          content?.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
  };

  const isDashboardPanelVisible = isAdmin ? adminPanelState.dashboard : studentPanelState.dashboard;

  const adminDashboardPanels = [
      { id: 'prep', label: 'Prontidao', icon: <Crown size={14} />, activeClass: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-500/15' },
      { id: 'judge', label: 'Juizes', icon: <Gavel size={14} />, activeClass: 'border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15' },
      { id: 'stats', label: 'Metricas', icon: <BarChart3 size={14} />, activeClass: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15' },
      { id: 'achievements', label: 'Conquistas', icon: <Medal size={14} />, activeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15' }
  ];

  const studentDashboardPanels = [
      { id: 'prep', label: 'Mapa FLL', icon: <Rocket size={14} />, activeClass: 'border-blue-500/20 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15' },
      { id: 'judge', label: 'Narrativa', icon: <MessageSquare size={14} />, activeClass: 'border-purple-500/20 bg-purple-500/10 text-purple-200 hover:bg-purple-500/15' },
      { id: 'stats', label: 'Metricas', icon: <BarChart3 size={14} />, activeClass: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15' },
      { id: 'achievements', label: 'Conquistas', icon: <Medal size={14} />, activeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15' }
  ];

  const currentDashboardPanels = isAdmin ? adminDashboardPanels : studentDashboardPanels;
  const currentDashboardState = isAdmin ? adminPanelState : studentPanelState;
  const visibleWorkspacePanelCount = currentDashboardPanels.filter((panel) => currentDashboardState[panel.id]).length;

  const toggleWorkspacePanel = (panelId) => {
      if (isAdmin) {
          setAdminPanelState((prev) => ({ ...prev, [panelId]: !prev[panelId] }));
          return;
      }

      setStudentPanelState((prev) => ({ ...prev, [panelId]: !prev[panelId] }));
  };

  const setWorkspacePanels = (value) => {
      const patch = Object.fromEntries(currentDashboardPanels.map((panel) => [panel.id, value]));

      if (isAdmin) {
          setAdminPanelState((prev) => ({ ...prev, ...patch }));
          return;
      }

      setStudentPanelState((prev) => ({ ...prev, ...patch }));
  };

  const toggleDashboardPanel = () => {
      if (isAdmin) {
          setAdminTabValue('overview');
          setAdminPanelState((prev) => {
              const nextDashboard = adminTab === 'overview' ? !prev.dashboard : true;

              if (prev.compact && nextDashboard) {
                  return { ...prev, compact: false, dashboard: true };
              }

              return { ...prev, dashboard: nextDashboard };
          });
          return;
      }

      setStudentTabValue('overview');
      setStudentPanelState((prev) => ({ ...prev, dashboard: studentTab === 'overview' ? !prev.dashboard : true }));
  };

  const toggleAdminHeroPanel = () => {
      setAdminTab('overview');
      setAdminPanelState((prev) => ({ ...prev, hero: adminTab === 'overview' ? !prev.hero : true }));
  };

  const toggleAdminCompactMode = () => {
      setAdminPanelState((prev) => ({ ...prev, compact: !prev.compact }));
  };

  const adminBatteryTone = teamAverage > 75
      ? 'border-green-500/20 bg-green-500/10 text-green-300'
      : teamAverage > 50
          ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200'
          : teamAverage > 0
              ? 'border-red-500/20 bg-red-500/10 text-red-300'
              : 'border-white/10 bg-white/5 text-gray-300';
  const adminProfileSpecialty = (adminProfile?.specialty || '').trim() || 'Comando geral, ritmo da semana e leitura da equipe.';
  const adminProfilePulse = teamMoods.length > 0 ? `${teamAverage}% de energia media da equipe` : 'Equipe ainda sem check-in do dia';
  const adminProfileWatch = urgentTasksCount > 0 ? `${urgentTasksCount} alerta(s) pedem resposta` : 'Fluxo principal sob controle';

  const adminExecutiveSignals = [
      { label: 'Prontidao FLL', value: `${commandCenterReadinessScore}%`, helper: commandCenterReadinessTone.label, icon: <Crown size={14} />, tone: `${commandCenterReadinessTone.border} ${commandCenterReadinessTone.bg} ${commandCenterReadinessTone.color}` },
      { label: 'Tarefas Criticas', value: urgentTasksCount, helper: urgentTasksCount > 0 ? 'demandam resposta hoje' : 'fluxo controlado', icon: <ClipboardList size={14} />, tone: 'border-orange-500/20 bg-orange-500/10 text-orange-300' },
      { label: 'Agenda Imediata', value: urgentEventsCount, helper: urgentEventsCount > 0 ? 'eventos proximos' : 'agenda sem pressao', icon: <CalendarDays size={14} />, tone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300' },
      { label: 'Energia da Equipe', value: teamMoods.length > 0 ? `${teamAverage}%` : 'Check-in', helper: teamMoods.length > 0 ? 'media do humor da equipe' : 'sem registro do dia', icon: <Battery size={14} />, tone: adminBatteryTone }
  ];

  const adminPriorityFocus = [
      commandCenterPriorityCards[0] && { title: commandCenterPriorityCards[0].title, detail: commandCenterPriorityCards[0].description, actionLabel: commandCenterPriorityCards[0].actionLabel, onClick: commandCenterPriorityCards[0].action, tone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100' },
      urgentTasksCount > 0 && { title: 'Resolver gargalos do Kanban', detail: `${urgentTasksCount} tarefa(s) venceram ou vencem agora.`, actionLabel: 'Abrir Kanban', onClick: () => setAdminTab('kanban'), tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100' },
      urgentEventsCount > 0 && { title: 'Blindar compromissos da agenda', detail: `${urgentEventsCount} marco(s) exigem preparacao proxima.`, actionLabel: 'Ver Agenda', onClick: () => setAdminTab('agenda'), tone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-100' }
  ].filter(Boolean).slice(0, 3);

  const adminActionQueueItems = [
      tasks.some((task) => task.block && !task.block.resolvedAt && task.status !== 'done') && { id: 'blocked', title: 'Tarefas bloqueadas', count: tasks.filter((task) => task.block && !task.block.resolvedAt && task.status !== 'done').length, detail: 'Confira os impedimentos e quem precisa de ajuda.', onClick: () => setAdminTab('kanban'), icon: <AlertTriangle size={15} />, tone: 'border-amber-300/20 bg-amber-300/10 text-amber-100' },
      urgentTasksCount > 0 && { id: 'tasks', title: 'Tarefas vencidas ou para hoje', count: urgentTasksCount, detail: 'Revise o Kanban e combine o próximo passo.', onClick: () => setAdminTab('kanban'), icon: <ClipboardList size={15} />, tone: 'border-orange-300/20 bg-orange-300/10 text-orange-100' },
      urgentEventsCount > 0 && { id: 'events', title: 'Compromissos próximos', count: urgentEventsCount, detail: 'Há eventos hoje ou amanhã na agenda.', onClick: () => setAdminTab('agenda'), icon: <CalendarDays size={15} />, tone: 'border-indigo-300/20 bg-indigo-300/10 text-indigo-100' },
      incompleteStudentRecords.length > 0 && { id: 'students', title: 'Cadastros incompletos', count: incompleteStudentRecords.length, detail: 'Faltam dados básicos ou acesso de integrantes.', onClick: () => setAdminTab('students'), icon: <Users size={15} />, tone: 'border-amber-300/20 bg-amber-300/10 text-amber-100' },
      pendingWeeklyEvaluationCount > 0 && { id: 'evaluations', title: 'Avaliações semanais pendentes', count: pendingWeeklyEvaluationCount, detail: 'Registre o acompanhamento desta semana.', onClick: () => setAdminTab('evaluations'), icon: <ClipboardList size={15} />, tone: 'border-rose-300/20 bg-rose-300/10 text-rose-100' },
      reportsWorkspace.unreadReports.length > 0 && { id: 'reports', title: 'Relatórios não lidos', count: reportsWorkspace.unreadReports.length, detail: 'Há aprendizados novos enviados pela equipe.', onClick: () => openWeeklyReports(), icon: <FileText size={15} />, tone: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100' },
  ].filter(Boolean);

  const adminHeroFooter = (
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] [&>div]:min-w-0">
          <div className="rounded-[20px] border border-white/10 bg-black/25 p-3 backdrop-blur-sm h-full flex flex-col">
              <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-4 min-w-0">
                  {adminProfile?.avatarImage ? (
                      <img src={adminProfile.avatarImage} alt={adminProfile?.name || 'Tecnico'} className="h-20 w-20 rounded-[22px] object-cover border border-red-500/25 shadow-[0_16px_40px_rgba(0,0,0,0.24)]" />
                  ) : (
                      <div className="h-20 w-20 rounded-[22px] bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                          <Bot size={34} className="text-red-300" />
                      </div>
                  )}

                  <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-gray-500 font-bold">Cockpit do tecnico</p>
                      <h3 className="mt-1 text-[15px] font-black leading-tight text-white truncate">{adminProfile?.name || 'Tecnico'}</h3>
                      <p className="mt-2 text-xs font-semibold leading-relaxed text-red-100/85">{adminProfileSpecialty}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1 text-[8px] font-bold uppercase tracking-[0.12em]">
                          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-red-200">Restrito</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-gray-200">{currentWeekData?.weekName || 'Semana ativa'}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-gray-200">{students.length} alunos</span>
                      </div>
                  </div>
                  </div>
                  <button
                      onClick={() => setModal({ type: 'editAdminProfile', data: adminProfile })}
                      className="rounded-[16px] border border-white/10 bg-white/5 p-2 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                      title="Editar perfil"
                  >
                      <Pencil size={13} />
                  </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-[16px] border border-white/10 bg-white/5 px-3 py-2.5">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-gray-500 font-bold">Pulso da equipe</p>
                      <p className="mt-2 text-sm font-black text-white">{teamMoods.length > 0 ? `${teamAverage}%` : 'Check-in'}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{adminProfilePulse}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-white/5 px-3 py-2.5">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-gray-500 font-bold">Radar imediato</p>
                      <p className="mt-2 text-sm font-black text-white">{urgentTasksCount > 0 ? `${urgentTasksCount} alerta(s)` : 'Tudo sob controle'}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{adminProfileWatch}</p>
                  </div>
              </div>

              <div className="mt-auto pt-2.5">
                <div className="rounded-[16px] border border-white/10 bg-white/5 px-2.5 py-2">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-gray-500 font-bold">Janela da semana</p>
                  <p className="mt-1 text-[13px] font-bold text-white leading-snug">
                      {currentWeekData ? `${currentWeekData.startDate.split('-').reverse().join('/')} ate ${currentWeekData.endDate.split('-').reverse().join('/')}` : 'Semana em sincronizacao'}
                  </p>
                </div>
              </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm h-full flex flex-col">
              <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Radar da equipe</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-200">
                      <BarChart3 size={12} /> Operacao
                  </span>
              </div>

              <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2 mt-4">
                  {adminExecutiveSignals.map((signal) => (
                      <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 h-full">
                          <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">{signal.label}</span>
                              <span className={`rounded-xl border px-2 py-1 ${signal.tone}`}>{signal.icon}</span>
                          </div>
                          <p className="text-lg font-black text-white mt-3">{signal.value}</p>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{signal.helper}</p>
                      </div>
                  ))}
              </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm h-full flex flex-col">
              <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Foco imediato</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-200">
                      <Target size={12} /> Prioridades
                  </span>
              </div>

              <div className="space-y-2 mt-4 flex-1">
                  {adminPriorityFocus.length > 0 ? adminPriorityFocus.slice(0, 2).map((item, index) => (
                      <button
                          key={`${item.title}-${index}`}
                          onClick={item.onClick}
                          className={`w-full text-left rounded-2xl border p-3 transition-all hover:bg-black/20 ${item.tone}`}
                      >
                          <p className="text-sm font-bold">{item.title}</p>
                          <p className="text-[11px] mt-2 opacity-90 leading-relaxed">{item.detail}</p>
                      </button>
                  )) : (
                      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-green-100">
                          <p className="text-sm font-bold">Painel estabilizado</p>
                          <p className="text-[11px] mt-2 leading-relaxed">Sem alertas imediatos. Aproveite para lapidar rubricas e narrativa.</p>
                      </div>
                  )}
              </div>

              <div className="mt-auto pt-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold mb-2">Controle rapido</p>
                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setAdminTab('students')} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-xs font-bold text-emerald-100 hover:bg-emerald-500 hover:text-black transition-all">
                          Gerenciar alunos
                      </button>
                      <button onClick={openAttendanceModal} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all">
                          Chamada
                      </button>
                      <button onClick={() => openNewStudentModal()} className="rounded-2xl border border-green-500/20 bg-green-500/10 px-3 py-3 text-xs font-bold text-green-100 hover:bg-green-500 hover:text-white transition-all">
                          Novo aluno
                      </button>
                      <button onClick={handleResetAllActivities} className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-xs font-bold text-red-100 hover:bg-red-500 hover:text-white transition-all">
                          Reset geral
                      </button>
                  </div>
              </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm h-full flex flex-col">
              <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Raio-X e conquistas</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-200">
                      <Crown size={12} /> {unlockedTeamAchievements.length}/{teamAchievementsSummary.length}
                  </span>
              </div>

              <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2 mt-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 h-full">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Impacto</p>
                      <p className="text-lg font-black text-white mt-2">{totalTeamImpact}</p>
                      <p className="text-[11px] text-gray-400 mt-1">pessoas alcancadas</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 h-full">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">XP da equipe</p>
                      <p className="text-lg font-black text-white mt-2">{totalTeamXP}</p>
                      <p className="text-[11px] text-gray-400 mt-1">forca acumulada</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 h-full">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Entregas</p>
                      <p className="text-lg font-black text-white mt-2">{totalTeamTasksDone}</p>
                      <p className="text-[11px] text-gray-400 mt-1">tarefas concluidas</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 h-full">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Especialistas</p>
                      <p className="text-lg font-black text-white mt-2">{totalTeamExperts}</p>
                      <p className="text-[11px] text-gray-400 mt-1">consultas registradas</p>
                  </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Conquista em destaque</p>
                  <p className="text-sm font-bold text-white mt-2">{nextTeamAchievement ? nextTeamAchievement.name : 'Todas as metas destravadas'}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                      {nextTeamAchievement ? `${nextTeamAchievement.current}/${nextTeamAchievement.target} no objetivo atual.` : 'A equipe ja concluiu os marcos coletivos definidos.'}
                  </p>
              </div>
          </div>
      </div>
  );

  const studentMissionTone = viewAsStudent?.station === STATION_KEYS.ENGINEERING
      ? {
          text: 'text-cyan-300',
          border: 'border-cyan-500/20',
          bg: 'from-cyan-500/15 via-sky-500/10 to-transparent',
          button: 'bg-cyan-500/15 text-cyan-100 border-cyan-500/30 hover:bg-cyan-500/25'
        }
      : viewAsStudent?.station === STATION_KEYS.INNOVATION
          ? {
              text: 'text-pink-300',
              border: 'border-pink-500/20',
              bg: 'from-pink-500/15 via-fuchsia-500/10 to-transparent',
              button: 'bg-pink-500/15 text-pink-100 border-pink-500/30 hover:bg-pink-500/25'
            }
          : viewAsStudent?.station === STATION_KEYS.MANAGEMENT
              ? {
                  text: 'text-violet-300',
                  border: 'border-violet-500/20',
                  bg: 'from-violet-500/15 via-indigo-500/10 to-transparent',
                  button: 'bg-violet-500/15 text-violet-100 border-violet-500/30 hover:bg-violet-500/25'
                }
              : {
                  text: 'text-gray-200',
                  border: 'border-white/10',
                  bg: 'from-white/10 via-white/5 to-transparent',
                  button: 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                };

  const studentMissionData = viewAsStudent?.station ? missions[viewAsStudent.station] : null;
  const isStudentMissionDetailed = studentMissionMode === 'detailed';
  const studentMissionDeadlineLabel = officialStudentDeadlineStr.split('-').reverse().join('/');
  const studentMissionNextStep = studentOpenTasksCount > 0
      ? 'Abra Tarefas, escolha a tarefa mais urgente ligada a sua frente e avance nela ainda hoje.'
      : 'Converse com a equipe e assuma uma tarefa da sua estacao para transformar a missao em entrega concreta.';
  const studentSubmissionStatus = viewAsStudent?.submission?.status || 'idle';
  const studentSubmissionTone = studentSubmissionStatus === 'approved'
      ? { label: 'Entrega aprovada', detail: 'Sua entrega foi validada pelo tecnico.', bar: 'bg-green-500/90 text-black', card: 'border-green-500/20 bg-green-500/10 text-green-100', icon: <CheckCircle size={16} /> }
      : studentSubmissionStatus === 'pending'
          ? { label: 'Em analise', detail: 'O tecnico ainda esta avaliando sua entrega.', bar: 'bg-yellow-500/90 text-black', card: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100', icon: <AlertCircle size={16} /> }
          : studentSubmissionStatus === 'rejected'
              ? { label: 'Refazer e reenviar', detail: 'A entrega precisa de ajuste antes da aprovacao.', bar: 'bg-red-500/90 text-white', card: 'border-red-500/20 bg-red-500/10 text-red-100', icon: <AlertTriangle size={16} /> }
              : { label: 'Pronto para agir', detail: 'Ainda nao ha entrega registrada para esta missao.', bar: 'bg-white/15 text-white', card: 'border-white/10 bg-white/5 text-gray-100', icon: <Rocket size={16} /> };

  const studentMissionCards = [
      { label: 'Estacao', value: viewAsStudent?.station || 'Equipe', helper: studentMissionData ? 'frente principal da semana' : 'aguardando definicao', icon: <Target size={16} />, tone: studentMissionTone.button },
      { label: 'Prazo', value: studentMissionDeadlineLabel, helper: officialStudentDeadlineObj.toLocaleDateString('pt-BR', { weekday: 'long' }) + ' do ciclo atual', icon: <CalendarDays size={16} />, tone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-100' },
      { label: STUDENT_TASKS_LABEL, value: studentOpenTasksCount, helper: studentOpenTasksCount > 0 ? 'tarefas abertas no seu quadro' : 'nenhuma pendencia aberta', icon: <ClipboardList size={16} />, tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100' },
      { label: 'Status', value: studentSubmissionTone.label, helper: studentSubmissionTone.detail, icon: studentSubmissionTone.icon, tone: studentSubmissionTone.card }
  ];

  const studentMissionActions = [
      { label: STUDENT_TASKS_OPEN_LABEL, onClick: () => setStudentTab('kanban'), icon: <ClipboardList size={14} />, style: 'bg-orange-500/10 text-orange-200 border-orange-500/20 hover:bg-orange-500 hover:text-white' },
      { label: 'Ver Rubricas', onClick: () => setStudentTab('rubrics'), icon: <Scale size={14} />, style: 'bg-purple-500/10 text-purple-100 border-purple-500/20 hover:bg-purple-500 hover:text-white' },
      { label: 'Registrar Diario', onClick: () => setStudentTab('logbook'), icon: <Book size={14} />, style: 'bg-yellow-500/10 text-yellow-100 border-yellow-500/20 hover:bg-yellow-500 hover:text-black' }
  ];

  const studentMissionFlow = [
      {
          label: 'Receber missao',
          detail: studentMissionData?.text ? 'Missao principal definida pela equipe tecnica.' : 'Aguardando definicao oficial da estacao.',
          icon: <Flag size={15} />,
          tone: studentMissionData?.text ? `${studentMissionTone.button} shadow-[0_12px_30px_rgba(0,0,0,0.18)]` : 'border-white/10 bg-white/5 text-gray-200'
      },
      {
          label: 'Executar',
          detail: studentOpenTasksCount > 0 ? `${studentOpenTasksCount} tarefa(s) conectadas ao seu foco.` : 'Pegue uma tarefa para tirar a missao do papel.',
          icon: <Zap size={15} />,
          tone: studentOpenTasksCount > 0 ? 'border-orange-500/20 bg-orange-500/10 text-orange-100' : 'border-white/10 bg-white/5 text-gray-200'
      },
      {
          label: 'Registrar entrega',
          detail: studentSubmissionTone.label,
          icon: studentSubmissionTone.icon,
          tone: studentSubmissionTone.card
      }
  ];

  const studentMissionCoachCards = viewAsStudent?.station === STATION_KEYS.ENGINEERING
      ? [
          'Mostre teste, ajuste e motivo tecnico por tras da sua escolha.',
          'Se mexeu no robo, documente o que mudou e o que melhorou.',
          'Conecte sua entrega com uma missao real da mesa.'
        ]
      : viewAsStudent?.station === STATION_KEYS.INNOVATION
          ? [
              'Explique o problema de um jeito que qualquer juiz entenda rapido.',
              'Use exemplos concretos para defender a solucao.',
              'Mostre como a ideia evoluiu depois de ouvir pessoas reais.'
            ]
          : viewAsStudent?.station === STATION_KEYS.MANAGEMENT
              ? [
                  'Organize prazos, combinados e proximos passos da equipe.',
                  'Mantenha a comunicacao clara para ninguem ficar perdido.',
                  'Transforme reuniao em acao registrada e acompanhada.'
                ]
              : [
                  'Pegue uma tarefa clara e leve ate o fim.',
                  'Mostre processo, nao so resultado final.',
                  'Se tiver duvida, chame a equipe antes de travar.'
                ];

  const championshipChecklistItems = [
      ...commandCenterReadinessItems,
      {
          label: 'Energia da Equipe',
          ready: teamMoods.length > 0 && teamAverage >= 60,
          detail: teamMoods.length > 0 ? `${teamAverage}% de humor medio registrado.` : 'Fazer check-in da equipe.',
          icon: <Battery size={14} />
      },
      {
          label: 'Urgencias sob controle',
          ready: urgentTasksCount === 0 && urgentEventsCount === 0,
          detail: urgentTasksCount === 0 && urgentEventsCount === 0 ? 'Sem alertas imediatos no Kanban e na agenda.' : `${urgentTasksCount} tarefa(s) e ${urgentEventsCount} alerta(s) ainda exigem resposta.`,
          icon: <AlertTriangle size={14} />
      }
  ];

  const championshipFocusCards = isAdmin
      ? [
          ...adminPriorityFocus,
          innovationAverage < 3 && {
              title: 'Fortalecer narrativa do projeto',
              detail: `A media de Inovacao esta em ${innovationAverage.toFixed(1)}/4. Usem problema, pesquisa e iteracao com mais evidencia.`,
              actionLabel: 'Abrir Rubricas',
              onClick: () => setAdminTab('rubrics'),
              tone: 'border-purple-500/20 bg-purple-500/10 text-purple-100'
          },
          robotAverage < 3 && {
              title: 'Provar processo do robo',
              detail: `A media de Robo esta em ${robotAverage.toFixed(1)}/4. Mostrem estrategia de missoes, testes e explicacao tecnica.`,
              actionLabel: 'Ver Robo',
              onClick: () => setAdminTab('rounds'),
              tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100'
          }
        ].filter(Boolean).slice(0, 4)
      : [
          studentOverdueTasksCount > 0 && {
              title: 'Zerar atrasos da semana',
              detail: `${studentOverdueTasksCount} tarefa(s) ja passaram do prazo e precisam de resposta imediata.`,
              actionLabel: STUDENT_TASKS_OPEN_LABEL,
              onClick: () => setStudentTab('kanban'),
              tone: 'border-red-500/20 bg-red-500/10 text-red-100'
          },
          studentOpenTasksCount > 0 && {
              title: 'Transformar missao em entrega',
              detail: `${studentOpenTasksCount} tarefa(s) abertas no seu fluxo atual. Escolha a mais importante e avance hoje.`,
              actionLabel: 'Ver tarefas',
              onClick: () => setStudentTab('kanban'),
              tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100'
          },
          innovationAverage < 3 && {
              title: 'Estudar a rubrica de inovacao',
              detail: `A equipe esta em ${innovationAverage.toFixed(1)}/4 em Inovacao. Entender os criterios ajuda voce a falar melhor com os juizes.`,
              actionLabel: 'Abrir Rubricas',
              onClick: () => setStudentTab('rubrics'),
              tone: 'border-purple-500/20 bg-purple-500/10 text-purple-100'
          },
          robotAverage < 3 && {
              title: 'Melhorar explicacao tecnica do robo',
              detail: `A media de Robo esta em ${robotAverage.toFixed(1)}/4. Treine como explicar estrategia, testes e melhorias.`,
              actionLabel: 'Ver Robo',
              onClick: () => setStudentTab('rounds'),
              tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100'
          }
        ].filter(Boolean).slice(0, 4);

  const championshipActionButtons = isAdmin
      ? [
          { label: 'Modo Juizes', onClick: openJudgeMode, icon: <Gavel size={14} />, style: 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500 hover:text-black' },
          { label: 'Central de Comando', onClick: openCommandCenterMode, icon: <Crown size={14} />, style: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20 hover:bg-yellow-500 hover:text-black' },
          { label: 'Kanban', onClick: () => setAdminTab('kanban'), icon: <ClipboardList size={14} />, style: 'bg-orange-500/10 text-orange-200 border-orange-500/20 hover:bg-orange-500 hover:text-white' }
        ]
      : [
          { label: 'Abrir Rubricas', onClick: () => setStudentTab('rubrics'), icon: <Scale size={14} />, style: 'bg-purple-500/10 text-purple-200 border-purple-500/20 hover:bg-purple-500 hover:text-white' },
          { label: STUDENT_TASKS_SHORT_LABEL, onClick: () => setStudentTab('kanban'), icon: <ClipboardList size={14} />, style: 'bg-orange-500/10 text-orange-200 border-orange-500/20 hover:bg-orange-500 hover:text-white' },
          { label: 'Minha Missao', onClick: () => setStudentTab('mission'), icon: <Rocket size={14} />, style: 'bg-white/10 text-white border-white/15 hover:bg-white hover:text-black' }
        ];

  const projectImpactNarrative = `${projectSummary?.impact || projectSummary?.sharing || ''}`.trim();
  const projectName = `${projectSummary?.title || ''}`.trim() && projectSummary?.title !== 'Nome do Projeto' ? projectSummary.title : 'nosso projeto';
  const judgeStoryCards = [
      {
          label: 'Projeto de Inovacao',
          title: 'Contem a historia do problema',
          icon: <Lightbulb size={16} />,
          tone: 'border-yellow-500/20 bg-yellow-500/10',
          pitch: projectSummary?.problem
              ? `No ${projectName}, nos concentramos em ${projectSummary.problem}. Nossa solucao e ${projectSummary.solution || 'uma resposta em desenvolvimento'} e buscamos gerar impacto real na comunidade.`
              : 'Definam claramente o problema, a solucao e por que isso importa para a comunidade antes da apresentacao.',
          proofs: [
              projectSummary?.problem ? `Problema mapeado: ${projectSummary.problem}` : 'O problema ainda precisa aparecer com clareza.',
              projectSummary?.solution ? `Solucao atual: ${projectSummary.solution}` : 'Detalhem melhor a solucao proposta.',
              totalImpactPeople > 0 ? `Impacto registrado: ${totalImpactPeople} pessoas alcancadas.` : projectImpactNarrative || 'Registrem impacto real ou compartilhamento da ideia.'
          ]
      },
      {
          label: 'Design do Robo',
          title: 'Mostrem processo tecnico',
          icon: <Wrench size={16} />,
          tone: 'border-cyan-500/20 bg-cyan-500/10',
          pitch: activeCommandCode
              ? `Nossa estrategia do robo hoje parte do codigo ${activeCommandCode.title}, com ${rounds.length} saida(s) planejada(s) e ${iterationRecords} iteracao(oes) documentada(s).`
              : `Nossa equipe esta estruturando a estrategia do robo com ${rounds.length} saida(s) planejada(s) e ${iterationRecords} iteracao(oes) registradas.`,
          proofs: [
              rounds.length > 0 ? `${rounds.length} round(s) planejado(s) para a mesa.` : 'Planejem rounds com prioridade clara de missoes.',
              activeCommandCode ? `Programacao oficial definida: ${activeCommandCode.title}.` : 'Definam e apliquem um codigo oficial no cofre.',
              `Media da rubrica de robo: ${robotAverage.toFixed(1)}/4.`
          ]
      },
      {
          label: 'Equipe',
          title: 'Transmitam maturidade de torneio',
          icon: <Users size={16} />,
          tone: 'border-pink-500/20 bg-pink-500/10',
          pitch: `Somos uma equipe que aprende com iteracao, organiza execucao no Kanban e conecta projeto, robo e impacto para competir com consistencia.`,
          proofs: [
              `${iterationRecords} registro(s) de iteracao no robo e anexos.`,
              `${overallRubricAverage}/4 de media geral nas rubricas oficiais.`,
              urgentTasksCount === 0 ? 'Kanban sem urgencias imediatas.' : `${urgentTasksCount} urgencia(s) ainda precisam de resposta.`
          ]
      }
  ];

  const judgeSpotlightQuestion = innovationAverage < 3
      ? 'Como a equipe definiu o problema e quais evidencias mostram que a pesquisa sustentou a solucao?'
      : robotAverage < 3
          ? 'Que testes e iteracoes provam que a estrategia do robo melhorou ao longo da temporada?'
          : 'Qual feedback externo mais mudou o projeto ou o robo e como essa mudanca apareceu na pratica?';


  // --- MODAL DE XP E APROVAÇÃO (CONECTADO) ---
  const openXPModal = (student, context = 'manual') => {
    if (currentUser?.type !== 'admin') { showNotification('Apenas t\u00e9cnicos podem gerenciar XP.', 'error'); return; }
    setXpPenaltyReason(''); setXpPenaltyShouldNotify(true);
    const operationId = crypto.randomUUID(); let saving = false;
    setModal({ type: 'xp', data: { student, onConfirm: async (amount, reason = '', notifyStudent = true) => {
      const val = Number(amount); if (saving || !Number.isSafeInteger(val) || !val) return;
      const cleanReason = reason.trim(); const shouldNotifyStudent = val < 0 && notifyStudent;
      if (shouldNotifyStudent && !cleanReason) { showNotification('Escreva o motivo para retirar XP.', 'error'); return; }
      const source = context === 'approval' ? 'activity' : val > 0 ? 'manual_reward' : shouldNotifyStudent ? 'penalty' : 'correction';
      saving = true;
      try {
        const result = await adjustStudentXp({ db, user: currentUser, actor: adminProfile?.name || currentUser.name, studentId: student.id, seasonId: activeTeamSeasonId || 'legacy', operationId, amount: val, source, sourceLabel: getXpSourceLabel(source), mode: val > 0 ? 'reward' : shouldNotifyStudent ? 'penalty' : 'correction', reason: cleanReason, notifyStudent: shouldNotifyStudent, approval: context === 'approval', expectedSubmission: student.submission || null });
        syncStudentLocally(result.student);
        void recordActivity({ action: 'atualizou XP', category: 'team', title: student.name, detail: String(result.amount), entityId: student.id });
        closeModal();
        showNotification(context === 'approval' ? 'Atividade aprovada.' : 'XP atualizado.', 'success', { label: 'Desfazer', onClick: async () => {
          try { const undone = await undoStudentXp({ db, user: currentUser, actor: adminProfile?.name || currentUser.name, studentId: student.id, seasonId: activeTeamSeasonId || 'legacy', recordId: result.recordId }); syncStudentLocally(undone.student); showNotification('Ajuste de XP desfeito.'); }
          catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel desfazer o XP.', 'error'); }
        } });
      } catch (error) { showNotification(error.message || 'N\u00e3o foi poss\u00edvel salvar o XP.', 'error'); }
      finally { saving = false; }
    } } });
  }

  const dismissXpLossNotification = async (notificationId) => {
      if (!viewAsStudent?.id) return;

      const currentNotices = normalizeXpLossNotifications(viewAsStudent.xpLossNotifications);
      const targetNotice = currentNotices.find((notice) => notice.id === notificationId);
      const deleteState = getXpLossDeleteState(targetNotice);

      if (!deleteState.canDelete) {
          showNotification(`Essa notificacao ainda nao pode ser apagada. ${deleteState.label}.`, "error");
          return;
      }

      const nextNotices = currentNotices.filter((notice) => notice.id !== notificationId);

      try {
          await updateDoc(doc(db, "students", viewAsStudent.id), {
              xpLossNotifications: nextNotices
          });

          setViewAsStudent(prev => prev ? { ...prev, xpLossNotifications: nextNotices } : prev);
          setStudents(prevStudents => prevStudents.map(student =>
              student.id === viewAsStudent.id ? { ...student, xpLossNotifications: nextNotices } : student
          ));
          showNotification("Notificacao apagada.", "success");
      } catch (error) {
          console.error("Erro ao apagar notificacao de XP:", error);
          showNotification("Erro ao apagar notificacao.", "error");
      }
  }

  // --- RECUSAR ATIVIDADE (CONECTADO) ---
  const handleRejectClick = (student) => { 
      setModal({ 
          type: 'confirm', 
          data: { 
              title: "Recusar Entrega?", 
              msg: "O aluno receberá um aviso para refazer.", 
              onConfirm: async () => { 
                  try {
                      const studentRef = doc(db, "students", student.id);
                      
                      // Muda status para 'rejected'
                      const newSubmission = { ...student.submission, status: 'rejected' };
                      
                      await updateDoc(studentRef, { submission: newSubmission });
                      
                      closeModal(); 
                      showNotification("Atividade recusada.", "error");
                  } catch (error) {
                      console.error("Erro ao recusar:", error);
                      showNotification("Erro ao salvar.", "error");
                  }
              } 
          } 
      }) 
  }

  // --- FUNÇÃO CORRIGIDA: MOVER ALUNO (Salva no Firebase) ---
  const moveStudent = async (id, st) => {
      try {
          // Referência ao documento do aluno no banco
          const studentRef = doc(db, "students", id);
          
          // Atualiza o campo 'station' no Firebase
          // A mudança manual preserva a entrega e encerra a possibilidade de desfazer uma aplicação anterior.
          await updateDoc(studentRef, { 
              station: st,
              rotationApplicationId: null
          });

          // Feedback visual
          if (st) showNotification(`Aluno movido para ${st}`);
          else showNotification("Aluno voltou para a Equipe");

      } catch (error) {
          console.error("Erro ao mover aluno:", error);
          showNotification("Erro ao salvar mudança.", "error");
      }
  }

  const updateStudentSpecialty = async (student, specialty) => {
      if (!isAdmin || !student?.id) return;

      try {
          await updateDoc(doc(db, "students", student.id), {
              specialty,
          });

          setStudents((prev) =>
              prev.map((item) => (item.id === student.id ? { ...item, specialty } : item))
          );

          setViewAsStudent((prev) =>
              prev?.id === student.id ? { ...prev, specialty } : prev
          );

          showNotification(
              specialty
                  ? `Especialidade de ${student.name} atualizada para ${specialty}.`
                  : `Especialidade de ${student.name} limpa com sucesso.`,
              "success"
          );
      } catch (error) {
          console.error("Erro ao atualizar especialidade do aluno:", error);
          showNotification("Erro ao atualizar especialidade.", "error");
      }
  };

  // --- APROVAÇÃO RÁPIDA DE ATIVIDADES (EMAIL/EXTERNO) ---
  const toggleActivityStatus = async (student, newStatus) => {
      try {
          const studentRef = doc(db, "students", student.id);
          if (!newStatus) {
              await updateDoc(studentRef, { submission: null });
              showNotification("Status de entrega removido.");
          } else {
              const newSubmission = { 
                  status: newStatus,
                  text: "Avaliado manualmente pelo Técnico (E-mail/Externo)",
                  date: new Date().toLocaleString(),
                  fileName: "Sem arquivo na plataforma"
              };
              await updateDoc(studentRef, { submission: newSubmission });
              showNotification(newStatus === 'approved' ? 'Atividade Aprovada!' : 'Atividade Recusada!', newStatus === 'approved' ? 'success' : 'error');
          }
      } catch (error) {
          console.error("Erro ao alterar status da atividade:", error);
          showNotification("Erro ao salvar.", "error");
      }
  };

  // --- FUNÇÃO PARA RESETAR TODAS AS ATIVIDADES ---
  async function handleResetAllActivities() {
      if (!window.confirm("Tem certeza que deseja limpar as entregas de atividades de TODOS os alunos? Isso preparará o sistema para a próxima semana de treinos.")) return;
      
      try {
          const updates = students.map(student => {
              if (student.submission) {
                  return updateDoc(doc(db, "students", student.id), { submission: null });
              }
              return Promise.resolve();
          });

          await Promise.all(updates);
          showNotification("Todas as atividades foram resetadas!", "success");
      } catch (error) {
          console.error("Erro ao resetar atividades:", error);
          showNotification("Erro ao resetar.", "error");
      }
  }

// --- CARREGAR AS METAS DO BANCO (Memória Longa) ---
  useEffect(() => {
    if (FIREBASE_AUTH_ENABLED && !currentUser?.type) return;
    const docRef = doc(db, "settings", "weekly_missions");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMissions(docSnap.data());
      } else {
        setMissions({
          [STATION_KEYS.ENGINEERING]: {},
          [STATION_KEYS.INNOVATION]: {},
          [STATION_KEYS.MANAGEMENT]: {}
        });
      }
    });
    return () => unsubscribe();
  }, [currentUser?.uid, currentUser?.type]);

  // --- ATUALIZAR NA TELA ENQUANTO DIGITAM (Memória Curta) ---
  const updateMission = (station, field, value) => {
    setMissions(prev => ({
      ...prev,
      [station]: { ...prev[station], [field]: value }
    }));
  };

  // --- FUNÇÃO PARA SALVAR A AUTO-AVALIAÇÃO DA RUBRICA ---
  const handleRubricUpdate = async (rubricType, category, value) => {
    if (!currentUser || !['innovation', 'robot_design'].includes(rubricType)) return;
    const defaults = rubricType === 'innovation' ? DEFAULT_INNOVATION_RUBRIC : DEFAULT_ROBOT_DESIGN_RUBRIC;
    if (!Object.hasOwn(defaults, category) || !Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 4) return;
    const docId = rubricType === 'innovation' ? 'rubric_innovation' : 'rubric_robot_design';
    try {
      await runTransaction(db, async (transaction) => {
        await assertActiveSeason(transaction, db, activeTeamSeasonId || 'legacy');
        transaction.set(doc(db, 'settings', docId), { [category]: Number(value) }, { merge: true });
      });
      void recordActivity({ action: 'atualizou uma rubrica', category: 'team', title: rubricType, detail: category + ': ' + value, entityId: docId });
    } catch { showNotification('N\u00e3o foi poss\u00edvel salvar a rubrica. Confira a conex\u00e3o e tente novamente.', 'error'); }
  };

  // --- SALVAR NO BANCO QUANDO CLICAR FORA DA CAIXA (O Pulo do Gato) ---
  const saveMissionToFirebase = async (station) => {
    try {
      await runTransaction(db, async (transaction) => {
        await assertActiveSeason(transaction, db, activeTeamSeasonId || 'legacy');
        transaction.set(doc(db, 'settings', 'weekly_missions'), { [station]: missions[station] }, { merge: true });
      });
    } catch (error) {
      showNotification('N\u00e3o foi poss\u00edvel salvar a meta. Seu texto continua na tela.', 'error');
      throw error;
    }
  };

  const handleSaveStationMission = async (station) => {
    try { await saveMissionToFirebase(station); void recordActivity({ action: 'atualizou a miss\u00e3o de uma esta\u00e7\u00e3o', category: 'team', title: station, detail: missions[station]?.text || '' }); showNotification('Meta salva.'); }
    catch { /* The failed write is displayed by saveMissionToFirebase. */ }
  };

  const closeModal = () => { setModal({ type: null, data: null }); setSelectedFile(null); setIsCropping(false); }

// --- FUNÇÃO AUXILIAR PARA TRANSFORMAR O ARQUIVO EM TEXTO ---

const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const handleSubmitActivity = async (e) => { 
      e.preventDefault(); 
      setIsSubmitting(true);

      try {
          const submissionData = { 
              text: "Atividade enviada por e-mail/externo.",
              fileName: "Enviado por email/externo", 
              fileUrl: "", // Removendo links
              date: new Date().toLocaleString(), 
              status: "pending" 
          };

          const studentRef = doc(db, "students", viewAsStudent.id);
          await updateDoc(studentRef, { 
              submission: submissionData 
          });
          void recordActivity({
              action: 'registrou uma entrega para validacao',
              category: 'team',
              title: viewAsStudent.name,
              detail: missions[viewAsStudent.station]?.text || 'Atividade semanal enviada.'
          });

          setSubmissionText(""); 
          showNotification("Aviso de atividade enviado para validação pelo Técnico!");
      
      } catch (error) {
          console.error("Erro ao enviar:", error);
          showNotification("Erro ao sinalizar o Técnico.", "error");
      } finally {
          setIsSubmitting(false);
      }
  };
// ATENÇÃO: COLOQUE ISSO NO SEU CÓDIGO DO TÉCNICO
// --- FUNÇÃO DO BOTÃO 'BAIXAR ARQUIVO' NO PAINEL DO TÉCNICO ---

  // --- UI COMPONENTS ---

  // --- COMPONENTE DE ESTATÍSTICAS DA EQUIPE (VISÃO DOS JUÍZES) ---
  const renderTeamStatsPanel = () => {
      const totalXP = students.reduce((sum, s) => sum + (s.xp || 0), 0);
      const totalBadges = students.reduce((sum, s) => sum + (s.badges?.length || 0), 0);
      const totalImpact = outreachEvents.reduce((sum, ev) => sum + (ev.people || 0), 0);
      const totalTasksDone = tasks.filter(t => t.status === 'done').length;
      const totalExperts = experts.length;
      const totalRobotVersions = robotVersions.length;
      const maxScore = scoreHistory.reduce((max, h) => Math.max(max, h.score || 0), 0);
      const approvedStudentsThisWeek = students.filter(s => s.submission?.status === 'approved').length;

      const stats = [
          { label: 'Pessoas Impactadas', value: totalImpact, icon: <Megaphone size={16}/>, color: 'text-orange-500' },
          { label: 'Especialistas', value: totalExperts, icon: <Briefcase size={16}/>, color: 'text-purple-500' },
          { label: 'Versões do Robô', value: totalRobotVersions, icon: <GitCommit size={16}/>, color: 'text-blue-500' },
          { label: 'Recorde de Pontos', value: maxScore, icon: <Trophy size={16}/>, color: 'text-green-500' },
          { label: 'Tarefas Entregues', value: totalTasksDone, icon: <CheckCheck size={16}/>, color: 'text-pink-500' },
          { label: 'Badges Coletadas', value: totalBadges, icon: <Medal size={16}/>, color: 'text-cyan-500' },
          { label: 'XP da Equipe', value: totalXP, icon: <Zap size={16}/>, color: 'text-yellow-500' },
          { label: 'Aprovados (Semana)', value: approvedStudentsThisWeek, icon: <CheckCircle size={16}/>, color: 'text-green-400' }
      ];

      return (
          <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 mb-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><BarChart3 size={150} /></div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10"><BarChart3 className="text-blue-500"/> Raio-X da Temporada (Dados para Juízes)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-4 relative z-10">
                  {stats.map((st, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                          <div className={`mb-2 ${st.color}`}>{st.icon}</div>
                          <p className={`text-2xl font-black ${st.color}`}>{st.value}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 leading-tight">{st.label}</p>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // --- COMPONENTE DE CONQUISTAS COLETIVAS (TEAM ACHIEVEMENTS) ---
  const renderTeamAchievementsPanel = ({ showLocked = true } = {}) => {
      const totalXP = students.reduce((sum, s) => sum + (s.xp || 0), 0);
      const totalImpact = outreachEvents.reduce((sum, ev) => sum + (ev.people || 0), 0);
      const totalTasksDone = tasks.filter(t => t.status === 'done').length;
      const totalExperts = experts.length;
      const totalRounds = rounds.length;
      const bestScore = scoreHistory.reduce((max, h) => Math.max(max, h.score || 0), 0);
      const totalDiaryEntries = logbookEntries.length;
      const officialProgramReady = isOfficialProgramBadgeOpen && activeCommandCode ? 1 : 0;
      const successfulWeeksCount = Math.max(
          Number(teamSeasonStats.successfulWeeks) || 0,
          Array.isArray(teamSeasonStats.successfulWeekIds) ? teamSeasonStats.successfulWeekIds.length : 0
      );
      const achievements = [
          { id: 'team_xp', name: 'Potência Máxima', icon: <Zap size={16}/>, color: 'text-yellow-400', bg: 'bg-yellow-500', desc: 'Atingir 6.000 XP somados por toda a equipe.', current: totalXP, target: 6000 },
          { id: 'team_impact', name: 'Voz da Mudança', icon: <Megaphone size={16}/>, color: 'text-orange-500', bg: 'bg-orange-500', desc: 'Impactar mais de 350 pessoas com o projeto.', current: totalImpact, target: 350 },
          { id: 'team_tasks', name: 'Maquina de Produtividade', icon: <CheckCheck size={16}/>, color: 'text-emerald-400', bg: 'bg-emerald-500', desc: 'Concluir 300 tarefas no Kanban da equipe.', current: totalTasksDone, target: 300 },
          { id: 'team_experts', name: 'Mentes Conectadas', icon: <Briefcase size={16}/>, color: 'text-violet-400', bg: 'bg-violet-500', desc: 'Registrar 5 especialistas ou mentorias que ajudaram o time.', current: totalExperts, target: 5 },
          { id: 'team_official_code', name: 'Programacao Oficial', icon: <Laptop size={16}/>, color: 'text-cyan-400', bg: 'bg-cyan-500', desc: isOfficialProgramBadgeOpen ? 'Definir uma programacao oficial do robo para treino e apresentacao.' : 'Liberada a partir de agosto, quando a temporada comeca oficialmente.', current: officialProgramReady, target: 1 },
          { id: 'team_rounds', name: 'Estrategia de Mesa', icon: <Rocket size={16}/>, color: 'text-blue-400', bg: 'bg-blue-500', desc: 'Planejar 6 saidas de mesa com objetivo claro.', current: totalRounds, target: 6 },
          { id: 'team_score', name: 'Recorde Competitivo', icon: <Trophy size={16}/>, color: 'text-green-400', bg: 'bg-green-500', desc: 'Bater 300 pontos em um treino ou round oficial.', current: bestScore, target: 300 },
          { id: 'team_logbook', name: 'Diario Vivo', icon: <Book size={16}/>, color: 'text-amber-400', bg: 'bg-amber-500', desc: 'Salvar 25 registros no diario de engenharia.', current: totalDiaryEntries, target: 25 },
          { id: 'team_readiness', name: 'Prontidao FLL', icon: <Crown size={16}/>, color: 'text-yellow-200', bg: 'bg-yellow-500', desc: 'Chegar a 85% de prontidao no mapa FLL.', current: commandCenterReadinessScore, target: 85 },
          { id: 'team_weekly_delivery', name: '40 Semanas Fechadas', icon: <CheckCircle size={16}/>, color: 'text-lime-400', bg: 'bg-lime-500', desc: 'Fechar 40 semanas com todos os alunos aprovados e todas as atividades entregues.', current: successfulWeeksCount, target: 40 }
      ];
      const visibleAchievements = showLocked ? achievements : achievements.filter((ach) => ach.current >= ach.target);

      return (
          <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-xl">
              <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
                  <Trophy size={180} />
              </div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                  <Crown className="text-yellow-500"/> Conquistas da Equipe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 relative z-10">
                  {visibleAchievements.map(ach => {
                      const isUnlocked = ach.current >= ach.target;
                      const progress = Math.min(100, (ach.current / ach.target) * 100);
                      const remaining = Math.max(0, ach.target - ach.current);
                      const achievementHint = isUnlocked
                          ? `${ach.name}: desbloqueada pela equipe.`
                          : `${ach.name}: ${ach.desc} Progresso: ${ach.current}/${ach.target}. Falta ${remaining}.`;
                      
                      return (
                          <div
                              key={ach.id}
                              title={achievementHint}
                              aria-label={achievementHint}
                              className={`p-4 rounded-xl border flex flex-col relative overflow-hidden transition-all duration-500 ${isUnlocked ? 'bg-gradient-to-br from-white/10 to-transparent border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)] scale-[1.02]' : 'bg-black/40 border-white/5 opacity-80'}`}
                          >
                              <div className="flex items-start gap-1.5 mb-2">
                                  <div className={`p-1 rounded-lg shrink-0 ${isUnlocked ? ach.bg + '/20 ' + ach.color : 'bg-white/5 text-gray-500'}`}>
                                      {ach.icon}
                                  </div>
                                  <div className="flex-1 min-w-0 pb-1">
                                      <h4 className={`font-bold text-xs leading-tight break-words ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{ach.name}</h4>
                                      {isUnlocked ? <span className="text-[9px] text-green-400 font-bold flex items-center gap-1 uppercase mt-0.5"><CheckCircle size={9} className="shrink-0"/> Desbloqueado</span> : <span className="text-[9px] text-gray-500 uppercase mt-0.5 font-bold flex items-center gap-1"><Lock size={9} className="shrink-0"/> Bloqueado</span>}
                                  </div>
                              </div>
                              <p className="text-xs text-gray-400 mb-3 flex-1">{ach.desc}</p>
                              <div className="w-full bg-gray-800 rounded-full h-2 mb-1 overflow-hidden"><div className={`h-full transition-all duration-1000 ${isUnlocked ? ach.bg : 'bg-gray-500'}`} style={{width: `${progress}%`}}></div></div>
                              <div className="text-[10px] text-right font-mono text-gray-500 font-bold">{ach.current} / {ach.target}</div>
                              {!isUnlocked && <div className="mt-1 text-[10px] font-bold text-gray-500">Falta {remaining} para desbloquear.</div>}
                          </div>
                      )
                  })}
                  {visibleAchievements.length === 0 && (
                      <div className="md:col-span-2 rounded-xl border border-white/5 bg-black/40 p-4 text-sm font-bold text-gray-400">
                          Nenhuma conquista coletiva desbloqueada ainda.
                      </div>
                  )}
              </div>
          </div>
      )
  };


  const renderDisciplinePanel = () => {
      const topConsistency = consistencyRanking.slice(0, 5);
      const rowsWithLosses = consistencyRanking
          .filter((row) => row.xpLosses.length > 0 || row.overdueTasks > 0 || row.attendanceStats.absences > 0)
          .sort((left, right) => right.weeklyLosses.length - left.weeklyLosses.length || right.weeklyLost - left.weeklyLost || right.totalLost - left.totalLost);

      return (
          <div className="space-y-6">
              <section className="newgears-major-panel rounded-[30px] border border-red-500/20 bg-red-500/10 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-100">
                              <Shield size={12} /> Painel de disciplina
                          </span>
                          <h3 className="mt-3 text-2xl font-black text-white">Perdas de XP e reincidencia</h3>
                          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-red-100/80">
                              Aqui fica o historico de motivos, quem repetiu perda na semana e onde vale intervir antes que vire costume.
                          </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center md:grid-cols-4">
                          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Revisao</p>
                              <p className="mt-2 text-xl font-black text-white">{pendingLeaderPenaltyRequests.length}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Alertas</p>
                              <p className="mt-2 text-xl font-black text-white">{disciplineAlerts.length}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">XP semana</p>
                              <p className="mt-2 text-xl font-black text-white">-{totalWeeklyXpLost}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Reinc.</p>
                              <p className="mt-2 text-xl font-black text-white">{disciplineRows.filter((row) => row.recurrence).length}</p>
                          </div>
                      </div>
                  </div>

                  {pendingLeaderPenaltyRequests.length > 0 && (
                      <div className="mt-5 rounded-[24px] border border-yellow-300/25 bg-yellow-400/10 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                  <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100">
                                      <Gavel size={12} /> Revisao do tecnico
                                  </span>
                                  <h4 className="mt-3 text-lg font-black text-white">Penalizacoes pedidas pelo lider</h4>
                                  <p className="mt-1 text-sm leading-relaxed text-yellow-50/80">
                                      Nada foi descontado ainda. Aprove apenas quando o motivo fizer sentido.
                                  </p>
                              </div>
                              <span className="rounded-full border border-yellow-300/25 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-100">
                                  {pendingLeaderPenaltyRequests.length} pendente(s)
                              </span>
                          </div>

                          <div className="mt-4 grid gap-3">
                              {pendingLeaderPenaltyRequests.map((request) => (
                                  <div key={request.id} className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                          <div className="min-w-0">
                                              <div className="flex flex-wrap items-center gap-2">
                                                  <p className="text-base font-black text-white">{request.studentName || 'Aluno'}</p>
                                                  <span className="rounded-full border border-yellow-300/20 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-yellow-100">{request.amount || LEADER_PENALTY_XP} XP solicitado</span>
                                                  {request.evidenceImage && <span className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">Com foto</span>}
                                              </div>
                                              <p className="mt-2 text-sm font-bold leading-relaxed text-yellow-50">{request.reason || 'Sem motivo informado.'}</p>
                                              <p className="mt-2 text-[11px] font-bold text-yellow-100/70">
                                                  Lider: {request.requestedByLeaderName || 'Nao informado'} | {formatShortDateLabel(request.requestedAt)}
                                              </p>
                                              {request.evidenceImage && (
                                                  <img
                                                      src={request.evidenceImage}
                                                      alt={`Evidencia enviada por ${request.requestedByLeaderName || 'lider'}`}
                                                      className="mt-3 max-h-56 w-full rounded-2xl border border-white/10 object-cover"
                                                  />
                                              )}
                                          </div>
                                          <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[260px] lg:justify-end">
                                              <button
                                                  type="button"
                                                  onClick={() => handleLeaderPenaltyReview(request, 'approved')}
                                                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-green-300/25 bg-green-500/15 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-green-100 transition-all hover:bg-green-500 hover:text-black"
                                              >
                                                  <Check size={14} /> Aprovar
                                              </button>
                                              <button
                                                  type="button"
                                                  onClick={() => handleLeaderPenaltyReview(request, 'rejected')}
                                                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-300/25 bg-red-500/15 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-100 transition-all hover:bg-red-500 hover:text-white"
                                              >
                                                  <X size={14} /> Rejeitar
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className={`mt-5 rounded-[24px] border p-4 ${
                      isBisRewardAlive
                          ? 'border-emerald-400/25 bg-emerald-500/10'
                          : 'border-red-400/25 bg-red-500/10'
                  }`}>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                                  <span>🍫</span> Caixa de Bis
                              </span>
                              <h4 className="mt-3 text-lg font-black text-white">{isBisRewardAlive ? 'Recompensa coletiva ainda viva' : 'Recompensa bloqueada neste ciclo'}</h4>
                              <p className="mt-1 text-sm leading-relaxed text-gray-300">
                                  Ciclo {bisCycleLabel}. {isBisRewardAlive ? 'Nenhuma perda de XP registrada ate agora.' : `${bisRewardLosses.length} perda(s) de XP bloquearam a compra neste ciclo.`}
                              </p>
                          </div>
                          {!isBisRewardAlive && (
                              <div className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
                                  {bisRewardLosses.slice(0, 4).map((event) => (
                                      <span key={`${event.studentId}-${event.id}`} className="rounded-full border border-red-400/25 bg-black/20 px-3 py-1 text-xs font-bold text-red-100">
                                          {event.studentName}: {event.amount} XP
                                      </span>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                      {rowsWithLosses.length > 0 ? rowsWithLosses.map((row) => {
                          const mood = getXpLossMood(row.latestNotice?.amount || -5);
                          return (
                              <div key={row.student.id} className={`rounded-[24px] border p-4 ${row.recurrence ? 'border-red-400/30 bg-red-500/15' : 'border-white/10 bg-black/25'}`}>
                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                      <div className="min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                              <p className="text-base font-black text-white">{row.student.name}</p>
                                              {row.recurrence && <span className="rounded-full border border-red-400/30 bg-red-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-100">Reincidencia semanal</span>}
                                              {row.latestNotice && <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${mood.tone}`}>{mood.emoji} ultimo: {row.latestNotice.amount} XP</span>}
                                          </div>
                                          <p className="mt-2 text-sm leading-relaxed text-gray-300">{row.latestNotice?.reason || 'Sem perda de XP recente registrada.'}</p>
                                          <p className="mt-1 text-[11px] font-bold text-gray-500">{row.latestNotice ? `Ultimo registro: ${formatXpLossDate(row.latestNotice.date)}` : 'Acompanhamento preventivo'}</p>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-center lg:min-w-[360px]">
                                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-500">Semana</p>
                                              <p className="mt-2 text-sm font-black text-white">{row.weeklyLosses.length}x / -{row.weeklyLost}</p>
                                          </div>
                                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-500">Total</p>
                                              <p className="mt-2 text-sm font-black text-white">{row.xpLosses.length}x / -{row.totalLost}</p>
                                          </div>
                                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-500">Faltas</p>
                                              <p className="mt-2 text-sm font-black text-white">{row.attendanceStats.absences}</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          );
                      }) : (
                          <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm font-bold text-emerald-100">
                              Sem perdas de XP registradas. Excelente momento para reforcar comportamento positivo.
                          </div>
                      )}
                  </div>
              </section>

              <section className="newgears-major-panel rounded-[30px] border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
                              <Trophy size={12} /> Ranking de consistencia
                          </span>
                          <h3 className="mt-3 text-2xl font-black text-white">Quem esta segurando o ritmo</h3>
                          <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">Pontua presenca, tarefas feitas e pouca perda de XP. E um ranking positivo, para virar cultura.</p>
                      </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                      {topConsistency.map((row, index) => (
                          <div key={row.student.id} className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                              <div className="flex items-center justify-between gap-4">
                                  <div className="flex min-w-0 items-center gap-3">
                                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10 text-sm font-black text-emerald-100">#{index + 1}</span>
                                      <div className="min-w-0">
                                          <p className="truncate text-sm font-black text-white">{row.student.name}</p>
                                          <p className="mt-1 text-[11px] text-gray-400">{row.doneTasks} tarefa(s) feitas | {row.overdueTasks} atraso(s) | {row.weeklyLosses.length} perda(s) na semana</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-2xl font-black text-emerald-100">{row.consistencyScore}</p>
                                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">pontos</p>
                                  </div>
                              </div>
                              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/35">
                                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${Math.min(100, row.consistencyScore)}%` }} />
                              </div>
                          </div>
                      ))}
                  </div>
              </section>
          </div>
      );
  }

  const renderNotification = () => {
      if (!notification) return null;

      const action = notification.action;
      const handleActionClick = () => {
          if (notificationTimeoutRef.current) {
              clearTimeout(notificationTimeoutRef.current);
          }
          setNotification(null);
          void action?.onClick?.();
      };

      return (
        <NotificationToast notification={notification} onAction={handleActionClick} onDismiss={() => { clearTimeout(notificationTimeoutRef.current); setNotification(null); }} />
      );
  }

  const renderXpLossAlertModal = () => {
      if (!xpLossAlertNotice) return null;

      const mood = getXpLossMood(xpLossAlertNotice.amount);
      const xpLost = Math.abs(xpLossAlertNotice.amount);
      const deleteState = getXpLossDeleteState(xpLossAlertNotice);
      const blocksBisReward = isNoticeInsideRange(xpLossAlertNotice, bisCycleStartDate, bisCycleEndDate);

      return (
          <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
              <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[#11121d] shadow-[0_36px_110px_rgba(0,0,0,0.55)]">
                  <div className={`h-2 bg-gradient-to-r ${mood.bar}`} />
                  <button
                      type="button"
                      onClick={() => setXpLossAlertNotice(null)}
                      className="absolute right-4 top-4 rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                      aria-label="Fechar alerta de XP"
                  >
                      <X size={18} />
                  </button>

                  <div className="p-6 md:p-8">
                      <div className="flex items-start gap-4 pr-10">
                          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] border text-5xl ${mood.tone}`}>
                              {mood.emoji}
                          </div>
                          <div className="min-w-0">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${mood.tone}`}>
                                  {mood.label}
                              </span>
                              <h3 className="mt-3 text-2xl font-black leading-tight text-white">Voce perdeu {xpLost} XP</h3>
                              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                                  {hasStudentWeeklyRecurrence
                                      ? `Atencao: voce ja perdeu XP ${studentWeeklyXpLosses.length} vezes nesta semana. Isso entrou como reincidencia no painel do tecnico.`
                                      : 'Esse aviso vai voltar a cada 5 minutos enquanto a notificacao estiver ativa.'}
                              </p>
                          </div>
                      </div>

                      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/25 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-black text-red-100">
                                  -{xpLost} XP
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-gray-300">
                                  {formatXpLossDate(xpLossAlertNotice.date)}
                              </span>
                          </div>
                          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Motivo</p>
                          <p className="mt-2 text-base font-bold leading-relaxed text-white break-words">{xpLossAlertNotice.reason || 'Sem motivo informado.'}</p>
                      </div>

                      <div className="mt-5 rounded-[20px] border border-white/10 bg-white/5 p-3 text-xs font-bold leading-relaxed text-gray-300">
                          {hasStudentWeeklyRecurrence && <span className="mb-2 block text-red-100">Reincidencia semanal ativa: procure recuperar postura e tarefas antes do proximo treino.</span>}
                          {blocksBisReward && <span className="mb-2 block text-yellow-100">Caixa de Bis: essa perda bloqueia a recompensa coletiva deste ciclo.</span>}
                          Voce so pode apagar essa notificacao depois de 5 dias da retirada. Status: <span className="text-white">{deleteState.label}</span>.
                      </div>

                      <button
                          type="button"
                          onClick={() => setXpLossAlertNotice(null)}
                          className="mt-6 w-full rounded-2xl border border-red-400/20 bg-red-500/15 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-red-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                          Entendi
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- MODAL DE CRONOGRAMA (CORRIGIDO E ROBUSTO) ---
  const ScheduleModal = () => { 
    if(!showFullSchedule) return null; 

    // Função interna inteligente para resolver o nome
    // Aceita: ID, Objeto {name: "Ana"} ou String "Ana"
    const resolveName = (item) => {
        if (!item) return "Vago";
        
        // 1. Se for um objeto com nome (nosso fix anterior)
        if (typeof item === 'object' && item.name) return item.name;
        
        // 2. Se for um ID, tenta achar na lista de alunos
        const found = students.find(s => s.id === item);
        if (found) return found.name;

        // 3. Se não achou ID, assume que o próprio item é o nome (Texto)
        return item; 
    };

    return ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in backdrop-blur-sm"> 
            <div className="bg-[#151520] border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col relative shadow-2xl overflow-hidden"> 
                
                {/* Cabeçalho */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0f]">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <CalendarDays className="text-blue-500"/> Cronograma Completo (36 Semanas)
                    </h3>
                    <button onClick={() => setShowFullSchedule(false)} className="text-gray-400 hover:text-white p-2 bg-white/5 rounded-lg">
                        <X size={24}/>
                    </button>
                </div> 

                {/* Conteúdo com Scroll */}
                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    <div className="min-w-[800px]"> 
                        {rotationSchedule.map((week, idx) => (
                            <div key={week.id || idx} className="mb-8 last:mb-0">
                                {/* Barra da Data */}
                                <div className="flex items-center gap-4 mb-4 sticky left-0">
                                    <div className="bg-white/5 px-4 py-1 rounded-full border border-white/10 text-yellow-400 font-bold text-sm">
                                        {week.weekName}
                                    </div>
                                    <div className="text-gray-500 text-xs font-mono">
                                        {week.startDate.split('-').reverse().join('/')} - {week.endDate.split('-').reverse().join('/')}
                                    </div>
                                    <div className="flex-1 border-b border-white/5 ml-4"></div>
                                </div>

                                {/* Grid das Estações */}
                                <div className="grid grid-cols-3 gap-4">
                                    
                                    {/* 1. Engenharia */}
                                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                                        <h4 className="text-blue-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><Rocket size={14}/> Engenharia</h4>
                                        <div className="space-y-2">
                                            {week.assignments.Engenharia.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-500 font-bold"><UserCircle size={14}/></div>
                                                    <span className="text-sm text-gray-300">{resolveName(item)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Inovação */}
                                    <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4">
                                        <h4 className="text-pink-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><Microscope size={14}/> {STATION_KEYS.INNOVATION}</h4>
                                        <div className="space-y-2">
                                            {(week.assignments[STATION_KEYS.INNOVATION] || []).map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                                                    <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px] text-pink-500 font-bold"><UserCircle size={14}/></div>
                                                    <span className="text-sm text-gray-300">{resolveName(item)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Gestão (CORRIGIDO) */}
                                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                                        <h4 className="text-purple-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><BookOpen size={14}/> {STATION_KEYS.MANAGEMENT}</h4>
                                        <div className="space-y-2">
                                            {(week.assignments[STATION_KEYS.MANAGEMENT] || []).map((item, i) => {
                                                const studentName = resolveName(item);
                                                // Verifica se é o aluno rotativo na gestão (que assume como líder)
                                                const isLeader = studentName !== 'Sofia' && studentName !== 'Heloise' && studentName !== 'Vago';
                                                
                                                return (
                                                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${isLeader ? 'bg-gradient-to-r from-yellow-500/10 to-black/40 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.15)]' : 'bg-black/40 border-white/5'}`}>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isLeader ? 'bg-yellow-500/20 text-yellow-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                                            {isLeader ? <Crown size={14}/> : <UserCircle size={14}/>}
                                                        </div>
                                                        <div className="flex flex-col justify-center">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`text-sm ${isLeader ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                                                                    {studentName}
                                                                </span>
                                                                {isLeader && (
                                                                    <span className="text-[8px] text-yellow-500 font-bold uppercase tracking-widest bg-yellow-500/10 px-1 py-0.5 rounded border border-yellow-500/20">
                                                                        Líder
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div> 
            </div> 
        </div> 
    ) 
  }

  // --- MODAL GERAL ---

  const renderModal = () => {

    if (!modal.type) return null;
    const isScrollableModal = modal.type !== 'attendance';
    const modalFrameClass = modal.type === 'seasonTransition'
      ? 'max-w-3xl max-h-[92vh] p-6 overflow-y-auto custom-scrollbar'
      : modal.type === 'imageView'
      ? 'max-w-4xl h-auto p-6 overflow-y-auto custom-scrollbar'
      : modal.type === 'expertContactForm'
        ? 'max-w-2xl max-h-[92vh] p-6 overflow-y-auto custom-scrollbar'
        : modal.type === 'attendance'
        ? 'max-w-7xl h-[94vh] overflow-hidden p-0'
        : 'max-w-md max-h-[90vh] p-6 overflow-y-auto custom-scrollbar';

    return (

      <DialogSurface key={modal.type} onClose={closeModal} label="Detalhes" closeButton className={`newgears-modal-frame w-full relative animate-in zoom-in-95 z-60 ${isScrollableModal ? 'newgears-modal-scrollable' : ''} ${modalFrameClass}`}>



          {modal.type === 'imageView' && <img src={modal.data} className="w-full h-auto rounded-lg" alt="Evidência" />}

          {/* --- MODAL DE RECORTE (CROP) --- */}
          {isCropping && (
            <DialogSurface onClose={() => setIsCropping(false)} label="Ajustar foto" closeButton className="bg-zinc-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Crop size={20}/> Ajustar Foto</h3>
                    
                    {/* Área de Visualização e Arrastar */}
                    <div 
                        className="relative w-[200px] h-[200px] bg-black overflow-hidden rounded-full border-4 border-purple-500 shadow-2xl mb-6 cursor-move touch-none"
                        onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX - cropPos.x, y: e.clientY - cropPos.y }); }}
                        onMouseMove={(e) => { if(isDragging) setCropPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        // Suporte a toque (celular)
                        onTouchStart={(e) => { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - cropPos.x, y: e.touches[0].clientY - cropPos.y }); }}
                        onTouchMove={(e) => { if(isDragging) setCropPos({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); }}
                        onTouchEnd={() => setIsDragging(false)}
                    >
                        {cropImgSrc && (
                            <img 
                                src={cropImgSrc} 
                                alt="Crop" 
                                draggable={false}
                                style={{ 
                                    transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropScale})`, 
                                    transformOrigin: 'top left',
                                    maxWidth: 'none', maxHeight: 'none' // Permite zoom livre
                                }}
                                onLoad={(e) => {
                                    // Centraliza automaticamente ao carregar
                                    const img = e.target;
                                    const initialScale = Math.max(200 / img.naturalWidth, 200 / img.naturalHeight);
                                    setCropScale(initialScale); 
                                    setCropPos({ x: (200 - img.naturalWidth * initialScale) / 2, y: (200 - img.naturalHeight * initialScale) / 2 });
                                }}
                            />
                        )}
                    </div>

                    {/* Controle de Zoom */}
                    <div className="w-full mb-6 px-2">
                        <div className="flex justify-between text-xs text-gray-400 font-bold uppercase mb-2"><span>Zoom</span><span>{Math.round(cropScale * 100)}%</span></div>
                        <input type="range" min="0.1" max="3" step="0.05" value={cropScale} onChange={(e) => setCropScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>

                    <div className="flex gap-3 w-full">
                        <button onClick={() => { setIsCropping(false); setCropImgSrc(null); }} className="flex-1 py-3 rounded-lg text-gray-400 bg-white/5 hover:bg-white/10 font-bold">Cancelar</button>
                        <button onClick={handleCropSave} className="flex-1 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-500 font-bold shadow-lg shadow-purple-900/20">Confirmar</button>
                    </div>
                </DialogSurface>
          )}

          {/* --- NOVO MODAL: PERFIL DO ALUNO DETALHADO --- */}
          {modal.type === 'profile' && (
            <div className="animate-in zoom-in-95">
                {/* Header com Gradiente */}
                <div className="relative mb-8 text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full opacity-50"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-4">
     <GearAvatar student={students.find((item) => item.id === modal.data.id) || modal.data} className="h-28 w-28" />
 </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-wider">{modal.data.name}</h2>
                        {(students.find((item) => item.id === modal.data.id) || modal.data).gearAppearance?.title ? <p className="mt-2 text-xs font-bold text-cyan-200">{gearItem((students.find((item) => item.id === modal.data.id) || modal.data).gearAppearance.title)?.name}</p> : null}
                        <p className="text-gray-400 font-mono text-sm bg-white/5 px-3 py-1 rounded-full mt-2 border border-white/10">{modal.data.turma} • {modal.data.station || "Membro da Equipe"}</p>
                        {(modal.data.specialty || modal.data.station) && (
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                {modal.data.specialty && (
                                    <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-100">
                                        Especialidade fixa: {modal.data.specialty}
                                    </span>
                                )}
                                {modal.data.station && (
                                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-100">
                                        Estacao da semana: {modal.data.station}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#151520] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${getCurrentLevel(modal.data.xp).color.replace('text-', 'bg-')}`}></div>
                        <span className="text-gray-500 text-xs font-bold uppercase mb-1">Nível Atual</span>
                        <span className={`text-xl font-black ${getCurrentLevel(modal.data.xp).color}`}>{getCurrentLevel(modal.data.xp).name}</span>
                        <span className="text-xs text-gray-400">{modal.data.xp} XP Totais</span>
                    </div>
                    <div className="bg-[#151520] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${getAttendanceStats(modal.data).percent > 75 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-gray-500 text-xs font-bold uppercase mb-1">Frequência</span>
                        <span className={`text-xl font-black ${getAttendanceStats(modal.data).percent > 75 ? 'text-green-500' : 'text-red-500'}`}>{getAttendanceStats(modal.data).percent}%</span>
                        <span className="text-xs text-gray-400">{getAttendanceStats(modal.data).absences} Faltas</span>
                    </div>
                </div>

                {/* Badges Collection */}
                <div className="mb-8">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Medal className="text-yellow-500"/> Coleção de Badges
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {BADGES_LIST.map(badge => {
                            const hasBadge = hasStudentBadge(modal.data, badge.id);
                            const badgeXp = getBadgeXpBonus(badge);
                            return (
                                <div key={badge.id} className={`relative flex min-h-[132px] flex-col items-center rounded-xl border p-3 text-center transition-all ${hasBadge ? 'bg-gradient-to-br from-white/5 to-transparent border-yellow-500/30' : 'bg-black/40 border-white/5 opacity-55 grayscale'}`}>
                                    <div className={`mb-2 ${hasBadge ? badge.color : 'text-gray-500'}`}>{badge.icon}</div>
                                    <span className="text-[10px] font-bold text-white leading-tight">{badge.name}</span>
                                    <p className={`mt-2 text-[10px] leading-snug ${hasBadge ? 'text-gray-300' : 'text-gray-500'}`}>{badge.desc}</p>
                                    <span className={`mt-auto rounded-full border px-2 py-0.5 text-[9px] font-black ${badgeXp > 0 ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                                      {badgeXp > 0 ? `+${badgeXp} XP` : '0 XP'}
                                    </span>
                                    {hasBadge && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,1)]"></div>}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    {/* Botão de Editar (só aparece para o próprio aluno) */}
                    {viewAsStudent?.id === modal.data.id && (
                        <button 
                            onClick={() => {
                                closeModal(); // Fecha o modal de perfil
                                openNewStudentModal(modal.data); // Abre o modal de edição
                            }} 
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Editar Perfil
                        </button>
                    )}
                    <button onClick={closeModal} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
          )}

          {modal.type === 'confirm' && <><h3 className="text-xl font-bold text-white mb-2">{modal.data.title}</h3><p className="text-gray-400 mb-6">{modal.data.msg}</p><div className="flex gap-3"><button onClick={closeModal} className="flex-1 py-3 rounded-lg text-gray-400 bg-white/5 hover:bg-white/10">Cancelar</button><button onClick={modal.data.onConfirm} className="flex-1 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600">Confirmar</button></div></>}

          {modal.type === 'taskBlock' && <TaskBlockForm task={modal.data.task} tasks={tasks} students={students} onSave={async (details) => { const task = modal.data.task; await setTaskBlock({ db, id: task.id, ...details, expectedStatus: task.status, expectedBlockAt: task.block?.updatedAt || '', actor: isAdmin ? adminProfile?.name || 'Técnico' : viewAsStudent?.name || '', actorStudentId: viewAsStudent?.id || '', isAdmin, seasonId: activeTeamSeasonId || 'legacy' }); void recordActivity({ action: details.blocked ? 'registrou um impedimento' : 'resolveu um impedimento', category: 'kanban', title: task.text, entityId: task.id }); closeModal(); showNotification(details.blocked ? 'Impedimento registrado.' : 'Tarefa liberada.'); }} />}
          {modal.type === 'taskTransition' && <TaskReviewForm task={modal.data.task} status={modal.data.status} onSave={async (details) => { await persistTaskStage(modal.data.task, modal.data.status, details); closeModal(); }} />}
          {modal.type === 'seasonTransition' && (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(8,145,178,0.13),rgba(15,23,42,0.5)_58%,rgba(16,185,129,0.08))] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/75">Ciclo da equipe</p>
                <h2 className="mt-2 text-2xl font-black text-white">Encerrar e iniciar temporada</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">Os registros de tarefas, agenda, rodízio da reta final e avaliações serão marcados como histórico. A próxima temporada começa no modo Rodízio.</p>
              </div>

              <form onSubmit={handleSeasonTransition} className="space-y-4">
                <SeasonTransitionChecklist key={seasonTransitionLock?.nextSeasonId || 'new-transition'} students={allStudents} tasks={tasks} events={events} lock={seasonTransitionLock} startDate={dateKey(new Date(new Date().getFullYear() + 1, 0, 1))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Temporada que termina
                    <input name="currentSeasonName" required maxLength={80} defaultValue={seasonTransitionLock?.options.currentName || activeTeamSeasonName} readOnly={Boolean(seasonTransitionLock)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold normal-case text-white outline-none focus:border-cyan-300/40" />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Próxima temporada
                    <input name="nextSeasonName" required maxLength={80} defaultValue={seasonTransitionLock?.options.nextName || `Temporada ${new Date().getFullYear() + 1}`} readOnly={Boolean(seasonTransitionLock)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold normal-case text-white outline-none focus:border-emerald-300/40" />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-xs font-black text-white">Será arquivado por temporada</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">Tarefas, agenda, avaliações, frequência, diário, treinos, evolução do protótipo e registros de XP ficam vinculados ao ciclo encerrado.</p>
                  </div>
                  <div className="rounded-[18px] border border-emerald-300/10 bg-emerald-300/[0.035] p-4">
                    <p className="text-xs font-black text-emerald-100">Continua com a equipe</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">XP e conquistas acompanham os integrantes escolhidos. Código, anexos e materiais do robô continuam disponíveis. O planejamento do novo ciclo pode ser configurado na aba Rodízio.</p>
                  </div>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black text-white">Histórico de temporadas</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">{teamSeasons.filter((season) => season.status === 'archived').length} arquivadas</span>
                  </div>
                  {teamSeasons.filter((season) => season.status === 'archived').length ? (
                    <div className="mt-3 space-y-2">
                      {teamSeasons.filter((season) => season.status === 'archived').slice(0, 4).map((season) => (
                        <div key={season.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2 text-xs">
                          <span className="font-bold text-slate-200">{season.name}<span className="ml-2 font-normal text-slate-500">{season.teamSnapshot?.length || 0} alunos · {Object.values(season.recordCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0)} registros</span></span>
                          <span className="text-slate-500">{season.closedAt ? new Date(season.closedAt).toLocaleDateString('pt-BR') : 'Arquivo histórico'}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="mt-2 text-xs text-slate-500">Ainda não há temporadas encerradas por este fluxo.</p>}
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <button type="button" onClick={() => { closeModal(); setAdminTab('season_history'); }} disabled={isTransitioningSeason} className="mr-auto rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-3 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50">Abrir histórico completo</button>
                  <button type="button" onClick={closeModal} disabled={isTransitioningSeason} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50">Agora não</button>
                  <button type="submit" disabled={isTransitioningSeason || !workspaceSeasonLoaded} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-5 py-3 text-xs font-black text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
                    {isTransitioningSeason ? <><Loader2 size={15} className="animate-spin" /> Arquivando…</> : !workspaceSeasonLoaded ? 'Carregando temporada…' : <><RotateCcw size={15} /> Arquivar e iniciar Rodízio</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ... MODAIS EXISTENTES (newStudent, expertForm, robotForm, rubric, xp, review, expertView, robotView, newRound, compliment, attendance, grades) MANTIDOS IGUAIS ... */}

{modal.type === 'newStudent' && (
  <form onSubmit={handleRegisterSubmit} className="space-y-5">
    <div className="relative overflow-hidden rounded-[26px] border border-emerald-400/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(15,23,42,0.5)_55%,rgba(59,130,246,0.1))] p-5">
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200"><UserPlus size={20} /></span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/75">Cadastro da equipe</p>
          <h3 className="mt-1 text-xl font-black text-white">{modal.data ? 'Editar aluno' : 'Novo aluno'}</h3>
          <p className="mt-1 text-xs text-gray-300">Dados, estação e acesso em um só lugar.</p>
        </div>
      </div>
    </div>
    
    {/* DADOS BÁSICOS */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Nome</label>
            <input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10" placeholder="Ex: Ana Silva" />
        </div>
        <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Turma</label>
            <input name="turma" defaultValue={modal.data?.turma} required className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10" placeholder="Ex: 8º A" />
        </div>
    </div>

    <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4">
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Especialidade principal</label>
        <input name="specialty" defaultValue={modal.data?.specialty || ''} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10" placeholder="Ex.: engenharia, pesquisa, organização" />
        <p className="mt-2 text-[11px] leading-relaxed text-gray-500">A área em que o aluno mais contribui. Use isso para orientar a estação fixa.</p>
    </div>

    <div className="rounded-[24px] border border-amber-400/10 bg-amber-400/[0.035] p-4">
        <div className="mb-3 flex items-center gap-2 text-amber-200">
            <Lock size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Acesso do aluno</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Usuário</label>
                <input name="username" defaultValue={modal.data?.username} required className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/50" placeholder="ana.fll" />
            </div>
            <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Senha</label>
                <input name="password" defaultValue={modal.data?.password} required className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/50" placeholder="1234" />
            </div>
        </div>
    </div>

    {/* UPLOAD DE FOTO */}
    <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Foto de perfil</label>
        <div className="flex flex-wrap items-center gap-4 rounded-[24px] border border-white/10 bg-black/25 p-4">
            {modal.data?.avatarImage ? ( <img src={modal.data.avatarImage} alt="Preview" className="h-16 w-16 rounded-2xl border border-purple-300/20 object-cover shadow-lg"/> ) : ( <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5"> <UserCircle size={32} className="text-gray-500" /> </div> )}
            <div className="flex flex-col gap-2">
                <input type="file" onChange={handleProfilePicSelect} accept="image/*" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer"/>
                {modal.data?.avatarImage && (
                    <button type="button" onClick={() => setModal(prev => ({ ...prev, data: { ...prev.data, avatarImage: null } }))} className="self-start rounded-full border border-red-400/15 bg-red-400/5 px-3 py-1.5 text-[10px] font-bold text-red-200 transition hover:bg-red-400/15">
                        Remover Foto
                    </button>
                )}
            </div>
        </div>
    </div>
    
    <button type="submit" className="w-full rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500 to-teal-400 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-[#05221c] shadow-[0_16px_36px_rgba(16,185,129,0.16)] transition-all hover:-translate-y-0.5 hover:brightness-110">
        {modal.data ? 'Salvar Alterações' : 'Cadastrar Aluno'}
    </button>
  </form>
)}

          {modal.type === 'editAdminProfile' && (
            <form onSubmit={handleAdminProfileSubmit}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Shield className="text-red-500"/> Editar Perfil do Técnico
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                  <div>
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome de Exibição</label>
                      <input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="Ex: Técnico Guilherme" />
                  </div>
                  <div>
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Especialidade / assinatura</label>
                      <input name="specialty" defaultValue={modal.data?.specialty || ''} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="Ex: Estrategia, ritmo e leitura da equipe" />
                  </div>
              </div>

              <div className="mb-4">
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nova Senha de Acesso (Opcional)</label>
                  <input name="password" type="password" className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="Deixe em branco para não alterar" />
                  <p className="text-[10px] text-gray-500 mt-1">Você poderá logar usando o usuário <strong className="text-gray-400">admin</strong> ou o seu <strong className="text-gray-400">Nome de Exibição</strong>.</p>
              </div>

              {/* UPLOAD DE FOTO */}
              <div className="mb-6">
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto de Perfil</label>
                  <div className="flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-white/10">
                      {modal.data?.avatarImage ? ( <img src={modal.data.avatarImage} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-red-500 shadow-lg"/> ) : ( <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border-2 border-dashed border-gray-600"> <UserCircle size={32} className="text-gray-500" /> </div> )}
                      <div className="flex flex-col gap-2">
                          <input type="file" onChange={handleProfilePicSelect} accept="image/*" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20 cursor-pointer"/>
                          {modal.data?.avatarImage && (
                              <button type="button" onClick={() => setModal(prev => ({ ...prev, data: { ...prev.data, avatarImage: null } }))} className="text-xs text-red-500 hover:text-red-400 font-bold self-start px-2 transition-colors">
                                  Remover Foto
                              </button>
                          )}
                      </div>
                  </div>
              </div>
              
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all">Salvar Alterações</button>
            </form>
          )}
          {modal.type === 'expertForm' && (<DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="expert" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleExpertSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Briefcase className="text-purple-500"/> {modal.data ? 'Editar' : 'Novo'} Especialista</h3><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label><input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Cargo</label><input name="role" defaultValue={modal.data?.role} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label><input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Anotações</label><textarea name="notes" defaultValue={modal.data?.notes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-20" /></div><div className="mb-4 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Evidência (Foto)</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}</div><div className="mb-6 flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10"><div><span className="text-sm font-bold text-white">Impactou?</span></div><select name="impact" defaultValue={modal.data?.impact} className="bg-black/50 border border-white/20 text-white p-2 rounded text-sm"><option value="Baixo">Baixo</option><option value="Médio">Médio</option><option value="Alto">Alto</option></select><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="applied" defaultChecked={modal.data?.applied} className="w-5 h-5 accent-green-500" /><span className="text-xs text-white">Aplicado</span></label></div><button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Salvar Registro</button></DraftForm>)}

          {modal.type === 'robotForm' && (<DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="robot" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleRobotSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><GitCommit className="text-blue-500"/> {modal.data ? 'Editar' : 'Novo'} Versão</h3><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Versão</label><input name="version" defaultValue={modal.data?.version} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: V2.0" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label><input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Apelido</label><input name="name" defaultValue={modal.data?.name} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">O que mudou?</label><textarea name="changes" defaultValue={modal.data?.changes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" /></div><div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Evidência (Foto)</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}</div><button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Salvar Versão</button></DraftForm>)}

          {modal.type === 'expertContactForm' && (
            <DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="contact" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleExpertContactSubmit}>
              <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
                <MessageSquare className="text-cyan-400" /> {modal.data ? 'Editar' : 'Novo'} contato realizado
              </h3>
              <p className="mb-6 text-xs leading-relaxed text-gray-400">
                Registre tambem tentativas sem retorno. Elas mostram como a equipe buscou conhecimento fora da sala.
              </p>

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-gray-400">Pessoa ou instituicao</label>
                  <input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full rounded-lg border border-white/20 bg-black/50 p-3 text-white outline-none focus:border-cyan-400" placeholder="Ex: Laboratorio de Ecologia" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-gray-400">Area ou cargo</label>
                  <input name="role" defaultValue={modal.data?.role} className="w-full rounded-lg border border-white/20 bg-black/50 p-3 text-white outline-none focus:border-cyan-400" placeholder="Ex: Biologa pesquisadora" />
                </div>
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-gray-400">Canal</label>
                  <select name="channel" defaultValue={modal.data?.channel || 'email'} required className="w-full rounded-lg border border-white/20 bg-black/50 p-3 text-white outline-none focus:border-cyan-400">
                    <option value="email">E-mail</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Telefone</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-gray-400">Data do contato</label>
                  <input name="date" type="date" defaultValue={modal.data?.date || today} required className="w-full rounded-lg border border-white/20 bg-black/50 p-3 text-white outline-none focus:border-cyan-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-gray-400">Status</label>
                  <select name="status" defaultValue={modal.data?.status || 'sent'} required className="w-full rounded-lg border border-white/20 bg-black/50 p-3 text-white outline-none focus:border-cyan-400">
                    <option value="sent">Mensagem enviada</option>
                    <option value="waiting">Aguardando retorno</option>
                    <option value="responded">Respondeu</option>
                    <option value="meeting">Mentoria agendada</option>
                    <option value="no_response">Sem retorno</option>
                    <option value="unavailable">Nao disponivel</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-bold uppercase text-gray-400">E-mail, perfil ou identificacao</label>
                <input name="contactDetail" defaultValue={modal.data?.contactDetail} className="w-full rounded-lg border border-white/20 bg-black/50 p-3 text-white outline-none focus:border-cyan-400" placeholder="Ex: @perfil ou contato@instituicao.org" />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-bold uppercase text-gray-400">Observacoes</label>
                <textarea name="notes" defaultValue={modal.data?.notes} className="h-24 w-full rounded-lg border border-white/20 bg-black/50 p-3 text-white outline-none focus:border-cyan-400" placeholder="Mensagem enviada, retorno recebido ou proximo passo." />
              </div>

              <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-3">
                <label className="mb-2 block text-xs font-bold uppercase text-gray-400">Evidencia do contato</label>
                <input
                  key={selectedFile?.name || modal.data?.evidenceName || 'empty-contact-evidence'}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="w-full cursor-pointer text-xs text-gray-400 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-cyan-300 hover:file:bg-cyan-500/20"
                />
                <p className="mt-2 text-[10px] leading-relaxed text-gray-500">Anexe um print da conversa ou um PDF do e-mail. Imagens grandes serao compactadas automaticamente; PDFs devem ter ate 500 KB.</p>
                {selectedFile ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-green-400">
                    <span className="flex items-center gap-1"><CheckCircle size={12} /> Selecionado: {selectedFile.name}</span>
                    <button type="button" onClick={() => setSelectedFile(null)} className="text-red-300 transition-colors hover:text-red-200">Remover</button>
                  </div>
                ) : modal.data?.evidence ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-cyan-300">
                    <span className="flex items-center gap-1"><FileText size={12} /> Salvo: {modal.data.evidenceName || 'Evidencia anexada'}</span>
                    <button
                      type="button"
                      onClick={() => setModal((previous) => ({ ...previous, data: { ...(previous.data || {}), evidence: null, evidenceName: '', evidenceType: '' } }))}
                      className="text-red-300 transition-colors hover:text-red-200"
                    >
                      Remover
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="newgears-modal-submit-bar sticky bottom-0 -mx-1 mt-2 border-t border-white/10 px-1 pb-1 pt-3">
                <button type="submit" className="w-full rounded-lg bg-cyan-600 py-3 font-bold text-white shadow-lg shadow-cyan-950/30 hover:bg-cyan-500">Salvar contato</button>
              </div>
            </DraftForm>
          )}

          {modal.type === 'xp' && (
            <div className="animate-in fade-in">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                {modal.data.student.avatarImage ? (
                    <img src={modal.data.student.avatarImage} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center border-2 border-yellow-500">
                        <UserCircle size={24} className="text-yellow-500" />
                    </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">Gerenciar XP: {modal.data.student.name}</h3>
                  <p className="text-sm text-yellow-500 font-mono font-bold mt-1 bg-yellow-500/10 inline-block px-2 py-0.5 rounded-md border border-yellow-500/20">
                      Saldo: {modal.data.student.xp || 0} XP
                  </p>
                </div>
              </div>
      
              <div className="space-y-6">
                {/* Adicionar XP */}
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 shadow-inner">
                  <p className="text-xs text-green-500 font-bold uppercase mb-3 flex items-center gap-1"><TrendingUp size={14}/> Recompensar (+)</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 20, 50].map(val => (
                      <button key={val} type="button" onClick={() => modal.data.onConfirm(val)} className="bg-green-500/10 text-green-500 font-black py-3 rounded-lg border border-green-500/20 hover:bg-green-500 hover:text-black transition-colors shadow-sm">+{val}</button>
                    ))}
                  </div>
                </div>
      
                {/* Remover XP */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 shadow-inner">
                  <p className="text-xs text-red-500 font-bold uppercase mb-3 flex items-center gap-1">
                    <TrendingUp size={14} className="rotate-180"/>
                    {xpPenaltyShouldNotify ? 'Penalidade (-)' : 'Correcao de XP (-)'}
                  </p>
                  <textarea
                    value={xpPenaltyReason}
                    onChange={(event) => setXpPenaltyReason(event.target.value)}
                    placeholder={xpPenaltyShouldNotify ? "Motivo que o aluno vai receber..." : "Observacao interna da correcao (opcional)"}
                    className="mb-3 h-20 w-full resize-none rounded-xl border border-red-500/20 bg-black/50 p-3 text-sm text-white outline-none placeholder:text-red-100/35 focus:border-red-400"
                  />
                  <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-black/30 p-3 text-xs text-red-100">
                    <span className="flex items-center gap-2 font-bold">
                      <input
                        type="checkbox"
                        checked={xpPenaltyShouldNotify}
                        onChange={(event) => setXpPenaltyShouldNotify(event.target.checked)}
                        className="h-4 w-4 accent-red-500"
                      />
                      Avisar aluno sobre esta retirada
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${xpPenaltyShouldNotify ? 'text-red-300' : 'text-gray-400'}`}>
                      {xpPenaltyShouldNotify ? 'Origem: Penalidade' : 'Origem: Correcao'}
                    </span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[-5, -10, -20, -50].map(val => (
                      <button key={val} type="button" onClick={() => modal.data.onConfirm(val, xpPenaltyReason, xpPenaltyShouldNotify)} className="bg-red-500/10 text-red-500 font-black py-3 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors shadow-sm">{val}</button>
                    ))}
                  </div>
                </div>
      
                {/* Valor Personalizado */}
                <form onSubmit={(e) => { e.preventDefault(); const customValue = e.target.customVal.value; modal.data.onConfirm(customValue, Number(customValue) < 0 ? xpPenaltyReason : '', xpPenaltyShouldNotify); }} className="flex gap-2 pt-2">
                  <input name="customVal" type="number" placeholder="Ou digite outro valor..." className="flex-1 bg-black/50 border border-white/20 rounded-xl p-3 text-white text-center font-mono focus:border-yellow-500 outline-none" required />
                  <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 rounded-xl transition-all shadow-lg shadow-yellow-900/20">Aplicar</button>
                </form>
              </div>
            </div>
          )}

          {modal.type === 'review' && (
  <div className="animate-in fade-in">
    <h3 className="text-xl font-bold text-white mb-1">Revisar Entrega</h3>
    <p className="text-sm text-gray-400 mb-4">{modal.data.name} - {modal.data.turma}</p>
    
    <div className="bg-black/50 p-4 rounded-xl mb-6 border border-white/5">
      <p className="text-gray-200 text-sm mb-4 leading-relaxed">"{modal.data.submission.text}"</p>
      
      {/* --- BOTÃƒÆ’O DE DOWNLOAD (VERSÃƒÆ’O BASE64) --- */}
      <button 
        onClick={(e) => {
           e.stopPropagation();
           const fileData = modal.data.submission.fileData;
           const fileName = modal.data.submission.fileName || "arquivo_download";

           if (fileData) {
             // Truque para baixar arquivo Base64
             const link = document.createElement("a");
             link.href = fileData;
             link.download = fileName; // O segredo está aqui: força o download com o nome certo
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
           } else {
             alert("⚠️ Erro: O conteúdo do arquivo não foi encontrado.");
           }
        }} 
        className="text-xs bg-white/10 px-3 py-2 rounded text-white flex items-center gap-2 hover:bg-white/20 transition-colors w-full justify-center font-bold border border-white/10"
      >
        <Download size={14}/> 
        {modal.data.submission.fileName || "Baixar Arquivo"}
      </button>
      {/* ----------------------------------------- */}

    </div>

    <div className="flex gap-3">
      <button onClick={() => handleRejectClick(modal.data)} className="flex-1 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-500/20">Recusar</button>
      <button 
        onClick={() => openXPModal(modal.data, 'approval')} 
        disabled={currentUser?.type !== 'admin'}
        className={`flex-1 py-3 bg-green-500 text-black font-bold rounded-xl transition-colors shadow-lg shadow-green-900/20 ${currentUser?.type === 'admin' ? 'hover:bg-green-400' : 'opacity-50 cursor-not-allowed'}`}
      >Aprovar (+XP)</button>
    </div>
  </div>
)}
          {modal.type === 'expertView' && (<div><h3 className="text-xl font-bold text-white mb-1">{modal.data.name}</h3><p className="text-sm text-purple-400 mb-4">{modal.data.role} • {modal.data.date}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-4"><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">"{modal.data.notes}"</p></div><div className="flex gap-4 mb-6"><div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><span className="text-[10px] text-gray-400 uppercase font-bold">Impacto</span><span className={`text-xs font-bold ${modal.data.impact==='Alto'?'text-green-500':modal.data.impact==='Médio'?'text-yellow-500':'text-gray-500'}`}>{modal.data.impact}</span></div>{modal.data.applied && <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"><CheckCircle size={12} className="text-green-500"/><span className="text-xs font-bold text-green-500">Sugestão Aplicada</span></div>}</div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Evidência Anexada</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10" alt="Evidência" /></div>)}</div>)}

          {modal.type === 'robotView' && (<div><div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-white">{modal.data.name}</h3><span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-mono font-bold">{modal.data.version}</span></div><p className="text-xs text-gray-500 mb-6">{modal.data.date}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Mudanças e Testes</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.changes}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto do Protótipo</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10" alt="Robô" /></div>)}</div>)}

          {modal.type === 'attachmentForm' && (
              <DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="attachment" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleAttachmentSubmit}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Wrench className="text-blue-500"/> {modal.data ? 'Editar' : 'Nova'} Garra / Anexo</h3>
                  <div className="space-y-4 mb-4">
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Anexo</label>
                          <input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Garra 1" />
                      </div>
                      <div>
                          <AttachmentRoundPicker rounds={rounds} attachment={modal.data} />
                      </div>
                  </div>
                  <div className="mb-4">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data da Modificação</label>
                      <input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="mb-4">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Mudanças / Funcionalidade</label>
                      <textarea name="changes" defaultValue={modal.data?.changes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" placeholder="Para quais missões serve e o que foi alterado?" />
                  </div>
                  <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da Garra</label>
                      <input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />
                      {selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Salvar Garra</button>
              </DraftForm>
          )}

          {modal.type === 'attachmentView' && (<div><div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-white">{modal.data.name}</h3>{(() => { const roundName = attachmentRoundNames(modal.data, rounds); return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-mono font-bold">{roundName}</span> })()}</div><p className="text-xs text-gray-500 mb-6">{modal.data.date?.split('-').reverse().join('/')} {modal.data.author && `• Por ${modal.data.author}`}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Mudanças / Funcionalidade</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.changes}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da Garra</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-80 transition-opacity" alt="Garra" onClick={() => openImageModal(modal.data.image)} title="Clique para ampliar" /></div>)}</div>)}

          {modal.type === 'codeForm' && (
              <DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="code" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleCodeSubmit}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Code className="text-green-500"/> {modal.data ? 'Editar' : 'Novo'} Codigo</h3>
                  <div className="mb-4">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Titulo do Codigo</label>
                      <input name="title" defaultValue={modal.data?.title} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-green-500 outline-none" placeholder="Ex: Seguidor de Linha PID" />
                  </div>
                  <div className="mb-4">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Como funciona? (Explicacao)</label>
                      <textarea name="description" defaultValue={modal.data?.description} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-green-500 outline-none h-32" placeholder="Explique a logica dos blocos/codigo passo a passo..." />
                  </div>
                  <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Print do Codigo (Blocos ou Python)</label>
                      <input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-500/10 file:text-green-500 hover:file:bg-green-500/20 cursor-pointer" />
                      {selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-green-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem ja salva</div>}
                  </div>
                  {isAdmin && (
                      <label className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3 cursor-pointer">
                          <input type="checkbox" name="setAsOfficial" defaultChecked={modal.data?.applied || (!activeCommandCode && !modal.data)} className="mt-1 h-4 w-4 accent-green-500" />
                          <span className="text-sm text-green-100 leading-relaxed">
                              <span className="block font-bold">Definir como programacao oficial</span>
                              <span className="text-xs text-green-100/80">Use isso para marcar qual codigo a equipe deve usar como base principal nos treinos.</span>
                          </span>
                      </label>
                  )}
                  <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20">Salvar no Cofre</button>
              </DraftForm>
          )}

          {modal.type === 'codeView' && (<div><h3 className="text-xl font-bold text-white mb-2">{modal.data.title}</h3><p className="text-xs text-gray-500 mb-6 flex items-center gap-2"><Calendar size={12}/> {modal.data.date?.split('-').reverse().join('/')} {modal.data.author && <><UserCircle size={12} className="ml-2"/> Por {modal.data.author}</>}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block flex items-center gap-1"><Lightbulb size={12}/> Lógica de Funcionamento</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.description}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block flex items-center gap-1"><ImageIcon size={12}/> Print do Código</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-80 transition-opacity" alt="Código" onClick={() => openImageModal(modal.data.image)} title="Clique para ampliar" /></div>)}</div>)}

          {modal.type === 'newRound' && (<form onSubmit={handleRoundSubmit}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-blue-500"/> {modal.data ? 'Editar Saída' : 'Planejar Saída'}</h3>
              
              <div className="mb-4">
                  <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome da Saída</label><input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Saída 1" /></div>
              </div>

              {/* SELEÇÃO DE BASE */}
              <div className="mb-4">
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Base de Saída</label>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-2 bg-black/50 p-3 rounded-lg border border-white/20 flex-1 cursor-pointer hover:border-blue-500 transition-colors"><input type="radio" name="startBase" value="Esquerda" defaultChecked={modal.data?.startBase ? modal.data.startBase === 'Esquerda' : true} className="accent-blue-500"/><span className="text-sm text-white">Esquerda (Vermelho)</span></label>
                      <label className="flex items-center gap-2 bg-black/50 p-3 rounded-lg border border-white/20 flex-1 cursor-pointer hover:border-red-500 transition-colors"><input type="radio" name="startBase" value="Direita" defaultChecked={modal.data?.startBase === 'Direita'} className="accent-red-500"/><span className="text-sm text-white">Direita (Azul)</span></label>
                  </div>
              </div>

              <div className="mb-6 max-h-40 overflow-y-auto custom-scrollbar border border-white/10 rounded-lg p-2"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block sticky top-0 bg-[#151520] pb-2">Missões (Selecione)</label>{missionsList.map(m => (<label key={m.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"><input type="checkbox" name="missions" value={m.id} defaultChecked={modal.data?.missions?.includes(m.id)} className="accent-blue-500 w-4 h-4"/><div className="flex items-center gap-2 flex-1">{m.image && <img src={m.image} className="w-6 h-6 rounded object-cover" alt="M" />}<span className="text-sm text-gray-300">{m.code} - {m.name}</span></div><span className="text-xs font-bold text-blue-500">+{m.points}pts</span></label>))}</div><button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">{modal.data ? 'Salvar alteracoes' : 'Salvar Saída'}</button></form>)}

          {modal.type === 'attendance' && <AttendancePanel students={allStudents} sessions={attendanceSessions} onSave={handleAttendanceSave} onClose={closeModal} />}

          {modal.type === 'grades' && (
              <SchoolGradesForm
                  key={`${modal.data.student.id}-${modal.data.stageId || 'etapa1'}`}
                  data={modal.data}
                  onSubmit={handleGradesSubmit}
              />
          )}

          
          {/* --- NOVO MODAL: TREINO DE PIT STOP --- */}
          {modal.type === 'pitstop' && (
            <Suspense fallback={<LazyOverlayFallback label="Carregando treino de pit stop..." />}>
              <PitStopModal seasonId={activeTeamSeasonId} viewAsStudent={viewAsStudent} pitStopRecords={pitStopRecords} showNotification={showNotification} />
            </Suspense>
          )}

          {/* NOVO MODAL: EDITOR DE MISSÕES */}
          {modal.type === 'missionForm' && (
             <div>
                 <DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="mission" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleMissionSubmit} className="mb-8 pb-8 border-b border-white/10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Settings className="text-blue-500"/> {modal.data ? 'Editar' : 'Nova'} Missão</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Código</label><input name="code" defaultValue={modal.data?.code} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: M01" /></div>
                        <div className="col-span-2"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label><input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Coral Nursery" /></div>
                    </div>
                    <div className="mb-4">
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Pontos (Máx)</label>
                        <input name="points" type="number" defaultValue={modal.data?.points} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da Missão</label>
                        <input id="missionFileInput" type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />
                        {selectedFile ? (
                            <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1">
                                <CheckCircle size={10}/> Selecionado: {selectedFile.name}
                                <button type="button" onClick={() => { setSelectedFile(null); document.getElementById('missionFileInput').value = ''; }} className="text-red-500 hover:text-red-400 ml-2">Remover</button>
                            </span>
                        ) : modal.data?.image && (
                            <div className="mt-2 text-xs text-blue-500 flex items-center gap-1">
                                <CheckCircle size={10}/> Imagem já salva
                                <button type="button" onClick={() => setModal(prev => ({ ...prev, data: { ...prev.data, image: null } }))} className="text-red-500 hover:text-red-400 ml-2 font-bold">Remover</button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">Salvar Missão</button>
                        {modal.data && <button type="button" onClick={() => { setModal({type: 'missionForm', data: null}); setSelectedFile(null); }} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Cancelar</button>}
                    </div>
                 </DraftForm>

                 {/* LISTA GERENCIADORA DE MISSÕES */}
                 <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><ListTodo size={16}/> Missões Cadastradas</h4>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                       {missionsList.length === 0 ? (
                           <p className="text-xs text-gray-500 italic">Nenhuma missão cadastrada. Adicione no formulário acima.</p>
                       ) : (
                           [...missionsList].sort((a,b) => a.code.localeCompare(b.code)).map(m => (
                               <div key={m.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors group">
                                   <div className="flex items-center gap-3">
                                       {m.image ? (
                                           <img src={m.image} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="M" />
                                       ) : (
                                           <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Settings size={16} className="text-blue-500"/></div>
                                       )}
                                       <div>
                                           <p className="text-sm font-bold text-white">{m.code} - {m.name}</p>
                                           <div className="flex items-center gap-2 mt-0.5">
                                              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">+{m.points} pts</span>
                                           </div>
                                       </div>
                                   </div>
                                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button type="button" onClick={() => setModal({type: 'missionForm', data: m})} className="text-gray-400 hover:text-white p-2 bg-black/60 rounded-lg transition-colors" title="Editar"><Pencil size={14}/></button>
                                       <button type="button" onClick={() => handleDeleteMission(m.id)} className="text-gray-400 hover:text-red-500 p-2 bg-black/60 rounded-lg transition-colors" title="Excluir"><Trash2 size={14}/></button>
                                   </div>
                               </div>
                           ))
                       )}
                    </div>
                 </div>
             </div>
          )}

          {/* NOVO MODAL: MATRIZ DE DECISÃƒÆ’O */}

          {modal.type === 'matrixForm' && (

             <DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="matrix" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleMatrixSubmit}>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><BarChart3 className="text-purple-500"/> Nova Ideia</h3>

                <div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome da Ideia / Solução</label><input name="name" required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Ex: Filtro de Carvão" /></div>

                <p className="text-xs text-gray-400 font-bold mb-2 uppercase">Pontuação (1 = Ruim, 5 = Excelente)</p>

                <div className="grid grid-cols-2 gap-4 mb-6">

                    <div><label className="text-[10px] text-gray-500 block mb-1">Impacto (Peso x3)</label><input name="impact" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">Custo (Peso x2)</label><input name="cost" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">Facilidade (Peso x1)</label><input name="feasibility" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">Inovação (Peso x2)</label><input name="innovation" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Adicionar à Matriz</button>

             </DraftForm>

          )}

          {/* NOVO MODAL: EDITOR DO PROJETO */}
          {modal.type === 'projectForm' && (
             <DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="project" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleProjectSubmit}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <Lightbulb className="text-yellow-500"/> Editar Projeto de Inovação
                </h3>

                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Projeto / Solução</label>
                    <input name="title" defaultValue={projectSummary?.title} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-yellow-500 outline-none font-bold text-lg" placeholder="Ex: Filtro Bio-Sintético" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-red-400">O Problema</label>
                        <textarea name="problem" defaultValue={projectSummary?.problem} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-32 focus:border-red-500 outline-none resize-none" placeholder="Qual problema vocês resolveram?" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-green-400">A Solução</label>
                        <textarea name="solution" defaultValue={projectSummary?.solution} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-32 focus:border-green-500 outline-none resize-none" placeholder="Como funciona a invenção?" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-blue-400">Impacto (Para os Juízes)</label>
                    <textarea name="impact" defaultValue={projectSummary?.impact} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-20 focus:border-blue-500 outline-none" placeholder="Quem isso ajuda? Qual o benefício real?" />
                </div>

                <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto do Protótipo / Desenho</label>
                    <input id="projectFileInput" type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-yellow-500/10 file:text-yellow-500 hover:file:bg-yellow-500/20 cursor-pointer" />
                    {selectedFile ? (
                        <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1">
                            <CheckCircle size={10}/> Selecionado: {selectedFile.name}
                            <button type="button" onClick={() => { setSelectedFile(null); document.getElementById('projectFileInput').value = ''; }} className="text-red-500 hover:text-red-400 ml-2">Remover</button>
                        </span>
                    ) : projectSummary?.image && (
                        <div className="mt-2 text-xs text-blue-500 flex items-center gap-1">
                            <CheckCircle size={10}/> Imagem atual já salva
                            <button type="button" onClick={() => setProjectSummary(prev => ({ ...prev, image: null }))} className="text-red-500 hover:text-red-400 ml-2 font-bold">Remover</button>
                        </div>
                    )}
                </div>

                <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg">Salvar Projeto Oficial</button>
             </DraftForm>
          )}

          {/* MODAL DE IMPACTO (OUTREACH) */}
          {modal.type === 'outreachForm' && (
             <DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="outreach" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleOutreachSubmit}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Megaphone className="text-orange-500"/> Registrar Impacto</h3>
                
                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Evento / Ação</label>
                    <input name="name" required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-orange-500 outline-none" placeholder="Ex: Apresentação para o 6º Ano" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Público-Alvo</label>
                        <select name="type" className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-orange-500 outline-none">
                            <option value="Escola">Escola / Alunos</option>
                            <option value="Especialistas">Especialistas</option>
                            <option value="Comunidade">Comunidade / Pais</option>
                            <option value="Equipes FLL">Outras Equipes FLL</option>
                            <option value="Internet">Internet / Redes Sociais</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label>
                        <input name="date" type="date" required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-orange-500 outline-none" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Pessoas Impactadas</label>
                    <input name="people" type="number" min="1" required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-orange-500 outline-none text-xl font-bold" placeholder="Ex: 35" />
                </div>

                <div className="mb-6">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Feedback / Resultado (Opcional)</label>
                    <textarea name="feedback" className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-orange-500 outline-none h-24 resize-none" placeholder="O que acharam? Deram alguma sugestão?"></textarea>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl mb-6 text-xs text-orange-400 flex items-start gap-2">
                    <Info size={16} className="shrink-0 mt-0.5"/>
                    <p>O Firebase não armazena fotos desta etapa para economizar espaço. Registre as fotos por conta própria no Drive da equipe e mostre aos juízes!</p>
                </div>

                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-900/20 transition-all">Salvar Registro</button>
             </DraftForm>
          )}

          {/* NOVO MODAL: EDITOR DE AGENDA/EVENTO */}
          {modal.type === 'eventForm' && (
             <DraftForm key={JSON.stringify([currentUser?.studentId || currentUser?.data?.id || currentUser?.name, activeTeamSeasonId, modal.type, modal.data?.id])} kind="event" recordId={modal.data?.id} onDiscard={() => setSelectedFile(null)} onSubmit={handleEventSubmit}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><CalendarDays className="text-blue-500"/> {modal.data ? 'Editar' : 'Novo'} Evento</h3>
                
                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Titulo do Evento</label>
                    <input name="title" defaultValue={modal.data?.title} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Reuniao com Eng. Mecanico" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label>
                        <input name="date" type="date" defaultValue={modal.data?.date || localTodayStr} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Horario</label>
                        <input name="time" type="time" defaultValue={modal.data?.time || '18:00'} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Tipo</label>
                        <select name="type" defaultValue={modal.data?.type || 'Visita'} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                            <option value="Visita">Visita Tecnica</option>
                            <option value="Especialista">Mentoria / Especialista</option>
                            <option value="Reunião">Reuniao Extra</option>
                            <option value="Outro">Outro</option>
                            <option value="Treino">Treino</option>
                            <option value="Prazo">Prazo / Entrega</option>
                            <option value="Competição">Competicao</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Local / Link</label>
                        <input name="location" defaultValue={modal.data?.location} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Zoom ou Unicamp" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Prioridade</label>
                        <select name="priority" defaultValue={modal.data?.priority || 'normal'} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                            {EVENT_PRIORITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Status</label>
                        <select name="status" defaultValue={modal.data?.status || 'confirmado'} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                            {EVENT_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Descrição (Opcional)</label>
                    <textarea name="description" defaultValue={modal.data?.description} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24 resize-none" placeholder="Detalhes do encontro, materiais necessários, etc..."></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20">Salvar na Agenda</button>
             </DraftForm>
          )}

        </DialogSurface>

    )

  }

  // --- COMPONENTE DE ESTRATÉGIA ---

  // --- GRÁFICO DE EVOLUÇÃO (SVG PURO) ---


  // Função para salvar pontuação no histórico
  const handleSavePracticeScore = async (totalPoints, totalTime) => {
      if (!window.confirm(`Registrar treino oficial?\nPontos: ${totalPoints}\nTempo: ${totalTime}s`)) return;
      
      try {
          await addDoc(collection(db, "score_history"), {
              seasonId: activeTeamSeasonId || 'legacy',
              score: totalPoints,
              time: totalTime, // Salva o tempo junto!
              date: new Date().toISOString(),
              author: isAdmin ? 'Técnico' : viewAsStudent?.name || 'Equipe'
          });
          void recordActivity({
              action: 'registrou uma pontuacao de treino',
              category: 'robot',
              title: `${totalPoints} pontos`,
              detail: `${totalTime}s no cronometro`
          });
          showNotification("Pontuação registrada no gráfico! 📈");
      } catch (error) {
          console.error("Erro ao salvar histórico:", error);
          showNotification("Erro ao salvar.", "error");
      }
  };

  const handleSaveFullRoundRun = async (e, { draftId } = {}) => {
      e.preventDefault();

      const timeVal = parseInt(roundFormValues[FULL_ROUND_TIME_KEY], 10);
      const scoreVal = parseInt(roundFormValues[FULL_ROUND_SCORE_KEY], 10);

      if (!timeVal || Number.isNaN(timeVal)) {
          showNotification("Cronometre ou preencha o tempo total do round.", "error");
          return;
      }

      if (scoreVal < 0 || Number.isNaN(scoreVal)) {
          showNotification("Preencha a pontuacao total da tentativa.", "error");
          return;
      }

      const upcomingWindow = [
          { time: timeVal, score: scoreVal },
          ...scoreHistory
              .filter((entry) => !entry.roundId && entry.practiceType !== 'exit_practice')
              .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0)),
      ].slice(0, 10);
      const withinLimitCount = upcomingWindow.filter((entry) => Number(entry.time) <= 150).length;

      try {
          const testData = {
              seasonId: activeTeamSeasonId || 'legacy',
              score: scoreVal,
              time: timeVal,
              date: new Date().toISOString(),
              author: isAdmin ? 'Tecnico' : viewAsStudent?.name || 'Equipe',
              practiceType: 'full_round',
              withinLimit: timeVal <= 150,
          };
          const testRef = await saveNewContribution('test', testData, draftId);
          celebrateGearContribution({ type: 'test', sourceId: testRef.id, studentId: gearActorId, record: testData });
          void recordActivity({
              action: 'registrou um round completo',
              category: 'robot',
              title: `${scoreVal} pontos`,
              detail: `${timeVal}s | ${timeVal <= 150 ? 'Dentro do limite de 2:30' : 'Acima do limite de 2:30'}`
          });

          setRoundFormValues((prev) => {
              const next = { ...prev };
              delete next[FULL_ROUND_TIME_KEY];
              delete next[FULL_ROUND_SCORE_KEY];
              return next;
          });

          if (activeTimer?.roundId === FULL_ROUND_TIMER_ID) {
              setActiveTimer(null);
              setTimerDisplay(0);
          }

          showNotification(`Round completo salvo! ${withinLimitCount}/${upcomingWindow.length} tentativas dentro de 2:30.`, "success");
          return true;
      } catch (error) {
          console.error("Erro ao salvar round completo:", error);
          showNotification("Erro ao salvar round completo.", "error");
      }
  };

  // --- NOVA FUNÇÃO: SALVAR EXECUÇÃO DE UM ROUND ESPECÍFICO ---
  const handleSaveExitPractice = async (e, exitNumber, { draftId } = {}) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const timeVal = Number.parseInt(formData.get('time'), 10);
      const scoreVal = Number.parseInt(formData.get('score'), 10);
      const attemptsVal = Number.parseInt(formData.get('attempts'), 10) || 1;
      const rawSuccesses = formData.get('successes');
      const successesVal = rawSuccesses === '' || rawSuccesses === null ? null : Number.parseInt(rawSuccesses, 10);
      const robotVersionId = `${formData.get('robotVersionId') || ''}`;
      const robotVersion = robotVersions.find((item) => String(item.id) === robotVersionId);
      if (!Number.isFinite(timeVal) || timeVal < 1 || !Number.isFinite(scoreVal) || scoreVal < 0) {
          showNotification('Preencha tempo e pontuacao desta saida.', 'error');
          return;
      }
      if (successesVal !== null && successesVal > attemptsVal) {
          showNotification('Os acertos nao podem superar o numero de tentativas.', 'error');
          return;
      }

      const run = {
              seasonId: activeTeamSeasonId || 'legacy',
          practiceType: 'exit_practice',
          exitNumber,
          exitName: `Saida ${exitNumber}`,
          time: timeVal,
          score: scoreVal,
          robotVersionId: robotVersion?.id || '',
          robotVersionLabel: robotVersion ? `${robotVersion.version || 'Versão'}${robotVersion.name ? ` · ${robotVersion.name}` : ''}` : '',
          attempts: successesVal === null ? null : attemptsVal,
          successes: successesVal,
          testGoal: `${formData.get('testGoal') || ''}`.trim(),
          strategy: `${formData.get('strategy') || ''}`.trim(),
          contributors: `${formData.get('contributors') || ''}`.trim(),
          attachmentUse: `${formData.get('attachmentUse') || ''}`.trim(),
          programmingUse: `${formData.get('programmingUse') || ''}`.trim(),
          adjustment: `${formData.get('adjustment') || ''}`.trim(),
          learning: `${formData.get('learning') || ''}`.trim(),
          date: new Date().toISOString(),
          author: isAdmin ? 'Tecnico' : viewAsStudent?.name || 'Equipe',
      };

      try {
          const testRef = await saveNewContribution('test', run, draftId);
          celebrateGearContribution({ type: 'test', sourceId: testRef.id, studentId: gearActorId, record: run });
          void recordActivity({
              action: 'registrou um teste de saida',
              category: 'robot',
              title: `Saida ${exitNumber}: ${scoreVal} pontos`,
              detail: `${timeVal}s${successesVal === null ? '' : ` | ${successesVal}/${attemptsVal} acertos`}${run.adjustment ? ` | Ajuste: ${run.adjustment}` : ''}`,
          });
          setRoundFormValues((previous) => {
              const next = { ...previous };
              delete next[`__exit_${exitNumber}_time__`];
              return next;
          });
          if (activeTimer?.roundId === `__exit_${exitNumber}_time__`) {
              setActiveTimer(null);
              setTimerDisplay(0);
          }
          form.reset();
          showNotification(`Teste da Saida ${exitNumber} registrado.`, 'success');
          return true;
      } catch (error) {
          console.error('Erro ao salvar teste de saida:', error);
          showNotification('Erro ao salvar teste de saida.', 'error');
      }
  };

  const handleSaveRoundRun = async (e, round, { draftId } = {}) => {
    e.preventDefault();
    const timeVal = parseInt(e.target.time.value);
    if(!timeVal || isNaN(timeVal)) return;

    // --- CÁLCULO DE TENDÊNCIA VS MÉDIA DOS ÚLTIMOS 3 TREINOS ---
    const previousRuns = scoreHistory
        .filter(h => h.roundId === round.id && h.time)
        .sort((a,b) => new Date(b.date) - new Date(a.date)) // Ordena do mais recente
        .slice(0, 3); // Pega os 3 últimos

    let trendMsg = "";
    if (previousRuns.length > 0) {
        const avg = previousRuns.reduce((acc, curr) => acc + curr.time, 0) / previousRuns.length;
        const diff = timeVal - avg;

        // Tempo menor = Melhor (Verde)
        if (diff < 0) {
            trendMsg = ` 🟢 ⬇️ ${(Math.abs(diff)).toFixed(1)}s mais rápido que a média!`;
        } else if (diff > 0) {
            trendMsg = ` 🔴 ⬆️ ${(Math.abs(diff)).toFixed(1)}s mais lento que a média.`;
        }
    }

    try {
        // 1. Salva no histórico para o gráfico
        const testData = {
              seasonId: activeTeamSeasonId || 'legacy',
            roundId: round.id,
            roundName: round.name,
            time: timeVal, // O tempo que levou
            date: new Date().toISOString(),
            author: viewAsStudent?.name || "Técnico"
          };
          const testRef = await saveNewContribution('test', testData, draftId);
          celebrateGearContribution({ type: 'test', sourceId: testRef.id, studentId: gearActorId, record: testData });

        // 2. Atualiza o tempo estimado do round (para ficar real)
        await updateDoc(doc(db, "rounds", round.id), {
            estimatedTime: timeVal
        });
        void recordActivity({
            action: 'registrou um treino de saida',
            category: 'robot',
            title: round.name,
            detail: `${timeVal}s no cronometro`,
            entityId: round.id
        });

        showNotification(`Treino de "${round.name}" registrado: ${timeVal}s ${trendMsg}`);
        
        // Limpa o valor do formulário local (estado controlado)
        setRoundFormValues(prev => {
            const next = { ...prev };
            delete next[round.id];
            return next;
        });
        e.target.reset();
    return true;
      } catch (error) {
        console.error("Erro round run:", error);
        showNotification("Erro ao salvar.", "error");
    }
  };


  const handleSavePrototypeIteration = async (draft, { draftId } = {}) => {
      const version = `${draft.version || ''}`.trim().slice(0, 100);
      const focus = `${draft.focus || ''}`.trim().slice(0, 100);
      const improvement = `${draft.improvement || ''}`.trim().slice(0, 1200);
      if (!version || !focus || !draft.date || !improvement) {
          showNotification('Preencha a versão, a etapa, a data e a melhoria aplicada antes de salvar.', 'error');
          return false;
      }

      let photo = '';
      if (draft.photo) {
          if (!draft.photo.type?.startsWith('image/')) {
              showNotification('Escolha uma foto JPG ou PNG para esta versão.', 'error');
              return false;
          }
          try {
              photo = await convertExpertContactEvidence(draft.photo);
          } catch (error) {
              console.error('Erro ao preparar foto do protótipo:', error);
              showNotification(error.message || 'Não foi possível preparar a foto.', 'error');
              return false;
          }
      }

      const now = new Date().toISOString();
      const iteration = {
              seasonId: activeTeamSeasonId || 'legacy',
          version,
          focus,
          date: draft.date,
          photo,
          participants: `${draft.participants || ''}`.trim().slice(0, 500),
          feedback: `${draft.feedback || ''}`.trim().slice(0, 1200),
          improvement,
          result: `${draft.result || ''}`.trim().slice(0, 1200),
          nextStep: `${draft.nextStep || ''}`.trim().slice(0, 1200),
          author: viewAsStudent?.name || currentUser?.name || 'Equipe',
          authorId: viewAsStudent?.id ? String(viewAsStudent.id) : String(currentUser?.name || 'tecnico'),
          createdAt: now,
          updatedAt: now,
      };

      try {
          const savedRecord = await saveNewContribution('prototype', iteration, draftId);
          celebrateGearContribution({ type: 'prototype', sourceId: savedRecord.id, studentId: gearActorId, record: iteration });
          void recordActivity({
              action: 'registrou uma versão do protótipo',
              category: 'innovation',
              title: `${version} · ${focus}`,
              detail: iteration.improvement || iteration.feedback || iteration.result || 'Nova etapa da evolução do protótipo.',
              entityId: savedRecord.id,
          });
          showNotification('Versão do protótipo registrada.', 'success');
          return true;
      } catch (error) {
          console.error('Erro ao registrar versão do protótipo:', error);
          showNotification('Não foi possível salvar a versão do protótipo.', 'error');
          return false;
      }
  };

  const strategyViewProps = {
      strategySubTab,
      setStrategySubTab,
      projectSummary,
      students,
      scoreHistory,
      projectImpactNarrative,
      decisionMatrix,
      prototypeIterations,
      onSavePrototypeIteration: handleSavePrototypeIteration,
      experts,
      expertContacts,
      outreachEvents,
      totalImpactPeople,
      isAdmin,
      viewAsStudent,
      InnovationStrategyPanel,
      RobotDesignStrategyPanel,
      LazyPanelFallback,
      openMatrixForm,
      handleDeleteMatrix,
      openExpertModal,
      openExpertView,
      handleDeleteExpert,
      openExpertContactModal,
      handleDeleteExpertContact,
      openOutreachForm,
      handleDeleteOutreach,
      setModal,
      robotVersions,
      attachments,
      codeSnippets,
      rounds,
      activeCommandCode,
      iterationRecords,
      openRobotModal,
      openRobotView,
      handleDeleteRobotVersion,
      openAttachmentModal,
      openAttachmentView,
      handleDeleteAttachment,
      openCodeModal,
      openCodeView,
      handleApplyCodeSnippet,
      handleDeleteCode
  };

  const finalSprintViewProps = {
      isTechnicalProfile: currentUser?.type === 'admin' && isAdmin,
      student: viewAsStudent,
      assignments: finalSprintAssignments,
      assignmentsLoading: finalSprintAssignmentsState.loading,
      assignmentsError: finalSprintAssignmentsState.error,
      onToggleFront: handleToggleFinalSprintFront,
      onSaveProgress: handleSaveFinalSprintProgress,
      onRetryAssignments: () => setFinalSprintAssignmentsRetry((attempt) => attempt + 1),
  };

  const evaluationDraftScope = `${activeTeamSeasonId || 'legacy'}:${currentUser?.uid || currentUser?.email || currentUser?.name || currentUser?.type}`;
  const finalSprintEvaluationViewProps = {
      isTechnicalProfile: currentUser?.type === 'admin' && isAdmin,
      student: viewAsStudent,
      students,
      evaluations: finalSprintEvaluations,
      evaluationsLoading: evaluationWorkspace.loading,
      evaluationsError: evaluationWorkspace.error,
      onRetryEvaluations: evaluationWorkspace.retry,
      selections: finalSprintSelections,
      draftScope: evaluationDraftScope,
      evaluationStartDate: teamSeasons.find((season) => season.id === activeTeamSeasonId)?.startDate || effectivePlanning.startDate,
      pauseWeeks: effectivePlanning.pauseWeeks || [],
      selectionDraft: tournamentDraftReady ? tournamentDraftState.record : null,
      selectionReady: tournamentDraftReady,
      selectionLoadingError: tournamentDraftState.error || selectionReadError,
      onRetrySelection: () => { setTournamentDraftState({ seasonId: activeTeamSeasonId || 'legacy', loading: true, error: false, record: null }); setSelectionRetry((attempt) => attempt + 1); },
      onPublishSelection: handlePublishTournamentSelection,
      onSaveWeekly: handleSaveWeeklyEvaluation,
      onSavePresentation: handleSavePresentationEvaluation,
      onSaveReport: handleSaveReportEvaluation,
      onSaveSelection: handleSaveFinalSprintSelection,
  };

  const roundsViewProps = {
      rounds,
      robotVersions,
      missionsList,
      attachments,
      activeCommandCode,
      scoreHistory,
      robotSubTab,
      setRobotSubTab,
      activeTimer,
      timerDisplay,
      roundFormValues,
      FULL_ROUND_TIME_KEY,
      FULL_ROUND_SCORE_KEY,
      FULL_ROUND_TIMER_ID,
      setRoundFormValues,
      toggleTimer,
      openNewRoundModal,
      openEditRoundModal,
      openMissionForm,
      openPitStopModal,
      handleSavePracticeScore,
      handleDeleteRound,
      handleSaveFullRoundRun,
      handleSaveExitPractice,
      handleSaveRoundRun,
      ScoreEvolutionChart,
      RobotRoundsPanel,
      LazyPanelFallback
  };

  const kanbanViewProps = {
      focusRequest: taskComposerRequest,
      onFocusRequestHandled: completeTaskComposerRequest,
      onOpenBlock: (task) => setModal({ type: 'taskBlock', data: { task } }),
      assignTaskToStudent,
      currentWeekData,
      db,
      handleAddTask,
      isAdmin,
      joinTask,
      leaveTask,
      localTodayObj,
      localTodayStart,
      localTodayStr,
      moveTask,
      removeTask,
      students,
      takeoverTask,
      tasks,
      viewAsStudent,
      parseLocalDateValue,
      getLocalYYYYMMDD
  };

  const logbookViewProps = {
      currentWeekData,
      isAdmin,
      adminLogbookStudentQuery,
      setAdminLogbookStudentQuery,
      adminLogbookSearchQuery,
      setAdminLogbookSearchQuery,
      adminLogbookWeekFilter,
      setAdminLogbookWeekFilter,
      adminLogbookStudentId,
      setAdminLogbookStudentId,
      studentLogbookSearchQuery,
      setStudentLogbookSearchQuery,
      studentLogbookWeekFilter,
      setStudentLogbookWeekFilter,
      studentLogbookDraft,
      setStudentLogbookDraft,
      logbookEntries,
      students,
      groupLogbookEntriesByWeek,
      getLogbookEntryDate,
      getLogbookEntryTags,
      getLogbookEntryWordCount,
      getLogbookStudentId,
      getLogbookEntryPreview,
      sortLogbookEntries,
      buildLogbookWeekOptions,
      handleDeleteLogbookEntry,
      handleLogbookSubmit
  };

  const agendaViewProps = {
      events,
      agendaSearchQuery,
      setAgendaSearchQuery,
      agendaTypeFilter,
      setAgendaTypeFilter,
      agendaScopeFilter,
      setAgendaScopeFilter,
      compareEventsByDate,
      matchesAgendaScope,
      getAgendaDayOffset,
      getEventPriorityValue,
      getEventPriorityMeta,
      getEventStatusValue,
      getEventStatusMeta,
      getEventTypeMeta,
      getAgendaRelativeLabel,
      formatAgendaDate,
      isAdmin,
      viewAsStudent,
      setModal,
      handleDeleteEvent,
      handleCycleEventStatus,
      EVENT_TYPE_OPTIONS
  };

  // --- PROTEÇÃO DE CARREGAMENTO (LOADING) ---
  // Só aparece DEPOIS que logou, enquanto baixa os dados
  if (isPublicTvMode) {
      return (
          <Suspense fallback={<LazyPanelFallback label="Carregando a equipe…" />}><PublicTvModeView
              students={students}
              adminProfile={adminProfile}
              projectSummary={projectSummary}
              outreachEvents={outreachEvents}
              galleryPhotos={galleryPhotos}
              robotVersions={robotVersions}
              attachments={attachments}
              teamSeasonStats={teamSeasonStats}
              showcaseSettings={showcaseSettings}
              visualTheme={visualTheme}
              onToggleTheme={toggleVisualTheme}
              onExit={closePublicTvMode}
          /></Suspense>
      );
  }

  if (isPublicMode) {
      return (
          <Suspense fallback={<LazyPanelFallback label="Carregando a equipe…" />}><PublicTeamView
              students={students}
              adminProfile={adminProfile}
              projectSummary={projectSummary}
              outreachEvents={outreachEvents}
              galleryPhotos={galleryPhotos}
              robotVersions={robotVersions}
              attachments={attachments}
              showcaseSettings={showcaseSettings}
              visualTheme={visualTheme}
              onBackToLogin={closePublicMode}
              onOpenTvMode={openPublicTvMode}
              onToggleTheme={toggleVisualTheme}
          /></Suspense>
      );
  }

  if (!currentUser) {
      return (
          <div className="newgears-login-shell min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden">
              <div className="newgears-orb newgears-orb--cyan"></div>
              <div className="newgears-orb newgears-orb--pink"></div>
              <div className="newgears-orb newgears-orb--yellow"></div>

              <div className="newgears-login-card p-8 w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                  <div className="text-center mb-8 mt-2">
                      <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-[28px] border border-white/12 bg-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
                          <LogoNewGears />
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-yellow-100">
                          Equipe FLL em missao
                      </span>
                      <h1 className="text-3xl font-black tracking-tight mt-4">Base da Equipe New Gears</h1>
                      <p className="text-slate-300/75 text-sm mt-3 leading-relaxed">
                          Entre para acompanhar desafios, evoluir no XP e viver a temporada com cara de jogo, robo e torneio.
                      </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                          <label className="text-[10px] text-slate-300/60 uppercase font-black mb-1.5 block tracking-wider">{FIREBASE_AUTH_ENABLED ? 'Seu e-mail' : 'Seu usuario'}</label>
                          <div className="relative">
                              <UserCircle className="absolute left-3 top-3.5 text-slate-400" size={18} />
                              <input
                                  type={FIREBASE_AUTH_ENABLED ? 'email' : 'text'}
                                  value={loginUser}
                                  onChange={(e) => setLoginUser(e.target.value)}
                                  className="newgears-login-input w-full p-3 pl-10 text-white outline-none transition-all placeholder:text-slate-500 font-medium"
                                  placeholder={FIREBASE_AUTH_ENABLED ? 'seu@email.com' : 'Ex: tecnico ou ana.fll'}
                                  disabled={loginBusy}
                                  autoComplete="username"
                                  autoFocus
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] text-slate-300/60 uppercase font-black mb-1.5 block tracking-wider">Senha secreta</label>
                          <div className="relative">
                              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                              <input
                                  type="password"
                                  value={loginPass}
                                  onChange={(e) => setLoginPass(e.target.value)}
                                  className="newgears-login-input w-full p-3 pl-10 text-white outline-none transition-all placeholder:text-slate-500 font-medium"
                                  placeholder="••••••"
                                  disabled={loginBusy}
                                  autoComplete="current-password"
                              />
                          </div>
                      </div>

                      {loginError && (
                          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                              <AlertCircle size={16} className="text-red-500 shrink-0" />
                              <p className="text-red-400 text-xs font-bold">{loginError}</p>
                          </div>
                      )}

                      <button disabled={loginBusy} className="newgears-login-button w-full text-white font-black py-4 mt-2 text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                          <LogOut size={18} className="rotate-180" /> {loginBusy ? 'Validando acesso…' : 'Entrar na Base'}
                      </button>
                  </form>

                  <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <button
                          type="button"
                          onClick={openPublicMode}
                          className="w-full rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300 hover:text-slate-950"
                      >
                          <span className="flex items-center justify-center gap-2">
                              <Globe2 size={16} /> Conhecer a equipe
                          </span>
                      </button>
                      <button
                          type="button"
                          onClick={toggleVisualTheme}
                          title={visualTheme === 'gold' ? 'Usar tema classico' : 'Usar tema dourado'}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white hover:bg-white/10"
                      >
                          <Palette size={17} />
                      </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 text-center">
                      <p className="text-[11px] text-slate-400/70">Plataforma da equipe para aprender, jogar junto e crescer na temporada.</p>
                  </div>
              </div>
          </div>
      )
  }

  if (currentUser && !currentWeekData) {
      return (
          <div className="newgears-loading-shell min-h-screen flex flex-col items-center justify-center text-white gap-4 px-6 text-center">
              <div className="rounded-[28px] border border-white/12 bg-white/10 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
                <Loader2 className="animate-spin text-cyan-300" size={48} />
              </div>
              <p className="animate-pulse text-sm font-black uppercase tracking-[0.22em] text-slate-300/70">Aquecendo a base da equipe...</p>
              <p className="text-sm text-slate-300/70 max-w-md">Estamos puxando cronograma, tarefas, ranking e tudo que a equipe precisa para entrar em modo missao.</p>
          </div>
      )
  }

  if (isTvOnlyView) {
      return (
          <ScoreEvolutionChartContext.Provider value={{ db, rounds, scoreHistory, showNotification, user: currentUser, seasonId: activeTeamSeasonId || 'legacy' }}><Suspense fallback={<LazyOverlayFallback label="Carregando modo TV..." />}>
            <TvModePanel
                isTvMode={true}
                setIsTvMode={setIsTvMode}
                standalone={true}
                currentWeekData={currentWeekData}
                students={students}
                missions={missions}
                tasks={tasks}
                events={events}
                outreachEvents={outreachEvents}
                ScoreEvolutionChart={ScoreEvolutionChart}
            />
          </Suspense></ScoreEvolutionChartContext.Provider>
      );
  }

  // --- RENDER PRINCIPAL (SÓ CHEGA AQUI SE ESTIVER LOGADO) ---
  return (
    <ScoreEvolutionChartContext.Provider value={{ db, rounds, scoreHistory, showNotification, user: currentUser, seasonId: activeTeamSeasonId || 'legacy' }}><GearExperienceProvider key={`${currentUser.type}:${currentUser.studentId || currentUser.data?.id || currentUser.uid || currentUser.name}:${activeTeamSeasonId || 'legacy'}`} db={db} user={currentUser} student={viewAsStudent} teamMembers={students.filter(isActiveStudent).map(workshopMember)} seasonId={activeTeamSeasonId || 'legacy'} isLiteMode={isLiteMode} aiContext={{ season: activeTeamSeasonName, project: projectSummary, robots: robotVersions, attachments, codes: codeSnippets }} onOpenKnowledge={() => setAdminTab('giro_knowledge')} onOpenShop={() => isAdmin ? setAdminTab('shop') : setStudentTab('shop')}>
    <div className={`newgears-shell newgears-workspace min-h-screen text-white selection:bg-yellow-300 selection:text-slate-950 pb-20 relative overflow-hidden ${isLiteMode ? 'newgears-lite-mode' : ''}`}>
      {/* Estilo da Animação de Fundo */}
      <div className="newgears-floating-layer">
        <div className="newgears-orb newgears-orb--cyan"></div>
        <div className="newgears-orb newgears-orb--yellow"></div>
        <div className="newgears-orb newgears-orb--pink"></div>
        <div className="newgears-orb newgears-orb--lime"></div>
      </div>

      {/* Fundo com o Logo */}

      {/* Conteúdo fica por cima */}
      <div className="newgears-content">
        
        {/* EFEITO DE CONFETES (Fica no topo de tudo, z-index gigante) */}
        {showConfetti && !isLiteMode && (
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <Suspense fallback={null}>
              <ConfettiBurst width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={420} gravity={0.14} />
            </Suspense>
          </div>
        )}

        <GearCompanion />
        <WorkspaceContent render={renderNotification} />
        <WorkspaceContent render={renderXpLossAlertModal} />
        {renderModal()}
        {seasonTransitionLock && modal.type !== 'seasonTransition' && <DialogSurface priority label="Encerramento em andamento"><div><h2 className="text-xl font-bold">Encerramento em andamento</h2><p className="mt-3 text-sm text-slate-300">Aguarde a preparação da próxima temporada. Se a conexão caiu, o técnico pode retomar de onde parou.</p>{isAdmin && <button onClick={() => setModal({ type: 'seasonTransition', data: null })} className="mt-5 rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950">Retomar encerramento</button>}</div></DialogSurface>}

        {/* --- ALERTA DE LOGOUT POR INATIVIDADE --- */}
        {logoutCountdown !== null && (
          <>
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-[200]">
                <div className="h-full bg-red-500 transition-all duration-1000 ease-linear" style={{ width: `${(logoutCountdown / 60) * 100}%` }}></div>
            </div>
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border-2 border-red-400">
                <AlertTriangle className="animate-pulse" size={20} />
                <span className="font-bold text-sm">Sua sessao vai expirar em {logoutCountdown}s</span>
                <button className="ml-2 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-black hover:bg-red-100 transition-colors">
                    Continuar Logado
                </button>
            </div>
          </>
        )}

        {isCommandCenterMode && (
          <Suspense fallback={<LazyOverlayFallback label="Carregando central de comando..." />}>
            <ChampionCommandCenter
                isOpen={isCommandCenterMode}
                onClose={closeCommandCenterMode}
                readinessTone={commandCenterReadinessTone}
                commandCards={commandCenterCards}
                readinessScore={commandCenterReadinessScore}
                readinessItems={commandCenterReadinessItems}
                quickActions={commandCenterQuickActions}
                priorityCards={commandCenterPriorityCards}
            />
          </Suspense>
        )}
        {isJudgeMode && (
          <Suspense fallback={<LazyOverlayFallback label="Carregando modo apresentacao..." />}>
            <JudgePresentationView
                isOpen={isJudgeMode}
                onClose={closeJudgeMode}
                projectSummary={projectSummary}
                experts={experts}
                outreachEvents={outreachEvents}
                robotVersions={robotVersions}
                attachments={attachments}
                codeSnippets={codeSnippets}
                rounds={rounds}
                innovationRubric={innovationRubric}
                robotDesignRubric={robotDesignRubric}
            />
          </Suspense>
        )}
        {isTvMode && (
          <Suspense fallback={<LazyOverlayFallback label="Carregando modo TV..." />}>
            <TvModePanel 
                isTvMode={isTvMode} 
                setIsTvMode={setIsTvMode} 
                currentWeekData={currentWeekData} 
                students={students} 
                missions={missions} 
                tasks={tasks} 
                events={events} 
                outreachEvents={outreachEvents} 
                ScoreEvolutionChart={ScoreEvolutionChart} 
            />
          </Suspense>
        )}
        {showFullSchedule && (
          <Suspense fallback={<LazyOverlayFallback label="Carregando cronograma completo..." />}>
            <FullScheduleModal
                isOpen={showFullSchedule}
                onClose={() => setShowFullSchedule(false)}
                rotationSchedule={rotationSchedule}
                currentWeekData={currentWeekData}
                students={students}
                captainIds={effectivePlanning.captainIds}
            />
          </Suspense>
        )}

{/* --- MODAL DO TÉCNICO: ENTREGAR BADGES --- */}
      {isAdmin && badgeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1a1a24] rounded-2xl border border-white/10 p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Botão Fechar */}
            <button 
              onClick={() => setBadgeStudent(null)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                <Trophy size={32} className="text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Sala de Trofeus</h2>
              <p className="text-gray-400">Gerenciando conquistas de <span className="text-white font-bold">{badgeStudent.name}</span></p>
            </div>

            {/* Grid de Badges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {BADGES_LIST.map(badge => {
                const hasBadge = hasStudentBadge(badgeStudent, badge.id);
                const badgeXp = getBadgeXpBonus(badge);
                return (
                  <button
                    key={badge.id}
                    onClick={() => toggleBadge(badgeStudent, badge.id)}
                    className={`relative flex min-h-[150px] flex-col items-center justify-start rounded-xl border-2 p-3 transition-all duration-300 ${
                      hasBadge 
                      ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)] scale-105' 
                      : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/20 opacity-60 grayscale'
                    }`}
                  >
                    <div className={`mb-3 ${hasBadge ? badge.color : 'text-gray-500'}`}>
                      {badge.icon}
                    </div>
                    <span className={`text-xs font-bold text-center leading-tight ${hasBadge ? 'text-white' : 'text-gray-500'}`}>
                      {badge.name}
                    </span>
                    <p className={`mt-2 text-center text-[10px] leading-snug ${hasBadge ? 'text-gray-300' : 'text-gray-500'}`}>
                      {badge.desc}
                    </p>
                    <span className={`mt-auto rounded-full border px-2 py-0.5 text-[9px] font-black ${badgeXp > 0 ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                      {badgeXp > 0 ? `+${badgeXp} XP` : '0 XP'}
                    </span>
                    {hasBadge && (
                       <div className="absolute top-2 right-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                       </div>
                    )}

                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL DE BATERIA DA EQUIPE --- */}
      {showBatteryModal && (
        <Suspense fallback={<LazyOverlayFallback label="Carregando check-in da equipe..." />}>
          <TeamCheckInModal
                    trainingDays={effectivePlanning.trainingDays}
            isOpen={showBatteryModal}
            onClose={() => setShowBatteryModal(false)}
            teamMoods={teamMoods}
            students={students}
            teamAverage={teamAverage}
            viewAsStudent={viewAsStudent}
            onSubmit={handleTeamCheckInSubmit}
            localTodayStr={localTodayStr}
            rewardXp={CHECK_IN_REWARD_XP}
          />
        </Suspense>
      )}

      <WorkspaceSidebar
          key={`${currentUser.type}:${currentUser.studentId || currentUser.data?.id || currentUser.uid || currentUser.name}`}
          accountKey={`${currentUser.type}:${currentUser.studentId || currentUser.data?.id || currentUser.uid || currentUser.name}`}
          tabs={currentWorkspaceTabs}
          activeId={isAdmin ? adminTab : studentTab}
          onNavigate={navigateWorkspace}
          open={workspaceMenuOpen}
          onClose={closeWorkspaceMenu}
          brand={<LogoNewGears />}
          profile={{ name: workspaceProfileStudent?.name || adminProfile?.name || currentUser?.name || 'Integrante', role: workspaceProfileStudent ? (isAdmin ? 'Aluno · Modo capitã' : 'Painel do aluno') : 'Painel do técnico', subtitle: workspaceProfileStudent ? (workspaceProfileStudent.station || 'Equipe') : (adminProfile?.specialty || 'Gestão da equipe') }}
          avatar={<GearAvatar student={workspaceProfileStudent || adminProfile} />}
          meta={viewAsStudent ? <><span>{viewAsStudent.xp || 0} XP</span><span>{studentCurrentLevel?.name || 'Equipe'}</span>{viewAsStudent.turma && <span>{viewAsStudent.turma}</span>}</> : <><span>{students.length} alunos</span><span>{activeTeamSeasonName}</span></>}
          onProfile={viewAsStudent ? () => openProfileModal(viewAsStudent) : currentUser?.type === 'admin' ? () => setModal({ type: 'editAdminProfile', data: adminProfile }) : undefined}
          onLogout={handleLogout}
      />
      <div className="newgears-workspace-page" data-workspace-page>
 {/* HEADER DO SISTEMA (COMPLETO) */}
      <header className="newgears-topbar sticky top-0 z-40 px-4 md:px-6 py-4 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex min-w-0 items-center gap-3">
              <button type="button" className="workspace-menu-toggle" aria-label="Abrir menu" aria-expanded={workspaceMenuOpen} aria-controls="workspace-navigation" onClick={() => setWorkspaceMenuOpen(true)}><Menu size={22} /></button>
              <div className="workspace-topbar-heading">
                  <small>New Gears / {isAdmin ? 'Equipe' : 'Meu painel'}</small>
                  <h1>{currentWorkspaceTab?.label || 'Base da equipe'}</h1>
              </div>
          </div>

          <div className="ng-topbar-actions"><WorkspaceSearch tabs={currentWorkspaceTabs} activeId={isAdmin ? adminTab : studentTab} onNavigate={navigateWorkspace} />
          <details className="workspace-tools" onClick={(event) => { if (event.target.closest('button')) event.currentTarget.open = false; }} onKeyDown={(event) => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); } }} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}>
            <summary aria-label="Ferramentas da equipe"><SlidersHorizontal size={18} /><span>Ferramentas</span><ChevronDown size={14} /></summary>
            <div className="workspace-tools__panel flex items-center gap-2 md:gap-3 flex-wrap justify-start">
              
              {/* --- CONTADOR COMPACTO --- */}
              <Countdown 
                  targetDate={showcaseSettings.tournamentTarget}
                  title="TORNEIO" 
                  compact={true} 
              />

              <button
                onClick={toggleVisualTheme}
                title={visualTheme === 'gold' ? 'Usar tema classico' : 'Usar tema dourado'}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                  visualTheme === 'gold'
                    ? 'border-yellow-300/30 bg-yellow-300/12 text-yellow-100'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Palette size={18} />
                <span className="hidden md:inline text-xs font-bold">{visualTheme === 'gold' ? 'Tema Classico' : 'Tema Dourado'}</span>
              </button>

              {/* 1. BOTÃƒÆ’O CRONOGRAMA (VOLTOU!) */}
              {/* Só aparece se o modal de cronograma não estiver aberto */}
              <button onClick={() => setShowFullSchedule(true)} className="bg-white/5 border border-white/10 text-white p-2 rounded-full hover:bg-white/10 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2">
                  <CalendarDays size={18} /> <span className="hidden md:inline text-xs font-bold">Cronograma</span>
              </button>
              {/* 👇 COLE O BOTÃO DO RANKING AQUI 👇 */}
              {!viewAsStudent && (
                <button 
                  onClick={() => { setAdminTab('overview'); setActiveTab('ranking'); }}
                  className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2 rounded-full hover:bg-yellow-500/20 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2"
                >
                  <Trophy size={18} /> <span className="hidden md:inline text-xs font-bold">Ranking XP</span>
                </button>
              )}
              {/* ☝️ FIM DO BOTÃO DO RANKING ☝️ */}
{/* --- BOTÃƒÆ’O DA BATERIA (NOVO) --- */}
              <button 
                onClick={() => setShowBatteryModal(true)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                    // Muda a cor dependendo da média da equipe
                    teamAverage > 75 ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    teamAverage > 50 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    teamAverage > 0  ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-white/5 border-white/10 text-gray-400'
                }`}
                title="Como esta a energia da equipe?"
              >
                  {/* Ícone muda conforme a carga */}
                  {teamAverage > 90 ? <BatteryFull size={18}/> : 
                   teamAverage > 50 ? <BatteryMedium size={18}/> : 
                   <BatteryWarning size={18}/>}
                  
                  {/* Mostra a porcentagem média para o Técnico */}
                  <span className="font-bold text-xs">
                      {teamMoods.length > 0 ? `${teamAverage}%` : 'Check-in'}
                  </span>
              </button>
              {isAdmin && (
                <button
                  onClick={toggleAdminHeroPanel}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                    adminPanelState.hero
                      ? 'bg-fuchsia-500/12 border-fuchsia-500/30 text-fuchsia-100 shadow-[0_0_15px_rgba(217,70,239,0.16)]'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={adminPanelState.hero ? 'Ocultar card central da tatica' : 'Mostrar card central da tatica'}
                >
                  {adminPanelState.hero ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span className="font-bold text-xs">Central Tatica</span>
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={toggleAdminCompactMode}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                    adminPanelState.compact
                      ? 'bg-violet-500/12 border-violet-500/30 text-violet-100 shadow-[0_0_15px_rgba(139,92,246,0.16)]'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={adminPanelState.compact ? 'Voltar ao layout completo do tecnico' : 'Ativar modo compacto para operacao rapida'}
                >
                  {adminPanelState.compact ? <Maximize size={18} /> : <Minimize size={18} />}
                  <span className="font-bold text-xs">{adminPanelState.compact ? 'Layout Completo' : 'Modo Compacto'}</span>
                </button>
              )}
              <button
                onClick={toggleDashboardPanel}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${isDashboardPanelVisible ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                title={isDashboardPanelVisible ? `Ocultar resumo (${visibleWorkspacePanelCount} blocos ativos)` : 'Mostrar resumo rapido'}
              >
                  <LayoutDashboard size={18} />
                  <span className="font-bold text-xs">{isDashboardPanelVisible ? `Resumo (${visibleWorkspacePanelCount})` : 'Resumo Rapido'}</span>
              </button>
              {/* --- BOTÃƒÆ’O MODO TV (TODOS PODEM ACESSAR) --- */}
              <button 
                onClick={openTvMode} 
                className="bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 p-2 rounded-full hover:bg-fuchsia-500 hover:text-white transition-all md:px-4 md:py-2 md:rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
              >
                  <MonitorPlay size={18} /> <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Modo TV</span>
              </button>

              {/* 2. BOTÃO MÁGICO DAS CAPITÃS (Sofia e Heloise) */}
              {viewAsStudent && (viewAsStudent.name === 'Sofia' || viewAsStudent.name === 'Heloise') && (
                  <button 
                    onClick={() => setIsAdmin(!isAdmin)} 
                    className={`px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase transition-all flex items-center gap-2 ${isAdmin ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-white/10 text-white border border-white/20'}`}
                  >
                      {isAdmin ? '👤 Voltar pro XP' : '👑 Modo Capitã'}
                  </button>
                  
              )}
{/* ÁREA DO DESAFIO DE INGLÊS (Visão do Aluno) */}
{viewAsStudent && (
    <div className="bg-[#151520] border border-white/10 rounded-2xl p-4 flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <div className="text-3xl">🇺🇸</div>
            <div>
                <h3 className="text-white font-bold text-sm">English Challenge</h3>
                <p className="text-gray-400 text-xs">Fale 10 min em ingles.</p>
            </div>
        </div>

        {/* 👇 O PULO DO GATO ESTÁ AQUI: viewAsStudent?.englishChallengeUnlocked 👇 */}
        {viewAsStudent?.englishChallengeUnlocked ? (
            <button 
                onClick={claimEnglishXP}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-bounce"
            >
                Resgatar +5 XP
            </button>
        ) : (
            <button 
                disabled
                className="bg-gray-800 text-gray-500 font-bold py-2 px-4 rounded-xl border border-gray-700 cursor-not-allowed"
            >
                Aguardando tecnico...
            </button>
        )}
    </div>
)}

              {/* 3. BOTÃƒÆ’O DE SAIR */}
              <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Sair">
                  <LogOut size={18} />
              </button>
            </div>
          </details>
      </div></header>

      <div className="px-4 pt-4 md:px-8"><ReminderInbox authenticated={reportsWorkspace.enabled} user={currentUser} seasonId={activeTeamSeasonId || 'legacy'} tasks={tasks} students={students} reportsVersion={reportsWorkspace.reports.map((report) => report.id + (report.updatedAt || '')).join('|')} onOpen={(tab) => isAdmin ? setAdminTab(tab) : setStudentTab(tab)} /></div>
      {/* --- ÁREA DO TÉCNICO (ADMIN) --- */}
      {!isAdmin && currentUser?.type === 'student' && !viewAsStudent && (
        <main className="newgears-stage p-4 md:p-8 w-full max-w-[1200px] mx-auto animate-in fade-in duration-500">
          <div className="newgears-major-panel rounded-[30px] border border-amber-400/20 bg-[#11131d]/92 p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-amber-400/20 bg-amber-400/10 text-amber-200">
                  {students.length > 0 ? <AlertTriangle size={24} /> : <Loader2 size={24} className="animate-spin" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200/70">Recuperando sessao</p>
                  <h2 className="mt-2 text-xl font-black text-white">
                    {students.length > 0 ? 'Reconstruindo o perfil do aluno.' : 'Sincronizando os dados da equipe.'}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/80">
                    {students.length > 0
                      ? 'Encontramos uma sessao salva no navegador, mas o perfil do aluno veio incompleto. O app esta tentando localizar o cadastro correto automaticamente.'
                      : 'A sessao do aluno foi encontrada, mas ainda estamos aguardando a lista de estudantes chegar do Firebase para montar o painel completo.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 self-start rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-white hover:text-black"
              >
                <LogOut size={14} />
                Entrar Novamente
              </button>
            </div>
          </div>
        </main>
      )}

      {isAdmin && (
        <main id="workspace-content" tabIndex={-1} aria-label={currentWorkspaceTab?.label} className={`newgears-stage workspace-section-anchor max-w-[1600px] mx-auto animate-in fade-in duration-500 ${adminPanelState.compact ? 'p-4 md:p-6' : 'p-4 md:p-8'}`}>
          {!adminPanelState.compact && adminTab !== 'overview' && <WorkspaceContent render={renderUrgentEventsBanner} />}

          <div className="mb-6" hidden={adminTab !== 'overview'}>
            {adminTab === 'overview' && <WorkspaceBriefing technical name={adminProfile?.name} students={students} tasks={tasks} events={events} today={localTodayStr} season={activeTeamSeasonName} onNavigate={navigateWorkspace} readiness={commandCenterReadinessScore} onNewTask={() => { setTaskComposerRequest((value) => value + 1); navigateWorkspace('kanban'); }} onNewEvent={() => setModal({ type: 'eventForm' })} />}
            <SectionDisclosure title={"Vis\u00e3o estrat\u00e9gica da equipe"} description="Indicadores completos, conquistas e controles da equipe">
            <WorkspaceCollapsible isOpen={adminPanelState.hero}>
              <WorkspaceHero
                eyebrow="Temporada FLL"
                title="Central tatica da equipe"
                subtitle="Acompanhe a reta final, as frentes de trabalho e a preparacao da equipe para o torneio."
                metrics={adminHeroMetrics}
                actions={adminHeroActions}
                shortcutLabel="Atalhos do técnico"
                accent="from-[#18376b] via-[#2b1559] to-[#140b2f]"
              />
            </WorkspaceCollapsible>

            <div className={`newgears-footer-shell newgears-hud-shell relative z-10 border border-white/10 bg-black/18 ${adminPanelState.compact ? 'p-3 md:p-4' : 'p-4 md:p-5'} ${adminPanelState.hero ? 'mt-2' : ''}`}>
              {adminHeroFooter}
            </div>
          </SectionDisclosure>
          </div>

          {adminTab === 'overview' && !adminPanelState.compact && (
          <WorkspaceCollapsible isOpen={adminPanelState.dashboard}>
            <div className="flex flex-col gap-6 mb-6">
              <WeeklyReportsSummary workspace={reportsWorkspace} onOpen={openWeeklyReports} />
              <WorkspaceActionQueue items={adminActionQueueItems} />
              <WorkspacePanelToolbar
                eyebrow="Painel Tatico"
                panels={adminDashboardPanels}
                panelState={adminPanelState}
                onToggle={toggleWorkspacePanel}
                onExpandAll={() => setWorkspacePanels(true)}
                onCollapseAll={() => setWorkspacePanels(false)}
              />

              {(adminPanelState.prep || adminPanelState.judge) && (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                  {adminPanelState.prep && (
                    <Suspense fallback={<LazyPanelFallback label="Carregando mapa rapido do torneio..." minHeightClass="min-h-[260px]" />}>
                      <CompetitionPrepPanel
                        title="Mapa rapido do torneio para a equipe entrar confiante."
                        summary="Este painel junta rubricas, ritmo, energia do time, codigo oficial e agenda numa leitura bem mais viva, para o site parecer equipe de robotica e nao painel corporativo."
                        readinessScore={commandCenterReadinessScore}
                        readinessLabel={commandCenterReadinessTone.label}
                        weekLabel={currentWeekData?.weekName || 'Semana em andamento'}
                        checklistItems={championshipChecklistItems}
                        focusItems={championshipFocusCards}
                        actionButtons={championshipActionButtons}
                      />
                    </Suspense>
                  )}
                  {adminPanelState.judge && (
                    <Suspense fallback={<LazyPanelFallback label="Carregando roteiro da apresentacao..." minHeightClass="min-h-[260px]" />}>
                      <JudgeStoryPanel
                        title="Roteiro rapido para a equipe falar com clareza, calma e cara de time preparado."
                        summary="Use estes blocos para ensaiar explicacoes curtas, memoraveis e ligadas a provas reais do projeto, do robo e do impacto."
                        cards={judgeStoryCards}
                        spotlightQuestion={judgeSpotlightQuestion}
                      />
                    </Suspense>
                  )}
                </div>
              )}

              {(adminPanelState.stats || adminPanelState.achievements) && (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                  {adminPanelState.stats && (
                    <div className="[&>div]:mb-0 h-full">
                      <WorkspaceContent render={renderTeamStatsPanel} />
                    </div>
                  )}
                  {adminPanelState.achievements && (
                    <div className="[&>div]:mb-0 h-full">
                      <WorkspaceContent render={renderTeamAchievementsPanel} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </WorkspaceCollapsible>
          )}

            {/* Dentro do seu <main> ou área de conteúdo central, junto com os outros 'ifs' de abas */}
{adminTab === 'overview' && activeTab === 'ranking' && (
  <Suspense fallback={<LazyPanelFallback label="Carregando ranking da equipe..." minHeightClass="min-h-[340px]" />}>
    <RankingPanel students={students} setActiveTab={setActiveTab} />
  </Suspense>
)}
          <div className="flex flex-col gap-6">
            {students.length > 0 && incompleteStudentRecords.length > 0 && (
              <section className="flex flex-col gap-4 rounded-[24px] border border-amber-300/20 bg-[linear-gradient(120deg,rgba(120,74,10,0.22),rgba(17,20,32,0.94)_56%)] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)] md:flex-row md:items-center md:justify-between md:px-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200"><AlertTriangle size={18} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-amber-100">{incompleteStudentRecords.length} cadastro{incompleteStudentRecords.length === 1 ? '' : 's'} precisa{incompleteStudentRecords.length === 1 ? '' : 'm'} de atenção</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {incompleteStudentRecords.slice(0, 4).map((student) => `${student.name || 'Sem nome'} (${student.missingFields.join(', ')})`).join(' · ')}
                      {incompleteStudentRecords.length > 4 ? ` · +${incompleteStudentRecords.length - 4} integrante(s)` : ''}
                    </p>
                  </div>
                </div>
                <button onClick={() => setAdminTab('students')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-amber-200/20 bg-amber-300/10 px-4 py-2.5 text-xs font-black text-amber-50 transition hover:bg-amber-300 hover:text-slate-950">
                  <Users size={14} /> Revisar cadastros
                </button>
              </section>
            )}

            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-[linear-gradient(120deg,rgba(255,255,255,0.045),rgba(0,0,0,0.2))] px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300/60">Foco da equipe</p>
                      <p className="mt-1 text-sm font-bold text-white">{activeTeamSeasonName} · {workspaceSeason === 'rotation' ? 'Rodízio de estações' : 'Reta final e torneio'}</p>
                    </div>
                    <div className="ng-season-actions flex items-center gap-3">
                      {isSavingWorkspaceSeason && <span role="status" className="text-[10px] font-bold text-slate-300">Sincronizando…</span>}
                      {currentUser?.type === 'admin' && <SeasonModeControl value={workspaceSeason} onChange={handleWorkspaceSeasonChange} disabled={isSavingWorkspaceSeason} />}
                      {currentUser?.type === 'admin' && db && <button type="button" disabled={!workspaceSeasonLoaded || isTransitioningSeason} onClick={() => setModal({ type: 'seasonTransition', data: null })} className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2.5 text-[11px] font-bold text-slate-300 transition hover:border-cyan-200/25 hover:bg-cyan-200/10 hover:text-cyan-50 disabled:cursor-wait disabled:opacity-50">{workspaceSeasonLoaded ? 'Encerrar temporada' : 'Carregando temporada…'}</button>}
                    </div>
                  </div>
                  <WorkspaceSectionHeading tab={currentWorkspaceTab} />
                </div>

                {/* CONTEÃƒÅ¡DO DA ABA SELECIONADA */}
                <div hidden={adminTab === 'overview'} className={`newgears-scene-shell px-4 pb-4 md:px-7 md:pb-7 min-h-[500px] ${getWorkspaceSceneTopPadding(adminTab)}`}>
                  <WorkspaceScene sceneId={`admin-${adminTab}`} onHome={() => setAdminTab('overview')}><Suspense fallback={<LazyPanelFallback label="Carregando esta área…" />}>
                    {adminTab === 'giro_knowledge' && currentUser?.type === 'admin' && <GiroKnowledgeView key={activeTeamSeasonId || 'legacy'} seasonName={activeTeamSeasonName} />}
                    {adminTab === 'weekly_reports' && <WeeklyReportsView key={focusedReportId || 'all-reports'} user={currentUser} workspace={reportsWorkspace} students={allStudents} seasonId={activeTeamSeasonId || 'legacy'} reportDueDay={effectivePlanning.reportDueDay} defaultWeek={currentWeekData?.weekName} focusedReportId={focusedReportId} />}
                    {adminTab === 'report_recipients' && <ReportRecipientsView user={currentUser} workspace={reportsWorkspace} />}
                    {adminTab === 'shop' && <Suspense fallback={<LazyPanelFallback label="Carregando a loja do Giro…" />}><GearShopView /></Suspense>}
                    {adminTab === 'sprint' && <FinalSprintView {...finalSprintViewProps} />}
                    {adminTab === 'evaluations' && <Suspense fallback={<LazyPanelFallback label="Carregando avaliações da reta final..." minHeightClass="min-h-[420px]" />}><FinalSprintEvaluationsView key={`${currentUser?.type}:${evaluationDraftScope}`} {...finalSprintEvaluationViewProps} /></Suspense>}
                    {adminTab === 'students' && (
                      <Suspense fallback={<LazyPanelFallback label="Carregando gerenciamento dos alunos..." minHeightClass="min-h-[420px]" />}>
                        <StudentManagementPanel
                          students={allStudents}
                          getCurrentLevel={getCurrentLevel}
                          canManage={currentUser?.type === 'admin'}
                          onMoveStudent={moveStudent}
                          onOpenXPModal={openXPModal}
                          onOpenGradesModal={openGradesModal}
                          onOpenProfileModal={openProfileModal}
                          onOpenNewStudentModal={openNewStudentModal}
                          onSetBadgeStudent={setBadgeStudent}
                          onToggleEnglishChallenge={toggleEnglishChallenge}
                          onDeleteStudent={handleDeleteStudent}
                          onToggleActivityStatus={toggleActivityStatus}
                          onUpdateStudentSpecialty={updateStudentSpecialty}
                        />
                      </Suspense>
                    )}
                    {adminTab === 'rotation' && (
                      <Suspense fallback={<LazyPanelFallback label="Carregando planejamento do rodizio..." minHeightClass="min-h-[420px]" />}>
                        <><SeasonPlanningPanel key={(activeTeamSeasonId || 'legacy') + JSON.stringify(effectivePlanning) + students.map((student) => student.id).join(',')} config={effectivePlanning} students={students} onSave={handleSavePlanning} busy={isSavingPlanning} />
                        <RotationOperationsPanel
                          students={students}
                          currentWeekData={currentWeekData}
                          canManage={currentUser?.type === 'admin'}
                          onApplyRotation={handleApplyRotation}
                          applications={rotationApplications}
                          busy={isProcessingRotation}
                          onUndoRotation={handleUndoRotation}
                          onOpenSchedule={() => setShowFullSchedule(true)}
                        /></>
                      </Suspense>
                    )}

                    {adminTab === 'strategy' && <StrategyView {...strategyViewProps} />}
                    {adminTab === 'rounds' && <RoundsView {...roundsViewProps} />} {/* StrategyBoard agora mora dentro de RoundsView */}
                    {adminTab === 'rubrics' && (
                      <Suspense fallback={<LazyPanelFallback label="Carregando rubricas..." minHeightClass="min-h-[320px]" />}>
                        <RubricViewPanel
                          innovationRubric={innovationRubric}
                          robotDesignRubric={robotDesignRubric}
                          handleRubricUpdate={handleRubricUpdate}
                        />
                      </Suspense>
                    )}
                    
                    {/* --- VISUALIZAÇÃO KANBAN --- */}
                    {adminTab === 'discipline' && <WorkspaceContent render={renderDisciplinePanel} />}
                    {adminTab === 'kanban' && <KanbanView {...kanbanViewProps} />}
                    {adminTab === 'logbook' && <LogbookView {...logbookViewProps} />}
                    {adminTab === 'agenda' && <AgendaView {...agendaViewProps} />}
                    {adminTab === 'showcase' && (
                      <PublicShowcaseAdminView
                        settings={showcaseSettings}
                        galleryPhotos={galleryPhotos}
                        robotVersions={robotVersions}
                        attachments={attachments}
                        onSaveSettings={handleSaveShowcaseSettings}
                        onAddPhoto={handleAddGalleryPhoto}
                        onTogglePhoto={handleToggleGalleryPhoto}
                        onToggleFeatured={handleToggleFeaturedGalleryPhoto}
                        onMovePhoto={handleMoveGalleryPhoto}
                        onReorderPhotos={handleReorderGalleryPhotos}
                        onDeletePhoto={handleDeleteGalleryPhoto}
                        onOpenTvMode={openPublicTvMode}
                      />
                    )}
                    {adminTab === 'operations' && currentUser?.type === 'admin' && <Suspense fallback={<LazyPanelFallback label="Carregando evolução e ferramentas…" minHeightClass="min-h-[420px]" />}><TeamOperationsView db={db} user={currentUser} tasks={tasks} sessions={attendanceSessions} seasonId={activeTeamSeasonId || 'legacy'} seasons={teamSeasons} reportsEnabled={reportsWorkspace.enabled} /></Suspense>}
                    {adminTab === 'history' && currentUser?.type === 'admin' && <ActivityHistoryView activityLogs={activityLogs} />}
                    {adminTab === 'season_history' && currentUser?.type === 'admin' && <SeasonHistoryView db={db} seasons={teamSeasons} reports={reportsWorkspace.reports} reportsEnabled={reportsWorkspace.enabled} />}
                  </Suspense></WorkspaceScene>
                </div>
            </div>
          </div>
        </main>
      )}

      {/* --- ÁREA DO ALUNO --- */}
      {!isAdmin && viewAsStudent && (
        <main id="workspace-content" tabIndex={-1} aria-label={currentWorkspaceTab?.label} className="newgears-stage workspace-section-anchor p-4 md:p-8 w-full max-w-[1800px] mx-auto animate-in slide-in-from-bottom-8">
          {studentTab !== 'overview' && <WorkspaceContent render={renderUrgentEventsBanner} />}

          {ownTournamentSelection ? <TournamentSelectionNotice key={`${viewAsStudent.id}__${activeTeamSeasonId || 'legacy'}__${ownTournamentSelection.selectedAt || ownTournamentSelection.createdAt || 'selected'}`} studentName={viewAsStudent.name || 'Integrante'} seasonName={activeTeamSeasonName} isLiteMode={isLiteMode} /> : null}

          <div hidden={studentTab !== 'overview'}>
          {studentTab === 'overview' && <WorkspaceBriefing name={viewAsStudent.name} student={viewAsStudent} students={students} tasks={tasks} events={events} today={localTodayStr} season={activeTeamSeasonName} onNavigate={navigateWorkspace} level={studentCurrentLevel} nextLevel={studentNextLevel} />}
          <SectionDisclosure title="Meu perfil e minhas conquistas" description={"Veja sua evolu\u00e7\u00e3o, detalhes da semana e todos os atalhos"}>
          <div className="mb-2">
            <WorkspaceCollapsible isOpen={studentPanelState.hero}>
              <WorkspaceHero
                eyebrow="Painel do Aluno"
                title={`Base pessoal de ${viewAsStudent.name} para jogar em equipe, evoluir e chegar pronto no torneio.`}
                subtitle={`Estacao atual: ${viewAsStudent.station || 'Equipe'}. Aqui voce acompanha sua rotina da semana, entende as rubricas, treina sua fala e enxerga o time com uma energia mais viva e menos engessada.`}
                metrics={studentHeroMetrics}
                actions={studentHeroActions}
                shortcutLabel="Seus atalhos"
                accent="from-[#101f4a] via-[#2a1458] to-[#1a0d32]"
              />
            </WorkspaceCollapsible>

            <div className={`newgears-footer-shell newgears-hud-shell relative z-10 border border-white/10 bg-black/18 p-4 md:p-5 ${studentPanelState.hero ? 'mt-2' : ''}`}>
              {studentHeroFooter}
            </div>
          </div>
          </SectionDisclosure>

          <WorkspaceCollapsible isOpen={studentPanelState.dashboard}>
            <div className="flex flex-col gap-6 mb-6">
              <WeeklyReportsSummary workspace={reportsWorkspace} onOpen={openWeeklyReports} />
              <WorkspacePanelToolbar
                eyebrow="Painel do Piloto"
                panels={studentDashboardPanels}
                panelState={studentPanelState}
                onToggle={toggleWorkspacePanel}
                onExpandAll={() => setWorkspacePanels(true)}
                onCollapseAll={() => setWorkspacePanels(false)}
              />

              {(studentPanelState.prep || studentPanelState.judge) && (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                  {studentPanelState.prep && (
                    <Suspense fallback={<LazyPanelFallback label="Carregando mapa do torneio..." minHeightClass="min-h-[260px]" />}>
                      <CompetitionPrepPanel
                        eyebrow="Mapa para o Torneio"
                        title="Mapa da equipe para estudar, treinar e subir de nivel na semana."
                        summary="Esses blocos mostram onde a equipe esta forte, onde precisa de boost e como voce pode entrar mais confiante na apresentacao e na mesa."
                        readinessScore={commandCenterReadinessScore}
                        readinessLabel={commandCenterReadinessTone.label}
                        weekLabel={currentWeekData?.weekName || 'Semana em andamento'}
                        checklistItems={championshipChecklistItems}
                        focusItems={championshipFocusCards}
                        actionButtons={championshipActionButtons}
                      />
                    </Suspense>
                  )}
                  {studentPanelState.judge && (
                    <Suspense fallback={<LazyPanelFallback label="Carregando roteiro da apresentacao..." minHeightClass="min-h-[260px]" />}>
                      <JudgeStoryPanel
                        eyebrow="Treino de Apresentacao"
                        title="Roteiro rapido para voce falar sem travar e com cara de equipe pronta."
                        summary="Estude estes blocos para ligar projeto, robo e impacto de um jeito simples, seguro e facil de lembrar."
                        cards={judgeStoryCards}
                        spotlightQuestion={judgeSpotlightQuestion}
                      />
                    </Suspense>
                  )}
                </div>
              )}

              {(studentPanelState.stats || studentPanelState.achievements) && (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                  {studentPanelState.stats && (
                    <div className="[&>div]:mb-0 w-full">
                      <WorkspaceContent render={renderTeamStatsPanel} />
                    </div>
                  )}
                  {studentPanelState.achievements && (
                    <div className="[&>div]:mb-0 w-full">
                      <WorkspaceContent render={renderTeamAchievementsPanel} options={{ showLocked: true }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </WorkspaceCollapsible>
          </div>

          {/* ALERTA DE TAREFAS ATRASADAS DO ALUNO */}
          {studentOverdueTasksCount > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] mb-6 flex items-center justify-between animate-pulse hover:animate-none transition-all">
                  <div className="flex items-center gap-4">
                      <div className="bg-red-500/20 p-3 rounded-full">
                          <AlertTriangle size={24} className="text-red-500" />
                      </div>
                      <div>
                          <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1">Acao Necessaria</h3>
                          <p className="text-white font-bold md:text-lg leading-tight">Voce possui tarefas atrasadas no quadro de tarefas!</p>
                      </div>
                  </div>
                  <button onClick={() => setStudentTab('kanban')} className="hidden md:block bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-colors whitespace-nowrap">
                      Resolver Agora
                  </button>
              </div>
          )}

    {/* ALERTA DE LÍDER DE GESTÃO */}
    {isWeeklyLeader && (
        <div className={`mb-6 overflow-hidden rounded-[24px] border p-4 shadow-[0_18px_46px_rgba(0,0,0,0.26)] ${hasWeeklyLeaderPendingWork ? 'border-amber-400/30 bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(124,58,237,0.18),rgba(15,23,42,0.78))]' : 'border-emerald-400/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(34,211,238,0.12),rgba(15,23,42,0.78))]'}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border ${hasWeeklyLeaderPendingWork ? 'border-amber-300/30 bg-amber-300/15 text-amber-100' : 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100'}`}>
                        {hasWeeklyLeaderPendingWork ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
                    </div>
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100">
                            <Crown size={12} /> Lider da semana
                        </span>
                        <h3 className="mt-2 text-xl font-black leading-tight text-white">
                            {hasWeeklyLeaderPendingWork ? 'Ainda falta organizar a semana' : 'Obrigacoes da lideranca em dia'}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-100/82">
                            {hasWeeklyLeaderPendingWork
                                ? `Falta ${weeklyLeaderPendingSummary}. Enquanto isso, o tecnico ainda ve a lideranca como pendente.`
                                : 'Foco das estacoes e tarefa do Kanban ja estao registrados para o time acompanhar.'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Estacoes</p>
                            <p className="mt-1 text-lg font-black text-white">{weeklyLeaderMissionReadyCount}/3</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Kanban</p>
                            <p className="mt-1 text-lg font-black text-white">{weeklyLeaderTasks.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Pen.</p>
                            <p className="mt-1 text-lg font-black text-white">{weeklyLeaderPendingPenaltyRequests.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setStudentTab('mission')}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition-all ${hasWeeklyLeaderPendingWork ? 'border-amber-300/25 bg-amber-400/12 text-amber-50 hover:bg-amber-400 hover:text-black' : 'border-emerald-300/25 bg-emerald-400/12 text-emerald-50 hover:bg-emerald-400 hover:text-black'}`}
                    >
                        <ClipboardList size={15} />
                        {hasWeeklyLeaderPendingWork ? 'Concluir agora' : 'Ver obrigacoes'}
                    </button>
                </div>
            </div>
        </div>
    )}

          {/* GRID PRINCIPAL DO ALUNO */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                
                <div>
                  {studentTab !== 'overview' && <WorkspaceSectionHeading tab={currentWorkspaceTab} />}
                </div>

                {/* CONTEÃƒÅ¡DO DA ABA SELECIONADA */}
                <div hidden={studentTab === 'overview'} className={`newgears-scene-shell px-4 pb-4 md:px-7 md:pb-7 min-h-[500px] ${getWorkspaceSceneTopPadding(studentTab)}`}>
                  <WorkspaceScene sceneId={`student-${studentTab}`} onHome={() => setStudentTab('overview')}><Suspense fallback={<LazyPanelFallback label="Carregando esta área…" />}>
                    {studentTab === 'weekly_reports' && <WeeklyReportsView key={focusedReportId || 'all-reports'} user={currentUser} workspace={reportsWorkspace} students={allStudents} seasonId={activeTeamSeasonId || 'legacy'} reportDueDay={effectivePlanning.reportDueDay} defaultWeek={currentWeekData?.weekName} focusedReportId={focusedReportId} />}
                    {studentTab === 'shop' && <Suspense fallback={<LazyPanelFallback label="Carregando a loja do Giro…" />}><GearShopView /></Suspense>}
                    {studentTab === 'sprint' && <FinalSprintView {...finalSprintViewProps} />}
                    {studentTab === 'feedback' && <Suspense fallback={<LazyPanelFallback label="Carregando seu feedback..." minHeightClass="min-h-[420px]" />}><FinalSprintEvaluationsView key={`${currentUser?.type}:${evaluationDraftScope}`} {...finalSprintEvaluationViewProps} /></Suspense>}
                    {studentTab === 'mission' && (
                        <>
                          {viewAsStudent.station ? (
                            <div className="space-y-6">
                              <section className="newgears-major-panel rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(0,0,0,0.18))] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)]">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                  <div className="max-w-2xl">
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Painel da Missao</p>
                                    <p className="text-sm text-gray-300 mt-2">
                                      Este painel mostra o foco principal, a etapa em que voce esta e o melhor proximo passo para transformar a missao da semana em entrega real.
                                    </p>
                                  </div>

                                  <div className="inline-flex rounded-[18px] border border-white/10 bg-black/20 p-1">
                                    <button
                                      onClick={() => setStudentMissionMode('compact')}
                                      className={`rounded-[16px] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all ${!isStudentMissionDetailed ? 'bg-white text-black shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                                    >
                                      Leitura rapida
                                    </button>
                                    <button
                                      onClick={() => setStudentMissionMode('detailed')}
                                      className={`rounded-[16px] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all ${isStudentMissionDetailed ? 'bg-white text-black shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                                    >
                                      Modo completo
                                    </button>
                                  </div>
                                </div>

                                <div className="grid gap-3 mt-5 md:grid-cols-3">
                                  {studentMissionFlow.map((step) => (
                                    <div key={step.label} className={`rounded-[22px] border p-4 ${step.tone}`}>
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-80">{step.label}</span>
                                        <span>{step.icon}</span>
                                      </div>
                                      <p className="text-sm font-bold text-white mt-3 leading-relaxed">{step.detail}</p>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              {isWeeklyLeader && (
                                <section className="newgears-major-panel rounded-[30px] border border-purple-400/25 bg-purple-500/10 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                      <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100">
                                        <Crown size={12} /> Lider da semana
                                      </span>
                                      <h3 className="mt-3 text-2xl font-black text-white">Obrigacoes de gestao da semana</h3>
                                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-purple-100/80">
                                        Como lider, voce ajusta o foco das estacoes e abre tarefas no Kanban para o time. Isso substitui o relatorio manual para o tecnico: fica tudo registrado no sistema.
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Missoes</p>
                                        <p className="mt-2 text-xl font-black text-white">{weeklyLeaderMissionReadyCount}/3</p>
                                      </div>
                                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Kanban</p>
                                        <p className="mt-2 text-xl font-black text-white">{weeklyLeaderTasks.length}</p>
                                      </div>
                                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Pen.</p>
                                        <p className="mt-2 text-xl font-black text-white">{weeklyLeaderPendingPenaltyRequests.length}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {hasWeeklyLeaderPendingWork && (
                                    <div className="mt-5 rounded-[24px] border border-amber-300/25 bg-amber-400/10 p-4">
                                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start gap-3">
                                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-100">
                                            <AlertTriangle size={17} />
                                          </div>
                                          <div>
                                            <p className="text-sm font-black text-white">Pendencias obrigatorias</p>
                                            <p className="mt-1 text-xs leading-relaxed text-amber-50/80">
                                              Complete foco e prazo das 3 estacoes e crie ao menos 1 tarefa Kanban para a semana ficar registrada.
                                            </p>
                                          </div>
                                        </div>
                                        <span className="rounded-full border border-amber-300/25 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">
                                          {weeklyLeaderPendingCount} pendencia(s)
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="mt-5 grid gap-4 xl:grid-cols-3">
                                    {WEEKLY_STATION_KEYS.map((station) => {
                                      const stationStatus = getWeeklyLeaderStationStatus(station);

                                      return (
                                      <div key={station} className={`rounded-[24px] border p-4 ${stationStatus.ready ? 'border-white/10 bg-black/25' : 'border-amber-300/20 bg-amber-400/10'}`}>
                                        <div className="flex items-center justify-between gap-2">
                                          <p className="text-sm font-black text-white">{station}</p>
                                          <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${stationStatus.ready ? 'border-green-400/25 bg-green-500/10 text-green-100' : 'border-yellow-400/25 bg-yellow-500/10 text-yellow-100'}`}>
                                            {stationStatus.ready ? 'Pronta' : 'Pendente'}
                                          </span>
                                        </div>
                                        <textarea
                                          value={missions?.[station]?.text || ''}
                                          onChange={(event) => updateMission(station, 'text', event.target.value)}
                                          placeholder={`O que ${station} precisa fazer nesta semana?`}
                                          className="mt-3 h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-300"
                                        />
                                        <input
                                          type="date"
                                          value={missions?.[station]?.deadline || ''}
                                          onChange={(event) => updateMission(station, 'deadline', event.target.value)}
                                          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-purple-300"
                                        />
                                        {!stationStatus.ready && (
                                          <p className="mt-2 text-[11px] font-semibold text-amber-100/85">
                                            Falta {[
                                              !stationStatus.hasText ? 'foco escrito' : null,
                                              !stationStatus.hasDeadline ? 'prazo' : null
                                            ].filter(Boolean).join(' e ')}.
                                          </p>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleSaveStationMission(station)}
                                          className="mt-3 w-full rounded-2xl border border-green-400/25 bg-green-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-green-100 transition-all hover:bg-green-500 hover:text-black"
                                        >
                                          Salvar foco
                                        </button>
                                      </div>
                                      );
                                    })}
                                  </div>

                                  <form onSubmit={handleWeeklyLeaderTaskSubmit} className={`mt-5 rounded-[24px] border p-4 ${weeklyLeaderKanbanReady ? 'border-white/10 bg-black/25' : 'border-orange-300/25 bg-orange-400/10'}`}>
                                    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                      <div>
                                        <p className="text-sm font-black text-white">Tarefa Kanban da lideranca</p>
                                        <p className="mt-1 text-xs text-gray-400">A tarefa criada aqui fica marcada como tarefa aberta pelo lider da semana.</p>
                                      </div>
                                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${weeklyLeaderKanbanReady ? 'border-green-400/25 bg-green-500/10 text-green-100' : 'border-orange-300/25 bg-orange-400/10 text-orange-100'}`}>
                                        {weeklyLeaderKanbanReady ? 'Registrada' : 'Obrigatoria'}
                                      </span>
                                    </div>
                                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr),180px,190px,160px,auto]">
                                      <input
                                        value={leaderTaskDraft.text}
                                        onChange={(event) => setLeaderTaskDraft(prev => ({ ...prev, text: event.target.value }))}
                                        placeholder="Criar tarefa obrigatoria no Kanban..."
                                        className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-orange-300"
                                      />
                                      <select
                                        value={leaderTaskDraft.studentId}
                                        onChange={(event) => setLeaderTaskDraft(prev => ({ ...prev, studentId: event.target.value }))}
                                        className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-orange-300"
                                      >
                                        <option value="">Equipe</option>
                                        {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                                      </select>
                                      <select
                                        value={leaderTaskDraft.station}
                                        onChange={(event) => setLeaderTaskDraft(prev => ({ ...prev, station: event.target.value }))}
                                        className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-orange-300"
                                      >
                                        {WEEKLY_STATION_KEYS.map((station) => <option key={station} value={station}>{station}</option>)}
                                      </select>
                                      <input
                                        type="date"
                                        value={leaderTaskDraft.dueDate || currentWeekData?.endDate || localTodayStr}
                                        onChange={(event) => setLeaderTaskDraft(prev => ({ ...prev, dueDate: event.target.value }))}
                                        className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-orange-300"
                                      />
                                      <button className="rounded-2xl border border-orange-400/25 bg-orange-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-orange-100 transition-all hover:bg-orange-500 hover:text-white">
                                        Criar
                                      </button>
                                    </div>
                                  </form>

                                  <form onSubmit={handleWeeklyLeaderPenaltySubmit} className="mt-5 rounded-[24px] border border-red-400/25 bg-red-500/10 p-4">
                                    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                      <div>
                                        <p className="text-sm font-black text-white flex items-center gap-2">
                                          <Gavel size={15} className="text-red-200" /> Penalizacao da lideranca
                                        </p>
                                        <p className="mt-1 text-xs text-red-50/70">O tecnico revisa antes de qualquer XP sair do aluno.</p>
                                      </div>
                                      <span className="rounded-full border border-red-300/25 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-100">
                                        {weeklyLeaderPendingPenaltyRequests.length} pendente(s)
                                      </span>
                                    </div>
                                    <div className="grid gap-3 xl:grid-cols-[220px,minmax(0,1fr),240px,auto]">
                                      <select
                                        value={leaderPenaltyDraft.studentId}
                                        onChange={(event) => setLeaderPenaltyDraft(prev => ({ ...prev, studentId: event.target.value }))}
                                        className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-red-300"
                                      >
                                        <option value="">Selecionar aluno</option>
                                        {students
                                          .filter((student) => student.id !== viewAsStudent.id)
                                          .map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                                      </select>
                                      <input
                                        value={leaderPenaltyDraft.reason}
                                        onChange={(event) => setLeaderPenaltyDraft(prev => ({ ...prev, reason: event.target.value }))}
                                        placeholder="Motivo objetivo da penalizacao..."
                                        className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-300"
                                      />
                                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/35 p-3 text-xs font-black uppercase tracking-[0.12em] text-red-50 transition-all hover:border-red-300/45 hover:bg-red-500/10">
                                        <ImageIcon size={14} />
                                        {leaderPenaltyDraft.evidenceFile ? 'Foto anexada' : 'Foto opcional'}
                                        <input
                                          key={leaderPenaltyFileInputKey}
                                          type="file"
                                          accept="image/*"
                                          onChange={(event) => {
                                            const file = event.target.files?.[0] || null;
                                            if (file && !file.type.startsWith('image/')) {
                                              showNotification("Envie apenas imagem como evidencia.", "error");
                                              event.target.value = '';
                                              return;
                                            }
                                            setLeaderPenaltyDraft(prev => ({ ...prev, evidenceFile: file }));
                                          }}
                                          className="sr-only"
                                        />
                                      </label>
                                      <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-300/25 bg-red-500/15 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-50 transition-all hover:bg-red-500 hover:text-white">
                                        <AlertTriangle size={14} /> Enviar revisao
                                      </button>
                                    </div>
                                    {leaderPenaltyDraft.evidenceFile && (
                                      <p className="mt-2 text-[11px] font-bold text-red-50/70">
                                        Foto selecionada: {leaderPenaltyDraft.evidenceFile.name}
                                      </p>
                                    )}
                                    {weeklyLeaderPenaltyRequests.length > 0 && (
                                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                                        {weeklyLeaderPenaltyRequests.slice(0, 3).map((request) => (
                                          <div key={request.id} className="rounded-2xl border border-red-300/15 bg-black/20 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                              <p className="truncate text-xs font-black text-white">{request.studentName || 'Aluno'}</p>
                                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${
                                                request.status === 'approved'
                                                  ? 'border-green-300/20 bg-green-500/10 text-green-100'
                                                  : request.status === 'rejected'
                                                      ? 'border-gray-300/20 bg-white/10 text-gray-200'
                                                      : 'border-yellow-300/20 bg-yellow-500/10 text-yellow-100'
                                              }`}>
                                                {request.status === 'approved' ? 'Aprovada' : request.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                                              </span>
                                            </div>
                                            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-red-50/75">
                                              {request.reason || 'Sem motivo registrado.'}
                                            </p>
                                            {request.evidenceImage && (
                                              <span className="mt-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">Com foto</span>
                                            )}
                                            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-100/70">{formatShortDateLabel(request.requestedAt || request.reviewedAt)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </form>
                                </section>
                              )}

                              <section className={`newgears-major-panel relative overflow-hidden rounded-[32px] border ${studentMissionTone.border} bg-gradient-to-br ${studentMissionTone.bg} p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]`}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)] pointer-events-none"></div>
                                <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                                  <div>
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${studentMissionTone.button}`}>
                                      <Gamepad2 size={12} /> Minha Missao
                                    </span>
                                    <h3 className="text-3xl font-black text-white mt-4 leading-tight">
                                      Sua missao principal em <span className={studentMissionTone.text}>{viewAsStudent.station}</span>
                                    </h3>
                                    <p className="text-sm text-gray-300 mt-4 max-w-2xl leading-relaxed">
                                      Esta e a frente onde voce mais pode ajudar a equipe nesta semana. Foque nessa frente para puxar a qualidade tecnica, a clareza da apresentacao e a prontidao competitiva.
                                    </p>

                                    <div className="rounded-[26px] border border-white/10 bg-black/25 p-5 mt-6">
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Foco prioritario</p>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">
                                          {currentWeekData?.weekName || 'Semana ativa'}
                                        </span>
                                      </div>
                                      <p className="text-xl text-white font-bold italic leading-relaxed mt-3">
                                        "{studentMissionData?.text || 'Aguarde orientacao da equipe tecnica.'}"
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-6">
                                      {studentMissionActions.map((action) => (
                                        <button
                                          key={action.label}
                                          onClick={action.onClick}
                                          className={`inline-flex items-center gap-2 rounded-[18px] border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition-all hover:-translate-y-0.5 ${action.style}`}
                                        >
                                          {action.icon}
                                          {action.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-300 font-bold">Loadout do jogador</p>
                                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">
                                        Visao rapida
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {studentMissionCards.map((card) => (
                                      <div key={card.label} className={`rounded-[22px] border p-4 ${card.tone}`}>
                                        <div className="flex items-center justify-between gap-3">
                                          <span className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-80">{card.label}</span>
                                          <span>{card.icon}</span>
                                        </div>
                                        <p className="text-xl font-black text-white mt-4 leading-tight">{card.value}</p>
                                        <p className="text-xs mt-2 opacity-90 leading-relaxed">{card.helper}</p>
                                      </div>
                                    ))}
                                    </div>
                                  </div>
                                </div>
                              </section>

                              <div className={`grid gap-6 ${isStudentMissionDetailed ? 'xl:grid-cols-[1.2fr,0.8fr]' : ''}`}>
                                <div className="rounded-[28px] border border-white/10 bg-[#12121b] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                                  <div className={`px-5 py-4 font-bold text-sm flex items-center justify-between gap-3 ${studentSubmissionTone.bar}`}>
                                    <span className="flex items-center gap-2">{studentSubmissionTone.icon} {studentSubmissionTone.label}</span>
                                    <span className="text-[10px] uppercase tracking-[0.18em] font-black">Status da entrega</span>
                                  </div>

                                  <div className="p-5">
                                    <p className="text-sm text-gray-300 leading-relaxed">{studentSubmissionTone.detail}</p>

                                    {(!viewAsStudent.submission || viewAsStudent.submission.status === 'rejected') && (
                                      <form onSubmit={handleSubmitActivity} className="mt-5">
                                        <p className="text-sm text-gray-400 mb-4">
                                          Quando voce concluir a atividade e enviar pelo canal combinado da equipe, registre aqui para o tecnico validar.
                                        </p>
                                        <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold py-3.5 rounded-2xl uppercase tracking-[0.18em] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(37,99,235,0.2)]">
                                          {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Upload size={20} /> Registrar entrega da missao</>}
                                        </button>
                                      </form>
                                    )}

                                    {viewAsStudent.submission && viewAsStudent.submission.status !== 'rejected' && (
                                      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Ultimo envio</p>
                                        <p className="text-white font-bold mt-3 leading-relaxed">"{viewAsStudent.submission.text}"</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-gray-400">
                                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1">
                                            <CalendarDays size={12} /> {viewAsStudent.submission.date}
                                          </span>
                                          {viewAsStudent.submission.fileName !== "Sem arquivo" && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-300">
                                              <FileText size={12}/> {viewAsStudent.submission.fileName}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {isStudentMissionDetailed ? (
                                  <div className="space-y-6">
                                    <div className="rounded-[28px] border border-white/10 bg-[#12121b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                                      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                          <Target size={16} className={studentMissionTone.text} /> Direcao da Semana
                                        </h4>
                                        <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold ${studentMissionTone.button}`}>
                                          Foco total
                                        </span>
                                      </div>
                                      <div className="space-y-3 mt-4">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Prazo oficial</p>
                                          <p className="text-lg font-black text-white mt-2">{studentMissionDeadlineLabel}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Melhor proximo passo</p>
                                          <p className="text-sm text-gray-200 mt-2 leading-relaxed">{studentMissionNextStep}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="rounded-[28px] border border-white/10 bg-[#12121b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                                      <h4 className="text-white font-bold flex items-center gap-2 border-b border-white/10 pb-3">
                                        <Sparkles size={16} className="text-yellow-400" /> Coach da Missao
                                      </h4>
                                      <div className="space-y-3 mt-4 text-sm text-gray-300">
                                        {studentMissionCoachCards.map((tip) => (
                                          <div key={tip} className="rounded-2xl border border-white/10 bg-white/5 p-4">{tip}</div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-[24px] border border-white/10 bg-[#12121b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                                      <div className="flex items-center justify-between gap-3">
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                          <Target size={16} className={studentMissionTone.text} /> Prazo oficial
                                        </h4>
                                        <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold ${studentMissionTone.button}`}>
                                          Resumo rapido
                                        </span>
                                      </div>
                                      <p className="text-2xl font-black text-white mt-5">{studentMissionDeadlineLabel}</p>
                                      <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                                        Use este prazo como meta de entrega da semana para nao perder ritmo no torneio.
                                      </p>
                                    </div>

                                    <div className="rounded-[24px] border border-white/10 bg-[#12121b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                                      <div className="flex items-center justify-between gap-3">
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                          <Sparkles size={16} className="text-yellow-400" /> Dica do coach
                                        </h4>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold text-gray-300">
                                          Boost
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-200 mt-5 leading-relaxed">{studentMissionCoachCards[0] || studentMissionNextStep}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="max-w-3xl mx-auto text-center rounded-[34px] border border-white/10 bg-gradient-to-br from-white/10 via-[#171720] to-[#0f1017] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                              <div className="w-20 h-20 mx-auto rounded-[24px] border border-white/10 bg-white/5 flex items-center justify-center mb-6 shadow-[0_14px_30px_rgba(0,0,0,0.24)]">
                                <Rocket size={34} className="text-white" />
                              </div>
                              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Minha Missao</p>
                              <h3 className="text-3xl font-black text-white mt-4">Sua frente ainda esta sendo organizada.</h3>
                              <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                                Assim que a equipe tecnica definir a estacao da semana, este painel vai mostrar sua missao prioritaria, prazo, status e as acoes para entrega.
                              </p>
                              <button onClick={() => setStudentTab('agenda')} className="mt-6 inline-flex items-center gap-2 rounded-[18px] border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:text-white transition-all">
                                <CalendarDays size={14} /> Ver agenda da equipe
                              </button>
                            </div>
                          )}
                        </>
                    )}

                    {studentTab === 'strategy' && <div className="text-left"><StrategyView {...strategyViewProps} /></div>}
                    {studentTab === 'rounds' && <div className="text-left"><RoundsView {...roundsViewProps} /></div>}
                    {studentTab === 'rubrics' && (
                      <div className="text-left">
                        <Suspense fallback={<LazyPanelFallback label="Carregando rubricas..." minHeightClass="min-h-[320px]" />}>
                          <RubricViewPanel
                            innovationRubric={innovationRubric}
                            robotDesignRubric={robotDesignRubric}
                            handleRubricUpdate={handleRubricUpdate}
                          />
                        </Suspense>
                      </div>
                    )}
                    {studentTab === 'kanban' && <div className="text-left"><KanbanView {...kanbanViewProps} /></div>}
                    {studentTab === 'logbook' && <div className="text-left"><LogbookView {...logbookViewProps} /></div>}
                    {studentTab === 'agenda' && <div className="text-left"><AgendaView {...agendaViewProps} /></div>}
                  </Suspense></WorkspaceScene>
                </div>
            </div>
          </div>
        </main>
      )}
      </div>
    </div>
    </div>
    </GearExperienceProvider></ScoreEvolutionChartContext.Provider>
  );
}

export default App;


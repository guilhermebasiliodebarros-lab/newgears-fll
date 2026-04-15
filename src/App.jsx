import { Suspense, lazy, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, setDoc, collectionGroup, orderBy, limit } from "firebase/firestore";
import { db } from './firebase'; // Importa a instância já inicializada
import Countdown from './components/Countdown';
import LogoNewGears from './components/LogoNewGears';
import { WorkspaceHero, WorkspaceTabs, WorkspaceScene, WorkspaceCollapsible, WorkspacePanelToolbar } from './components/WorkspaceChrome';
import { 
  User, 
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
} from 'lucide-react';

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
const RotationOperationsPanel = lazy(() => import('./components/RotationOperationsPanel'));

const LazyPanelFallback = ({ label = 'Carregando modulo...', minHeightClass = 'min-h-[220px]' }) => (
  <div className={`newgears-major-panel flex ${minHeightClass} items-center justify-center rounded-[28px] border border-white/10 bg-[#11131d]/92 p-6 text-center shadow-[0_18px_48px_rgba(0,0,0,0.24)]`}>
    <div>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-cyan-400/20 bg-cyan-400/10">
        <Loader2 size={24} className="animate-spin text-cyan-300" />
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300/70">Streaming de interface</p>
      <p className="mt-2 text-sm text-slate-200/80">{label}</p>
    </div>
  </div>
);

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

    { name: "Novato", min: 0, max: 499, color: "text-gray-400" },

    { name: "Aprendiz", min: 500, max: 1199, color: "text-blue-400" },

    { name: "Veterano", min: 1200, max: 2399, color: "text-purple-400" },

    { name: "Mestre FLL", min: 2400, max: 10000, color: "text-yellow-400" }

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

const SCHOOL_REPORT_SUBJECTS = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Inglês', 'Artes', 'Ed. Física', 'Robótica', 'STEAM'];

const SCHOOL_REPORT_STAGE_CONFIG = {
  etapa1: {
    id: 'etapa1',
    label: '1ª etapa',
    periodLabel: 'fechamento do fim de abril'
  },
  etapa2: {
    id: 'etapa2',
    label: '2ª etapa',
    periodLabel: 'fechamento de meados de setembro'
  }
};

const calculateSchoolReportXp = (grades = {}) =>
  Object.values(grades).reduce((total, rawGrade) => {
    const grade = parseFloat(rawGrade);

    if (Number.isNaN(grade)) return total;
    if (grade === 10) return total + 10;
    if (grade >= 9.0) return total + 7;
    if (grade >= 8.0) return total + 5;

    return total - 2;
  }, 0);

const normalizeSchoolGrades = (schoolGrades) => {
  if (!schoolGrades || typeof schoolGrades !== 'object') return {};

  const hasSeparatedStages = Object.values(SCHOOL_REPORT_STAGE_CONFIG).some((stage) => {
    const stageRecord = schoolGrades?.[stage.id];
    return Boolean(stageRecord && typeof stageRecord === 'object');
  });

  if (hasSeparatedStages) return schoolGrades;

  return {
    etapa1: {
      grades: schoolGrades,
      xpApplied: calculateSchoolReportXp(schoolGrades),
      submittedAt: null,
      updatedAt: null,
      migratedFromLegacy: true
    }
  };
};

const getSchoolStageRecord = (studentOrGrades, stageId) => {
  const schoolGrades = studentOrGrades?.schoolGrades ?? studentOrGrades;
  const normalized = normalizeSchoolGrades(schoolGrades);
  return normalized?.[stageId] || null;
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

const normalizeStationKey = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const resolveTaskTagFromStation = (station) => {
  const normalizedStation = normalizeStationKey(station);

  if (normalizedStation === 'engenharia') return 'engenharia';
  if (normalizedStation === 'inovacao') return 'inovacao';
  if (normalizedStation === 'gestao') return 'gestao';

  return 'geral';
};

const buildInitialKanbanTaskDraft = (station, dueDate = '') => ({
  text: '',
  dueDate,
  tag: resolveTaskTagFromStation(station),
  priority: 'normal'
});

const STUDENT_TASKS_LABEL = 'Tarefas';
const STUDENT_TASKS_OPEN_LABEL = 'Abrir Tarefas';
const STUDENT_TASKS_SHORT_LABEL = 'Minhas Tarefas';
const STUDENT_TASKS_VIEW_LABEL = 'Ver Tarefas';

const readStoredPrefs = (storageKey, defaults) => {
  if (typeof window === 'undefined') return defaults;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
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

function App() {
  // === TODOS OS ESTADOS (HOOKS) ===
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("roboquest_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem("roboquest_user");
    return saved ? JSON.parse(saved).type === 'admin' : false;
  });

  const [viewAsStudent, setViewAsStudent] = useState(() => {
    const saved = localStorage.getItem("roboquest_user");
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.type === 'student' ? parsed.data : null;
  });

  const [logoutCountdown, setLogoutCountdown] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [badgeStudent, setBadgeStudent] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(() => detectLiteMode());
  const prevXpRef = useRef(null);
  const confettiTimeoutRef = useRef(null);
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [teamMoods, setTeamMoods] = useState([]);
  const [isStudentLink, setIsStudentLink] = useState(false);
  const [currentWeekData, setCurrentWeekData] = useState(null);
  const [adminPanelState, setAdminPanelState] = useState(() => readStoredPrefs('newgears_admin_panel_prefs_v2', ADMIN_PANEL_DEFAULTS));
  const [studentPanelState, setStudentPanelState] = useState(() => readStoredPrefs('newgears_student_panel_prefs_v2', STUDENT_PANEL_DEFAULTS));
  const [studentMissionMode, setStudentMissionMode] = useState(() => {
    if (typeof window === 'undefined') return 'compact';
    return localStorage.getItem('newgears_student_mission_mode') || 'compact';
  });
  const getStandaloneView = () => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('view') || '';
  };
  const [adminTab, setAdminTab] = useState('rotation');
  const [studentTab, setStudentTab] = useState('mission');
  const [isTvMode, setIsTvMode] = useState(() => getStandaloneView() === 'tv');
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [isCommandCenterMode, setIsCommandCenterMode] = useState(false);
  const [strategySubTab, setStrategySubTab] = useState('innovation');
  const [robotSubTab, setRobotSubTab] = useState('overview');
  const [missionsList, setMissionsList] = useState([]);
  const [decisionMatrix, setDecisionMatrix] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logbookEntries, setLogbookEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [adminProfile, setAdminProfile] = useState({ name: 'Técnico', avatarImage: null, specialty: '' });
  const [isCropping, setIsCropping] = useState(false);
  const [cropImgSrc, setCropImgSrc] = useState(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [experts, setExperts] = useState([]);
  const [robotVersions, setRobotVersions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerDisplay, setTimerDisplay] = useState(0); 
  const [roundFormValues, setRoundFormValues] = useState({});
  const FULL_ROUND_TIMER_ID = '__full_round__';
  const FULL_ROUND_TIME_KEY = '__full_round_time__';
  const FULL_ROUND_SCORE_KEY = '__full_round_score__';
  const [pitStopRecords, setPitStopRecords] = useState([]);
  const [innovationRubric, setInnovationRubric] = useState(DEFAULT_INNOVATION_RUBRIC);
  const [robotDesignRubric, setRobotDesignRubric] = useState(DEFAULT_ROBOT_DESIGN_RUBRIC);
  const [outreachEvents, setOutreachEvents] = useState([]);
  const [projectSummary, setProjectSummary] = useState({ title: "Nome do Projeto", problem: "", solution: "", sharing: "", image: null });
  const [modal, setModal] = useState({ type: null, data: null });
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false); 
  const [agendaSearchQuery, setAgendaSearchQuery] = useState('');
  const [agendaTypeFilter, setAgendaTypeFilter] = useState('all');
  const [agendaScopeFilter, setAgendaScopeFilter] = useState('all');
  const [adminLogbookStudentId, setAdminLogbookStudentId] = useState(null);
  const [adminLogbookSearchQuery, setAdminLogbookSearchQuery] = useState('');
  const [adminLogbookStudentQuery, setAdminLogbookStudentQuery] = useState('');
  const [adminLogbookWeekFilter, setAdminLogbookWeekFilter] = useState('all');
  const [studentLogbookSearchQuery, setStudentLogbookSearchQuery] = useState('');
  const [studentLogbookWeekFilter, setStudentLogbookWeekFilter] = useState('all');
  const [studentLogbookDraft, setStudentLogbookDraft] = useState('');
  const isTvOnlyView = getStandaloneView() === 'tv';
  const today = new Date().toISOString().split('T')[0];
  const isLogbookViewActive = isAdmin ? adminTab === 'logbook' : studentTab === 'logbook';
  const isPitStopModalOpen = modal.type === 'pitstop';
  const dashboardNeedsStrategyData =
    (adminPanelState.dashboard && (adminPanelState.prep || adminPanelState.judge || adminPanelState.stats || adminPanelState.achievements))
    || (studentPanelState.dashboard && (studentPanelState.prep || studentPanelState.judge || studentPanelState.stats || studentPanelState.achievements));
  const dashboardNeedsRobotData =
    (adminPanelState.dashboard && (adminPanelState.prep || adminPanelState.judge || adminPanelState.stats))
    || (studentPanelState.dashboard && (studentPanelState.prep || studentPanelState.judge || studentPanelState.stats));
  const shouldLoadStrategyWorkspaceData =
    isTvOnlyView
    || isTvMode
    || isJudgeMode
    || isCommandCenterMode
    || ((adminTab === 'strategy' || studentTab === 'strategy') && strategySubTab === 'innovation')
    || dashboardNeedsStrategyData;
  const shouldLoadRobotWorkspaceData =
    isTvOnlyView
    || isTvMode
    || isJudgeMode
    || isCommandCenterMode
    || adminTab === 'rounds'
    || studentTab === 'rounds'
    || ((adminTab === 'strategy' || studentTab === 'strategy') && strategySubTab === 'robot_design')
    || dashboardNeedsRobotData;
  const [missions, setMissions] = useState({
    Engenharia: { text: "Definir estratégia do robô.", deadline: today },
    Inovação: { text: "Pesquisar especialistas.", deadline: today },
    Gestão: { text: "Atualizar o Cronograma.", deadline: today }
  });

  useEffect(() => {
      localStorage.setItem('newgears_admin_panel_prefs_v2', JSON.stringify(adminPanelState));
  }, [adminPanelState]);

  useEffect(() => {
      localStorage.setItem('newgears_student_panel_prefs_v2', JSON.stringify(studentPanelState));
  }, [studentPanelState]);

  useEffect(() => {
      setAdminPanelState((prev) => (prev.dashboard ? { ...prev, dashboard: false } : prev));
  }, [adminTab]);

  useEffect(() => {
      setStudentPanelState((prev) => (prev.dashboard ? { ...prev, dashboard: false } : prev));
  }, [studentTab]);

  useEffect(() => {
      localStorage.setItem('newgears_student_mission_mode', studentMissionMode);
  }, [studentMissionMode]);

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

  useEffect(() => {
      if (typeof window === 'undefined') return;

      if (!viewAsStudent?.id) {
          setStudentLogbookDraft('');
          return;
      }

      const draftKey = `newgears_logbook_draft_${viewAsStudent.id}`;
      setStudentLogbookDraft(localStorage.getItem(draftKey) || '');
  }, [viewAsStudent?.id]);

  useEffect(() => {
      if (typeof window === 'undefined' || !viewAsStudent?.id) return;

      const draftKey = `newgears_logbook_draft_${viewAsStudent.id}`;

      if (studentLogbookDraft.trim()) {
          localStorage.setItem(draftKey, studentLogbookDraft);
          return;
      }

      localStorage.removeItem(draftKey);
  }, [studentLogbookDraft, viewAsStudent?.id]);

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

// --- LISTA DE BADGES (VERSÃO FINAL) ---
  const BADGES_LIST = [
    { id: 'pitstop', name: 'Pit Stop F1', icon: <Timer size={20}/>, color: 'text-red-500', desc: 'Troca de anexo em menos de 3s.' },
    { id: 'engineer', name: 'Engenheiro Minimalista', icon: <Wrench size={20}/>, color: 'text-gray-400', desc: 'Solução mecânica simples e genial.' },
    { id: 'ice_blood', name: 'Sangue Frio', icon: <ThermometerSnowflake size={20}/>, color: 'text-blue-400', desc: 'Manteve a calma no erro crítico.' },
    { id: 'repetition', name: 'Rei da Repetição', icon: <RotateCcw size={20}/>, color: 'text-green-500', desc: '10 acertos seguidos na mesa.' },
    { id: 'helper', name: 'Braço Direito', icon: <HeartHandshake size={20}/>, color: 'text-pink-500', desc: 'Ajudou o time em qualquer situação.' },
    { id: 'data_keeper', name: 'Guardião dos Dados', icon: <BarChart size={20}/>, color: 'text-blue-500', desc: 'Trouxe estatísticas reais pro Projeto.' },
    { id: 'legend', name: 'Lenda do XP', icon: <Zap size={20}/>, color: 'text-yellow-400', desc: 'Destaque absoluto no Ranking de XP.' },
    { id: 'ambassador', name: 'Embaixador', icon: <Crown size={20}/>, color: 'text-purple-500', desc: 'Liderou pelo exemplo e uniu a equipe.' },
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
      if (!viewAsStudent || !viewAsStudent.englishChallengeUnlocked) return;

      try {
          const studentRef = doc(db, "students", viewAsStudent.id);
          const xpBonus = 20; // Quanto de XP ele ganha por falar inglês

          await updateDoc(studentRef, {
              xp: (viewAsStudent.xp || 0) + xpBonus,
              englishChallengeUnlocked: false // Bloqueia o botão de novo automaticamente!
          });

          // Atualiza a tela do aluno
          setViewAsStudent(prev => ({ 
              ...prev, 
              xp: (prev.xp || 0) + xpBonus, 
              englishChallengeUnlocked: false 
          }));
          
          alert("Great job! Mandou bem no inglês! +20 XP 🇺🇸✨");
      } catch (error) {
          console.error("Erro ao resgatar XP de inglês:", error);
      }
  };
 // Função atualizada para o Técnico dar Badges
  const toggleBadge = async (student, badgeId) => {
      if (!isAdmin) return;
      
      const currentBadges = student.badges || [];
      let newBadges;
      let xpBonus = 0;

      // Lógica de Adicionar/Remover
      if (currentBadges.includes(badgeId)) {
          newBadges = currentBadges.filter(b => b !== badgeId);
          // Opcional: Remover XP se tirar a badge? Melhor não, deixa o XP ganho.
      } else {
          newBadges = [...currentBadges, badgeId];
          xpBonus = 100; // Bônus de XP ao ganhar
      }

      // 1. Atualiza no Firebase
      const studentRef = doc(db, "students", student.id);
      await updateDoc(studentRef, {
         badges: newBadges,
         xp: (student.xp || 0) + xpBonus
      });

      // 2. Atualiza o estado local para ver a mudança na hora (sem recarregar)
      const updatedStudent = { ...student, badges: newBadges, xp: (student.xp || 0) + xpBonus };
      
      // Atualiza o aluno selecionado no modal
      setBadgeStudent(updatedStudent);

      // Atualiza a lista geral de alunos na tela
      setStudents(prevStudents => 
        prevStudents.map(s => s.id === student.id ? updatedStudent : s)
      );
  };
  // --- LÓGICA DA CHUVA DE CONFETES (LEVEL UP E GRANDES GANHOS DE XP) ---

  useEffect(() => {
      return () => {
          if (confettiTimeoutRef.current) {
              clearTimeout(confettiTimeoutRef.current);
          }
      };
  }, []);

  useEffect(() => {
      if (isLiteMode && showConfetti) {
          setShowConfetti(false);
      }
  }, [isLiteMode, showConfetti]);

  useEffect(() => {
      if (viewAsStudent) {
          const currentXp = viewAsStudent.xp || 0;

          // 1. Descobre o nível atual baseado no XP do aluno
          const currentLevelObj = getCurrentLevel(currentXp);
          // Encontra a posição numérica desse nível (0 = Novato, 1 = Aprendiz, etc)
          const currentLevelIndex = LEVELS.findIndex(l => l.name === currentLevelObj.name);
          
          // 2. Busca na memória qual foi o último nível que esse aluno assistiu
          const storageKey = `last_seen_level_${viewAsStudent.id}`;
          const lastSeenLevel = localStorage.getItem(storageKey);

          let triggerConfetti = false;
          let msg = "";

          // 3. Se não for o primeiro carregamento da tela, verifica as vitórias
          if (prevXpRef.current !== null) {
              const prevXp = prevXpRef.current;
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
          localStorage.setItem(storageKey, currentLevelIndex.toString());
          
          // Atualiza o valor anterior para a próxima renderização
          prevXpRef.current = currentXp;
      } else {
          // Se deslogar, limpa a memória temporária do XP
          prevXpRef.current = null;
      }
  }, [isLiteMode, viewAsStudent?.xp, viewAsStudent?.id]);

  const CHECK_IN_REWARD_XP = 2;
  const getTodayMoodDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // Função para carregar a bateria de hoje do banco
  useEffect(() => {
      if (!db) return;
      const today = getTodayMoodDate();
      
      // Cria uma "escuta" no banco para ver os humores de hoje em tempo real
      const q = query(collection(db, "dailyMoods"), where("date", "==", today));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const moods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTeamMoods(moods);
      });
      return () => unsubscribe();
  }, [db]);

  // Função para Salvar o Humor
  const handleMoodSubmit = async (level) => {
      if (!viewAsStudent) return;

      // Trava 1: Apenas dias de treino (Segunda=1, Quarta=3)
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek !== 1 && dayOfWeek !== 3) {
          alert("Check-in bloqueado. Votação permitida apenas às segundas e quartas.");
          return;
      }

      // Trava 2: Impedir Farm de XP (apenas um voto por dia)
      const hasVotedToday = teamMoods.some(mood => mood.studentId === viewAsStudent.id);
      if (hasVotedToday) {
          alert("Você já respondeu hoje! Foco no treino.");
          return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      try {
          // Salva no banco
          await addDoc(collection(db, "dailyMoods"), {
              studentId: viewAsStudent.id,
              studentName: viewAsStudent.name,
              level: level, // 100, 75, 50, 25
              date: today,
              timestamp: new Date()
          });
          
          // Ganha 5 XP por participar (Incentivo!)
          // (Aqui reaproveitamos sua função de dar XP se ela existir, ou fazemos direto)
          await updateDoc(doc(db, "students", viewAsStudent.id), {
              xp: (viewAsStudent.xp || 0) + 2
          });

          setShowBatteryModal(false);
          alert(`Obrigado por compartilhar! +5 XP ⚡`);
      } catch (error) {
          console.error("Erro ao salvar bateria:", error);
      }
  };

  // Cálculo da Média da Equipe (Para você ver)
  const teamAverage = teamMoods.length > 0 
      ? Math.round(teamMoods.reduce((acc, curr) => acc + curr.level, 0) / teamMoods.length) 
      : 0;

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    
    // Normaliza (remove espaços e deixa minúsculo) para evitar erros de digitação
    const userClean = loginUser.trim().toLowerCase();
    const passClean = loginPass.trim();

    // 1. Lógica de login de Admin (SIMPLIFICADA)
    // TODO: Substituir por Firebase Auth. Por enquanto, uma verificação simples.
    let adminFound = ADMIN_USERS.find(a => a.user.toLowerCase() === userClean && a.pass === passClean);

    // Verifica se tem senha personalizada no Firebase
    if (!adminFound && adminProfile?.password) {
        // Pode logar usando "admin", "tecnico" ou o próprio nome configurado no perfil
        const allowedUsers = ['admin', 'técnico', 'tecnico', (adminProfile?.name || '').toLowerCase().trim()];
        if (allowedUsers.includes(userClean) && passClean === adminProfile.password) {
            adminFound = { user: adminProfile.name || 'Técnico' };
        }
    }

    if (adminFound) {
        // Logou com sucesso!
        const userObj = { type: 'admin', name: adminFound.user };
        setCurrentUser(userObj);
        setIsAdmin(true);
        setViewAsStudent(null);
        localStorage.setItem("roboquest_user", JSON.stringify(userObj)); // Salva na memória
        return;
    }

    console.log("Tentando logar aluno:", userClean);
    console.log("Alunos carregados no sistema:", students.length);

    // 2. Tenta logar como Aluno (busca no array 'students' que já existe no seu código)
    // Nota: Certifique-se de que o cadastro de aluno salva 'username' e 'password'
    const studentFound = students.find(s => 
        s.username && s.username.toLowerCase().trim() === userClean && s.password === passClean
    );

    if (studentFound) {
        const userObj = { type: 'student', data: studentFound };
        setCurrentUser(userObj);
        setIsAdmin(false); // Remove flag de admin
        setViewAsStudent(studentFound); // Força a visão para este aluno
        localStorage.setItem("roboquest_user", JSON.stringify(userObj)); // Salva na memória
    } else {
        // Log para ajudar a descobrir o erro (veja no F12)
        console.log("Falha no login. Usuários disponíveis:", students.map(s => s.username));
        setLoginError("Usuário ou senha incorretos.");
    }
  };

  

  const handleLogout = () => {
      setCurrentUser(null);
      setIsAdmin(false);
      setViewAsStudent(null);
      setLoginUser("");
      setLoginPass("");
      localStorage.removeItem("roboquest_user"); // Limpa a memória
        localStorage.removeItem("roboquest_last_activity"); // Limpa o controle de tempo
  };
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
        const lastActivity = localStorage.getItem("roboquest_last_activity");
        const now = new Date().getTime();
        
        if (lastActivity) {
            const timeIdle = now - parseInt(lastActivity);
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
            const currentLastActivity = localStorage.getItem("roboquest_last_activity");
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
          localStorage.setItem("roboquest_last_activity", new Date().getTime().toString());
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
        const lastActivity = localStorage.getItem("roboquest_last_activity");
        const now = new Date().getTime();
        if (lastActivity && now - parseInt(lastActivity) > TIMEOUT_MS) {
          handleLogout();
          alert("Sessão encerrada por inatividade (30 minutos). Por favor, faça login novamente.");
          return;
        }
        
        resetTimer();
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
    }, [currentUser]);


  // --- LÓGICA DE NOTIFICAÇÕES DA AGENDA EM TEMPO REAL ---
  const getLocalYYYYMMDD = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };
  const localTodayObj = new Date();
  const localTodayStr = getLocalYYYYMMDD(localTodayObj);
  const localTomorrowObj = new Date();
  localTomorrowObj.setDate(localTodayObj.getDate() + 1);
  const localTomorrowStr = getLocalYYYYMMDD(localTomorrowObj);
  const officialStudentDeadlineObj = getNextOrSameWeekday(localTodayObj, 3);
  const officialStudentDeadlineStr = getLocalYYYYMMDD(officialStudentDeadlineObj);
  const localTodayStart = new Date(localTodayObj.getFullYear(), localTodayObj.getMonth(), localTodayObj.getDate());

  const parseAgendaDate = (dateString) => {
      if (!dateString) return null;
      const [year, month, day] = dateString.split('-').map(Number);
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

  const getLogbookEntryDate = (entry) => {
      const parsed = new Date(entry?.date || 0);
      return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
  };

  const sortLogbookEntries = (entries) => [...entries].sort((left, right) => getLogbookEntryDate(right) - getLogbookEntryDate(left));

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

  const getLogbookStudentId = (entry) => {
      if (!entry?.refPath) return null;
      const pathParts = entry.refPath.split('/');
      return pathParts.length > 1 ? pathParts[1] : null;
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

  useEffect(() => {
      if (!isAdmin) return;

      const selectedExists = students.some((student) => student.id === adminLogbookStudentId);
      if (adminLogbookStudentId && selectedExists) return;

      const nextStudentId = sortLogbookEntries(logbookEntries)
          .map((entry) => getLogbookStudentId(entry))
          .find(Boolean) || students[0]?.id || null;

      if (nextStudentId !== adminLogbookStudentId) {
          setAdminLogbookStudentId(nextStudentId);
      }
  }, [isAdmin, students, logbookEntries, adminLogbookStudentId]);

  const eventsToday = events.filter(e => e.date === localTodayStr);
  const eventsTomorrow = events.filter(e => e.date === localTomorrowStr);
  const urgentEventsCount = eventsToday.length + eventsTomorrow.length;

  // --- LÓGICA DE NOTIFICAÇÕES DO KANBAN ---
  const urgentTasks = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate <= localTodayStr);
  const urgentTasksCount = urgentTasks.length;

  const UrgentEventsBanner = () => {
      if (eventsToday.length === 0 && eventsTomorrow.length === 0) return null;
      if (eventsToday.length === 0 && eventsTomorrow.length === 0 && urgentTasks.length === 0) return null;
      return (
          <div className="mb-6 space-y-3">
              {eventsToday.map(ev => (
                  <div key={ev.id} className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-500/20 rounded-full animate-pulse"><AlertTriangle className="text-red-500" size={24} /></div>
                          <div><h4 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div> EVENTO HOJE</h4><p className="text-white font-bold md:text-lg leading-none">{ev.title} <span className="text-gray-300 font-normal text-xs md:text-sm ml-2">às {ev.time}</span></p></div>
                      </div>
                      <button onClick={() => { isAdmin ? setAdminTab('agenda') : setStudentTab('agenda') }} className="hidden md:block text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-red-900/20 whitespace-nowrap">Ver na Agenda</button>
                  </div>
              ))}
              {eventsTomorrow.map(ev => (
                  <div key={ev.id} className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-yellow-500/20 rounded-full"><CalendarDays className="text-yellow-500" size={24} /></div>
                          <div><h4 className="text-yellow-500 font-bold text-xs uppercase tracking-widest mb-1">EVENTO AMANHÃ</h4><p className="text-white font-bold md:text-lg leading-none">{ev.title} <span className="text-gray-300 font-normal text-xs md:text-sm ml-2">às {ev.time}</span></p></div>
                      </div>
                      <button onClick={() => { isAdmin ? setAdminTab('agenda') : setStudentTab('agenda') }} className="hidden md:block text-xs bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-yellow-900/20 whitespace-nowrap">Ver na Agenda</button>
                  </div>
              ))}
              {urgentTasks.map(task => (
                  <div key={task.id} className="bg-orange-500/10 border border-orange-500/50 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-500/20 rounded-full animate-pulse"><ClipboardList className="text-orange-500" size={24} /></div>
                          <div><h4 className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div> TAREFA VENCENDO</h4><p className="text-white font-bold md:text-lg leading-none">{task.text}</p></div>
                      </div>
                      <button onClick={() => { isAdmin ? setAdminTab('kanban') : setStudentTab('kanban') }} className="hidden md:block text-xs bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-orange-900/20 whitespace-nowrap">{isAdmin ? 'Ver Kanban' : STUDENT_TASKS_VIEW_LABEL}</button>
                  </div>
              ))}
          </div>
      );
  }

  // --- NOVO: Sincroniza dados do aluno logado com o Firebase em tempo real ---
  useEffect(() => {
    if (currentUser?.type === 'student' && students.length > 0) {
        // Procura a versão mais recente deste aluno na lista que veio do banco
        const freshStudent = students.find(s => s.id === currentUser.data.id);
        if (freshStudent) {
            setViewAsStudent(freshStudent);
        }
    }
  }, [students, currentUser]);






// --- FUNÇÃO DE CRONOGRAMA OFICIAL (12 ALUNOS) ---
  // Usamos useMemo para reconectar os dados assim que os alunos carregarem do Firebase
  const buildLocalDate = (year, monthIndex, day, hour = 12, minute = 0, second = 0, millisecond = 0) =>
      new Date(year, monthIndex, day, hour, minute, second, millisecond);

  const parseLocalDateValue = (dateString, endOfDay = false) => {
      if (!dateString) return null;

      const [year, month, day] = dateString.split('-').map(Number);
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

  const formatLocalDateValue = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const rotationSchedule = useMemo(() => { 
      const schedule = []; 
      const totalScheduleWeeks = 36;
      let currentDate = buildLocalDate(2026, 2, 22);

      // 1. CAPITÃS (Sempre Fixas em Gestão - Tarde)
      const capitasNames = ["Heloise", "Sofia"];

      // 2. APRENDIZES (Sexto Ano): Antônio, Heloisa, Helena (Rodízio Simplificado)

      // 3. POOL DO RODÍZIO (7 Alunos da Manhã)
      // Estes rodam nas vagas: 3 Eng, 3 Inov, 1 Gestão (Líder da Manhã)
      // Ciclo de 7 semanas para dar a volta completa
      const morningPool = [
          "Enzo", "Mariana", 
          "Lívia", "Arthur Silva", 
          "Benjamim", "Davi Miguel", 
          "Antônio Yamaguchi" 
      ];

      // Função auxiliar para criar objetos visuais (evita o "Vago")
      const getStudentObjects = (namesList) => {
          return namesList.map(nameStr => {
              // Correção: Comparação exata para diferenciar "Antônio" de "Antônio Yamaguchi"
              const found = students.find(s => s.name && s.name.trim().toLowerCase() === nameStr.trim().toLowerCase());
              if (found) return found; 
              // Cria objeto temporário se não achar no banco
              return { id: `fake-${nameStr}-${Math.random()}`, name: nameStr, avatarType: 'robot' };
          });
      };

      for (let i = 1; i <= totalScheduleWeeks; i++) { 
          const endDate = new Date(currentDate); 
          endDate.setDate(currentDate.getDate() + 6); // Agora a semana vai de Domingo a Sábado
          
          // --- LÓGICA DE ROTAÇÃO (CICLO DE 7) ---
          // A cada semana, giramos a lista dos 7 alunos uma posição
          // Assim, todos passam por Eng -> Inov -> Gestão
          const shift = (i - 1) % 7;
          const currentRotation = [...morningPool];
          
          // Realiza a rotação do array
          for(let k = 0; k < shift; k++) {
              currentRotation.push(currentRotation.shift());
          }

          // DISTRIBUIÇÃO INTERCALADA (EVITA REPETIÇÕES SEGUIDAS)
          // Para alternar e não ficar 3 semanas na mesma área:
          // Eng: Pega índices 0, 3, 5
          // Inov: Pega índices 2, 4, 6
          // Gestão: Pega índice 1
          const engTeam = [currentRotation[0], currentRotation[3], currentRotation[5]];
          const inovTeam = [currentRotation[2], currentRotation[4], currentRotation[6]];
          const morningLeader = [currentRotation[1]];

          // ONDE ENTRAM OS TRAINEES (6º ANO)?
          // Ciclo de 6 semanas: Rotaciona as duplas e as áreas para misturar bem (Todos trabalham com todos)
          const tList = ["Antônio Echenique", "Helena", "Heloisa"];
          const cycle = (i - 1) % 6; 
          
          let pair, solo;
          if (cycle < 2) { pair = [tList[0], tList[1]]; solo = tList[2]; }      // Ant & Hel
          else if (cycle < 4) { pair = [tList[1], tList[2]]; solo = tList[0]; } // Hel & Helo
          else { pair = [tList[2], tList[0]]; solo = tList[1]; }                // Helo & Ant

          if (cycle % 2 === 0) {
             engTeam.push(...pair);
             inovTeam.push(solo);
          } else {
             inovTeam.push(...pair);
             engTeam.push(solo);
          }

          // GESTÃO FINAL = Capitãs (Tarde) + Líder da Manhã
          const gestaoFinal = [...capitasNames, ...morningLeader];

          schedule.push({ 
              id: i, 
              weekName: `Semana ${i}`, 
              startDate: formatLocalDateValue(currentDate), 
              endDate: formatLocalDateValue(endDate), 
              assignments: { 
                  Engenharia: getStudentObjects(engTeam), 
                  Inovação:   getStudentObjects(inovTeam),
                  Gestão:     getStudentObjects(gestaoFinal) // Capitãs + Alunos
              } 
          }); 
          currentDate.setDate(currentDate.getDate() + 7); 
      } 
      return schedule;
  }, [students]); // <--- A mágica acontece aqui: atualiza quando "students" muda

  // --- 1. CÁLCULO DA SEMANA ATUAL (CÓDIGO NOVO) ---
  useEffect(() => {
    // Se não tiver cronograma, não faz nada
    if (!rotationSchedule || rotationSchedule.length === 0) return;
    
    const calculateCurrentWeek = () => {
        const now = new Date();
        
        // Procura qual semana engloba o dia de hoje
        const found = rotationSchedule.find(w => {
            const start = parseLocalDateValue(w.startDate);
            const end = parseLocalDateValue(w.endDate, true);
            if (!start || !end) return false;
            return now >= start && now <= end;
        });

        if (found) {
            // Atualiza apenas se mudou de semana para não causar re-renders atoa
            setCurrentWeekData(prev => prev?.id !== found.id ? found : prev);
        } else {
            const firstWeek = rotationSchedule[0];
            const lastWeek = rotationSchedule[rotationSchedule.length - 1];
            const firstWeekStart = parseLocalDateValue(firstWeek?.startDate);
            const fallbackWeek = firstWeekStart && now < firstWeekStart ? firstWeek : lastWeek;
            setCurrentWeekData(prev => prev?.id !== fallbackWeek?.id ? fallbackWeek : prev);
        }
    };

    // 1. Calcula imediatamente ao carregar
    calculateCurrentWeek();

    // 2. Configura um timer para checar a data a cada 1 minuto (60000 milissegundos)
    const intervalId = setInterval(calculateCurrentWeek, 60000);

    // 3. Limpa o timer para não dar vazamento de memória
    return () => clearInterval(intervalId);
  }, [rotationSchedule]);



  const getAttendanceStats = (student) => { const total = student.totalClasses || 1; const attended = student.attendedClasses || 0; const percent = Math.round((attended / total) * 100); const absences = total - attended; return { percent, absences }; }

  

  const getCurrentLevel = (xp) => LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[LEVELS.length - 1];

  const getNextLevel = (xp) => { const current = getCurrentLevel(xp); const next = LEVELS[LEVELS.indexOf(current) + 1]; return next ? next : null; }



 // 1. Sincronização com Firebase (Carrega os dados)
  useEffect(() => {
    if (!db) return;

    // Função auxiliar para criar ouvintes seguros
    const createListener = (colName, setter) => {
        return onSnapshot(collection(db, colName), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            console.log(`✅ ${colName} carregados com sucesso:`, data.length);
            setter(data);
        }, (error) => {
            console.error(`❌ ERRO CRÍTICO em ${colName}:`, error);
            showNotification(`Erro de conexão: ${error.code}`, "error");
        });
    };

    const unsubStudents = createListener("students", setStudents);
    const unsubTasks = createListener("tasks", setTasks);
    const unsubEvents = createListener("events", setEvents);
    

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

    // ... e não esqueça de adicionar no return para limpar:
    // return () => { ... unsubProject(); };
    
    return () => {
        unsubStudents();
        unsubTasks();
        unsubEvents();
        unsubInnovationRubric();
        unsubRobotDesignRubric();
        unsubAdminProfile();
    };
  }, []);

  useEffect(() => {
    if (!db || !shouldLoadStrategyWorkspaceData) return;

    const createListener = (colName, setter) => {
        return onSnapshot(collection(db, colName), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setter(data);
        }, (error) => {
            console.error(`Erro critico em ${colName}:`, error);
            showNotification(`Erro de conexao: ${error.code}`, "error");
        });
    };

    const unsubExperts = createListener("experts", setExperts);
    const unsubMatrix = createListener("decisionMatrix", setDecisionMatrix);
    const unsubOutreach = createListener("outreach", setOutreachEvents);

    const unsubProject = onSnapshot(collection(db, "project"), (snapshot) => {
        if (!snapshot.empty) {
            setProjectSummary({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
        }
    });

    return () => {
        unsubExperts();
        unsubMatrix();
        unsubOutreach();
        unsubProject();
    };
  }, [shouldLoadStrategyWorkspaceData]);

  useEffect(() => {
    if (!db || !shouldLoadRobotWorkspaceData) return;

    const createListener = (colName, setter) => {
        return onSnapshot(collection(db, colName), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setter(data);
        }, (error) => {
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
        if (!snapshot.empty) {
            setMissionsList(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }
    });

    return () => {
        unsubRobot();
        unsubAttachments();
        unsubCodeSnippets();
        unsubRounds();
        unsubScoreHistory();
        unsubMissions();
    };
  }, [shouldLoadRobotWorkspaceData]);

  useEffect(() => {
    if (!db || !isLogbookViewActive) return;

    let unsubLogbook;

    if (isAdmin) {
        const logbookQuery = query(collectionGroup(db, 'logbook'));
        unsubLogbook = onSnapshot(logbookQuery, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, refPath: doc.ref.path }));
            setLogbookEntries(entries.sort((a, b) => (b.weekId || 0) - (a.weekId || 0)));
        });
    } else if (viewAsStudent?.id) {
        const logbookQuery = query(collection(db, 'students', viewAsStudent.id, 'logbook'));
        unsubLogbook = onSnapshot(logbookQuery, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, refPath: doc.ref.path }));
            setLogbookEntries(entries.sort((a, b) => (b.weekId || 0) - (a.weekId || 0)));
        });
    }

    return () => {
        if (unsubLogbook) unsubLogbook();
    };
  }, [isAdmin, isLogbookViewActive, viewAsStudent?.id]);

  useEffect(() => {
    if (!db || !isPitStopModalOpen) return;

    const pitStopQuery = query(collection(db, "pitstop_records"), orderBy("time", "asc"), limit(5));
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

  // Função de notificação (corrigida)
  const showNotification = (msg, type = 'success') => { 
      setNotification({ msg, type }); 
      setTimeout(() => setNotification(null), 3000); 
  }

  const handleTeamCheckInSubmit = async (level) => {
      if (!viewAsStudent) return;

      const dayOfWeek = new Date().getDay();
      if (dayOfWeek !== 1 && dayOfWeek !== 3) {
          showNotification("Check-in liberado apenas nas segundas e quartas.", "error");
          return;
      }

      const hasVotedToday = teamMoods.some(mood => mood.studentId === viewAsStudent.id);
      if (hasVotedToday) {
          showNotification("Voce ja respondeu hoje. Bora focar no treino.", "error");
          return;
      }

      const today = getTodayMoodDate();
      const updatedXp = (viewAsStudent.xp || 0) + CHECK_IN_REWARD_XP;

      try {
          await addDoc(collection(db, "dailyMoods"), {
              studentId: viewAsStudent.id,
              studentName: viewAsStudent.name,
              level,
              date: today,
              timestamp: new Date()
          });

          await updateDoc(doc(db, "students", viewAsStudent.id), {
              xp: updatedXp
          });

          setStudents(prevStudents =>
            prevStudents.map(student =>
              student.id === viewAsStudent.id ? { ...student, xp: updatedXp } : student
            )
          );
          setViewAsStudent(prev => (prev ? { ...prev, xp: updatedXp } : prev));
          setShowBatteryModal(false);
          showNotification(`Check-in registrado! +${CHECK_IN_REWARD_XP} XP na conta.`, "success");
      } catch (error) {
          console.error("Erro ao salvar bateria:", error);
          showNotification("Nao foi possivel salvar o check-in.", "error");
      }
  }

  const getStudentName = (id) => { const s = students.find(stud => stud.id === id); return s ? s.name : "Vaga"; }

  const convertBase64 = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = error => reject(error); });

 

  // --- FUNÇÃO ESPECÍFICA PARA FOTO DE PERFIL (COM CROP) ---
  const handleProfilePicSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertBase64(file);
      setCropImgSrc(base64);
      setCropScale(1);
      setCropPos({ x: 0, y: 0 });
      setIsCropping(true);
      e.target.value = null; // Limpa input
    }
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

  const saveStudent = (newStudentData) => { setStudents(prev => { const exists = prev.find(s => s.id === newStudentData.id); return exists ? prev.map(s => s.id === newStudentData.id ? newStudentData : s) : [...prev, newStudentData]; }); }

  const deleteStudent = (id) => { setStudents(prev => prev.filter(s => s.id !== id)); }

  // --- FUNÇÕES DO KANBAN (TAREFAS) ---
  const createKanbanTask = async ({ text, dueDate = '', tag = 'geral', priority = 'normal', author, ...extraData }) => {
      if (!text) return;

      const resolvedAuthor = author || (isAdmin ? "Técnico" : (viewAsStudent?.name || "Equipe"));

      await addDoc(collection(db, "tasks"), {
          text,
          status: 'todo',
          createdAt: new Date().toISOString(),
          author: resolvedAuthor,
          dueDate,
          tag,
          priority,
          ...extraData
      });
  };

  const handleAddTask = async ({ text, dueDate = '', tag = 'geral', priority = 'normal' }) => {
      const normalizedText = text.trim();
      if (!normalizedText) return false;

      try {
          await createKanbanTask({
              text: normalizedText,
              dueDate,
              tag,
              priority
          });
          return true;
      } catch (error) {
          console.error("Erro ao criar tarefa:", error);
          return false;
      }
  }

  // --- FUNÇÕES DA GARRA / ANEXO ---
  const handleAttachmentSubmit = async (e) => { 
      e.preventDefault(); 
      const fd = new FormData(e.target); 
      
      let img = modal.data?.image || null; 
      if (selectedFile) img = await convertBase64(selectedFile); 
      
      const attachmentData = { 
          name: fd.get('name'), 
          roundId: fd.get('roundId'), 
          date: fd.get('date'), 
          changes: fd.get('changes'), 
          image: img,
          author: modal.data?.author || viewAsStudent?.name || "Técnico"
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "attachments", modal.data.id), attachmentData);
          } else {
              await addDoc(collection(db, "attachments"), attachmentData);
          }
          closeModal(); 
          showNotification("Garra/Anexo salva com sucesso!");
      } catch (error) {
          console.error("Erro ao salvar anexo:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleDeleteAttachment = async (e, id) => {
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja excluir esta garra/anexo?")) {
          try { await deleteDoc(doc(db, "attachments", id)); showNotification("Garra excluída!"); } catch (error) {}
      }
  };

  // --- FUNÇÕES DO COFRE DE CÓDIGOS ---
  const handleCodeSubmit = async (e) => { 
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
                  const updates = codeSnippets.map((item) =>
                      updateDoc(doc(db, "codeSnippets", item.id), { applied: item.id === modal.data.id })
                  );
                  await Promise.all(updates);
              }
          } else {
              const newSnippetRef = await addDoc(collection(db, "codeSnippets"), {
                  ...codeData,
                  applied: false
              });

              if (shouldSetAsOfficial) {
                  const updates = [
                      ...codeSnippets.map((item) => updateDoc(doc(db, "codeSnippets", item.id), { applied: false })),
                      updateDoc(doc(db, "codeSnippets", newSnippetRef.id), { applied: true })
                  ];
                  await Promise.all(updates);
              }
          }
          closeModal(); 
          showNotification(shouldSetAsOfficial ? "Codigo salvo e definido como oficial!" : "Codigo salvo no cofre!");
      } catch (error) {
          console.error("Erro ao salvar codigo:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleDeleteCode = async (e, id) => {
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja excluir este código?")) {
          try { 
              await deleteDoc(doc(db, "codeSnippets", id)); 
              showNotification("Código excluído!"); 
          } catch (error) {
              console.error("Erro ao excluir código:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleApplyCodeSnippet = async (snippet) => {
      try {
          const updates = codeSnippets.map((item) =>
              updateDoc(doc(db, "codeSnippets", item.id), { applied: item.id === snippet.id })
          );
          await Promise.all(updates);

          setCodeSnippets(prev => prev.map((item) => ({ ...item, applied: item.id === snippet.id })));
          setModal(prev => ({
              ...prev,
              data: prev?.data ? { ...prev.data, applied: true } : prev.data
          }));
          showNotification(`Programacao "${snippet.title}" definida como ativa!`, "success");
      } catch (error) {
          console.error("Erro ao aplicar programacao:", error);
          showNotification("Erro ao aplicar a nova programacao.", "error");
      }
  };

  const moveTask = async (id, newStatus) => {
      // --- TRAVA PARA MOVER PARA FEITO (SÓ TÉCNICO) ---
      if (newStatus === 'done' && !isAdmin) {
          alert("🛑 Acesso Bloqueado!\n\nApenas o Técnico pode mover tarefas para 'Feito' após aprová-las na coluna 'Em Revisão'.");
          return;
      }

      // --- TRAVA DE 3 HORAS (SÓ PARA ALUNOS) ---
      if (newStatus === 'review' && !isAdmin) {
          const task = tasks.find(t => t.id === id);
          if (task && task.createdAt) {
              const createdTime = new Date(task.createdAt).getTime();
              const now = new Date().getTime();
              const hoursDiff = (now - createdTime) / (1000 * 60 * 60);
              
              if (hoursDiff < 3) {
                  const hoursLeft = (3 - hoursDiff).toFixed(1);
                  alert(`🛑 Acesso Bloqueado!\n\nAs tarefas precisam de pelo menos 3 horas desde a criação para irem para "Em Revisão". Isso garante que vocês planejem ANTES de executar.\n\nAguarde mais ${hoursLeft} hora(s) para avançar.`);
                  return; // Cancela a movimentação
              }
          }
      }

      try {
          const updateData = { status: newStatus };
          if (newStatus === 'done') {
              updateData.completedAt = new Date().toISOString(); // Salva quando terminou
          } else {
              updateData.completedAt = null; // Limpa se voltar pra Fazendo/A Fazer
          }
          await updateDoc(doc(db, "tasks", id), updateData);
      } catch (error) {
          console.error("Erro ao mover tarefa:", error);
      }
  }

  const removeTask = async (id) => {
      if(window.confirm("Excluir tarefa permanentemente?")) {
          await deleteDoc(doc(db, "tasks", id));
      }
  }

      const takeoverTask = async (id) => {
          if (!viewAsStudent) return;
          try {
              await updateDoc(doc(db, "tasks", id), { author: viewAsStudent.name });
              showNotification("Você assumiu a responsabilidade desta tarefa!");
          } catch (error) {
              console.error("Erro ao assumir:", error);
          }
      }

    const joinTask = async (id) => {
        if (!viewAsStudent) return;
        try {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            
            let newAuthor = viewAsStudent.name;
            if (task.author) {
                if (task.author.includes(viewAsStudent.name)) return;
                
                const authorsArray = task.author.split(',').map(a => a.trim());
                if (authorsArray.length >= 3) {
                    showNotification("Esta tarefa já atingiu o limite de 3 participantes.", "error");
                    return;
                }
                
                newAuthor = `${task.author}, ${viewAsStudent.name}`;
            }
            
            await updateDoc(doc(db, "tasks", id), { author: newAuthor });
            showNotification("Você entrou na tarefa!");
        } catch (error) {
            console.error("Erro ao participar da tarefa:", error);
        }
    };

    const leaveTask = async (id) => {
        if (!viewAsStudent) return;
        try {
            const task = tasks.find(t => t.id === id);
            if (!task || !task.author) return;
            
            let authorsArray = task.author.split(',').map(a => a.trim());
            authorsArray = authorsArray.filter(a => a !== viewAsStudent.name);
            
            const newAuthor = authorsArray.length > 0 ? authorsArray.join(', ') : null;
            
            await updateDoc(doc(db, "tasks", id), { author: newAuthor });
            showNotification("Você saiu da tarefa!");
        } catch (error) {
            console.error("Erro ao sair da tarefa:", error);
        }
    };

    const assignTaskToStudent = async (taskId, studentName) => {
        if (!isAdmin) return;
        
        // Se o valor for vazio, desatribui (author: null). Senão, atribui.
        const newAuthor = studentName === "" ? null : studentName;

        try {
            await updateDoc(doc(db, "tasks", taskId), { author: newAuthor });
            if (newAuthor) {
              showNotification(`Tarefa atribuída para ${studentName}!`);
            } else {
              showNotification(`Tarefa agora é da equipe.`);
            }
        } catch (error) {
            console.error("Erro ao atribuir tarefa:", error);
            showNotification("Erro ao atribuir tarefa.", "error");
        }
    };

  // --- FUNÇÃO PARA SALVAR DIÁRIO DE BORDO ---
  const handleLogbookSubmit = async (e) => {
      e.preventDefault();
      const text = studentLogbookDraft.trim();
      // Se não tiver semana definida, pega a atual ou a 1
      const weekId = currentWeekData?.id || 1;
      const weekName = currentWeekData?.weekName || "Semana Inicial";

      if (!text || !viewAsStudent?.id) return; // Apenas alunos podem escrever

      try {
          // O caminho agora é uma subcoleção dentro do documento do aluno
          const logbookRef = collection(db, 'students', viewAsStudent.id, 'logbook');
          
          // Usamos setDoc com um ID específico para evitar duplicatas na mesma semana?
          // Ou addDoc para permitir vários registros na semana?
          // Vamos usar addDoc para permitir vários insights na mesma semana.
          
          const tags = Array.from(new Set((text.match(/#[^\s#]+/g) || []).map((tag) => tag.toLowerCase())));
          const wordCount = text.split(/\s+/).filter(Boolean).length;

          const newEntry = {
              // Ainda salvamos o nome para a visualização consolidada do técnico
              studentName: viewAsStudent.name, 
              text: text,
              weekId: weekId,       // Para ordenar
              weekName: weekName,   // Para exibir bonitinho
              date: new Date().toISOString(),
              tags,
              wordCount
          };

          await addDoc(logbookRef, newEntry);

          setStudentLogbookDraft('');
          showNotification("Diário de Bordo atualizado! 📖");
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
    // Confirmação para o técnico não excluir sem querer esbarrando no botão
    if (window.confirm("Tem certeza que deseja excluir este aluno do banco de dados? A ação não pode ser desfeita.")) {
        try {
            // A. Deleta o documento lá no Firebase
            const studentRef = doc(db, "students", studentId);
            await deleteDoc(studentRef);

            // B. Atualiza a tela (remove da lista local sem precisar atualizar a página)
            setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));

            alert("Aluno excluído com sucesso! 🗑️");
        } catch (error) {
            console.error("Erro ao excluir aluno no Firebase:", error);
            alert("Erro ao excluir. Verifique sua conexão ou regras do Firebase.");
        }
    }
};

const handleDeleteRound = async (id) => {
    console.log("Tentando apagar ID:", id); // Isso vai aparecer no F12 se funcionar

    if (confirm("Tem certeza que quer apagar esse registro?")) {
      try {
        // Tenta apagar com o nome 'strategies'
        await deleteDoc(doc(db, "strategies", id));
        
        // Tenta apagar com o nome 'robot_rounds'
        await deleteDoc(doc(db, "robot_rounds", id));

        // Tenta apagar com o nome 'rounds' (Muito comum!)
        await deleteDoc(doc(db, "rounds", id));

        // Tenta apagar com o nome 'history'
        await deleteDoc(doc(db, "history", id));
        
        // --- NOVO: Apaga também o histórico do gráfico deste round ---
        // Usamos o state 'scoreHistory' que já está carregado para não precisar fazer outra busca
        const historyToDelete = scoreHistory.filter(h => h.roundId === id);
        historyToDelete.forEach(async (h) => await deleteDoc(doc(db, "score_history", h.id)));

        showNotification("Registro apagado do banco!");
      } catch (error) {
        console.error("Erro fatal ao apagar:", error);
        alert("Erro no sistema: Olhe o Console (F12)");
      }
    }
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

  const handleDeleteRobotVersion = async (e, id) => {
      e.stopPropagation(); // Evita abrir o modal de visualização
      if (window.confirm("Tem certeza que deseja excluir esta versão do robô?")) {
          try {
              await deleteDoc(doc(db, "robotVersions", id));
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
              await deleteDoc(doc(db, "missions", id));
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
          xp: modal.data?.xp ?? 0,
          totalClasses: modal.data?.totalClasses ?? 0,
          attendedClasses: modal.data?.attendedClasses ?? 0,
          station: modal.data?.station ?? null,
          submission: modal.data?.submission ?? null,
          badges: modal.data?.badges ?? [],
          englishChallengeUnlocked: modal.data?.englishChallengeUnlocked ?? false,
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
          // Vamos salvar sempre com o ID 'main' para ser único
          await api_setDoc(doc(db, "project", "main"), projectData);
          setProjectSummary(projectData); // Atualiza na hora
          closeModal();
          showNotification("Projeto de Inovação atualizado!");
      } catch (error) {
          console.error("Erro ao salvar projeto:", error);
          // Fallback se o setDoc falhar (usa addDoc)
          try {
             await addDoc(collection(db, "project"), projectData);
             closeModal();
             showNotification("Projeto salvo (novo registro)!");
          } catch (e2) {
             showNotification("Erro ao salvar.", "error");
          }
      }
  }

  // --- FUNÇÕES DE OUTREACH (IMPACTO) ---
  const handleOutreachSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      const outreachData = {
          name: fd.get('name'),
          type: fd.get('type'),
          people: parseInt(fd.get('people')),
          date: fd.get('date'),
          feedback: fd.get('feedback')
      };

      try {
          await addDoc(collection(db, "outreach"), outreachData);
          closeModal();
          showNotification("Evento de impacto registrado!");
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

  const handleAttendanceSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      
      // Pega todos os IDs marcados no checkbox (agora são strings do Firebase)
      const presentIds = fd.getAll('present').map(id => String(id));

      try {
          // Cria uma lista de "promessas" para atualizar todos ao mesmo tempo
          const updates = students.map(student => {
              const studentRef = doc(db, "students", student.id);
              
              const isPresent = presentIds.includes(String(student.id));
              
              // Calcula os novos valores
              const currentTotal = student.totalClasses || 0;
              const currentAttended = student.attendedClasses || 0;
              
              return updateDoc(studentRef, {
                  totalClasses: currentTotal + 1,
                  attendedClasses: isPresent ? currentAttended + 1 : currentAttended
              });
          });

          // Espera todos serem atualizados
          await Promise.all(updates);
          
          closeModal();
          showNotification("Frequência registrada no Firebase!");
      } catch (error) {
          console.error("Erro na chamada:", error);
          showNotification("Erro ao salvar frequência.", "error");
      }
  }
  const handleExpertSubmit = async (e) => { 
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
              await addDoc(collection(db, "experts"), expertData);
          }
          closeModal(); 
          showNotification("Especialista salvo no banco!");
      } catch (error) {
          console.error("Erro ao salvar especialista:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleRobotSubmit = async (e) => { 
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
              await addDoc(collection(db, "robotVersions"), robotData);
          }
          closeModal(); 
          showNotification("Versão do robô salva!");
      } catch (error) {
          console.error("Erro ao salvar robô:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }




  const handleRoundSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const selectedMissions = Array.from(fd.getAll('missions'));
      const estimatedTime = Number.parseInt(fd.get('time'), 10) || 0;
      
      // Calcula pontos somando as missões selecionadas
      const totalPoints = selectedMissions.reduce((acc, mid) => 
          acc + (missionsList.find(m => m.id === mid)?.points || 0), 0);

      const roundData = {
          name: fd.get('name'),
          startBase: fd.get('startBase'), // <--- SALVA A BASE ESCOLHIDA
          estimatedTime,
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
          closeModal();
      } catch (error) {
          console.error("Erro ao salvar round:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleComplimentSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      
      const complimentData = {
          from: viewAsStudent.name,
          to: getStudentName(parseInt(fd.get('to'))), // Pega o nome do destinatário
          msg: fd.get('msg'),
          date: new Date().toLocaleDateString().slice(0,5)
      };

      try {
          // 1. Salva o elogio
          await addDoc(collection(db, "compliments"), complimentData);

          // 2. Dá XP para quem enviou (Gamificação!)
          const senderRef = doc(db, "students", viewAsStudent.id);
          // Nota: Para atualizar XP de forma segura, o ideal seria ler o doc atual, 
          // mas para simplificar vamos assumir o dado local:
          await updateDoc(senderRef, { 
              xp: (viewAsStudent.xp || 0) + 1 
          });

          closeModal();
          showNotification("Elogio enviado! (+1 XP)", "success");
      } catch (error) {
          console.error("Erro ao enviar elogio:", error);
          showNotification("Erro ao enviar.", "error");
      }
  }

  const handleMissionSubmit = async (e) => {
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
              await addDoc(collection(db, "missions"), missionData);
          }
          // Após salvar, não fecha o modal: apenas limpa para que você possa adicionar/ver outras
          setModal({ type: 'missionForm', data: null });
          setSelectedFile(null);
          showNotification("Missão salva!");
      } catch (error) {
          console.error("Erro ao salvar missão:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleGradesSubmit = async (e) => {
      e.preventDefault();
      if (currentUser?.type !== 'admin') {
          showNotification("Apenas técnicos podem lançar notas.", "error");
          closeModal();
          return;
      }

      const fd = new FormData(e.target);
      const student = modal.data.student;
      const stageId = modal.data.stageId || 'etapa1';
      const stageMeta = SCHOOL_REPORT_STAGE_CONFIG[stageId] || SCHOOL_REPORT_STAGE_CONFIG.etapa1;

      let bonusXP = 0;
      const newGrades = {};

      SCHOOL_REPORT_SUBJECTS.forEach(subj => {
          const val = fd.get(`grade_${subj}`);
          if (val && val.trim() !== '') {
              const grade = parseFloat(val);
              if (!isNaN(grade)) {
                  newGrades[subj] = grade;
              }
          }
      });

      bonusXP = calculateSchoolReportXp(newGrades);

      try {
          const studentRef = doc(db, "students", student.id);
          const currentSchoolGrades = normalizeSchoolGrades(student.schoolGrades);
          const previousStageRecord = getSchoolStageRecord(student, stageId);
          const previousStageXp = previousStageRecord?.xpApplied ?? calculateSchoolReportXp(previousStageRecord?.grades || {});
          const xpDelta = bonusXP - previousStageXp;
          const nowIso = new Date().toISOString();
          
          await updateDoc(studentRef, {
              xp: (student.xp || 0) + xpDelta,
              schoolGrades: {
                  ...currentSchoolGrades,
                  [stageId]: {
                      ...previousStageRecord,
                      label: stageMeta.label,
                      grades: newGrades,
                      xpApplied: bonusXP,
                      submittedAt: previousStageRecord?.submittedAt || nowIso,
                      updatedAt: nowIso
                  }
              }
          });

          closeModal();
          const xpChangeLabel = xpDelta > 0 ? `+${xpDelta}` : `${xpDelta}`;
          showNotification(`${stageMeta.label} salva! ${xpChangeLabel} XP ajustados.`, "success");
      } catch (error) {
          console.error("Erro ao lançar notas:", error);
          showNotification("Erro ao atualizar XP.", "error");
      }
  }

  


  const handleMatrixSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      const ideaData = {
          name: fd.get('name'),
          impact: parseInt(fd.get('impact')),
          cost: parseInt(fd.get('cost')),
          feasibility: parseInt(fd.get('feasibility')),
          innovation: parseInt(fd.get('innovation'))
      };

      try {
          await addDoc(collection(db, "decisionMatrix"), ideaData);
          closeModal(); 
          showNotification("Ideia salva na matriz!");
      } catch (error) {
          console.error("Erro ao salvar ideia:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  // --- FUNÇÕES DA AGENDA ---
  const handleEventSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const eventData = {
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
              await addDoc(collection(db, "events"), eventData);
          }
          closeModal();
          showNotification("Evento salvo na agenda!");
      } catch (error) {
          console.error("Erro ao salvar evento:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleDeleteEvent = async (id) => {
      if(window.confirm("Deseja excluir este evento da agenda?")) {
          try {
              await deleteDoc(doc(db, "events", id));
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
          showNotification(`Evento atualizado para ${getEventStatusMeta(nextStatus).label.toLowerCase()}.`, nextStatus === 'concluido' ? 'success' : undefined);
      } catch (error) {
          console.error("Erro ao atualizar status do evento:", error);
          showNotification("Erro ao atualizar evento.", "error");
      }
  }

  const handleCloseStationWeek = async (station) => {
      const stationStudents = students.filter(s => s.station === station);
      if(stationStudents.length === 0) return;

      const approvedCount = stationStudents.filter(s => s.submission?.status === 'approved').length;
      const totalInStation = stationStudents.length;
      const isCompleteTeam = approvedCount === totalInStation;
      const FULL_TEAM_XP = 50; 
      const PARTIAL_TEAM_XP = 35;

      try {
          // Cria uma lista de atualizações para enviar tudo de uma vez
          const updates = stationStudents.map(student => {
              const studentRef = doc(db, "students", student.id);
              
              // Lógica de XP
              let xpGain = 0;
              if (student.submission?.status === 'approved') {
                  xpGain = isCompleteTeam ? FULL_TEAM_XP : PARTIAL_TEAM_XP;
              }

              // Prepara a atualização: Dá XP, remove a estação e limpa a entrega
              return updateDoc(studentRef, {
                  xp: (student.xp || 0) + xpGain,
                  station: null,
                  submission: null
              });
          });

          // Executa todas as atualizações no banco
          await Promise.all(updates);

          if(isCompleteTeam) showNotification(`Semana ${station} fechada! Sucesso Total!`, "success");
          else showNotification(`Semana ${station} fechada com penalidade.`, "error");

      } catch (error) {
          console.error("Erro ao fechar semana:", error);
          showNotification("Erro ao salvar fechamento.", "error");
      }
  }

  // --- FUNÇÃO PARA APLICAR O RODÍZIO AUTOMATICAMENTE ---
  const handleApplyRotation = async () => {
      if (!currentWeekData) return;
      if (!window.confirm(`Sincronizar a equipe com a ${currentWeekData.weekName}? Todos os alunos serão movidos para as suas estações.`)) return;
      
      try {
          // Cria uma lista de atualizações para enviar tudo de uma vez
          const updates = students.map(student => {
              let targetStation = null;
              
              // Verifica em qual estação o aluno está escalado no cronograma
              if (currentWeekData.assignments.Engenharia.some(s => s.name === student.name)) targetStation = 'Engenharia';
              else if (currentWeekData.assignments.Inovação.some(s => s.name === student.name)) targetStation = 'Inovação';
              else if (currentWeekData.assignments.Gestão.some(s => s.name === student.name)) targetStation = 'Gestão';

              // Atualiza o aluno no Firebase
              return updateDoc(doc(db, "students", student.id), { station: targetStation, submission: null });
          });

          await Promise.all(updates);
          showNotification("Rodízio automático aplicado com sucesso!", "success");
      } catch (error) {
          console.error("Erro ao aplicar rodízio:", error);
          showNotification("Erro ao aplicar rodízio.", "error");
      }
  };

  // --- SALVAR PERFIL DO TÉCNICO ---
  const handleAdminProfileSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newPassword = fd.get('password');
      
      const dataToSave = {
          name: fd.get('name') || 'Técnico',
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

  const openReviewModal = (student) => setModal({ type: 'review', data: student });

  const openExpertModal = (data = null) => { setSelectedFile(null); setModal({ type: 'expertForm', data }); }

  const openRobotModal = (data = null) => { setSelectedFile(null); setModal({ type: 'robotForm', data }); }
  const openAttachmentModal = (data = null) => { setSelectedFile(null); setModal({ type: 'attachmentForm', data }); } // <--- NOVO
  const openCodeModal = (data = null) => { setSelectedFile(null); setModal({ type: 'codeForm', data }); } // <--- NOVO

  const openRubricModal = () => setModal({ type: 'rubric' });

  const openNewRoundModal = () => setModal({ type: 'newRound' });
  const openEditRoundModal = (data) => setModal({ type: 'newRound', data });

  const openComplimentModal = () => setModal({ type: 'compliment' });

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
  const unlockedStudentBadges = BADGES_LIST.filter((badge) => viewAsStudent?.badges?.includes(badge.id));
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
  const studentStationTone = viewAsStudent?.station === 'Engenharia'
      ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200'
      : viewAsStudent?.station === 'Inovação'
          ? 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-200'
          : viewAsStudent?.station === 'Gestão'
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
              label: 'Inovação',
              helper: 'Ideia e narrativa',
              badgeClass: 'border-fuchsia-400/30 bg-fuchsia-500/14 text-fuchsia-100',
              stampClass: 'border-fuchsia-400/35 bg-fuchsia-500/18 text-fuchsia-100 shadow-[0_14px_28px_rgba(217,70,239,0.18)]',
              Icon: Microscope
            }
          : studentSpecialtyText && specialtyMatchesLeadership
              ? {
                  label: 'Gestão',
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
  const teamAchievementsSummary = [
      { id: 'team_xp', name: 'Potencia Maxima', current: totalTeamXP, target: 6000, icon: <Zap size={14} className="text-yellow-300" /> },
      { id: 'team_impact', name: 'Voz da Mudanca', current: totalTeamImpact, target: 350, icon: <Megaphone size={14} className="text-orange-300" /> },
      { id: 'team_tasks', name: 'Maquina de Produtividade', current: totalTeamTasksDone, target: 300, icon: <CheckCheck size={14} className="text-emerald-300" /> },
      { id: 'team_experts', name: 'Mentes Conectadas', current: totalTeamExperts, target: 5, icon: <Briefcase size={14} className="text-violet-300" /> }
  ];
  const unlockedTeamAchievements = teamAchievementsSummary.filter((achievement) => achievement.current >= achievement.target);
  const nextTeamAchievement = teamAchievementsSummary
      .filter((achievement) => achievement.current < achievement.target)
      .sort((left, right) => (right.current / right.target) - (left.current / left.target))[0];
  const studentHeroFooter = viewAsStudent ? (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr,0.95fr,0.95fr,1fr]">
          <button
              onClick={() => openProfileModal(viewAsStudent)}
              className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm text-left transition-all hover:bg-white/10 h-full flex flex-col"
          >
              <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                      {viewAsStudent.avatarImage ? (
                          <img src={viewAsStudent.avatarImage} alt={viewAsStudent.name} className="w-20 h-20 rounded-[22px] object-cover border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.24)]" />
                      ) : (
                          <div className="w-20 h-20 rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-center">
                              <UserCircle size={38} className="text-gray-400" />
                          </div>
                      )}

                      <div className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-[16px] border ${studentPrimarySeal.stampClass}`}>
                          <StudentPrimarySealIcon size={16} />
                      </div>
                  </div>

                  <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Passaporte FLL</p>
                              <h3 className="text-lg font-black text-white leading-tight mt-2 truncate">{viewAsStudent.name}</h3>
                              <p className={`mt-2 text-xs font-semibold leading-relaxed ${viewAsStudent?.station === 'Engenharia' ? 'text-cyan-200' : viewAsStudent?.station === 'Inovação' ? 'text-fuchsia-200' : viewAsStudent?.station === 'Gestão' ? 'text-violet-200' : 'text-slate-200'}`}>
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
                      <span key={badge.id} className={`inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 ${badge.color}`}>
                          {badge.icon}
                      </span>
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
              <div className="space-y-2 mt-4">
                  {teamAchievementsSummary.slice(0, 2).map((achievement) => {
                      const progress = Math.min(100, (achievement.current / achievement.target) * 100);

                      return (
                          <div key={achievement.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                              <div className="flex items-center justify-between gap-3">
                                  <span className="inline-flex items-center gap-2 text-xs font-bold text-white">
                                      {achievement.icon}
                                      {achievement.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-bold">{achievement.current}/{achievement.target}</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden mt-3">
                                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${progress}%` }}></div>
                              </div>
                          </div>
                      );
                  })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                  {nextTeamAchievement ? `Proxima meta: ${nextTeamAchievement.name}.` : 'Todas as conquistas coletivas foram desbloqueadas.'}
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

  const adminHeroActions = [
      { label: 'Central de Comando', onClick: openCommandCenterMode, icon: <Crown size={14} />, style: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20 hover:bg-yellow-500 hover:text-black' },
      { label: 'Abrir Rubricas', onClick: () => setAdminTab('rubrics'), icon: <Scale size={14} />, style: 'bg-white/10 text-white border-white/15 hover:bg-white hover:text-black' },
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
      { label: 'Rubricas', onClick: () => setStudentTab('rubrics'), icon: <Scale size={14} />, style: 'bg-purple-500/10 text-purple-200 border-purple-500/20 hover:bg-purple-500 hover:text-white' },
      { label: STUDENT_TASKS_LABEL, onClick: () => setStudentTab('kanban'), icon: <ClipboardList size={14} />, style: 'bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500 hover:text-white' },
      { label: 'Agenda', onClick: () => setStudentTab('agenda'), icon: <CalendarDays size={14} />, style: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500 hover:text-white' }
  ];

  const adminWorkspaceTabs = [
      { id: 'rotation', label: 'Rodizio', icon: <LayoutDashboard size={16} />, description: 'Escala viva da semana, remanejamentos e energia do time.', pill: currentWeekData?.weekName || 'Semana', pillTone: 'border-white/10 bg-white/5 text-gray-200', activeClass: 'bg-white text-black shadow-lg', inactiveClass: 'text-gray-400 hover:text-white hover:bg-white/5' },
      { id: 'strategy', label: 'Estrategia', icon: <Lightbulb size={16} />, description: 'Projeto, impacto, ideias e narrativa que os juizes entendem rapido.', pillTone: 'border-purple-500/20 bg-purple-500/10 text-purple-200', activeClass: 'bg-purple-500 text-white shadow-lg shadow-purple-900/20', inactiveClass: 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/10' },
      { id: 'rounds', label: 'Robo', icon: <ListTodo size={16} />, description: 'Saidas, anexos, codigo e evolucao do robo em linguagem de equipe.', pillTone: 'border-blue-500/20 bg-blue-500/10 text-blue-200', activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20', inactiveClass: 'text-gray-400 hover:text-blue-300 hover:bg-blue-500/10' },
      { id: 'rubrics', label: 'Rubricas', icon: <Scale size={16} />, description: 'Placar oficial da equipe com leitura simples e proximo passo.', pill: `${overallRubricAverage}/4`, pillTone: 'border-gray-400/20 bg-gray-400/10 text-gray-100', activeClass: 'bg-gray-300 text-black shadow-lg shadow-gray-900/20', inactiveClass: 'text-gray-400 hover:text-white hover:bg-white/5' },
      { id: 'kanban', label: 'Kanban', icon: <ClipboardList size={16} />, description: 'Fluxo da semana, prioridades e entregas sem cara de planilha.', badge: urgentTasksCount > 0 ? urgentTasksCount : null, pillTone: 'border-orange-500/20 bg-orange-500/10 text-orange-200', activeClass: 'bg-orange-500 text-white shadow-lg shadow-orange-900/20', inactiveClass: 'text-gray-400 hover:text-orange-300 hover:bg-orange-500/10' },
      { id: 'logbook', label: 'Diario', icon: <Book size={16} />, description: 'Memoria viva do time com testes, aprendizados e mini vitorias.', pillTone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200', activeClass: 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20', inactiveClass: 'text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10' },
      { id: 'agenda', label: 'Agenda', icon: <CalendarDays size={16} />, description: 'Prazos, encontros e checkpoints da equipe em modo missao.', badge: urgentEventsCount > 0 ? urgentEventsCount : null, pillTone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200', activeClass: 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/20', inactiveClass: 'text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10' }
  ];

  const studentWorkspaceTabs = [
      { id: 'mission', label: 'Minha Missao', icon: <Rocket size={16} />, description: 'Seu foco da semana, status da entrega e proximo passo.', pill: viewAsStudent?.station || 'Equipe', pillTone: 'border-white/10 bg-white/5 text-gray-200', activeClass: 'bg-white text-black shadow-lg', inactiveClass: 'text-gray-400 hover:text-white hover:bg-white/5' },
      { id: 'strategy', label: 'Estrategia', icon: <Lightbulb size={16} />, description: 'Entenda o projeto, o impacto e o caminho competitivo do time.', pillTone: 'border-purple-500/20 bg-purple-500/10 text-purple-200', activeClass: 'bg-purple-500 text-white shadow-lg shadow-purple-900/20', inactiveClass: 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/10' },
      { id: 'rubrics', label: 'Rubricas', icon: <Scale size={16} />, description: 'Veja o placar da equipe e onde subir de nivel.', pill: `${overallRubricAverage}/4`, pillTone: 'border-gray-400/20 bg-gray-400/10 text-gray-100', activeClass: 'bg-gray-300 text-black shadow-lg shadow-gray-900/20', inactiveClass: 'text-gray-400 hover:text-white hover:bg-white/5' },
      { id: 'rounds', label: 'Robo', icon: <ListTodo size={16} />, description: 'Rounds, estrategia de mesa, codigo e anexos do robo.', pillTone: 'border-blue-500/20 bg-blue-500/10 text-blue-200', activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20', inactiveClass: 'text-gray-400 hover:text-blue-300 hover:bg-blue-500/10' },
      { id: 'kanban', label: STUDENT_TASKS_LABEL, icon: <ClipboardList size={16} />, description: 'Seu quadro da semana para agir sem se perder nas entregas.', badge: urgentTasksCount > 0 ? urgentTasksCount : null, pillTone: 'border-orange-500/20 bg-orange-500/10 text-orange-200', activeClass: 'bg-orange-500 text-white shadow-lg shadow-orange-900/20', inactiveClass: 'text-gray-400 hover:text-orange-300 hover:bg-orange-500/10' },
      { id: 'logbook', label: 'Diario', icon: <Book size={16} />, description: 'Guarde o que aprendeu, testou e melhorou na temporada.', pillTone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200', activeClass: 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20', inactiveClass: 'text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10' },
      { id: 'agenda', label: 'Agenda', icon: <CalendarDays size={16} />, description: 'Prazos, encontros e marcos importantes da equipe.', badge: urgentEventsCount > 0 ? urgentEventsCount : null, pillTone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200', activeClass: 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/20', inactiveClass: 'text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10' }
  ];

  const workspaceSceneTopPaddingMap = {
      strategy: 'pt-7 md:pt-8',
      rubrics: 'pt-6 md:pt-7',
      kanban: 'pt-6 md:pt-7',
      logbook: 'pt-6 md:pt-7',
      agenda: 'pt-6 md:pt-7',
  };

  const getWorkspaceSceneTopPadding = (tabId) => workspaceSceneTopPaddingMap[tabId] || 'pt-5 md:pt-6';

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
          setAdminPanelState((prev) => {
              const nextDashboard = !prev.dashboard;

              if (prev.compact && nextDashboard) {
                  return { ...prev, compact: false, dashboard: true };
              }

              return { ...prev, dashboard: nextDashboard };
          });
          return;
      }

      setStudentPanelState((prev) => ({ ...prev, dashboard: !prev.dashboard }));
  };

  const toggleAdminHeroPanel = () => {
      setAdminPanelState((prev) => ({ ...prev, hero: !prev.hero }));
  };

  const toggleStudentHeroPanel = () => {
      setStudentPanelState((prev) => ({ ...prev, hero: !prev.hero }));
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

  const adminHeroFooter = (
      <div className="grid items-stretch gap-3 md:grid-cols-2 xl:auto-rows-fr xl:grid-cols-[1.05fr,1.1fr,1fr,1fr]">
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
                      <button onClick={handleApplyRotation} className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-3 text-xs font-bold text-blue-100 hover:bg-blue-500 hover:text-white transition-all">
                          Aplicar rodizio
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

  const studentMissionTone = viewAsStudent?.station === 'Engenharia'
      ? {
          text: 'text-cyan-300',
          border: 'border-cyan-500/20',
          bg: 'from-cyan-500/15 via-sky-500/10 to-transparent',
          button: 'bg-cyan-500/15 text-cyan-100 border-cyan-500/30 hover:bg-cyan-500/25'
        }
      : viewAsStudent?.station === 'Inovação'
          ? {
              text: 'text-pink-300',
              border: 'border-pink-500/20',
              bg: 'from-pink-500/15 via-fuchsia-500/10 to-transparent',
              button: 'bg-pink-500/15 text-pink-100 border-pink-500/30 hover:bg-pink-500/25'
            }
          : viewAsStudent?.station === 'Gestão'
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
      { label: 'Prazo', value: studentMissionDeadlineLabel, helper: 'quarta-feira da semana atual', icon: <CalendarDays size={16} />, tone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-100' },
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

  const studentMissionCoachCards = viewAsStudent?.station === 'Engenharia'
      ? [
          'Mostre teste, ajuste e motivo tecnico por tras da sua escolha.',
          'Se mexeu no robo, documente o que mudou e o que melhorou.',
          'Conecte sua entrega com uma missao real da mesa.'
        ]
      : viewAsStudent?.station === 'InovaÃ§Ã£o'
          ? [
              'Explique o problema de um jeito que qualquer juiz entenda rapido.',
              'Use exemplos concretos para defender a solucao.',
              'Mostre como a ideia evoluiu depois de ouvir pessoas reais.'
            ]
          : viewAsStudent?.station === 'GestÃ£o'
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
  const openXPModal = (student, context = "manual") => { 
      if (currentUser?.type !== 'admin') {
          showNotification("Apenas técnicos podem gerenciar XP.", "error");
          return;
      }

      setModal({ 
          type: 'xp', 
          data: { 
              student: student, 
              onConfirm: async (amount) => { 
                  const val = parseInt(amount); 
                  if (isNaN(val)) return; 
                  
                  try {
                      const studentRef = doc(db, "students", student.id);
                      
                      // Prepara a atualização do XP
                      const updateData = { xp: (student.xp || 0) + val };

                      // Se for contexto de aprovação, muda o status da entrega também
                      if (context === 'approval') {
                          // Mantém os dados da entrega, mas muda status para 'approved'
                          const newSubmission = { ...student.submission, status: 'approved' };
                          updateData.submission = newSubmission;
                      }

                      await updateDoc(studentRef, updateData);
                      
                      closeModal(); 
                      let msg = `XP atualizado: ${val > 0 ? '+' : ''}${val}`;
                      if (context === 'approval') msg = "Atividade Aprovada com Sucesso!";
                      showNotification(msg, "success");

                  } catch (error) {
                      console.error("Erro ao atualizar XP:", error);
                      showNotification("Erro ao salvar.", "error");
                  }
              } 
          } 
      }) 
  }

  const handleDeleteClick = (id) => { setModal({ type: 'confirm', data: { title: "Excluir?", msg: "Irreversível.", onConfirm: () => { deleteStudent(id); closeModal(); showNotification("Removido."); } } }) }

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
          // Também limpamos a 'submission' anterior para ele começar zerado na nova estação
          await updateDoc(studentRef, { 
              station: st,
              submission: null 
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
    const docRef = doc(db, "settings", "weekly_missions");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMissions(docSnap.data());
      } else {
        setMissions({ Engenharia: {}, Inovação: {}, Gestão: {} });
      }
    });
    return () => unsubscribe();
  }, []);

  // --- ATUALIZAR NA TELA ENQUANTO DIGITAM (Memória Curta) ---
  const updateMission = (station, field, value) => {
    setMissions(prev => ({
      ...prev,
      [station]: { ...prev[station], [field]: value }
    }));
  };

  // --- FUNÇÃO PARA SALVAR A AUTO-AVALIAÇÃO DA RUBRICA ---
  const handleRubricUpdate = async (rubricType, category, value) => {
      const isInnovation = rubricType === 'innovation';
      const currentRubric = isInnovation ? innovationRubric : robotDesignRubric;
      const setRubricState = isInnovation ? setInnovationRubric : setRobotDesignRubric;
      const docId = isInnovation ? 'rubric_innovation' : 'rubric_robot_design';
      const defaults = isInnovation ? DEFAULT_INNOVATION_RUBRIC : DEFAULT_ROBOT_DESIGN_RUBRIC;
 
      const newRubric = normalizeRubricValues({ ...currentRubric, [category]: value }, defaults);
      setRubricState(newRubric); // Atualiza na tela imediatamente
      try {
          // Salva no banco de dados sem precisar de botão "Salvar"
          await setDoc(doc(db, "settings", docId), newRubric);
      } catch (error) {
          console.error(`Erro ao salvar rubrica de ${rubricType}:`, error);
          showNotification("Erro ao salvar auto-avaliação.", "error");
      }
  };

  // --- SALVAR NO BANCO QUANDO CLICAR FORA DA CAIXA (O Pulo do Gato) ---
  const saveMissionToFirebase = async (station) => {
    try {
      const docRef = doc(db, "settings", "weekly_missions");
      await setDoc(docRef, {
        [station]: missions[station]
      }, { merge: true });
      console.log(`Meta de ${station} salva no banco com sucesso!`); 
    } catch (error) {
      console.error("Erro ao salvar a meta da semana:", error);
    }
  };

  const handleSaveStationMission = async (station) => {
    await saveMissionToFirebase(station);
    showNotification(`Meta de ${station} salva com sucesso!`, 'success');
  };

  const closeModal = () => { setModal({ type: null, data: null }); setSelectedFile(null); }

// --- FUNÇÃO AUXILIAR PARA TRANSFORMAR O ARQUIVO EM TEXTO ---
  const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
      });
  };
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
  const handleDownloadFile = (sub) => { 
      if (sub && sub.fileData) {
          // O navegador recria o arquivo a partir do texto e força o download
          const link = document.createElement("a");
          link.href = sub.fileData;
          link.download = sub.fileName || "atividade_baixada.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          showNotification("Não há arquivo anexado ou o link está quebrado.", "error");
      }
  };
  // --- UI COMPONENTS ---

  // --- COMPONENTE DE ESTATÍSTICAS DA EQUIPE (VISÃO DOS JUÍZES) ---
  const TeamStatsPanel = () => {
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
  const TeamAchievementsPanel = () => {
      const totalXP = students.reduce((sum, s) => sum + (s.xp || 0), 0);
      const totalImpact = outreachEvents.reduce((sum, ev) => sum + (ev.people || 0), 0);
      const totalTasksDone = tasks.filter(t => t.status === 'done').length;
      const totalExperts = experts.length;

      const achievements = [
          { id: 'team_xp', name: 'Potência Máxima', icon: <Zap size={16}/>, color: 'text-yellow-400', bg: 'bg-yellow-500', desc: 'Atingir 6.000 XP somados por toda a equipe.', current: totalXP, target: 6000 },
          { id: 'team_impact', name: 'Voz da Mudança', icon: <Megaphone size={16}/>, color: 'text-orange-500', bg: 'bg-orange-500', desc: 'Impactar mais de 350 pessoas com o projeto.', current: totalImpact, target: 350 },
          { id: 'team_tasks', name: 'Máquina de Produtividade', icon: <CheckCheck size={16}/>, color: 'text-green-500', bg: 'bg-green-500', desc: 'Concluir 300 tarefas no Kanban da equipe.', current: totalTasksDone, target: 300 },
          { id: 'team_experts', name: 'Mentes Conectadas', icon: <Briefcase size={16}/>, color: 'text-purple-500', bg: 'bg-purple-500', desc: 'Consultar 5 especialistas diferentes.', current: totalExperts, target: 5 }
      ];

      return (
          <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-xl">
              <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
                  <Trophy size={180} />
              </div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                  <Crown className="text-yellow-500"/> Conquistas da Equipe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {achievements.map(ach => {
                      const isUnlocked = ach.current >= ach.target;
                      const progress = Math.min(100, (ach.current / ach.target) * 100);
                      
                      return (
                          <div key={ach.id} className={`p-4 rounded-xl border flex flex-col relative overflow-hidden transition-all duration-500 ${isUnlocked ? 'bg-gradient-to-br from-white/10 to-transparent border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)] scale-[1.02]' : 'bg-black/40 border-white/5 opacity-80'}`}>
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
                          </div>
                      )
                  })}
              </div>
          </div>
      )
  };

  const Notification = () => { if (!notification) return null; const isError = notification.type === 'error'; const isDownload = notification.type === 'download'; return (<div className={`newgears-toast fixed top-6 right-6 z-[100] px-6 py-4 rounded-[22px] flex items-center gap-3 animate-in slide-in-from-right duration-300 border ${isError ? 'bg-red-500/12 border-red-400/40 text-red-200' : isDownload ? 'bg-cyan-500/12 border-cyan-400/40 text-cyan-100' : 'bg-emerald-500/12 border-emerald-400/40 text-emerald-100'}`}>{isError ? <AlertCircle size={24}/> : isDownload ? <Download size={24}/> : <CheckCircle size={24}/>}<span className="font-black text-sm">{notification.msg}</span></div>) }



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
                                        <h4 className="text-pink-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><Microscope size={14}/> Inovação</h4>
                                        <div className="space-y-2">
                                            {week.assignments.Inovação.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                                                    <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px] text-pink-500 font-bold"><UserCircle size={14}/></div>
                                                    <span className="text-sm text-gray-300">{resolveName(item)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Gestão (CORRIGIDO) */}
                                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                                        <h4 className="text-purple-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><BookOpen size={14}/> Gestão</h4>
                                        <div className="space-y-2">
                                            {week.assignments.Gestão.map((item, i) => {
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

    return (

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 animate-in fade-in backdrop-blur-sm">

        <div className={`newgears-modal-frame p-6 w-full relative animate-in zoom-in-95 z-60 overflow-y-auto custom-scrollbar ${modal.type === 'imageView' ? 'max-w-4xl h-auto' : 'max-w-md max-h-[90vh]'}`}>

          <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 z-50 rounded-full border border-white/10 bg-white/5"><X size={20}/></button>



          {modal.type === 'imageView' && <img src={modal.data} className="w-full h-auto rounded-lg" alt="Evidência" />}

          {/* --- MODAL DE RECORTE (CROP) --- */}
          {isCropping && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
                <div className="bg-zinc-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center">
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
                </div>
            </div>
          )}

          {/* --- NOVO MODAL: PERFIL DO ALUNO DETALHADO --- */}
          {modal.type === 'profile' && (
            <div className="animate-in zoom-in-95">
                {/* Header com Gradiente */}
                <div className="relative mb-8 text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full opacity-50"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-4">
     {modal.data.avatarImage ? (
         <img src={modal.data.avatarImage} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-lg mx-auto" />
     ) : (
         <div className="w-28 h-28 rounded-full bg-black/50 flex items-center justify-center border-4 border-gray-600 mx-auto">
             <UserCircle size={80} className="text-gray-500" />
         </div>
     )}
 </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-wider">{modal.data.name}</h2>
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
                            const hasBadge = modal.data.badges?.includes(badge.id);
                            return (
                                <div key={badge.id} className={`relative p-3 rounded-xl border flex flex-col items-center text-center transition-all group ${hasBadge ? 'bg-gradient-to-br from-white/5 to-transparent border-yellow-500/30' : 'bg-black/40 border-white/5 opacity-40 grayscale'}`}>
                                    <div className={`mb-2 ${hasBadge ? badge.color : 'text-gray-500'}`}>{badge.icon}</div>
                                    <span className="text-[10px] font-bold text-white leading-tight">{badge.name}</span>
                                    {hasBadge && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,1)]"></div>}
                                    
                                    {/* Tooltip Simples */}
                                    <div className="absolute bottom-full mb-2 bg-black border border-white/20 p-2 rounded text-[10px] text-gray-300 w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 hidden sm:block">
                                        {badge.desc}
                                    </div>
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

          

          {/* ... MODAIS EXISTENTES (newStudent, expertForm, robotForm, rubric, xp, review, expertView, robotView, newRound, compliment, attendance, grades) MANTIDOS IGUAIS ... */}

{modal.type === 'newStudent' && (
  <form onSubmit={handleRegisterSubmit}>
    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
      <UserPlus className="text-green-500"/> {modal.data ? 'Editar' : 'Novo'} Aluno
    </h3>
    
    {/* DADOS BÁSICOS */}
    <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label>
            <input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Ana Silva" />
        </div>
        <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Turma</label>
            <input name="turma" defaultValue={modal.data?.turma} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: 8º A" />
        </div>
    </div>

    <div className="mb-4">
        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Especialidade principal (fixa)</label>
        <input name="specialty" defaultValue={modal.data?.specialty || ''} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Lideranca, inovacao e engenharia" />
        <p className="mt-1 text-[10px] text-gray-500">Esse campo representa o melhor jogo do aluno e nao muda com o rodizio semanal.</p>
    </div>

    {/* DADOS DE LOGIN (COM FUNDO CINZA PARA ORGANIZAR) */}
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
        <div className="flex items-center gap-2 mb-3 text-yellow-500">
            <Lock size={14} />
            <span className="text-xs font-bold uppercase">Acesso do Aluno</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Usuário</label>
                <input name="username" defaultValue={modal.data?.username} required className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:border-yellow-500 outline-none" placeholder="ana.fll" />
            </div>
            <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Senha</label>
                <input name="password" defaultValue={modal.data?.password} required className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:border-yellow-500 outline-none" placeholder="1234" />
            </div>
        </div>
    </div>

    {/* UPLOAD DE FOTO */}
    <div className="mb-6">
        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto de Perfil</label>
        <div className="flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-white/10">
            {modal.data?.avatarImage ? ( <img src={modal.data.avatarImage} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 shadow-lg"/> ) : ( <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border-2 border-dashed border-gray-600"> <UserCircle size={32} className="text-gray-500" /> </div> )}
            <div className="flex flex-col gap-2">
                <input type="file" onChange={handleProfilePicSelect} accept="image/*" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer"/>
                {modal.data?.avatarImage && (
                    <button type="button" onClick={() => setModal(prev => ({ ...prev, data: { ...prev.data, avatarImage: null } }))} className="text-xs text-red-500 hover:text-red-400 font-bold self-start px-2 transition-colors">
                        Remover Foto
                    </button>
                )}
            </div>
        </div>
    </div>
    
    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all">
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
          {modal.type === 'expertForm' && (<form onSubmit={handleExpertSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Briefcase className="text-purple-500"/> {modal.data ? 'Editar' : 'Novo'} Especialista</h3><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label><input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Cargo</label><input name="role" defaultValue={modal.data?.role} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label><input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Anotações</label><textarea name="notes" defaultValue={modal.data?.notes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-20" /></div><div className="mb-4 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Evidência (Foto)</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}</div><div className="mb-6 flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10"><div><span className="text-sm font-bold text-white">Impactou?</span></div><select name="impact" defaultValue={modal.data?.impact} className="bg-black/50 border border-white/20 text-white p-2 rounded text-sm"><option value="Baixo">Baixo</option><option value="Médio">Médio</option><option value="Alto">Alto</option></select><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="applied" defaultChecked={modal.data?.applied} className="w-5 h-5 accent-green-500" /><span className="text-xs text-white">Aplicado</span></label></div><button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Salvar Registro</button></form>)}

          {modal.type === 'robotForm' && (<form onSubmit={handleRobotSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><GitCommit className="text-blue-500"/> {modal.data ? 'Editar' : 'Novo'} Versão</h3><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Versão</label><input name="version" defaultValue={modal.data?.version} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: V2.0" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label><input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Apelido</label><input name="name" defaultValue={modal.data?.name} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">O que mudou?</label><textarea name="changes" defaultValue={modal.data?.changes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" /></div><div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Evidência (Foto)</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}</div><button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Salvar Versão</button></form>)}

        

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
                  <p className="text-xs text-red-500 font-bold uppercase mb-3 flex items-center gap-1"><TrendingUp size={14} className="rotate-180"/> Penalizar (-)</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[-5, -10, -20, -50].map(val => (
                      <button key={val} type="button" onClick={() => modal.data.onConfirm(val)} className="bg-red-500/10 text-red-500 font-black py-3 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors shadow-sm">{val}</button>
                    ))}
                  </div>
                </div>
      
                {/* Valor Personalizado */}
                <form onSubmit={(e) => { e.preventDefault(); modal.data.onConfirm(e.target.customVal.value); }} className="flex gap-2 pt-2">
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
      
      {/* --- BOTÃO DE DOWNLOAD (VERSÃO BASE64) --- */}
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
              <form onSubmit={handleAttachmentSubmit}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Wrench className="text-blue-500"/> {modal.data ? 'Editar' : 'Nova'} Garra / Anexo</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Anexo</label>
                          <input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Garra 1" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Saída Associada</label>
                          <select name="roundId" defaultValue={modal.data?.roundId} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                              <option value="">Selecione...</option>
                              {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
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
              </form>
          )}

          {modal.type === 'attachmentView' && (<div><div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-white">{modal.data.name}</h3>{(() => { const roundName = rounds.find(r => r.id === modal.data.roundId)?.name || 'Saída Desconhecida'; return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-mono font-bold">{roundName}</span> })()}</div><p className="text-xs text-gray-500 mb-6">{modal.data.date?.split('-').reverse().join('/')} {modal.data.author && `• Por ${modal.data.author}`}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Mudanças / Funcionalidade</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.changes}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da Garra</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-80 transition-opacity" alt="Garra" onClick={() => openImageModal(modal.data.image)} title="Clique para ampliar" /></div>)}</div>)}

          {modal.type === 'codeForm' && (
              <form onSubmit={handleCodeSubmit}>
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
              </form>
          )}

          {modal.type === 'codeView' && (<div><h3 className="text-xl font-bold text-white mb-2">{modal.data.title}</h3><p className="text-xs text-gray-500 mb-6 flex items-center gap-2"><Calendar size={12}/> {modal.data.date?.split('-').reverse().join('/')} {modal.data.author && <><UserCircle size={12} className="ml-2"/> Por {modal.data.author}</>}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block flex items-center gap-1"><Lightbulb size={12}/> Lógica de Funcionamento</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.description}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block flex items-center gap-1"><ImageIcon size={12}/> Print do Código</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-80 transition-opacity" alt="Código" onClick={() => openImageModal(modal.data.image)} title="Clique para ampliar" /></div>)}</div>)}

          {modal.type === 'newRound' && (<form onSubmit={handleRoundSubmit}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-blue-500"/> {modal.data ? 'Editar Saída' : 'Planejar Saída'}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome da Saída</label><input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Saída 1" /></div>
                  <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Tempo Estimado (s)</label><input name="time" type="number" defaultValue={modal.data?.estimatedTime} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="30" /></div>
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

    

          {modal.type === 'attendance' && (<form onSubmit={handleAttendanceSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-green-500"/> Chamada do Dia</h3><div className="mb-6 max-h-60 overflow-y-auto custom-scrollbar">{students.map(s => { const stats = getAttendanceStats(s); return ( <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg border-b border-white/5 cursor-pointer"><input type="checkbox" name="present" value={s.id} defaultChecked className="accent-green-500 w-5 h-5"/><div className="flex-1"><span className="text-white font-bold block">{s.name}</span><span className="text-xs text-gray-500">{s.turma} • Presença: <span className={stats.percent < 75 ? 'text-red-500' : 'text-green-500'}>{stats.percent}%</span> • Faltas: {stats.absences}</span></div></label>) })}</div><button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg">Confirmar Presença</button></form>)}

          {modal.type === 'grades' && (() => {
              const stageId = modal.data.stageId || 'etapa1';
              const stageMeta = SCHOOL_REPORT_STAGE_CONFIG[stageId] || SCHOOL_REPORT_STAGE_CONFIG.etapa1;
              const stageRecord = getSchoolStageRecord(modal.data.student, stageId);
              const stageHasGrades = Boolean(stageRecord?.grades && Object.keys(stageRecord.grades).length > 0);

              return (
                  <form onSubmit={handleGradesSubmit}>
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white"><GraduationCap className="text-yellow-500"/> Boletim SESI • {stageMeta.label}</h3>
                      <p className="text-xs text-gray-400 mb-4">Insira as notas do aluno(a) <strong className="text-white">{modal.data.student.name}</strong> para a <strong className="text-yellow-300">{stageMeta.label}</strong>.</p>

                      <div className={`mb-6 rounded-xl border p-3 text-xs ${stageHasGrades ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100'}`}>
                          <p className="font-bold uppercase tracking-[0.16em]">{stageMeta.periodLabel}</p>
                          <p className="mt-2 text-[11px] leading-relaxed text-white/80">
                              {stageHasGrades
                                  ? 'Esta etapa já foi lançada. Se você corrigir alguma nota, o sistema recalcula só a diferença de XP.'
                                  : 'As notas desta etapa ficam separadas da outra para evitar lançamento duplicado.'}
                          </p>
                      </div>
                      
                      <div className="bg-black/50 border border-white/20 rounded-xl p-4 mb-6">
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                              {SCHOOL_REPORT_SUBJECTS.map(subj => (
                                  <div key={subj} className="flex flex-col">
                                      <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 truncate" title={subj}>{subj}</label>
                                      <input
                                          name={`grade_${subj}`}
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          max="10"
                                          defaultValue={stageRecord?.grades?.[subj] ?? ''}
                                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:border-yellow-500 outline-none font-mono text-sm"
                                          placeholder="0.0"
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl text-xs text-gray-400 mb-6">
                          <p className="font-bold text-white mb-2">Bônus de XP por Matéria:</p>
                          <div className="grid grid-cols-2 gap-2">
                              <p>• Nota 10 = <span className="text-green-500 font-bold">+10 XP</span></p>
                              <p>• Nota 9.0 a 9.9 = <span className="text-cyan-500 font-bold">+7 XP</span></p>
                              <p>• Nota 8.0 a 8.9 = <span className="text-purple-500 font-bold">+5 XP</span></p>
                              <p>• Nota 7.9 ou menos = <span className="text-red-400 font-bold">-2 XP</span></p>
                          </div>
                      </div>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg shadow-lg shadow-yellow-900/20">Salvar {stageMeta.label}</button>
                  </form>
              );
          })()}

          
          {/* --- NOVO MODAL: TREINO DE PIT STOP --- */}
          {modal.type === 'pitstop' && (
            <Suspense fallback={<LazyOverlayFallback label="Carregando treino de pit stop..." />}>
              <PitStopModal viewAsStudent={viewAsStudent} pitStopRecords={pitStopRecords} showNotification={showNotification} />
            </Suspense>
          )}

          {/* NOVO MODAL: EDITOR DE MISSÕES */}
          {modal.type === 'missionForm' && (
             <div>
                 <form onSubmit={handleMissionSubmit} className="mb-8 pb-8 border-b border-white/10">
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
                 </form>

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



          {/* NOVO MODAL: MATRIZ DE DECISÃO */}

          {modal.type === 'matrixForm' && (

             <form onSubmit={handleMatrixSubmit}>

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

             </form>

          )}

          {/* NOVO MODAL: EDITOR DO PROJETO */}
          {modal.type === 'projectForm' && (
             <form onSubmit={handleProjectSubmit}>
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
             </form>
          )}

          {/* MODAL DE IMPACTO (OUTREACH) */}
          {modal.type === 'outreachForm' && (
             <form onSubmit={handleOutreachSubmit}>
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
             </form>
          )}

          {/* NOVO MODAL: EDITOR DE AGENDA/EVENTO */}
          {modal.type === 'eventForm' && (
             <form onSubmit={handleEventSubmit}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><CalendarDays className="text-blue-500"/> {modal.data ? 'Editar' : 'Novo'} Evento</h3>
                
                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Título do Evento</label>
                    <input name="title" defaultValue={modal.data?.title} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Reunião com Eng. Mecânico" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label>
                        <input name="date" type="date" defaultValue={modal.data?.date || localTodayStr} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Horário</label>
                        <input name="time" type="time" defaultValue={modal.data?.time || '18:00'} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Tipo</label>
                        <select name="type" defaultValue={modal.data?.type || 'Visita'} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                            <option value="Visita">Visita Técnica</option>
                            <option value="Especialista">Mentoria / Especialista</option>
                            <option value="Reunião">Reunião Extra</option>
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
             </form>
          )}

        </div>

      </div>

    )

  }



  // --- COMPONENTE DE ESTRATÉGIA ---

  const StrategyView = () => {
      return (
      <div className="animate-in fade-in duration-300 space-y-6">
          
          {/* --- NAVEGAÇÃO DA ÁREA DE ESTRATÉGIA --- */}
          <section className="newgears-major-panel relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(19,21,35,0.96),rgba(12,14,24,0.96))] p-4 md:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),radial-gradient(circle_at_top_left,rgba(255,217,95,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(71,214,255,0.12),transparent_28%)] bg-[size:22px_22px,22px_22px,auto,auto]" />
              <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-black">Mapa da estrategia</p>
                      <h3 className="newgears-display mt-2 text-2xl font-black text-white">Escolha a trilha que a equipe quer explorar agora.</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-300">
                          Uma trilha cuida do projeto e do impacto. A outra mostra como o robo evoluiu. As duas precisam ter mais cara de equipe criativa e menos cara de relatorio.
                      </p>
                  </div>

                  <div className="inline-flex w-full flex-col rounded-[24px] border border-white/10 bg-black/20 p-1.5 sm:w-auto sm:flex-row">
                      <button 
                          onClick={() => setStrategySubTab('innovation')}
                          className={`px-5 py-3 rounded-[18px] text-sm font-black flex items-center justify-center gap-2 transition-all ${strategySubTab === 'innovation' ? 'bg-yellow-500 text-black shadow-[0_16px_30px_rgba(234,179,8,0.26)]' : 'text-gray-300 hover:text-white hover:bg-white/8'}`}
                      >
                          <Lightbulb size={16}/> Projeto de Inovacao
                      </button>
                      <button 
                          onClick={() => setStrategySubTab('robot_design')}
                          className={`px-5 py-3 rounded-[18px] text-sm font-black flex items-center justify-center gap-2 transition-all ${strategySubTab === 'robot_design' ? 'bg-blue-600 text-white shadow-[0_16px_30px_rgba(37,99,235,0.26)]' : 'text-gray-300 hover:text-white hover:bg-white/8'}`}
                      >
                          <Wrench size={16}/> Design do Robo
                      </button>
                  </div>
              </div>
          </section>

          {strategySubTab === 'innovation' && (
              <Suspense fallback={<LazyPanelFallback label="Carregando painel de inovacao..." minHeightClass="min-h-[360px]" />}>
                <InnovationStrategyPanel
                    projectSummary={projectSummary}
                    projectImpactNarrative={projectImpactNarrative}
                    decisionMatrix={decisionMatrix}
                    experts={experts}
                    outreachEvents={outreachEvents}
                    totalImpactPeople={totalImpactPeople}
                    isAdmin={isAdmin}
                    viewAsStudent={viewAsStudent}
                    onOpenProject={() => setModal({ type: 'projectForm' })}
                    onOpenMatrix={openMatrixForm}
                    onDeleteMatrix={handleDeleteMatrix}
                    onOpenExpert={() => openExpertModal()}
                    onOpenExpertEdit={openExpertModal}
                    onOpenExpertView={openExpertView}
                    onDeleteExpert={handleDeleteExpert}
                    onOpenImpact={() => openOutreachForm()}
                    onDeleteOutreach={handleDeleteOutreach}
                />
              </Suspense>
          )}

          {strategySubTab === 'robot_design' && (
              <Suspense fallback={<LazyPanelFallback label="Carregando painel de robo..." minHeightClass="min-h-[360px]" />}>
                <RobotDesignStrategyPanel
                    robotVersions={robotVersions}
                    attachments={attachments}
                    codeSnippets={codeSnippets}
                    rounds={rounds}
                    activeCommandCode={activeCommandCode}
                    iterationRecords={iterationRecords}
                    isAdmin={isAdmin}
                    viewAsStudent={viewAsStudent}
                    onOpenRobot={() => openRobotModal()}
                    onOpenRobotEdit={openRobotModal}
                    onOpenRobotView={openRobotView}
                    onDeleteRobotVersion={handleDeleteRobotVersion}
                    onOpenAttachment={() => openAttachmentModal()}
                    onOpenAttachmentEdit={openAttachmentModal}
                    onOpenAttachmentView={openAttachmentView}
                    onDeleteAttachment={handleDeleteAttachment}
                    onOpenCode={() => openCodeModal()}
                    onOpenCodeEdit={openCodeModal}
                    onOpenCodeView={openCodeView}
                    onApplyCode={handleApplyCodeSnippet}
                    onDeleteCode={handleDeleteCode}
                />
              </Suspense>
          )}

          {strategySubTab === 'innovation_legacy' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                  {/* MATRIZ DE DECISÃO (NOVO) */}
                  <div className="bg-[#151520] border border-white/10 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="text-purple-500"/> Matriz de Decisão (Pugh Matrix)</h3><button onClick={openMatrixForm} className="text-xs bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500 hover:text-white font-bold">+ Nova Ideia</button></div>
                      <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="text-xs text-gray-500 uppercase border-b border-white/10"><tr><th className="p-3">Ideia</th><th className="p-3 text-center">Impacto (x3)</th><th className="p-3 text-center">Custo (x2)</th><th className="p-3 text-center">Fácil (x1)</th><th className="p-3 text-center">Inovação (x2)</th><th className="p-3 text-right text-white">Total</th><th className="p-3"></th></tr></thead><tbody>
                          {decisionMatrix.sort((a,b) => (b.impact*3 + b.cost*2 + b.feasibility + b.innovation*2) - (a.impact*3 + a.cost*2 + a.feasibility + a.innovation*2)).map(item => {
                              const total = (item.impact*3) + (item.cost*2) + (item.feasibility) + (item.innovation*2);
                              return (<tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors"><td className="p-3 font-bold text-white">{item.name}{item.author && <span className="block text-[10px] text-gray-500 font-normal mt-0.5 flex items-center gap-1"><UserCircle size={10}/> {item.author}</span>}</td><td className="p-3 text-center text-gray-400">{item.impact}</td><td className="p-3 text-center text-gray-400">{item.cost}</td><td className="p-3 text-center text-gray-400">{item.feasibility}</td><td className="p-3 text-center text-gray-400">{item.innovation}</td><td className="p-3 text-right font-black text-purple-400 text-lg">{total}</td><td className="p-3 text-right">{(isAdmin || item.author === viewAsStudent?.name) && <button onClick={() => handleDeleteMatrix(item.id)} className="text-gray-600 hover:text-red-500 p-1 transition-colors"><Trash2 size={16}/></button>}</td></tr>)
                          })}
                      </tbody></table></div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">
                          <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="text-pink-500"/> Especialistas</h3><button onClick={() => openExpertModal()} className="text-xs bg-pink-500/10 text-pink-500 border border-pink-500/20 px-3 py-1.5 rounded-lg hover:bg-pink-500 hover:text-white font-bold">+ Novo</button></div>
                          <div className="space-y-4">{experts.map(exp => (<div key={exp.id} onClick={() => openExpertView(exp)} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-2 relative group cursor-pointer hover:bg-white/5 transition-colors">
                              {/* Botões de Ação (Editar e Excluir) */}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <button onClick={(e) => { e.stopPropagation(); openExpertModal(exp); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14}/></button>
                                  {(isAdmin || exp.author === viewAsStudent?.name) && <button onClick={(e) => handleDeleteExpert(e, exp.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14}/></button>}
                              </div>
                              <div className="flex justify-between items-start pr-6"><div><span className="text-white font-bold block text-sm">{exp.name}</span><span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">{exp.role} {exp.author && <><span className="mx-1">•</span> <UserCircle size={10}/> {exp.author}</>}</span></div>{exp.applied ? <span className="bg-green-500/20 text-green-500 text-[9px] px-2 py-1 rounded">APLICADO</span> : <span className="bg-gray-500/20 text-gray-500 text-[9px] px-2 py-1 rounded">CONSULTA</span>}</div><p className="text-xs text-gray-300 italic line-clamp-3">"{exp.notes}"</p>{exp.image && <div className="text-[10px] text-pink-400 flex items-center gap-1 mt-1"><ImageIcon size={10}/> Tem evidência</div>}<div className="h-1 rounded-full bg-gray-700 mt-1"><div className={`h-1 rounded-full ${exp.impact==='Alto'?'bg-green-500 w-full':exp.impact==='Médio'?'bg-yellow-500 w-1/2':'bg-gray-500 w-1/4'}`}></div></div></div>))}</div>
                      </div>

                      {/* COMPARTILHAMENTO E IMPACTO */}
                      <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                  <Megaphone className="text-orange-500"/> Impacto
                              </h3>
                              <button onClick={() => openOutreachForm()} className="text-xs bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white font-bold">+ Registro</button>
                          </div>

                          <div className="flex flex-col gap-4">
                              {/* Resumo de Impacto */}
                              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center justify-between">
                                  <div>
                                      <p className="text-[10px] text-orange-400 uppercase font-bold">Pessoas Alcançadas</p>
                                      <h4 className="text-3xl font-black text-white">{outreachEvents.reduce((acc, ev) => acc + (ev.people || 0), 0)}</h4>
                                  </div>
                                  <Users size={32} className="text-orange-500 opacity-50"/>
                              </div>

                              {/* Lista de Eventos */}
                              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 border-t border-white/10 pt-4">
                                  {outreachEvents.sort((a, b) => new Date(b.date) - new Date(a.date)).map(ev => (
                                      <div key={ev.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col relative group hover:bg-white/5 transition-colors">
                                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                              {(isAdmin || ev.author === viewAsStudent?.name) && <button onClick={() => handleDeleteOutreach(ev.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14}/></button>}
                                          </div>
                                          <div className="flex justify-between items-start mb-2 pr-6">
                                              <div>
                                                  <span className="text-white font-bold text-sm block">{ev.name}</span>
                                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300">{ev.type}</span>
                                                      <span className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={10}/> {ev.date.split('-').reverse().join('/')}</span>
                                                      {ev.author && <span className="text-[10px] text-gray-500 flex items-center gap-1 ml-1 border-l border-white/10 pl-2"><UserCircle size={10}/> {ev.author}</span>}
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="mt-2 text-sm text-orange-400 font-bold">
                                              +{ev.people} pessoas
                                          </div>
                                          {ev.feedback && <p className="text-xs text-gray-300 italic mt-2 pt-2 border-t border-white/5">"{ev.feedback}"</p>}
                                      </div>
                                  ))}
                                  {outreachEvents.length === 0 && (
                                      <div className="text-center text-gray-500 text-sm italic py-4">Nenhum registro de impacto ainda.</div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {strategySubTab === 'robot_design_legacy' && (
              <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                  <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">
                      <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><GitCommit className="text-blue-500"/> Diário do Robô</h3><button onClick={() => openRobotModal()} className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white font-bold">+ Versão</button></div>
                      <div className="relative pl-4 border-l border-white/10 space-y-8">{robotVersions.map((ver) => (<div key={ver.id} onClick={() => openRobotView(ver)} className="relative group cursor-pointer"><div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#151520]"></div><div className="bg-black/40 border border-white/5 p-4 rounded-xl relative hover:bg-white/5 transition-colors">
                          {/* Botões de Ação (Editar e Excluir) */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button onClick={(e) => { e.stopPropagation(); openRobotModal(ver); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14}/></button>
                              {(isAdmin || ver.author === viewAsStudent?.name) && <button onClick={(e) => handleDeleteRobotVersion(e, ver.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14}/></button>}
                          </div>
                          <div className="flex justify-between mb-2"><span className="text-blue-400 font-mono font-bold text-xs">{ver.version}</span><span className="text-[10px] text-gray-500 flex items-center gap-1">{ver.date.split('-').reverse().slice(0,2).join('/')} {ver.author && <><span className="mx-1">•</span> <UserCircle size={10}/> {ver.author}</>}</span></div><h4 className="text-white font-bold mb-1 text-sm">{ver.name}</h4><p className="text-xs text-gray-400 line-clamp-2">{ver.changes}</p>{ver.image && <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-2"><ImageIcon size={10}/> Tem foto</div>}</div></div>))}</div>
                  </div>

                  {/* DIÁRIO DE GARRAS / ANEXOS */}
                  <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">
                      <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Wrench className="text-blue-500"/> Diário de Garras</h3><button onClick={() => openAttachmentModal()} className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white font-bold">+ Garra</button></div>
                      <div className="relative pl-4 border-l border-white/10 space-y-8">
                          {attachments.sort((a,b) => new Date(b.date) - new Date(a.date)).map((att) => (
                              <div key={att.id} onClick={() => openAttachmentView(att)} className="relative group cursor-pointer"><div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#151520]"></div><div className="bg-black/40 border border-white/5 p-4 rounded-xl relative hover:bg-white/5 transition-colors">
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <button onClick={(e) => { e.stopPropagation(); openAttachmentModal(att); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14}/></button>
                                  {(isAdmin || att.author === viewAsStudent?.name) && <button onClick={(e) => handleDeleteAttachment(e, att.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14}/></button>}
                              </div>
                              <div className="flex justify-between mb-2"><span className="text-blue-400 font-mono font-bold text-xs">{rounds.find(r => r.id === att.roundId)?.name || 'Geral'}</span><span className="text-[10px] text-gray-500 flex items-center gap-1">{att.date.split('-').reverse().slice(0,2).join('/')} {att.author && <><span className="mx-1">•</span> <UserCircle size={10}/> {att.author}</>}</span></div><h4 className="text-white font-bold mb-1 text-sm">{att.name}</h4><p className="text-xs text-gray-400 line-clamp-2">{att.changes}</p>{att.image && <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-2"><ImageIcon size={10}/> Tem foto</div>}</div></div>
                          ))}
                      </div>
                  </div>

                  {/* BIBLIOTECA DE CÓDIGOS */}
                  <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">
                      <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Code className="text-green-500"/> Cofre de Códigos</h3><button onClick={() => openCodeModal()} className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-white font-bold">+ Código</button></div>
                      {(() => {
                          const activeCode = codeSnippets.find(code => code.applied);
                          return (
                              <div className={`mb-4 rounded-2xl border p-4 ${activeCode ? 'bg-green-500/10 border-green-500/20' : 'bg-black/30 border-white/10'}`}>
                                  <div className="flex items-center justify-between gap-3">
                                      <div>
                                          <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${activeCode ? 'text-green-400' : 'text-gray-500'}`}>Programacao Ativa</p>
                                          <p className="text-sm font-bold text-white mt-1">{activeCode ? activeCode.title : 'Nenhuma programacao definida ainda'}</p>
                                      </div>
                                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${activeCode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                          {activeCode ? 'Pronta para teste' : 'Escolha um codigo'}
                                      </div>
                                  </div>
                              </div>
                          );
                      })()}
                      <div className="relative pl-4 border-l border-white/10 space-y-8">
                          {codeSnippets.sort((a,b) => new Date(b.date) - new Date(a.date)).map((code) => (
                              <div key={code.id} onClick={() => openCodeView(code)} className="relative group cursor-pointer"><div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#151520]"></div><div className={`border p-4 rounded-xl relative transition-colors ${code.applied ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}> 
                              <div className="absolute top-2 right-2 flex gap-1 opacity-100 z-10">
                                  <button onClick={(e) => { e.stopPropagation(); openCodeModal(code); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14}/></button>
                                  {isAdmin && !code.applied && <button onClick={(e) => { e.stopPropagation(); handleApplyCodeSnippet(code); }} className="text-green-400 hover:text-white p-1.5 bg-green-500/20 rounded-lg backdrop-blur-sm" title="Definir como oficial"><Laptop size={14}/></button>}
                                  {(isAdmin || code.author === viewAsStudent?.name) && <button onClick={(e) => handleDeleteCode(e, code.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14}/></button>}</div>
                              <div className="flex justify-between mb-2"><span className="text-green-400 font-mono font-bold text-xs">{code.date?.split('-').reverse().slice(0,2).join('/')}</span><span className="text-[10px] text-gray-500 flex items-center gap-1">{code.author && <><UserCircle size={10}/> {code.author}</>}</span></div><h4 className="text-white font-bold mb-1 text-sm">{code.title}</h4><p className="text-xs text-gray-400 line-clamp-2">{code.description}</p>{code.applied && <div className="text-[10px] text-green-400 flex items-center gap-1 mt-2 font-bold"><CheckCircle size={10}/> Programacao ativa</div>}{code.image && <div className="text-[10px] text-green-400 flex items-center gap-1 mt-2"><ImageIcon size={10}/> Ver print</div>}{isAdmin && !code.applied && <button onClick={(e) => { e.stopPropagation(); handleApplyCodeSnippet(code); }} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300 hover:bg-green-500 hover:text-black transition-all"><Laptop size={12}/> Definir como oficial</button>}</div></div>
                          ))}
                          {codeSnippets.length === 0 && <p className="text-xs text-gray-500 italic mt-2">Nenhum código documentado.</p>}
                      </div>
                  </div>
              </div>
          )}
      </div>
  )

  }

  // --- GRÁFICO DE EVOLUÇÃO (SVG PURO) ---
  const ScoreEvolutionChart = ({ isTvMode = false, tvModeVariant = 'default' }) => {
      // Estado local para filtrar o gráfico
      const [chartFilter, setChartFilter] = useState('score_total'); // 'score_total' ou ID do round
      const [isFullscreen, setIsFullscreen] = useState(false);
      const isTvFullRoundsView = isTvMode && tvModeVariant === 'full_rounds';
      
      // Prepara os dados baseado no filtro
      const isGeneral = chartFilter === 'score_total';
      const chartPalette = isTvMode
          ? {
              primary: "#D01BF1",
              secondary: "#6293E9",
              better: "#D01BF1",
              worse: "#6293E9",
              avg: "#E8D9FF",
              grid: "rgba(255,255,255,0.16)",
              tooltipBorder: "#5D58D3",
              tooltipSubtle: "#A5B8D7",
            }
          : {
              primary: "#22c55e",
              secondary: "#3b82f6",
              better: "#22c55e",
              worse: "#ef4444",
              avg: "#facc15",
              grid: "#333",
              tooltipBorder: "#555",
              tooltipSubtle: "#9ca3af",
            };
      let rawData = [];
      let yLabel = "pts";
      let color = chartPalette.primary;

      if (isGeneral) {
          // Pega apenas históricos de pontuação total
          rawData = scoreHistory.filter(h => !h.roundId);
      } else {
          // Pega histórico de TEMPO de um round específico
          rawData = scoreHistory.filter(h => h.roundId === chartFilter);
          yLabel = "seg";
          color = chartPalette.secondary;
      }

      if (isTvFullRoundsView) {
          rawData = scoreHistory.filter(h => !h.roundId && (h.practiceType === 'full_round' || h.time != null));
          yLabel = "seg";
          color = chartPalette.secondary;
      }

      // --- FUNÇÃO PARA LIMPAR O GRÁFICO ATUAL ---
      const handleClearChart = async () => {
        const confirmMsg = isGeneral 
            ? "ZERAR o gráfico geral de Pontos/Tempo? Isso apaga todo o histórico da equipe." 
            : "Limpar o histórico de tempos deste round?";
            
        if (!window.confirm(confirmMsg)) return;
        
        // Apaga apenas os documentos que estão sendo mostrados no gráfico agora
        try {
            const deletePromises = rawData.map(d => deleteDoc(doc(db, "score_history", d.id)));
            await Promise.all(deletePromises);
            showNotification("Histórico do gráfico limpo!", "success");
        } catch (error) {
            console.error("Erro ao limpar gráfico:", error);
            showNotification("Erro ao limpar.", "error");
        }
      };

      const data = [...rawData].sort((a,b) => new Date(a.date) - new Date(b.date));

      if (data.length < 2 && (isGeneral || isTvFullRoundsView)) return (
        <div className={`border rounded-2xl p-6 text-center text-sm flex flex-col items-center justify-center h-48 ${isTvMode ? 'bg-black/20 border-white/10 text-slate-300' : 'bg-[#151520] border-white/10 text-gray-500 mb-8'}`}>
            <TrendingUp size={32} className="mb-2 opacity-50"/>
            <p>{isTvFullRoundsView ? 'Registre pelo menos 2 rounds completos para acompanhar a meta de 2:30.' : 'Registre pelo menos 2 treinos para ver o gráfico de evolução.'}</p>
        </div>
      );

      const width = 800;
      const height = isTvFullRoundsView ? 188 : isTvMode ? 146 : 200;
      const padding = isTvFullRoundsView ? 16 : isTvMode ? 14 : 20;
      
      // Se for tempo, queremos ver cair (mas gráfico svg padrão sobe valores, então tratamos visualmente)
      const valKey = isTvFullRoundsView ? 'time' : chartFilter === 'score_total' ? 'score' : 'time';
      
      // ESCALAS (Máximos)
      const maxScore = Math.max(...data.map(d => d.score || 0), 100);
      const maxTime = Math.max(...data.map(d => d.time || 0), isGeneral ? 150 : 60); // 150s para geral, 60s para round

      const minVal = 0; // Sempre base zero para facilitar leitura

      // Função para converter dados em coordenadas X,Y
      const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);
      
      // Y dinâmico (Pontos ou Tempo)
      const getY = (val, type = 'score') => {
          const max = type === 'time' ? maxTime : maxScore;
          return height - padding - ((val || 0) / max) * (height - 2 * padding);
      };

      // Cria o caminho da linha (path d)
      const pathDataMain = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[valKey], isTvFullRoundsView ? 'time' : isGeneral ? 'score' : 'time')}`).join(' ');
      
      // Linha secundária (Tempo) apenas se for Geral
      const pathDataTime = isGeneral && !isTvFullRoundsView ? data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.time || 0, 'time')}`).join(' ') : "";

      // Cria o caminho para o preenchimento (area fill)
      const fillPathData = `${pathDataMain} L ${width - padding} ${height} L ${padding} ${height} Z`;

      // Cálculos de Média
      const avgScore = data.length > 0 ? (data.reduce((sum, d) => sum + (d.score || 0), 0) / data.length).toFixed(1) : 0;
      const avgTime = data.length > 0 ? (data.reduce((sum, d) => sum + (d.time || 0), 0) / data.length).toFixed(1) : 0;
      const recentGeneralAttempts = isGeneral
          ? [...data].filter((entry) => entry.practiceType === 'full_round').slice(-10)
          : [];
      const attemptsWithinLimit = isGeneral ? recentGeneralAttempts.filter((entry) => Number(entry.time) <= 150).length : 0;
      const consistencyLabel = isGeneral && recentGeneralAttempts.length > 0
          ? `${attemptsWithinLimit}/${recentGeneralAttempts.length} em 2:30`
          : '--';
      const recentTvRounds = isTvFullRoundsView ? data.slice(-10) : [];
      const tvWithinLimitCount = recentTvRounds.filter((entry) => Number(entry.time) <= 150).length;
      const tvConsistencyLabel = recentTvRounds.length > 0 ? `${tvWithinLimitCount}/${recentTvRounds.length}` : '--';
      const buildLocalDateKey = (value) => {
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) return 'sem-data';
          const year = parsed.getFullYear();
          const month = String(parsed.getMonth() + 1).padStart(2, '0');
          const day = String(parsed.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
      };
      const roundsByDay = isTvFullRoundsView
          ? data.reduce((acc, entry) => {
                const key = buildLocalDateKey(entry.date);
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {})
          : {};
      const roundDays = Object.keys(roundsByDay);
      const roundsToday = roundsByDay[buildLocalDateKey(new Date())] || 0;
      const averageRoundsPerDay = roundDays.length > 0 ? (data.length / roundDays.length) : 0;

      // Coordenadas da Média para o Gradiente
      const currentAvg = isTvFullRoundsView ? parseFloat(avgTime) : isGeneral ? parseFloat(avgScore) : parseFloat(avgTime);
      const avgY = getY(currentAvg, isTvFullRoundsView ? 'time' : isGeneral ? 'score' : 'time');
      const avgPercent = Math.max(0, Math.min(100, (avgY / height) * 100));
      const tvTargetY = getY(150, 'time');

      const renderChartContent = () => (
          <>
              <div className={`${isTvMode ? 'mb-0 hidden' : 'mb-6 flex items-center justify-between'}`}>
                  <h3 className={`text-white font-bold flex items-center gap-2 ${isFullscreen ? 'text-2xl' : ''}`}>
                      <TrendingUp style={{ color }}/> {isGeneral ? 'Evolução (Pontos vs Tempo)' : 'Melhoria de Tempo (Segundos)'}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                  {/* Botão de Limpar Histórico */}
                  {!isTvMode && data.length > 0 && (
                      <button onClick={handleClearChart} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors" title="Zerar este gráfico">
                          <Trash2 size={16}/>
                      </button>
                  )}

                  {/* BOTÃO TELA CHEIA */}
                  {!isTvMode && (
                      <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title={isFullscreen ? "Minimizar" : "Tela Cheia"}>
                          {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
                      </button>
                  )}

                  {/* SELETOR DE GRÁFICO */}
                  {!isTvMode && (
                  <select 
                    className="bg-black/40 border border-white/20 text-xs text-white rounded-lg p-2 outline-none focus:border-blue-500"
                    value={chartFilter}
                    onChange={(e) => setChartFilter(e.target.value)}
                  >
                      <option value="score_total">📊 Pontuação Geral</option>
                      {rounds.map(r => (
                          <option key={r.id} value={r.id}>⏱️ Tempo: {r.name}</option>
                      ))}
                  </select>
                  )}
                  </div>
              </div>

              {data.length === 0 ? (
                  <div className={`flex items-center justify-center text-gray-500 text-xs italic border border-dashed border-white/10 rounded-xl ${isFullscreen ? 'flex-1 min-h-[400px]' : isTvMode ? 'h-28' : 'h-32'}`}>
                      Sem dados registrados para este gráfico ainda.
                  </div>
              ) : (
              <div className="w-full overflow-hidden relative flex-1 flex flex-col justify-center">
                  {isTvFullRoundsView ? (
                      <div className="mb-3 grid gap-2 md:grid-cols-3">
                          <div className="rounded-[18px] border border-[#6293E9]/20 bg-[#6293E9]/10 px-3 py-2.5">
                              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-200/68">Meta 2:30</p>
                              <p className="mt-1.5 text-lg font-black text-white">{tvConsistencyLabel}</p>
                              <p className="mt-1 text-[10px] text-slate-100/68">ultimos 10 rounds dentro do tempo</p>
                          </div>
                          <div className="rounded-[18px] border border-[#5D58D3]/20 bg-[#5D58D3]/10 px-3 py-2.5">
                              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-200/68">Hoje</p>
                              <p className="mt-1.5 text-lg font-black text-white">{roundsToday}</p>
                              <p className="mt-1 text-[10px] text-slate-100/68">rounds registrados no dia</p>
                          </div>
                          <div className="rounded-[18px] border border-[#D01BF1]/20 bg-[#D01BF1]/10 px-3 py-2.5">
                              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-200/68">Media/dia</p>
                              <p className="mt-1.5 text-lg font-black text-white">{averageRoundsPerDay.toFixed(1)}</p>
                              <p className="mt-1 text-[10px] text-slate-100/68">quantas tentativas por dia</p>
                          </div>
                      </div>
                  ) : null}

                  <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto drop-shadow-2xl ${isFullscreen ? 'max-h-[60vh]' : ''}`}>
                      {/* Gradiente de Fundo */}
                      <defs>
                          <linearGradient id="trendLineGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
                              <stop offset={`${avgPercent}%`} stopColor={chartPalette.better} />
                              <stop offset={`${avgPercent}%`} stopColor={chartPalette.worse} />
                          </linearGradient>
                          <linearGradient id="trendFillGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor={chartPalette.better} stopOpacity="0.2"/>
                              <stop offset={`${avgPercent}%`} stopColor={chartPalette.better} stopOpacity="0.1"/>
                              <stop offset={`${avgPercent}%`} stopColor={chartPalette.worse} stopOpacity="0.1"/>
                              <stop offset="100%" stopColor={chartPalette.worse} stopOpacity="0"/>
                          </linearGradient>
                      </defs>

                      {/* Linhas de Grade Horizontal (Baseadas na escala principal) */}
                      {[0, 0.25, 0.5, 0.75, 1].map(p => {
                          const y = height - padding - (p * (height - 2 * padding));
                          return <line key={p} x1={padding} y1={y} x2={width-padding} y2={y} stroke={chartPalette.grid} strokeDasharray="4 4" strokeWidth="1"/>
                      })}

                      {/* Linha da Média */}
                      {isTvFullRoundsView ? (
                        <>
                            <line x1={padding} y1={tvTargetY} x2={width-padding} y2={tvTargetY} stroke={chartPalette.avg} strokeDasharray="5 5" strokeWidth="1" opacity="0.75"/>
                            <text x={padding + 5} y={tvTargetY - 5} fill={chartPalette.avg} fontSize="10" fontWeight="bold" opacity="0.92">META 2:30</text>
                        </>
                      ) : (
                        <>
                            <line x1={padding} y1={avgY} x2={width-padding} y2={avgY} stroke={chartPalette.avg} strokeDasharray="5 5" strokeWidth="1" opacity="0.6"/>
                            <text x={padding + 5} y={avgY - 5} fill={chartPalette.avg} fontSize="10" fontWeight="bold" opacity="0.8">MÉDIA: {currentAvg}</text>
                        </>
                      )}

                      {/* Área Preenchida (Apenas Principal) */}
                      <path d={fillPathData} fill={isGeneral && !isTvFullRoundsView ? "url(#trendFillGradient)" : "none"} />

                      {/* SEGUNDA LINHA: TEMPO (AZUL) - Só no Geral */}
                      {isGeneral && !isTvFullRoundsView && (
                        <>
                            <path d={pathDataTime} fill="none" stroke={chartPalette.secondary} strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                            {data.map((d, i) => (
                                <circle key={`t-${d.id}`} cx={getX(i)} cy={getY(d.time || 0, 'time')} r="3" fill="#151520" stroke={chartPalette.secondary} strokeWidth="2" />
                            ))}
                        </>
                      )}

                      {/* LINHA PRINCIPAL (VERDE ou AZUL) */}
                      <path d={pathDataMain} fill="none" stroke={isTvFullRoundsView ? chartPalette.secondary : "url(#trendLineGradient)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Pontos */}
                      {data.map((d, i) => (
                          (() => {
                            const yPos = getY(d[valKey], isTvFullRoundsView ? 'time' : isGeneral ? 'score' : 'time');
                            const dateText = new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                            const isBetter = isTvFullRoundsView ? Number(d.time) <= 150 : isGeneral ? d[valKey] >= currentAvg : d[valKey] <= currentAvg;
                            const ptColor = isBetter ? chartPalette.better : chartPalette.worse;

                            return (
                                <g key={d.id} className="group">
                                    <circle cx={getX(i)} cy={yPos} r="4" fill="#151520" stroke={ptColor} strokeWidth="2" />
                                    
                                    {/* Textos fixos (Sempre visíveis, alternando altura para não encavalar) */}
                                    <text x={getX(i)} y={yPos - (i % 2 === 0 ? 12 : -18)} textAnchor="middle" fill={ptColor} fontSize="10" fontWeight="bold">
                                        {d[valKey]}
                                    </text>

                                    {/* Tooltip Aprimorado */}
                                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <rect 
                                            x={getX(i) - 45} 
                                            y={yPos - (isGeneral ? 60 : 48)} 
                                            width="90" 
                                            height={isGeneral ? 55 : 40} 
                                            rx="5" 
                                            fill="black" 
                                            fillOpacity="0.9"
                                            stroke={chartPalette.tooltipBorder}
                                            strokeWidth="1"
                                        />
                                        
                                        {isTvFullRoundsView ? (
                                            <>
                                                <text x={getX(i)} y={yPos - 45} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.time} seg</text>
                                                <text x={getX(i)} y={yPos - 30} textAnchor="middle" fill={chartPalette.avg} fontSize="10" fontWeight="bold">{Number(d.time) <= 150 ? 'Dentro de 2:30' : 'Acima de 2:30'}</text>
                                                <text x={getX(i)} y={yPos - 15} textAnchor="middle" fill={chartPalette.tooltipSubtle} fontSize="10">{dateText}</text>
                                            </>
                                        ) : isGeneral ? (
                                            <>
                                                <text x={getX(i)} y={yPos - 45} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.score} pts</text>
                                                <text x={getX(i)} y={yPos - 30} textAnchor="middle" fill={chartPalette.secondary} fontSize="10" fontWeight="bold">{d.time ? `${d.time}s` : '--'}</text>
                                                <text x={getX(i)} y={yPos - 15} textAnchor="middle" fill={chartPalette.tooltipSubtle} fontSize="10">{dateText}</text>
                                            </>
                                        ) : (
                                            <>
                                                <text x={getX(i)} y={yPos - 35} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.time} seg</text>
                                                <text x={getX(i)} y={yPos - 20} textAnchor="middle" fill="#9ca3af" fontSize="10">{dateText}</text>
                                            </>
                                        )}
                                    </g>
                                </g>
                            )
                          })()
                      ))}
                  </svg>
                  
                  {/* Legenda X (Datas) */}
                  <div className={`flex justify-between ${isTvMode ? 'mt-0.5 px-2 text-[8px]' : 'mt-2 px-4 text-[10px]'} text-gray-500 uppercase font-mono select-none`}>
                      <span>{new Date(data[0].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                      {data.length > 3 && (<span>{new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>)}
                      <span>{new Date(data[data.length-1].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                  </div>
              </div>
              )}

              {/* HISTÓRICO COMPLETO ABAIXO DO GRÁFICO (SÓ FORA DO MODO TV E NÃO EM TELA CHEIA) */}
              {!isTvMode && !isFullscreen && data.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="text-gray-400 font-bold uppercase text-xs flex items-center gap-2"><ListTodo size={14}/> Histórico Detalhado</h4>
                          <div className="flex gap-4">
                              <div className="text-right bg-white/5 px-3 py-1 rounded-lg">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Média Pontos</span>
                                  <span className="text-green-500 font-bold">{avgScore} pts</span>
                              </div>
                              <div className="text-right bg-white/5 px-3 py-1 rounded-lg">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Média Tempo</span>
                                  <span className="text-blue-500 font-bold">{avgTime} s</span>
                              </div>
                              {isGeneral && (
                                  <div className="text-right bg-white/5 px-3 py-1 rounded-lg">
                                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Consistencia 2:30</span>
                                      <span className={`font-bold ${attemptsWithinLimit >= 7 && recentGeneralAttempts.length >= 10 ? 'text-green-400' : 'text-yellow-300'}`}>{consistencyLabel}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                          {[...data].reverse().map((d, i) => (
                              <div key={d.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                  <div className="flex items-center gap-3">
                                      <span className="text-gray-500 text-xs font-mono font-bold w-6">#{data.length - i}</span>
                                      <div className="flex flex-col">
                                          <span className="text-gray-200 text-xs font-bold">{new Date(d.date).toLocaleDateString('pt-BR')} às {new Date(d.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                          {d.author && <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><UserCircle size={10}/> {d.author}</span>}
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-right">
                                      <div className="w-16"><span className="text-[9px] text-gray-500 uppercase block">Tempo</span><span className="text-blue-400 font-bold text-sm">{d.time || '--'}s</span></div>
                                      <div className="w-16"><span className="text-[9px] text-gray-500 uppercase block">Pontos</span><span className="text-green-400 font-bold text-sm">{d.score || '--'}</span></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </>
      );

      if (isFullscreen) {
          return (
              <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-sm p-4 md:p-8 flex flex-col overflow-auto animate-in fade-in">
                  <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
                      <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 md:p-10 flex-1 flex flex-col shadow-2xl relative">
                          {renderChartContent()}
                      </div>
                  </div>
              </div>
          );
      }

      return (
          <div className={`rounded-2xl ${isTvMode ? 'border-0 bg-transparent p-0 shadow-none' : 'bg-[#151520] border border-white/10 p-6 mb-8'}`}>
              {renderChartContent()}
          </div>
      );
  };

  // Função para salvar pontuação no histórico
  const handleSavePracticeScore = async (totalPoints, totalTime) => {
      if (!window.confirm(`Registrar treino oficial?\nPontos: ${totalPoints}\nTempo: ${totalTime}s`)) return;
      
      try {
          await addDoc(collection(db, "score_history"), {
              score: totalPoints,
              time: totalTime, // Salva o tempo junto!
              date: new Date().toISOString(),
              author: isAdmin ? 'Técnico' : viewAsStudent?.name || 'Equipe'
          });
          showNotification("Pontuação registrada no gráfico! 📈");
      } catch (error) {
          console.error("Erro ao salvar histórico:", error);
          showNotification("Erro ao salvar.", "error");
      }
  };

  const handleSaveFullRoundRun = async (e) => {
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
              .filter((entry) => !entry.roundId)
              .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0)),
      ].slice(0, 10);
      const withinLimitCount = upcomingWindow.filter((entry) => Number(entry.time) <= 150).length;

      try {
          await addDoc(collection(db, "score_history"), {
              score: scoreVal,
              time: timeVal,
              date: new Date().toISOString(),
              author: isAdmin ? 'Tecnico' : viewAsStudent?.name || 'Equipe',
              practiceType: 'full_round',
              withinLimit: timeVal <= 150,
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
      } catch (error) {
          console.error("Erro ao salvar round completo:", error);
          showNotification("Erro ao salvar round completo.", "error");
      }
  };

  // --- NOVA FUNÇÃO: SALVAR EXECUÇÃO DE UM ROUND ESPECÍFICO ---
  const handleSaveRoundRun = async (e, round) => {
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
        await addDoc(collection(db, "score_history"), {
            roundId: round.id,
            roundName: round.name,
            time: timeVal, // O tempo que levou
            date: new Date().toISOString(),
            author: viewAsStudent?.name || "Técnico"
        });

        // 2. Atualiza o tempo estimado do round (para ficar real)
        await updateDoc(doc(db, "rounds", round.id), {
            estimatedTime: timeVal
        });

        showNotification(`Treino de "${round.name}" registrado: ${timeVal}s ${trendMsg}`);
        
        // Limpa o valor do formulário local (estado controlado)
        setRoundFormValues(prev => {
            const next = { ...prev };
            delete next[round.id];
            return next;
        });
        e.target.reset();
    } catch (error) {
        console.error("Erro round run:", error);
        showNotification("Erro ao salvar.", "error");
    }
  };


  // --- COMPONENTE DE ROUNDS ---

  const RoundsView = ({ readonly = false }) => (
      <Suspense fallback={<LazyPanelFallback label="Carregando central de rounds..." minHeightClass="min-h-[420px]" />}>
        <RobotRoundsPanel
            rounds={rounds}
            missionsList={missionsList}
            attachments={attachments}
            activeCommandCode={activeCommandCode}
            scoreHistory={scoreHistory}
            robotSubTab={robotSubTab}
            onChangeRobotSubTab={setRobotSubTab}
            activeTimer={activeTimer}
            timerDisplay={timerDisplay}
            roundFormValues={roundFormValues}
            fullRoundTimeValue={roundFormValues[FULL_ROUND_TIME_KEY] ?? ''}
            fullRoundScoreValue={roundFormValues[FULL_ROUND_SCORE_KEY] ?? ''}
            fullRoundTimerActive={activeTimer?.roundId === FULL_ROUND_TIMER_ID}
          onRoundFormValueChange={(roundId, value) => setRoundFormValues(prev => ({ ...prev, [roundId]: value }))}
          onFullRoundFieldChange={(field, value) => setRoundFormValues(prev => ({ ...prev, [field]: value }))}
          onToggleTimer={toggleTimer}
          onToggleFullRoundTimer={() => toggleTimer({ id: FULL_ROUND_TIMER_ID, name: 'Round completo' })}
          onOpenNewRound={openNewRoundModal}
          onOpenRoundEdit={openEditRoundModal}
          onOpenMissionForm={() => openMissionForm()}
          onOpenPitStop={openPitStopModal}
            onSavePracticeScore={handleSavePracticeScore}
            onDeleteRound={handleDeleteRound}
            onSaveFullRoundRun={handleSaveFullRoundRun}
            onSaveRoundRun={handleSaveRoundRun}
            scoreChart={<ScoreEvolutionChart />}
            readonly={readonly}
        />
      </Suspense>
  );

  // --- COMPONENTE KANBAN (REUTILIZÁVEL) ---
  const KanbanView = () => {
      const [searchTerm, setSearchTerm] = useState("");
      const deferredSearchTerm = useDeferredValue(searchTerm);
      const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();
      const kanbanLayout = 'swimlanes';
      const activeTagFilter = 'all';
      const activeOwnerFilter = 'all';
      const focusFilter = 'all';
      const [showAllTodo, setShowAllTodo] = useState(false);
      const [showAllDoing, setShowAllDoing] = useState(false);
      const [showAllReview, setShowAllReview] = useState(false);
      const [showAllDone, setShowAllDone] = useState(false);
      const [editingTaskId, setEditingTaskId] = useState(null);
      const [editingTaskText, setEditingTaskText] = useState("");
      const [draggedOverCol, setDraggedOverCol] = useState(null);
      const [kanbanTaskDraft, setKanbanTaskDraft] = useState(() =>
          buildInitialKanbanTaskDraft(isAdmin ? null : viewAsStudent?.station, localTodayStr)
      );

      useEffect(() => {
          const nextTag = isAdmin ? 'geral' : resolveTaskTagFromStation(viewAsStudent?.station);

          setKanbanTaskDraft((prev) => {
              const nextDraft = {
                  ...prev,
                  dueDate: prev.dueDate || localTodayStr
              };

              if (!prev.text.trim()) {
                  nextDraft.tag = nextTag;
              }

              if (prev.tag === nextDraft.tag && prev.dueDate === nextDraft.dueDate) {
                  return prev;
              }

              return nextDraft;
          });
      }, [isAdmin, viewAsStudent?.station, localTodayStr]);

      const updateKanbanTaskDraft = (field, value) => {
          setKanbanTaskDraft((prev) => ({ ...prev, [field]: value }));
      };

      const stopKanbanInputKeyDown = (event) => {
          event.stopPropagation();
      };

      const handleAddTaskSubmit = async (event) => {
          event.preventDefault();

          const created = await handleAddTask(kanbanTaskDraft);
          if (!created) return;

          setKanbanTaskDraft(buildInitialKanbanTaskDraft(isAdmin ? null : viewAsStudent?.station, localTodayStr));
      };

      const handleSaveTaskEdit = async (taskId) => {
          if (!editingTaskText.trim()) return;
          try {
              await updateDoc(doc(db, "tasks", taskId), { text: editingTaskText });
              setEditingTaskId(null);
              setEditingTaskText("");
          } catch (error) {
              console.error("Erro ao editar tarefa:", error);
          }
      };
      
      const handleDragStart = (e, taskId) => {
          e.dataTransfer.setData("taskId", taskId);
          e.target.style.opacity = "0.5";
      };

      const handleDragEnd = (e) => {
          e.target.style.opacity = "1";
      };

      const handleDragOver = (e, colId) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDraggedOverCol(colId);
      };

      const handleDragLeave = () => {
          setDraggedOverCol(null);
      };

      const handleDrop = async (e, targetStatus) => {
          e.preventDefault();
          setDraggedOverCol(null);
          const taskId = e.dataTransfer.getData("taskId");
          if (taskId) {
              await moveTask(taskId, targetStatus);
          }
      };

      const KANBAN_TAGS = [
          { id: 'engenharia', label: 'Engenharia', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { id: 'inovacao', label: 'Inovação', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
          { id: 'gestao', label: 'Gestão', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
          { id: 'geral', label: 'Geral', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
      ];

      const focusOptions = isAdmin
          ? [
              { id: 'all', label: 'Tudo', icon: <BarChart3 size={12} /> },
              { id: 'priority', label: 'Prioritarias', icon: <Zap size={12} /> },
              { id: 'overdue', label: 'Atrasadas', icon: <AlertTriangle size={12} /> },
              { id: 'unassigned', label: 'Sem dono', icon: <Users size={12} /> }
          ]
          : [
              { id: 'all', label: 'Tudo', icon: <BarChart3 size={12} /> },
              { id: 'mine', label: 'Minhas', icon: <Target size={12} /> },
              { id: 'priority', label: 'Prioritarias', icon: <Zap size={12} /> },
              { id: 'overdue', label: 'Atrasadas', icon: <AlertTriangle size={12} /> }
          ];

      const priorityRank = { urgente: 4, alta: 3, normal: 2, baixa: 1 };

      const getDeadlineStatus = (date) => {
          if (!date) return null;
          const due = parseLocalDateValue(date, true);
          if (!due) return null;
          const diffTime = due.getTime() - localTodayStart.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          const parts = date.split('-');
          const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;

          if (diffDays < 0) return { color: 'text-red-500', border: 'border-red-500', icon: <AlertTriangle size={12}/>, text: `Atrasado (${dateStr})`, isOverdue: true };
          if (diffDays <= 2) return { color: 'text-yellow-500', border: 'border-yellow-500', icon: <Timer size={12}/>, text: `Prazo Curto (${dateStr})` };
          return { color: 'text-gray-500', border: 'border-white/5', icon: <Calendar size={12}/>, text: dateStr };
      };

      // --- LÓGICA DE CÁLCULO DE TEMPO ---
      const getTaskDuration = (createdAt, completedAt) => {
          if (!createdAt || !completedAt) return null;
          const start = new Date(createdAt);
          const end = new Date(completedAt);
          const diffMs = end.getTime() - start.getTime();
          if (diffMs < 0) return '0 min';
          
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins < 60) return `${diffMins} min`;
          
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m`;
          
          const diffDays = Math.floor(diffHours / 24);
          return `${diffDays}d ${diffHours % 24}h`;
      };

      const getTaskAgeLabel = (createdAt) => {
          if (!createdAt) return 'agora';

          const createdTime = new Date(createdAt).getTime();
          const diffMs = Date.now() - createdTime;
          const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

          if (diffMinutes < 60) return `${diffMinutes} min`;

          const diffHours = Math.floor(diffMinutes / 60);
          if (diffHours < 24) return `${diffHours}h`;

          const diffDays = Math.floor(diffHours / 24);
          return `${diffDays}d`;
      };

      const isTaskOverdue = (task) => task.status !== 'done' && task.dueDate && task.dueDate < localTodayStr;
      const isTaskPriority = (task) => task.status !== 'done' && ['urgente', 'alta'].includes(task.priority);

      const getStageProgress = (status) => {
          if (status === 'todo') return 22;
          if (status === 'doing') return 56;
          if (status === 'review') return 82;
          if (status === 'done') return 100;
          return 0;
      };

      const sortOpenTasks = (a, b) => {
          const overdueDiff = Number(isTaskOverdue(b)) - Number(isTaskOverdue(a));
          if (overdueDiff !== 0) return overdueDiff;

          const priorityDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;

          const aDue = a.dueDate ? (parseLocalDateValue(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
          const bDue = b.dueDate ? (parseLocalDateValue(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
          if (aDue !== bDue) return aDue - bDue;

          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      };

      const ownerOptions = [
          { value: 'all', label: 'Todos os responsaveis' },
          { value: 'unassigned', label: 'Equipe (livre)' },
          { value: 'Técnico', label: 'Tecnico' },
          ...[...students]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((student) => ({ value: student.name, label: student.name }))
      ].filter((option, index, arr) => arr.findIndex((item) => item.value === option.value) === index);

      const TaskCard = ({ t, showMoveRight, showMoveLeft, showDelete, cardIndex = 0, laneIndex = 0, columnIndex = 0 }) => {
          const status = getDeadlineStatus(t.dueDate);
          const tagObj = KANBAN_TAGS.find(tag => tag.id === (t.tag || 'geral')) || KANBAN_TAGS[3];

          // Só pisca se estiver atrasado e ainda não foi concluída
          const isPulsing = status?.isOverdue && t.status !== 'done';
          const duration = t.status === 'done' ? getTaskDuration(t.createdAt, t.completedAt) : null;
          const ageLabel = getTaskAgeLabel(t.createdAt);
          const stageProgress = getStageProgress(t.status);
          const cardEntranceClass = isPulsing ? '' : 'animate-in fade-in slide-in-from-bottom-2';

          // Lógica de exibição de autores
          const authors = t.author ? t.author.split(',').map(a => a.trim()) : [];
          const isMultiAuthor = authors.length > 1;
          let displayAuthor = t.author || "Equipe";
          if (isMultiAuthor) {
              displayAuthor = `${authors[0]}, ${authors[1]}...`;
          }

          // Busca os dados completos dos autores para poder exibir a foto
          const authorStudents = authors.map(authorName => students.find(s => s.name === authorName)).filter(Boolean);

          // Renderiza os avatares dos responsáveis (com sobreposição se houver mais de um)
          const renderAvatars = () => {
              if (authorStudents.length === 0) return <UserCircle size={12} className={isAdmin ? "text-blue-400 shrink-0" : "text-gray-400 shrink-0"} />;
              
              return (
                  <div className="flex -space-x-1.5 shrink-0 mr-1">
                      {authorStudents.map((s, idx) => (
                          s.avatarImage ? (
                              <img key={idx} src={s.avatarImage} alt={s.name} className="w-4 h-4 rounded-full object-cover border border-[#151520] relative z-10 hover:z-20 hover:scale-125 transition-transform" title={s.name} />
                          ) : (
                              <div key={idx} className="w-4 h-4 rounded-full bg-gray-800 border border-[#151520] flex items-center justify-center relative z-10 hover:z-20" title={s.name}>
                                  <span className="text-[6px] font-bold text-gray-300">{s.name.charAt(0)}</span>
                              </div>
                          )
                      ))}
                  </div>
              );
          };

          const entranceDelay = Math.min((columnIndex * 110) + (laneIndex * 70) + (cardIndex * 45), 420);

          return (
              <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-black/40 p-3 rounded-xl border flex flex-col gap-2 group cursor-grab active:cursor-grabbing ${cardEntranceClass} transition-[transform,box-shadow,border-color,background-color,opacity] duration-500 ease-out will-change-transform motion-reduce:animate-none motion-reduce:transition-none hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.28)] ${status && t.status !== 'done' ? status.border : 'border-white/5'} ${isPulsing ? 'animate-pulse hover:animate-none shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'hover:border-white/20'}`}
                  style={cardEntranceClass ? { animationDelay: `${entranceDelay}ms`, animationFillMode: 'both' } : undefined}
              >
                  <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-wrap gap-1.5">
                          {isAdmin ? (
                              <div className="relative flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 transition-colors px-2 py-0.5 rounded border border-blue-500/30 group focus-within:border-blue-500/50">
                                  {renderAvatars()}
                                  <select
                                      value={authors.length === 1 ? authors[0] : ''} // Só pré-seleciona se for um único autor
                                      onChange={(e) => assignTaskToStudent(t.id, e.target.value)}
                                      className="text-[10px] font-bold uppercase bg-transparent border-none text-blue-100 focus:ring-0 outline-none appearance-none cursor-pointer pr-3"
                                      title={t.author || "Atribuir tarefa"}
                                  >
                                      <option value="" className="bg-zinc-900 text-gray-400">Equipe (Livre)</option>
                                      {[...students].sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                                          <option key={s.id} value={s.name} className="bg-zinc-900 text-white">{s.name}</option>
                                      ))}
                                  </select>
                                  <ChevronDown size={10} className="text-blue-400 absolute right-1 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"/>
                                  {isMultiAuthor && <span className="text-[10px] text-blue-300 ml-1" title={t.author}>+{authors.length - 1}</span>}
                              </div>
                          ) : (
                              <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded text-gray-300 flex items-center gap-1" title={t.author || "Equipe"}>
                                  {renderAvatars()} {displayAuthor}
                              </span>
                          )}
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${tagObj.color}`}>
                              <Tag size={8}/> {tagObj.label}
                          </span>
                          {t.priority === 'urgente' && <span className="text-[9px] bg-red-500/20 text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-1" title="Prioridade Urgente"><AlertTriangle size={8}/> Urgente</span>}
                          {t.priority === 'alta' && <span className="text-[9px] bg-orange-500/20 text-orange-500 border border-orange-500/30 px-1.5 py-0.5 rounded font-bold uppercase" title="Prioridade Alta">Alta</span>}
                          {t.priority === 'baixa' && <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase" title="Prioridade Baixa">Baixa</span>}
                      </div>
                      {status && t.status !== 'done' && <span className={`text-[10px] font-bold flex items-center gap-1 whitespace-nowrap mt-0.5 ${status.color}`}>{status.icon} {status.text}</span>}
                      {duration && <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 mt-0.5 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20" title="Tempo total levado"><Clock size={10}/> {duration}</span>}
                  </div>
                  {editingTaskId === t.id ? (
                      <div className="flex flex-col gap-2 mt-1">
                          <textarea 
                              value={editingTaskText} 
                              onChange={(e) => setEditingTaskText(e.target.value)} 
                              className="w-full bg-black/60 border border-blue-500/50 rounded-lg p-2 text-xs text-white outline-none resize-none focus:border-blue-400" 
                              rows={3}
                              autoFocus 
                          />
                          <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingTaskId(null)} className="text-[10px] text-gray-400 hover:text-white px-2 py-1">Cancelar</button>
                              <button onClick={() => handleSaveTaskEdit(t.id)} className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-bold">Salvar</button>
                          </div>
                      </div>
                  ) : (
                      <>
                          <p className="text-sm text-gray-200 leading-relaxed">{t.text}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                  <Clock size={10}/> criada ha {ageLabel}
                              </span>
                              {!t.dueDate && t.status !== 'done' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                      <Calendar size={10}/> sem prazo
                                  </span>
                              )}
                              {authors.length > 1 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                      <Users size={10}/> {authors.length} pessoas
                                  </span>
                              )}
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                  className={`h-full rounded-full transition-all duration-500 ${t.status === 'done' ? 'bg-green-500' : t.status === 'review' ? 'bg-purple-500' : t.status === 'doing' ? 'bg-blue-500' : 'bg-gray-500'}`}
                                  style={{ width: `${stageProgress}%` }}
                              ></div>
                          </div>
                      </>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-between pt-2 border-t border-white/5 mt-1">
                      <div className="flex gap-1 flex-wrap">
                          {isAdmin && editingTaskId !== t.id && (
                              <button onClick={() => { setEditingTaskId(t.id); setEditingTaskText(t.text); }} className="text-blue-400 hover:bg-blue-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors" title="Editar Tarefa">
                                  <Pencil size={14}/> Editar
                              </button>
                          )}
                          {viewAsStudent && (!t.author || !t.author.includes(viewAsStudent.name)) && t.status !== 'done' && (
                              <>
                                  <button onClick={() => joinTask(t.id)} className="text-green-500 hover:bg-green-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors" title="Participar junto na tarefa">
                                      <UserPlus size={14}/> Participar
                                  </button>
                                  <button onClick={() => takeoverTask(t.id)} className="text-orange-500 hover:bg-orange-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors" title="Assumir sozinho (Substituir atuais)">
                                      <UserCheck size={14}/> Assumir
                                  </button>
                              </>
                          )}
                          {viewAsStudent && t.author && t.author.includes(viewAsStudent.name) && t.status !== 'done' && (
                              <button onClick={() => leaveTask(t.id)} className="text-red-500 hover:bg-red-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors" title="Sair desta tarefa">
                                  <UserX size={14}/> Sair
                              </button>
                          )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                          {showMoveLeft && <button onClick={() => moveTask(t.id, showMoveLeft)} className="text-orange-500 hover:bg-orange-500/20 p-1.5 rounded" title="Devolver tarefa (Incompleta)"><ChevronLeft size={16}/></button>}
                          {showMoveRight && <button onClick={() => moveTask(t.id, showMoveRight)} className="text-blue-500 hover:bg-blue-500/20 p-1.5 rounded" title="Avançar"><ChevronRight size={16}/></button>}
                          {showDelete && <button onClick={() => removeTask(t.id)} className="text-red-500 hover:bg-red-500/20 p-1.5 rounded" title="Excluir"><Trash2 size={16}/></button>}
                      </div>
                  </div>
              </div>
          );
      };

      // Lógica de Filtro e Ordenação
      const filteredTasks = tasks.filter((task) => {
          const matchesSearch = !normalizedSearchTerm ||
              task.text.toLowerCase().includes(normalizedSearchTerm) ||
              (task.author && task.author.toLowerCase().includes(normalizedSearchTerm)) ||
              (task.tag && task.tag.toLowerCase().includes(normalizedSearchTerm));

          const matchesTag = activeTagFilter === 'all' || (task.tag || 'geral') === activeTagFilter;

          const authors = task.author ? task.author.split(',').map((author) => author.trim()) : [];
          const matchesOwner = activeOwnerFilter === 'all'
              || (activeOwnerFilter === 'unassigned' && authors.length === 0)
              || authors.includes(activeOwnerFilter);

          const matchesFocus = focusFilter === 'all'
              || (focusFilter === 'mine' && viewAsStudent?.name && authors.includes(viewAsStudent.name))
              || (focusFilter === 'priority' && isTaskPriority(task))
              || (focusFilter === 'overdue' && isTaskOverdue(task))
              || (focusFilter === 'unassigned' && authors.length === 0);

          return matchesSearch && matchesTag && matchesOwner && matchesFocus;
      });

      const todoTasks = filteredTasks.filter(t => t.status === 'todo')
          .sort(sortOpenTasks);
      const doingTasks = filteredTasks.filter(t => t.status === 'doing')
          .sort(sortOpenTasks);
      const reviewTasks = filteredTasks.filter(t => t.status === 'review')
          .sort(sortOpenTasks);
      
      // Ordena Feitos: Mais recentes primeiro
      const doneTasks = filteredTasks.filter(t => t.status === 'done')
          .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

      const hasActiveFilters = Boolean(normalizedSearchTerm);

      const displayedTodoTasks = (showAllTodo || hasActiveFilters) ? todoTasks : todoTasks.slice(0, 10);
      const displayedDoingTasks = (showAllDoing || hasActiveFilters) ? doingTasks : doingTasks.slice(0, 10);
      const displayedReviewTasks = (showAllReview || hasActiveFilters) ? reviewTasks : reviewTasks.slice(0, 10);
      const displayedDoneTasks = (showAllDone || hasActiveFilters) ? doneTasks : doneTasks.slice(0, 10);

      const activeTasksCount = filteredTasks.filter((task) => task.status !== 'done').length;
      const overdueFilteredCount = filteredTasks.filter((task) => isTaskOverdue(task)).length;
      const priorityFilteredCount = filteredTasks.filter((task) => isTaskPriority(task)).length;
      const doneLast7Days = tasks.filter((task) => {
          if (task.status !== 'done' || !task.completedAt) return false;
          const completedTime = new Date(task.completedAt).getTime();
          return Date.now() - completedTime <= (7 * 24 * 60 * 60 * 1000);
      }).length;

      const boardMessage = overdueFilteredCount > 0
          ? 'Hoje o foco deve ser limpar atrasos antes de puxar novas frentes.'
          : reviewTasks.length > 0
              ? 'Ha entregas aguardando validacao tecnica em Em Revisao.'
              : activeTasksCount === 0
                  ? 'Quadro limpo. Hora de criar a proxima meta da equipe.'
                  : 'Fluxo saudavel: mantenham as tarefas pequenas, claras e com dono definido.';

      const boardStats = [
          { label: 'Abertas', value: activeTasksCount, helper: 'tarefas ativas na visao atual', icon: <ListTodo size={16} />, tone: 'text-white border-white/10 bg-white/5' },
          { label: 'Atrasadas', value: overdueFilteredCount, helper: 'pedem acao imediata', icon: <AlertTriangle size={16} />, tone: 'text-red-400 border-red-500/20 bg-red-500/10' },
          { label: 'Em Revisao', value: reviewTasks.length, helper: 'esperando aprovacao', icon: <Target size={16} />, tone: 'text-purple-400 border-purple-500/20 bg-purple-500/10' },
          { label: 'Entregues 7d', value: doneLast7Days, helper: 'ritmo recente da equipe', icon: <CheckCircle size={16} />, tone: 'text-green-400 border-green-500/20 bg-green-500/10' }
      ];

      const defaultWeekStart = new Date(localTodayObj);
      defaultWeekStart.setDate(defaultWeekStart.getDate() - 6);
      const currentWeekStart = currentWeekData?.startDate || getLocalYYYYMMDD(defaultWeekStart);
      const currentWeekEnd = currentWeekData?.endDate || localTodayStr;
      const tasksThisWeek = tasks.filter((task) => {
          const referenceDate = task.dueDate || getLocalYYYYMMDD(new Date(task.createdAt || Date.now()));
          return referenceDate >= currentWeekStart && referenceDate <= currentWeekEnd;
      });
      const completedThisWeek = tasksThisWeek.filter((task) => task.status === 'done').length;
      const weeklyGoalProgress = tasksThisWeek.length > 0 ? Math.round((completedThisWeek / tasksThisWeek.length) * 100) : 0;
      const avgThroughput = tasksThisWeek.length > 0 ? (completedThisWeek / Math.max(1, 7)).toFixed(1) : '0.0';
      const weeklyUnassignedCount = tasksThisWeek.filter((task) => !task.author).length;
      const weeklyReviewCount = tasksThisWeek.filter((task) => task.status === 'review').length;
      const weeklyBacklogCount = tasksThisWeek.filter((task) => task.status !== 'done').length;

      const tacticalAlerts = [
          overdueFilteredCount > 0 && {
              title: `${overdueFilteredCount} tarefas atrasadas`,
              detail: 'Priorize o que ja passou do prazo antes de abrir novas frentes.',
              tone: 'border-red-500/20 bg-red-500/10 text-red-400',
              icon: <AlertTriangle size={16} />
          },
          reviewTasks.length > 0 && {
              title: `${reviewTasks.length} tarefas em revisao`,
              detail: 'Ha entregas esperando aprovacao tecnica para virar resultado.',
              tone: 'border-purple-500/20 bg-purple-500/10 text-purple-300',
              icon: <Search size={16} />
          },
          filteredTasks.filter((task) => !task.author && task.status !== 'done').length > 0 && {
              title: `${filteredTasks.filter((task) => !task.author && task.status !== 'done').length} tarefas sem dono`,
              detail: 'Distribuam responsabilidades para evitar tarefa esquecida.',
              tone: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
              icon: <Users size={16} />
          },
          doingTasks.length >= 6 && {
              title: 'Execucao muito espalhada',
              detail: 'Reduzam o WIP para acelerar entrega e aprovacao.',
              tone: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
              icon: <Zap size={16} />
          }
      ].filter(Boolean).slice(0, 3);

      const studentTasksThisWeek = !isAdmin && viewAsStudent?.name
          ? tasksThisWeek
              .filter((task) => task.author && task.author.includes(viewAsStudent.name))
              .sort((a, b) => {
                  if (a.status === 'done' && b.status !== 'done') return 1;
                  if (a.status !== 'done' && b.status === 'done') return -1;
                  return sortOpenTasks(a, b);
              })
          : [];

      const studentTaskSummary = {
          total: studentTasksThisWeek.length,
          done: studentTasksThisWeek.filter((task) => task.status === 'done').length,
          review: studentTasksThisWeek.filter((task) => task.status === 'review').length,
          overdue: studentTasksThisWeek.filter((task) => isTaskOverdue(task)).length
      };

      const getColumnSignal = (columnId, total) => {
          if (columnId === 'todo' && total >= 10) return { label: 'Backlog alto', tone: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
          if (columnId === 'doing' && total >= 6) return { label: 'WIP alto', tone: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
          if (columnId === 'review' && total >= 3) return { label: 'Aprovar', tone: 'text-purple-300 bg-purple-500/10 border-purple-500/20' };
          if (columnId === 'done' && total >= 6) return { label: 'Bom ritmo', tone: 'text-green-400 bg-green-500/10 border-green-500/20' };
          return null;
      };

      const buildLaneGroups = (taskList) => {
          if (activeTagFilter !== 'all') {
              const selectedTag = KANBAN_TAGS.find((tag) => tag.id === activeTagFilter) || KANBAN_TAGS[3];
              return [{ ...selectedTag, tasks: taskList, compact: false }];
          }

          if (kanbanLayout === 'compact') {
              return [{ id: 'all', label: 'Quadro compacto', color: 'bg-white/5 text-gray-300 border-white/10', tasks: taskList, compact: true }];
          }

          return KANBAN_TAGS.map((tag) => ({
              ...tag,
              tasks: taskList.filter((task) => (task.tag || 'geral') === tag.id),
              compact: false
          })).filter((lane) => lane.tasks.length > 0);
      };

      const columnConfigs = [
          {
              id: 'todo',
              title: 'A Fazer',
              subtitle: 'planejamento e prioridade',
              icon: <ListTodo size={16} />,
              total: todoTasks.length,
              tasks: displayedTodoTasks,
              showAll: showAllTodo,
              setShowAll: setShowAllTodo,
              moveLeft: null,
              moveRight: 'doing',
              accent: draggedOverCol === 'todo'
                  ? 'bg-[#1a1a2a] border-white/40 shadow-lg'
                  : 'bg-[#151520] border-white/10',
              heading: 'text-gray-300 border-white/5',
              moreTone: 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10',
              emptyText: 'Crie ou priorize a proxima entrega da equipe.'
          },
          {
              id: 'doing',
              title: 'Fazendo',
              subtitle: 'execucao em andamento',
              icon: <Loader2 size={16} className="animate-spin" />,
              total: doingTasks.length,
              tasks: displayedDoingTasks,
              showAll: showAllDoing,
              setShowAll: setShowAllDoing,
              moveLeft: null,
              moveRight: 'review',
              accent: draggedOverCol === 'doing'
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'bg-blue-500/5 border-blue-500/20',
              heading: 'text-blue-400 border-blue-500/10',
              moreTone: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20',
              emptyText: 'Nenhuma tarefa em execucao agora.'
          },
          {
              id: 'review',
              title: 'Em Revisao',
              subtitle: 'validacao antes de concluir',
              icon: <Search size={16} />,
              total: reviewTasks.length,
              tasks: displayedReviewTasks,
              showAll: showAllReview,
              setShowAll: setShowAllReview,
              moveLeft: isAdmin ? 'doing' : null,
              moveRight: isAdmin ? 'done' : null,
              accent: draggedOverCol === 'review'
                  ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-purple-500/5 border-purple-500/20',
              heading: 'text-purple-400 border-purple-500/10',
              moreTone: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20',
              emptyText: 'Quando uma entrega estiver pronta, ela aparece aqui.'
          },
          {
              id: 'done',
              title: 'Feito',
              subtitle: 'entregas aprovadas e registradas',
              icon: <CheckCircle size={16} />,
              total: doneTasks.length,
              tasks: displayedDoneTasks,
              showAll: showAllDone,
              setShowAll: setShowAllDone,
              moveLeft: null,
              moveRight: null,
              accent: draggedOverCol === 'done'
                  ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                  : 'bg-green-500/5 border-green-500/20',
              heading: 'text-green-500 border-green-500/10',
              moreTone: 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20',
              emptyText: 'As entregas concluidas aparecerao aqui.'
          }
      ];

      return (
      <div className="animate-in fade-in duration-500 flex flex-col h-full">
          <div className="mb-6">
              <div className="self-start rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-2xl">
                  <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Quadro de tarefas</p>
                      <h2 className="text-2xl md:text-3xl font-black text-white mt-2 leading-tight">Busca e leitura rapida do kanban</h2>
                      <p className="text-sm text-gray-300 mt-3 max-w-3xl">{boardMessage}</p>

                      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                          {boardStats.map((stat) => (
                              <div key={stat.label} className={`rounded-2xl border p-4 ${stat.tone}`}>
                                  <div className="flex items-center justify-between">
                                      <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-300">{stat.label}</span>
                                      <span>{stat.icon}</span>
                                  </div>
                                  <div className="text-2xl font-black text-white mt-3">{stat.value}</div>
                                  <p className="text-xs text-gray-300 mt-1">{stat.helper}</p>
                              </div>
                          ))}
                      </div>

                      <div className="mt-6 relative">
                          <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
                          <input
                              type="text"
                              placeholder="Buscar tarefas por nome, tag ou responsavel..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onKeyDown={stopKanbanInputKeyDown}
                              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-12 pr-28 text-white focus:border-orange-500 outline-none transition-all"
                          />
                          {hasActiveFilters && (
                              <button
                                  type="button"
                                  onClick={() => setSearchTerm('')}
                                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10"
                              >
                                  <X size={12} /> Limpar
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
          {tacticalAlerts.length > 0 && (
              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                  {tacticalAlerts.map((alert) => (
                      <div key={alert.title} className={`rounded-2xl border p-4 ${alert.tone}`}>
                          <div className="flex items-center gap-2 text-sm font-bold">
                              {alert.icon} {alert.title}
                          </div>
                          <p className="text-xs text-gray-200 mt-2 leading-relaxed">{alert.detail}</p>
                      </div>
                  ))}
              </div>
          )}

          {!isAdmin && viewAsStudent && (
              <div className="mb-6 rounded-[28px] border border-white/10 bg-[#151520] p-6 shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.24em]">
                              <Target size={12} /> Minhas Entregas da Semana
                          </div>
                          <h3 className="text-2xl font-black text-white mt-3">Foco pessoal de {viewAsStudent.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">Acompanhe suas tarefas da semana atual e saiba o que precisa andar primeiro.</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                              <p className="text-2xl font-black text-white">{studentTaskSummary.total}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">tarefas</p>
                          </div>
                          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-center">
                              <p className="text-2xl font-black text-white">{studentTaskSummary.done}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">concluidas</p>
                          </div>
                          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-center">
                              <p className="text-2xl font-black text-white">{studentTaskSummary.review}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">em revisao</p>
                          </div>
                          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                              <p className="text-2xl font-black text-white">{studentTaskSummary.overdue}</p>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">atrasadas</p>
                          </div>
                      </div>
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mt-6">
                      {studentTasksThisWeek.slice(0, 4).map((task) => {
                          const taskStatus = getDeadlineStatus(task.dueDate);
                          return (
                              <div key={task.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                  <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">{task.tag || 'geral'}</span>
                                      <span className={`text-[10px] font-bold ${taskStatus?.color || 'text-gray-500'}`}>{taskStatus?.text || 'Sem prazo'}</span>
                                  </div>
                                  <p className="text-sm text-white font-bold mt-3 leading-relaxed">{task.text}</p>
                                  <div className="mt-3 text-[11px] text-gray-400">
                                      {task.status === 'done' ? 'Concluida' : task.status === 'review' ? 'Aguardando validacao' : task.status === 'doing' ? 'Em execucao' : 'A iniciar'}
                                  </div>
                              </div>
                          );
                      })}
                      {studentTasksThisWeek.length === 0 && (
                          <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
                              <p className="text-sm font-bold text-white">Voce ainda nao tem entregas ligadas a esta semana.</p>
                              <p className="text-xs text-gray-500 mt-2">Use Tarefas para assumir uma tarefa e deixar seu plano visivel.</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

          <div className="flex overflow-x-auto snap-x md:grid md:grid-cols-4 gap-6 flex-1 min-h-[600px] pb-4 custom-scrollbar">
              {columnConfigs.map((column, columnIndex) => {
                  const columnSignal = getColumnSignal(column.id, column.total);
                  const laneGroups = buildLaneGroups(column.tasks);

                  return (
                      <div
                          key={column.id}
                          className={`shrink-0 w-[85vw] md:w-auto snap-center rounded-2xl p-4 flex flex-col border animate-in fade-in slide-in-from-bottom-4 transition-all duration-500 ease-out motion-reduce:animate-none motion-reduce:transition-none ${column.accent}`}
                          onDragOver={(e) => handleDragOver(e, column.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, column.id)}
                          style={{ animationDelay: `${columnIndex * 90}ms`, animationFillMode: 'both' }}
                      >
                          <div className={`border-b pb-3 mb-4 ${column.heading}`}>
                              <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-bold uppercase flex items-center gap-2">
                                      {column.icon} {column.title} ({column.total})
                                  </h3>
                                  {columnSignal && (
                                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${columnSignal.tone}`}>
                                          {columnSignal.label}
                                      </span>
                                  )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-2">{column.subtitle}</p>
                          </div>

                          {column.id === 'todo' && (
                              <form onSubmit={handleAddTaskSubmit} onKeyDown={stopKanbanInputKeyDown} className="mb-4 space-y-2">
                                  <input
                                      name="taskText"
                                      value={kanbanTaskDraft.text}
                                      onChange={(e) => updateKanbanTaskDraft('text', e.target.value)}
                                      onKeyDown={stopKanbanInputKeyDown}
                                      autoComplete="off"
                                      placeholder="+ Nova Tarefa..."
                                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-orange-500 outline-none transition-all"
                                  />
                                  <div className="flex flex-col gap-2 md:flex-row">
                                      <select
                                          name="taskTag"
                                          value={kanbanTaskDraft.tag}
                                          onChange={(e) => updateKanbanTaskDraft('tag', e.target.value)}
                                          onKeyDown={stopKanbanInputKeyDown}
                                          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:border-orange-500 outline-none md:w-1/4"
                                      >
                                          <option value="engenharia">Engenharia</option>
                                          <option value="inovacao">Inovacao</option>
                                          <option value="gestao">Gestao</option>
                                          <option value="geral">Geral</option>
                                      </select>
                                      <select
                                          name="taskPriority"
                                          value={kanbanTaskDraft.priority}
                                          onChange={(e) => updateKanbanTaskDraft('priority', e.target.value)}
                                          onKeyDown={stopKanbanInputKeyDown}
                                          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:border-orange-500 outline-none md:w-1/4"
                                          title="Prioridade"
                                      >
                                          <option value="normal">Normal</option>
                                          <option value="baixa">Baixa</option>
                                          <option value="alta">Alta</option>
                                          <option value="urgente">Urgente</option>
                                      </select>
                                      <input
                                          type="date"
                                          name="taskDate"
                                          value={kanbanTaskDraft.dueDate}
                                          onChange={(e) => updateKanbanTaskDraft('dueDate', e.target.value)}
                                          onKeyDown={stopKanbanInputKeyDown}
                                          min={isAdmin ? undefined : localTodayStr}
                                          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:border-orange-500 outline-none md:w-1/4"
                                          title="Prazo"
                                      />
                                      <button
                                          type="submit"
                                          disabled={!kanbanTaskDraft.text.trim()}
                                          className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900/40 disabled:text-white/50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold uppercase"
                                      >
                                          Criar
                                      </button>
                                  </div>
                              </form>
                          )}

                          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                              {column.tasks.length === 0 && (
                                  <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center bg-black/20">
                                      <p className="text-sm font-bold text-white">{hasActiveFilters ? 'Nada encontrado nessa coluna' : 'Coluna organizada'}</p>
                                      <p className="text-xs text-gray-500 mt-2">{hasActiveFilters ? 'Ajuste a busca para ampliar a visao do quadro.' : column.emptyText}</p>
                                  </div>
                              )}

                              {column.tasks.length > 0 && laneGroups.map((lane, laneIndex) => (
                                  <div
                                      key={`${column.id}-${lane.id}`}
                                      className={`${lane.compact ? '' : 'rounded-2xl border border-white/5 bg-black/20 p-3'} animate-in fade-in slide-in-from-bottom-2 transition-all duration-500 ease-out motion-reduce:animate-none motion-reduce:transition-none`}
                                      style={{ animationDelay: `${Math.min((columnIndex * 90) + (laneIndex * 70), 360)}ms`, animationFillMode: 'both' }}
                                  >
                                      {!lane.compact && (
                                          <div className="flex items-center justify-between gap-2 mb-3">
                                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${lane.color}`}>
                                                  <Tag size={8}/> {lane.label}
                                              </span>
                                              <span className="text-[10px] text-gray-500 font-bold">{lane.tasks.length} tarefa(s)</span>
                                          </div>
                                      )}

                                      <div className="space-y-2">
                                          {lane.tasks.map((task, taskIndex) => (
                                              <TaskCard
                                                  key={task.id}
                                                  t={task}
                                                  showMoveLeft={column.moveLeft}
                                                  showMoveRight={column.moveRight}
                                                  showDelete={true}
                                                  cardIndex={taskIndex}
                                                  laneIndex={laneIndex}
                                                  columnIndex={columnIndex}
                                              />
                                          ))}
                                      </div>
                                  </div>
                              ))}

                              {!column.showAll && !hasActiveFilters && column.total > 10 && (
                                  <button onClick={() => column.setShowAll(true)} className={`w-full py-2 mt-2 border rounded-xl text-xs font-bold transition-colors ${column.moreTone}`}>
                                      Ver mais {column.total - 10} {column.id === 'done' ? 'antigas...' : 'tarefas...'}
                                  </button>
                              )}

                              {column.showAll && !hasActiveFilters && column.total > 10 && (
                                  <button onClick={() => column.setShowAll(false)} className="w-full py-2 mt-2 bg-black/40 hover:bg-white/5 text-gray-500 border border-white/5 rounded-xl text-xs font-bold transition-colors">
                                      Ocultar {column.id === 'done' ? 'antigas' : 'tarefas'}
                                  </button>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
      );
  };

  // --- COMPONENTE DIÁRIO DE BORDO ---
  const DiaryWorkspaceView = () => {
      const currentWeekValue = String(currentWeekData?.id || 'current');
      const prompts = ['Hoje eu testei...', 'O principal aprendizado foi...', 'O que deu errado foi...', 'Na proxima semana quero melhorar...'];
      const formatDiaryDate = (entry, includeTime = false) => getLogbookEntryDate(entry).toLocaleDateString(
          'pt-BR',
          includeTime ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'long', year: 'numeric' }
      );
      const renderTags = (tags) => tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => <span key={tag} className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100">{tag}</span>)}
          </div>
      ) : null;
      const renderEntries = (entries, emptyTitle, emptyDetail, options = {}) => {
          const groups = groupLogbookEntriesByWeek(entries);
          if (!groups.length) {
              return (
                  <div className="rounded-[30px] border border-dashed border-white/10 bg-[#151520] p-10 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-white/5"><BookOpen size={28} className="text-yellow-300" /></div>
                      <h3 className="mt-5 text-2xl font-black text-white">{emptyTitle}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-400">{emptyDetail}</p>
                  </div>
              );
          }

          return (
              <div className="space-y-8">
                  {groups.map((group) => (
                      <section key={group.key} className="space-y-4">
                          <div className="flex items-end justify-between gap-4">
                              <div>
                                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Bloco semanal</p>
                                  <h3 className="mt-2 text-xl font-black text-white">{group.weekName}</h3>
                              </div>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{group.entries.length} registro(s)</span>
                          </div>
                          <div className="grid gap-4 xl:grid-cols-2">
                              {group.entries.map((entry) => {
                                  const tags = getLogbookEntryTags(entry);
                                  const wordCount = getLogbookEntryWordCount(entry);
                                  const readMinutes = Math.max(1, Math.ceil(wordCount / 120));
                                  const timeLabel = formatDiaryDate(entry, true).split(',').slice(-1)[0]?.trim() || 'Horario';
                                  return (
                                      <article key={entry.id} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_26%)]"></div>
                                          <div className="relative z-10">
                                              <div className="flex items-start justify-between gap-4">
                                                  <div className="min-w-0">
                                                      <div className="flex flex-wrap items-center gap-2">
                                                          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100">{entry.weekName || `Semana ${entry.weekId || 'Geral'}`}</span>
                                                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{wordCount} palavras</span>
                                                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{readMinutes} min leitura</span>
                                                      </div>
                                                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                                          {options.showStudentName && <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-200"><UserCircle size={12} /> {entry.studentName}</span>}
                                                          <span className="inline-flex items-center gap-2"><Calendar size={12} className="text-yellow-400" /> {formatDiaryDate(entry)}</span>
                                                          <span className="inline-flex items-center gap-2"><Clock size={12} className="text-cyan-400" /> {timeLabel}</span>
                                                      </div>
                                                  </div>
                                                  <button onClick={() => handleDeleteLogbookEntry(entry)} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-gray-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300" title="Excluir Registro"><Trash2 size={15} /></button>
                                              </div>
                                              <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{entry.text}</p>
                                              {renderTags(tags)}
                                          </div>
                                      </article>
                                  );
                              })}
                          </div>
                      </section>
                  ))}
              </div>
          );
      };

      if (isAdmin) {
          const normalizedStudentQuery = adminLogbookStudentQuery.trim().toLowerCase();
          const normalizedEntryQuery = adminLogbookSearchQuery.trim().toLowerCase();
          const teamEntries = sortLogbookEntries(logbookEntries);
          const selectedStudent = students.find((student) => student.id === adminLogbookStudentId) || null;
          const selectedEntries = adminLogbookStudentId ? teamEntries.filter((entry) => getLogbookStudentId(entry) === adminLogbookStudentId) : [];
          const filteredEntries = selectedEntries.filter((entry) => (!normalizedEntryQuery || [entry.text, entry.weekName, ...getLogbookEntryTags(entry)].filter(Boolean).join(' ').toLowerCase().includes(normalizedEntryQuery)) && (adminLogbookWeekFilter === 'all' || String(entry.weekId ?? 'general') === adminLogbookWeekFilter));
          const studentCards = students.map((student) => {
              const entries = teamEntries.filter((entry) => getLogbookStudentId(entry) === student.id);
              return { ...student, totalEntries: entries.length, currentWeekEntries: currentWeekData ? entries.filter((entry) => String(entry.weekId) === currentWeekValue).length : 0, lastEntry: entries[0] || null };
          }).filter((student) => !normalizedStudentQuery || [student.name, student.role].filter(Boolean).join(' ').toLowerCase().includes(normalizedStudentQuery)).sort((left, right) => right.totalEntries - left.totalEntries || (left.name || '').localeCompare(right.name || '', 'pt-BR'));
          const avgWords = selectedEntries.length ? Math.round(selectedEntries.reduce((total, entry) => total + getLogbookEntryWordCount(entry), 0) / selectedEntries.length) : 0;
          const activeWriterCount = new Set(teamEntries.map((entry) => getLogbookStudentId(entry)).filter(Boolean)).size;
          const hasAdminFilters = Boolean(normalizedEntryQuery) || adminLogbookWeekFilter !== 'all';

          return (
              <div className="animate-in fade-in duration-500 space-y-6 max-w-7xl mx-auto">
                  <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#2c180f] via-[#151520] to-[#0f1726] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                      <div className="grid gap-4 lg:grid-cols-4">
                          <div className="lg:col-span-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">Radar do diario</p>
                              <h3 className="mt-3 text-3xl font-black text-white">Leitura rapida da memoria da equipe.</h3>
                              <p className="mt-3 text-sm leading-relaxed text-gray-300">Veja quem esta registrando com frequencia e mergulhe no historico de cada aluno com busca e filtro por semana.</p>
                          </div>
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Registros totais</p><p className="mt-4 text-3xl font-black text-white">{teamEntries.length}</p><p className="mt-2 text-xs text-gray-400">memoria consolidada</p></div>
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Alunos ativos</p><p className="mt-4 text-3xl font-black text-white">{activeWriterCount}</p><p className="mt-2 text-xs text-gray-400">{selectedEntries.length} no diario atual</p></div>
                      </div>
                  </section>
                  <div className="grid gap-6 lg:grid-cols-4">
                      <aside className="lg:col-span-1 rounded-[30px] border border-white/10 bg-[#151520] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><h3 className="text-base font-bold text-white">Diarios da equipe</h3><p className="mt-1 text-xs text-gray-400">Escolha um aluno para abrir o historico.</p></div><Users size={16} className="text-gray-300" /></div>
                          <div className="relative mt-4"><Search size={16} className="absolute left-4 top-3.5 text-gray-500" /><input type="text" value={adminLogbookStudentQuery} onChange={(e) => setAdminLogbookStudentQuery(e.target.value)} placeholder="Buscar aluno..." className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pl-11 text-sm text-white outline-none focus:border-yellow-500" /></div>
                          <div className="mt-4 max-h-[700px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                              {studentCards.length === 0 && <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5 text-sm text-gray-400">Nenhum aluno encontrado para esse filtro.</div>}
                              {studentCards.map((student) => <button key={student.id} onClick={() => setAdminLogbookStudentId(student.id)} className={`w-full rounded-[24px] border p-4 text-left transition-all ${adminLogbookStudentId === student.id ? 'border-yellow-500/30 bg-yellow-500/10 shadow-[0_14px_36px_rgba(234,179,8,0.12)]' : 'border-white/5 bg-black/30 hover:border-white/15 hover:bg-white/5'}`}><div className="flex items-start gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${student.avatarType === 'mech2' ? 'border-fuchsia-500/50 bg-fuchsia-500/10' : 'border-orange-500/40 bg-orange-500/10'}`}>{student.avatarImage ? <img src={student.avatarImage} alt="Avatar" className="h-9 w-9 rounded-xl object-cover" /> : <UserCircle size={24} className="text-gray-400" />}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate font-bold text-white">{student.name}</p><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{student.totalEntries}</span></div><p className="mt-2 text-[11px] leading-relaxed text-gray-400">{student.currentWeekEntries > 0 ? `${student.currentWeekEntries} registro(s) nesta semana` : 'Sem registro nesta semana'}</p><p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-gray-500">{student.lastEntry ? `Ultimo em ${formatDiaryDate(student.lastEntry)}` : 'Ainda sem historico'}</p></div></div></button>)}
                          </div>
                      </aside>
                      <div className="lg:col-span-3 space-y-6">
                          {selectedStudent ? (
                              <>
                                  <section className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">Painel individual</p><h3 className="mt-3 text-3xl font-black text-white">{selectedStudent.name}</h3><p className="mt-3 text-sm leading-relaxed text-gray-300">{selectedEntries[0] ? getLogbookEntryPreview(selectedEntries[0], 180) : 'Ainda nao ha registros salvos para este aluno.'}</p></div>
                                          <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Registros</p><p className="mt-3 text-3xl font-black text-white">{selectedEntries.length}</p></div><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Semana atual</p><p className="mt-3 text-3xl font-black text-white">{currentWeekData ? selectedEntries.filter((entry) => String(entry.weekId) === currentWeekValue).length : 0}</p></div><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Media</p><p className="mt-3 text-3xl font-black text-white">{avgWords}</p></div></div>
                                      </div>
                                  </section>
                                  <section className="rounded-[30px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Filtros do diario</p><h3 className="mt-2 text-xl font-black text-white">Encontre registros por texto ou semana</h3></div>{hasAdminFilters && <button type="button" onClick={() => { setAdminLogbookSearchQuery(''); setAdminLogbookWeekFilter('all'); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition-all hover:border-white/20 hover:bg-white/10">Limpar filtros</button>}</div>
                                      <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_0.9fr]"><div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-gray-500" /><input type="text" placeholder={`Buscar em ${selectedStudent.name}...`} value={adminLogbookSearchQuery} onChange={(e) => setAdminLogbookSearchQuery(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pl-12 text-white outline-none focus:border-yellow-500" /></div><select value={adminLogbookWeekFilter} onChange={(e) => setAdminLogbookWeekFilter(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500">{buildLogbookWeekOptions(selectedEntries).map((option) => <option key={option.value} value={option.value} className="bg-[#0f0f17]">{option.label}</option>)}</select></div>
                                  </section>
                                  {renderEntries(filteredEntries, 'Nenhum registro encontrado', hasAdminFilters ? 'Esse aluno nao possui entradas com os filtros atuais.' : 'Esse aluno ainda nao registrou aprendizados no diario.')}
                              </>
                          ) : (
                              <div className="flex min-h-[420px] items-center justify-center rounded-[30px] border-2 border-dashed border-white/10 bg-[#151520] p-8 text-center"><div><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/5"><BookOpen size={30} className="text-yellow-300" /></div><h3 className="mt-5 text-2xl font-black text-white">Escolha um diario para analisar</h3><p className="mt-3 text-sm leading-relaxed text-gray-400">Selecione um aluno no painel lateral para abrir o historico e localizar registros especificos.</p></div></div>
                          )}
                      </div>
                  </div>
              </div>
          );
      }

      const normalizedStudentQuery = studentLogbookSearchQuery.trim().toLowerCase();
      const studentEntries = sortLogbookEntries(logbookEntries);
      const filteredEntries = studentEntries.filter((entry) => (!normalizedStudentQuery || [entry.text, entry.weekName, ...getLogbookEntryTags(entry)].filter(Boolean).join(' ').toLowerCase().includes(normalizedStudentQuery)) && (studentLogbookWeekFilter === 'all' || String(entry.weekId ?? 'general') === studentLogbookWeekFilter));
      const draftWordCount = studentLogbookDraft.trim().split(/\s+/).filter(Boolean).length;
      const draftTags = Array.from(new Set((studentLogbookDraft.match(/#[^\s#]+/g) || []).map((tag) => tag.toLowerCase())));
      const latestEntry = studentEntries[0] || null;
      const entriesThisWeek = currentWeekData ? studentEntries.filter((entry) => String(entry.weekId) === currentWeekValue).length : 0;
      const weeksCovered = new Set(studentEntries.map((entry) => String(entry.weekId ?? 'general'))).size;
      const averageStudentWords = studentEntries.length ? Math.round(studentEntries.reduce((total, entry) => total + getLogbookEntryWordCount(entry), 0) / studentEntries.length) : 0;
      const hasStudentFilters = Boolean(normalizedStudentQuery) || studentLogbookWeekFilter !== 'all';

      return (
          <div className="animate-in fade-in duration-500 space-y-6 max-w-6xl mx-auto">
              <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#102036] via-[#151520] to-[#22140f] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                  <div className="grid gap-4 lg:grid-cols-4">
                      <div className="lg:col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">Diario de bordo</p>
                          <h3 className="mt-3 text-3xl font-black text-white">Transforme cada semana em memoria util.</h3>
                          <p className="mt-3 text-sm leading-relaxed text-gray-300">Seu diario agora salva rascunho, organiza por semana e deixa o historico muito mais facil de consultar.</p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Registros</p><p className="mt-4 text-3xl font-black text-white">{studentEntries.length}</p><p className="mt-2 text-xs text-gray-400">historico pessoal</p></div>
                      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Semana atual</p><p className="mt-4 text-3xl font-black text-white">{entriesThisWeek}</p><p className="mt-2 text-xs text-gray-400">{currentWeekData?.weekName || 'semana ativa'}</p></div>
                      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Semanas cobertas</p><p className="mt-4 text-3xl font-black text-white">{weeksCovered}</p><p className="mt-2 text-xs text-gray-400">com registros salvos</p></div>
                      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Media</p><p className="mt-4 text-3xl font-black text-white">{averageStudentWords}</p><p className="mt-2 text-xs text-gray-400">palavras por registro</p></div>
                  </div>
              </section>
              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                  <section className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">Novo registro</p><h3 className="mt-2 text-2xl font-black text-white">Escreva o que vale lembrar</h3><p className="mt-3 text-sm leading-relaxed text-gray-400">Registre testes, falhas, aprendizados e proximos passos para a equipe retomar rapido depois.</p></div><div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200"><CheckCircle size={14} /> Rascunho salvo automaticamente</div></div>
                      <form onSubmit={handleLogbookSubmit} className="mt-6 space-y-5">
                          <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
                              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100">{currentWeekData?.weekName || 'Semana atual'}</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{draftWordCount} palavras</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">{draftTags.length} hashtag(s)</span></div>
                              <textarea name="entry" value={studentLogbookDraft} onChange={(e) => setStudentLogbookDraft(e.target.value)} className="mt-4 h-40 w-full resize-none rounded-[24px] border border-white/10 bg-[#0d0d14] p-4 text-white outline-none transition-all placeholder:text-gray-500 focus:border-yellow-500" placeholder="O que aprendemos nesta semana? O que deu errado, como resolvemos e o que precisa acontecer depois?" />
                              {renderTags(draftTags)}
                          </div>
                          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Atalhos para destravar a escrita</p><div className="mt-3 flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setStudentLogbookDraft((current) => current.trim() ? `${current}\n${prompt}` : prompt)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 transition-all hover:border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-100">{prompt}</button>)}</div></div>
                          <div className="flex flex-col gap-4 rounded-[26px] border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="text-sm text-gray-400">Dica: use hashtags como <span className="font-semibold text-yellow-200">#teste</span>, <span className="font-semibold text-yellow-200">#erro</span> e <span className="font-semibold text-yellow-200">#ideia</span> para achar temas depois.</div><button type="submit" disabled={!studentLogbookDraft.trim()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-black text-black transition-all hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-yellow-500/40 disabled:text-black/60"><Plus size={18} /> Salvar registro</button></div>
                      </form>
                  </section>
                  <aside className="space-y-6"><section className="rounded-[30px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">Painel rapido</p><h3 className="mt-2 text-xl font-black text-white">Seu ultimo destaque</h3><p className="mt-3 text-sm leading-relaxed text-gray-400">{latestEntry ? getLogbookEntryPreview(latestEntry, 180) : 'Ainda nao existe nenhum registro salvo. O primeiro texto que voce gravar aparece aqui como destaque.'}</p><div className="mt-5 space-y-3"><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Ultima atualizacao</p><p className="mt-3 text-lg font-black text-white">{latestEntry ? formatDiaryDate(latestEntry) : 'Sem registros'}</p><p className="mt-2 text-xs text-gray-400">{latestEntry?.weekName || 'Esperando primeiro diario'}</p></div><div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Escreva melhor</p><p className="mt-3 text-sm leading-relaxed text-gray-400">Contexto, decisao e proximo passo costumam gerar registros mais fortes e uteis para revisao.</p></div></div></section></aside>
              </div>
              <section className="rounded-[30px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Historico filtrado</p><h3 className="mt-2 text-xl font-black text-white">Busque e releia seus registros</h3></div>{hasStudentFilters && <button type="button" onClick={() => { setStudentLogbookSearchQuery(''); setStudentLogbookWeekFilter('all'); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition-all hover:border-white/20 hover:bg-white/10">Limpar filtros</button>}</div>
                  <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_0.9fr]"><div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-gray-500" /><input type="text" placeholder="Buscar por texto, semana ou hashtag..." value={studentLogbookSearchQuery} onChange={(e) => setStudentLogbookSearchQuery(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pl-12 text-white outline-none focus:border-yellow-500" /></div><select value={studentLogbookWeekFilter} onChange={(e) => setStudentLogbookWeekFilter(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500">{buildLogbookWeekOptions(studentEntries).map((option) => <option key={option.value} value={option.value} className="bg-[#0f0f17]">{option.label}</option>)}</select></div>
              </section>
              {renderEntries(filteredEntries, 'Nenhum registro encontrado', hasStudentFilters ? 'Nenhum item combinou com os filtros atuais. Ajuste a busca ou volte para todas as semanas.' : 'Nenhum registro ainda. Comece escrevendo o que aconteceu nesta semana.')}
          </div>
      );
  };

  const LogbookView = () => {
      return <DiaryWorkspaceView />;
/*

      const currentWeekValue = String(currentWeekData?.id || 'current');
      const promptSuggestions = [
          'Hoje eu testei...',
          'O principal aprendizado foi...',
          'O que deu errado foi...',
          'Na proxima semana quero melhorar...',
          'Evidencia importante: ...'
      ];

      const formatDiaryDate = (entry, includeTime = false) => getLogbookEntryDate(entry).toLocaleDateString(
          'pt-BR',
          includeTime
              ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
              : { day: '2-digit', month: 'long', year: 'numeric' }
      );

      const renderTagRow = (tags) => {
          if (!tags.length) return null;

          return (
              <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100">
                          {tag}
                      </span>
                  ))}
              </div>
          );
      };

      const renderDiaryEntryCard = (entry, { showStudentName = false } = {}) => {
          const tags = getLogbookEntryTags(entry);
          const wordCount = getLogbookEntryWordCount(entry);
          const readMinutes = Math.max(1, Math.ceil(wordCount / 120));
          const timeLabel = formatDiaryDate(entry, true).split(',').slice(-1)[0]?.trim() || 'Horario';

          return (
              <article key={entry.id} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#151520] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition-all hover:border-white/20 hover:bg-[#181825]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_26%)] pointer-events-none"></div>
                  <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-100">
                                      {entry.weekName || `Semana ${entry.weekId || 'Geral'}`}
                                  </span>
                                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
                                      {wordCount} palavras
                                  </span>
                                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                      {readMinutes} min leitura
                                  </span>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                  {showStudentName && (
                                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-200">
                                          <UserCircle size={12} /> {entry.studentName}
                                      </span>
                                  )}
                                  <span className="inline-flex items-center gap-2">
                                      <Calendar size={12} className="text-yellow-400" /> {formatDiaryDate(entry)}
                                  </span>
                                  <span className="inline-flex items-center gap-2">
                                      <Clock size={12} className="text-cyan-400" /> {timeLabel}
                                  </span>
                              </div>
                          </div>

                          <button onClick={() => handleDeleteLogbookEntry(entry)} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-gray-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300" title="Excluir Registro">
                              <Trash2 size={15} />
                          </button>
                      </div>

                      <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{entry.text}</p>
                      {renderTagRow(tags)}
                  </div>
              </article>
          );
      };

      const renderDiaryGroups = (groups, emptyTitle, emptyDetail, options = {}) => {
          if (groups.length === 0) {
              return (
                  <div className="rounded-[30px] border border-dashed border-white/10 bg-[#151520] p-10 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-white/5">
                          <BookOpen size={28} className="text-yellow-300" />
                      </div>
                      <h3 className="mt-5 text-2xl font-black text-white">{emptyTitle}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-400">{emptyDetail}</p>
                  </div>
              );
          }

          return (
              <div className="space-y-8">
                  {groups.map((group) => (
                      <section key={group.key} className="space-y-4">
                          <div className="flex items-end justify-between gap-4">
                              <div>
                                  <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Bloco semanal</p>
                                  <h3 className="mt-2 text-xl font-black text-white">{group.weekName}</h3>
                              </div>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
                                  {group.entries.length} registro(s)
                              </span>
                          </div>

                          <div className="grid gap-4 xl:grid-cols-2">
                              {group.entries.map((entry) => renderDiaryEntryCard(entry, options))}
                          </div>
                      </section>
                  ))}
              </div>
          );
      };

      // --- VISÃO DO TÉCNICO ---
      if (isAdmin) {
          const entriesForSelectedStudent = adminLogbookStudentId
              ? logbookEntries.filter(entry => {
                  const pathParts = entry.refPath.split('/');
                  // O caminho é students/STUDENT_ID/logbook/ENTRY_ID
                  return pathParts.length > 1 && pathParts[1] === adminLogbookStudentId;
              })
              : [];
          
          const filteredEntries = adminLogbookSearchQuery
              ? entriesForSelectedStudent.filter(entry => 
                  [entry.text, entry.weekName].filter(Boolean).join(' ').toLowerCase().includes(adminLogbookSearchQuery.toLowerCase())
                )
              : entriesForSelectedStudent;
          
          const selectedStudent = students.find(s => s.id === adminLogbookStudentId);
          const teamEntries = sortLogbookEntries(logbookEntries);
          const teamCurrentWeekEntries = currentWeekData ? teamEntries.filter((entry) => String(entry.weekId) === currentWeekValue).length : 0;
          const studentCards = students.map((student) => {
              const totalEntries = teamEntries.filter((entry) => getLogbookStudentId(entry) === student.id).length;
              const lastEntry = teamEntries.find((entry) => getLogbookStudentId(entry) === student.id) || null;
              return { ...student, totalEntries, lastEntry };
          });
          const weekFilteredEntries = adminLogbookWeekFilter === 'all'
              ? filteredEntries
              : filteredEntries.filter((entry) => String(entry.weekId) === adminLogbookWeekFilter);
          const groupedEntries = groupLogbookEntriesByWeek(weekFilteredEntries);
          const adminWeekOptions = buildLogbookWeekOptions(entriesForSelectedStudent);

          return (
              <div className="animate-in fade-in duration-500 space-y-6 max-w-7xl mx-auto">
                  <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#2b1d13] via-[#151520] to-[#101018] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_24%)] pointer-events-none"></div>
                      <div className="relative z-10 grid gap-4 md:grid-cols-4">
                          <div className="md:col-span-2">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-200 font-bold">Leitura do tecnico</p>
                              <h3 className="mt-3 text-2xl font-black text-white">Diario da equipe com foco em volume, frequencia e historico.</h3>
                              <p className="mt-3 text-sm text-gray-300">Selecione um aluno para ver a memoria dele e acompanhe quem esta registrando a temporada com consistencia.</p>
                          </div>
                          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Registros totais</p>
                              <p className="mt-4 text-3xl font-black text-white">{teamEntries.length}</p>
                              <p className="mt-2 text-xs text-gray-400">memoria consolidada</p>
                          </div>
                          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Semana atual</p>
                              <p className="mt-4 text-3xl font-black text-white">{teamCurrentWeekEntries}</p>
                              <p className="mt-2 text-xs text-gray-400">{currentWeekData?.weekName || 'semana ativa'}</p>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1 bg-[#151520] border border-white/10 rounded-[28px] p-4 h-fit shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                      <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                          <Users size={16}/> Diários da Equipe
                      </h3>
                      <div className="relative mb-4">
                          <Search size={16} className="absolute left-4 top-3.5 text-gray-500" />
                          <input
                              type="text"
                              value={adminLogbookStudentQuery}
                              onChange={(e) => setAdminLogbookStudentQuery(e.target.value)}
                              placeholder="Buscar aluno..."
                              className="w-full bg-black/20 border border-white/10 rounded-2xl p-3 pl-11 text-sm text-white focus:border-yellow-500 outline-none"
                          />
                      </div>
                      <div className="space-y-2 max-h-[680px] overflow-y-auto custom-scrollbar pr-1">
                          {studentCards.map(student => (
                              <button 
                                  key={student.id} 
                                  onClick={() => setAdminLogbookStudentId(student.id)}
                                  className={`w-full text-left p-3 rounded-2xl transition-colors text-sm ${adminLogbookStudentId === student.id ? 'bg-yellow-500/15 border border-yellow-500/30 text-white shadow-[0_10px_30px_rgba(234,179,8,0.12)]' : 'bg-black/30 border border-white/5 hover:bg-white/10 text-white'}`}
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={`p-1 rounded-full border ${student.avatarType === 'mech2' ? 'border-fuchsia-500' : 'border-orange-500'}`}>
                                          {student.avatarImage ? (
                                             <img src={student.avatarImage} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                                         ) : (
                                             <UserCircle size={20} className="text-gray-500" />
                                         )}
                                      </div>
                                      <div className="min-w-0">
                                          <p className="font-bold truncate">{student.name}</p>
                                          <p className="text-[10px] text-gray-400 mt-1">{student.totalEntries} registro(s){student.lastEntry ? ` • ${formatDiaryDate(student.lastEntry)}` : ''}</p>
                                      </div>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="lg:col-span-3">
                      {adminLogbookStudentId && (
                          <div className="relative mb-6">
                              <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
                              <input 
                                  type="text"
                                  placeholder={`Buscar no diário de ${selectedStudent?.name}...`}
                                  value={adminLogbookSearchQuery}
                                  onChange={(e) => setAdminLogbookSearchQuery(e.target.value)}
                                  className="w-full bg-[#151520] border border-white/10 rounded-xl p-3 pl-12 text-white focus:border-yellow-500 outline-none"
                              />
                          </div>
                      )}
                      {!adminLogbookStudentId ? (
                          <div className="h-full min-h-[400px] flex items-center justify-center bg-[#151520] border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
                              <div>
                                  <BookOpen size={48} className="text-gray-600 mx-auto mb-4"/>
                                  <p className="text-gray-400 font-bold">Selecione um aluno à esquerda</p>
                                  <p className="text-sm text-gray-500">para visualizar seu diário de bordo individual.</p>
                              </div>
                          </div>
                      ) : (
                          <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8">
                              {filteredEntries.length === 0 && (
                                  <div className="text-gray-500 italic">
                                      Nenhum registro para <span className="font-bold">{selectedStudent?.name}</span> ainda.
                                  </div>
                              )}
                              {filteredEntries.map(entry => (
                                  <div key={entry.id} className="relative group">
                                      <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-[#151520] border-2 border-yellow-500 flex items-center justify-center"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div></div>
                                      <div className="bg-black/40 border border-white/5 p-6 rounded-xl hover:bg-white/5 transition-all">
                                          <div className="flex justify-between items-start mb-3">
                                              <div className="flex items-center gap-3">
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-blue-600 text-white`}>{entry.studentName.charAt(0)}</div>
                                                  <div>
                                                      <span className="text-white font-bold text-sm block">{entry.studentName}</span>
                                                      <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={10}/> {entry.weekName || "Semana Geral"}<span className="mx-1">•</span><Timer size={10}/> {new Date(entry.date).toLocaleDateString()}</span>
                                                  </div>
                                              </div>
                                          </div>
                                          <button onClick={() => handleDeleteLogbookEntry(entry)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 transition-colors" title="Excluir Registro"><Trash2 size={16} /></button>
                                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          );
      }

      // --- Lógica de filtro para o aluno ---
      const filteredEntries = searchTerm
          ? logbookEntries.filter(entry => 
              entry.text.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : logbookEntries;

      // --- VISÃO DO ALUNO (Permanece a mesma) ---
      return (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
              <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Book className="text-yellow-500"/> Diário de Bordo Semanal</h3>
                  <p className="text-gray-400 text-sm mb-4">Registrando aprendizados da <strong className="text-yellow-500">{currentWeekData?.weekName || "Semana Atual"}</strong></p>
                  <form onSubmit={handleLogbookSubmit}>
                      <textarea name="entry" className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-yellow-500 outline-none h-32 resize-none mb-4" placeholder="O que aprendemos nesta semana? O que deu errado e como resolvemos?"></textarea>
                      <button className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-yellow-900/20"><Plus size={18}/> Salvar Registro da Semana</button>
                  </form>
              </div>
              <div className="relative mb-6">
                  <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
                  <input 
                      type="text"
                      placeholder="Buscar nos meus registros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#151520] border border-white/10 rounded-xl p-3 pl-12 text-white focus:border-yellow-500 outline-none"
                  />
              </div>
              <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8">
                  {filteredEntries.length === 0 && <p className="text-gray-500 italic">{searchTerm ? 'Nenhum registro encontrado.' : 'Nenhum registro ainda. Comece o diário!'}</p>}
                  {filteredEntries.map(entry => (
                      <div key={entry.id} className="relative group">
                          <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-[#151520] border-2 border-yellow-500 flex items-center justify-center"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div></div>
                          <div className="bg-black/40 border border-white/5 p-6 rounded-xl hover:bg-white/5 transition-all">
                              <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-blue-600 text-white`}>{entry.studentName.charAt(0)}</div>
                                      <div>
                                          <span className="text-white font-bold text-sm block">{entry.studentName}</span>
                                          <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={10}/> {entry.weekName || "Semana Geral"}<span className="mx-1">•</span><Timer size={10}/> {new Date(entry.date).toLocaleDateString()}</span>
                                      </div>
                                  </div>
                              </div>
                              <button onClick={() => handleDeleteLogbookEntry(entry)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 transition-colors" title="Excluir Registro"><Trash2 size={16} /></button>
                              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
*/
  }

  // --- COMPONENTE DE AGENDA ---
  const AgendaWorkspaceView = () => {
      const normalizedQuery = agendaSearchQuery.trim().toLowerCase();
      const matchesTextAndType = (event) => {
          const matchesType = agendaTypeFilter === 'all' || (event.type || 'Outro') === agendaTypeFilter;
          const haystack = [event.title, event.description, event.location, event.author]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();

          return matchesType && (!normalizedQuery || haystack.includes(normalizedQuery));
      };

      const baseAgendaEvents = [...events]
          .filter(matchesTextAndType)
          .sort(compareEventsByDate);

      const filteredAgendaEvents = baseAgendaEvents.filter((event) => matchesAgendaScope(event, agendaScopeFilter));
      const filteredUpcomingEvents = filteredAgendaEvents.filter((event) => getAgendaDayOffset(event.date) >= 0);
      const filteredPastEvents = filteredAgendaEvents
          .filter((event) => getAgendaDayOffset(event.date) < 0)
          .sort((left, right) => compareEventsByDate(right, left));

      const immediateEvents = filteredUpcomingEvents.filter((event) => getAgendaDayOffset(event.date) <= 1);
      const weekEvents = filteredUpcomingEvents.filter((event) => {
          const dayOffset = getAgendaDayOffset(event.date);
          return dayOffset >= 2 && dayOffset <= 7;
      });
      const laterEvents = filteredUpcomingEvents.filter((event) => getAgendaDayOffset(event.date) > 7);

      const upcomingMatches = baseAgendaEvents.filter((event) => getAgendaDayOffset(event.date) >= 0);
      const pastMatches = baseAgendaEvents
          .filter((event) => getAgendaDayOffset(event.date) < 0)
          .sort((left, right) => compareEventsByDate(right, left));

      const agendaScopeOptions = [
          { id: 'all', label: 'Visao completa', count: baseAgendaEvents.length },
          { id: 'urgent', label: 'Hoje e amanha', count: upcomingMatches.filter((event) => getAgendaDayOffset(event.date) <= 1).length },
          { id: 'week', label: '7 dias', count: upcomingMatches.filter((event) => getAgendaDayOffset(event.date) <= 7).length },
          { id: 'upcoming', label: 'Proximos marcos', count: upcomingMatches.length },
          { id: 'past', label: 'Historico', count: pastMatches.length }
      ];

      const nextAgendaEvent = filteredUpcomingEvents[0] || upcomingMatches[0] || null;
      const spotlightHistoryEvent = filteredPastEvents[0] || pastMatches[0] || null;
      const spotlightEvent = nextAgendaEvent || spotlightHistoryEvent;
      const spotlightLabel = nextAgendaEvent ? 'Proximo compromisso' : spotlightHistoryEvent ? 'Ultimo registro' : 'Sem compromissos ativos';
      const highlightedPriorityCount = upcomingMatches.filter((event) => ['alta', 'critica'].includes(getEventPriorityValue(event))).length;
      const confirmedCount = upcomingMatches.filter((event) => getEventStatusValue(event) === 'confirmado').length;
      const hasActiveFilters = Boolean(normalizedQuery) || agendaTypeFilter !== 'all' || agendaScopeFilter !== 'all';

      const clearAgendaFilters = () => {
          setAgendaSearchQuery('');
          setAgendaTypeFilter('all');
          setAgendaScopeFilter('all');
      };

      const renderAgendaCard = (event, { spotlight = false, muted = false } = {}) => {
          const typeMeta = getEventTypeMeta(event.type);
          const priorityMeta = getEventPriorityMeta(getEventPriorityValue(event));
          const statusValue = getEventStatusValue(event);
          const statusMeta = getEventStatusMeta(statusValue);
          const canManageEvent = isAdmin || event.author === viewAsStudent?.name;
          const nextStatusLabel = statusValue === 'planejado'
              ? 'Confirmar'
              : statusValue === 'confirmado'
                  ? 'Concluir'
                  : 'Reabrir';

          return (
              <article
                  key={event.id}
                  className={`group relative overflow-hidden rounded-[30px] border bg-[#13131d] p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] transition-all ${spotlight ? 'border-indigo-400/35 shadow-[0_25px_70px_rgba(79,70,229,0.18)]' : 'border-white/10 hover:border-white/20'} ${muted ? 'opacity-80' : ''}`}
              >
                  <div className={`absolute inset-0 bg-gradient-to-br ${typeMeta.accent} pointer-events-none opacity-80`}></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%)] pointer-events-none"></div>

                  {spotlight && (
                      <div className="absolute -top-3 left-5 rounded-full border border-yellow-400/30 bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black shadow-lg">
                          Radar imediato
                      </div>
                  )}

                  <div className="relative z-10 flex h-full flex-col gap-5">
                      <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${typeMeta.tone}`}>
                                  {typeMeta.label}
                              </span>
                              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${priorityMeta.tone}`}>
                                  {priorityMeta.label}
                              </span>
                              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusMeta.tone}`}>
                                  {statusMeta.label}
                              </span>
                          </div>

                          {canManageEvent && (
                              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button type="button" onClick={() => setModal({type: 'eventForm', data: event})} className="rounded-xl border border-white/10 bg-black/35 p-2 text-gray-300 hover:bg-white/10 hover:text-white">
                                      <Pencil size={14}/>
                                  </button>
                                  <button type="button" onClick={() => handleDeleteEvent(event.id)} className="rounded-xl border border-white/10 bg-black/35 p-2 text-gray-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300">
                                      <Trash2 size={14}/>
                                  </button>
                              </div>
                          )}
                      </div>

                      <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{getAgendaRelativeLabel(event.date)}</p>
                          <h3 className="mt-3 text-xl font-black leading-tight text-white">{event.title}</h3>
                          {event.description && (
                              <p className="mt-3 text-sm leading-relaxed text-gray-300">{event.description}</p>
                          )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Data</p>
                              <div className="mt-2 flex items-center gap-2 text-sm text-white">
                                  <CalendarDays size={14} className="text-blue-400" />
                                  {formatAgendaDate(event.date, { weekday: 'short', day: '2-digit', month: 'long' })}
                              </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Horario</p>
                              <div className="mt-2 flex items-center gap-2 text-sm text-white">
                                  <Clock size={14} className="text-yellow-400" />
                                  {event.time || 'A definir'}
                              </div>
                          </div>
                          {event.location && (
                              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                                  <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Local / Link</p>
                                  <div className="mt-2 flex items-center gap-2 text-sm text-white">
                                      <MapPin size={14} className="text-emerald-400" />
                                      {event.location}
                                  </div>
                              </div>
                          )}
                          {event.author && (
                              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                                  <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Responsavel pelo registro</p>
                                  <div className="mt-2 flex items-center gap-2 text-sm text-white">
                                      <UserCircle size={14} className="text-gray-400" />
                                      {event.author}
                                  </div>
                              </div>
                          )}
                      </div>

                      {canManageEvent && (
                          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                              <button
                                  type="button"
                                  onClick={() => handleCycleEventStatus(event)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs font-bold text-cyan-100 transition-all hover:bg-cyan-500 hover:text-white"
                              >
                                  <CheckCircle size={14} />
                                  {nextStatusLabel}
                              </button>
                          </div>
                      )}
                  </div>
              </article>
          );
      };

      const renderAgendaSection = (title, helper, items, options = {}) => {
          if (items.length === 0) return null;

          return (
              <section className="space-y-4">
                  <div className="flex items-end justify-between gap-4">
                      <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">{title}</p>
                          <h3 className="mt-2 text-xl font-black text-white">{helper}</h3>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
                          {items.length} evento(s)
                      </span>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                      {items.map((event, index) => renderAgendaCard(event, { spotlight: options.highlightFirst && index === 0, muted: options.muted }))}
                  </div>
              </section>
          );
      };

      return (
          <div className="animate-in fade-in duration-500 space-y-8">
              <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#161b33] via-[#151520] to-[#101018] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_28%)] pointer-events-none"></div>
                  <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
                      <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-200">
                              <CalendarDays size={12} /> Radar da equipe
                          </span>
                          <h2 className="mt-4 text-3xl font-black leading-tight text-white">Agenda da equipe em modo radar: o que vem agora, o que merece preparo e o que ja virou historia.</h2>
                          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
                              Use esta visao para bater o olho e entender o que pede acao rapida, o que ja esta perto e o que pode ser organizado com mais calma pela equipe.
                          </p>

                          <div className="mt-6 flex flex-wrap gap-3">
                              <button onClick={() => setModal({type: 'eventForm'})} className="inline-flex items-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs font-bold text-indigo-100 transition-all hover:bg-indigo-500 hover:text-white">
                                  <Plus size={16}/> Novo evento
                              </button>
                              <button onClick={() => setAgendaScopeFilter('urgent')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-gray-200 transition-all hover:bg-white/10 hover:text-white">
                                  <AlertTriangle size={16}/> So urgentes
                              </button>
                          </div>

                          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">{spotlightLabel}</p>
                              {spotlightEvent ? (
                                  <div className="mt-3">
                                      <p className="text-lg font-black text-white">{spotlightEvent.title}</p>
                                      <p className="mt-2 text-sm text-gray-300">
                                          {getAgendaRelativeLabel(spotlightEvent.date)} • {formatAgendaDate(spotlightEvent.date, { day: '2-digit', month: 'long' })} • {spotlightEvent.time || 'Horario a definir'}
                                      </p>
                                  </div>
                              ) : (
                                  <p className="mt-3 text-sm text-gray-400">Cadastre o proximo evento para transformar a agenda num radar real da equipe.</p>
                              )}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          {[
                              { label: 'Missao relampago', value: immediateEvents.length, helper: 'hoje e amanha', tone: 'border-red-500/20 bg-red-500/10 text-red-100', icon: <AlertTriangle size={14} /> },
                              { label: 'Semana em foco', value: upcomingMatches.filter((event) => getAgendaDayOffset(event.date) <= 7).length, helper: 'janela curta', tone: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-100', icon: <CalendarDays size={14} /> },
                              { label: 'Alertas quentes', value: highlightedPriorityCount, helper: 'pedem preparo', tone: 'border-orange-500/20 bg-orange-500/10 text-orange-100', icon: <Flag size={14} /> },
                              { label: 'Ja confirmados', value: confirmedCount, helper: 'prontos para acontecer', tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100', icon: <CheckCircle size={14} /> }
                          ].map((metric) => (
                              <div key={metric.label} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                                  <div className="flex items-center justify-between gap-3">
                                      <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">{metric.label}</span>
                                      <span className={`rounded-xl border px-2 py-1 ${metric.tone}`}>{metric.icon}</span>
                                  </div>
                                  <p className="mt-4 text-3xl font-black text-white">{metric.value}</p>
                                  <p className="mt-2 text-xs text-gray-400">{metric.helper}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </section>

              <section className="rounded-[30px] border border-white/10 bg-[#151520] p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                  <div className="grid gap-4 xl:grid-cols-[1fr,260px]">
                      <div className="relative">
                          <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
                          <input
                              type="text"
                              value={agendaSearchQuery}
                              onChange={(e) => setAgendaSearchQuery(e.target.value)}
                              placeholder="Buscar por titulo, local, descricao ou autor..."
                              className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pl-12 text-sm text-white outline-none transition-all focus:border-indigo-400"
                          />
                      </div>

                      <select
                          value={agendaTypeFilter}
                          onChange={(e) => setAgendaTypeFilter(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none transition-all focus:border-indigo-400"
                      >
                          <option value="all">Todos os tipos</option>
                          {EVENT_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                      {agendaScopeOptions.map((option) => (
                          <button
                              key={option.id}
                              type="button"
                              onClick={() => setAgendaScopeFilter(option.id)}
                              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${agendaScopeFilter === option.id ? 'border-indigo-500/30 bg-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                          >
                              {option.label}
                              <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">
                                  {option.count}
                              </span>
                          </button>
                      ))}

                      {hasActiveFilters && (
                          <button
                              type="button"
                              onClick={clearAgendaFilters}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                          >
                              <XCircle size={14} /> Limpar filtros
                          </button>
                      )}
                  </div>
              </section>

              {filteredUpcomingEvents.length === 0 && filteredPastEvents.length === 0 ? (
                  <div className="rounded-[30px] border border-dashed border-white/10 bg-[#151520] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-white/5">
                          <CalendarDays size={26} className="text-indigo-300" />
                      </div>
                      <h3 className="mt-5 text-2xl font-black text-white">Nenhum compromisso encontrado.</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-400">
                          {hasActiveFilters ? 'Os filtros atuais nao encontraram eventos. Limpe a busca ou troque o recorte.' : 'Cadastre o primeiro evento para transformar a agenda num painel vivo da equipe.'}
                      </p>
                  </div>
              ) : (
                  <div className="space-y-8">
                      {renderAgendaSection('Agora ou proximo', 'Eventos que pedem reacao rapida', immediateEvents, { highlightFirst: true })}
                      {renderAgendaSection('Esta semana', 'Janela curta para preparar sem correria', weekEvents)}
                      {renderAgendaSection('Mais pra frente', 'Marcos que podem ser organizados com calma', laterEvents)}

                      {(agendaScopeFilter === 'all' || agendaScopeFilter === 'past') && filteredPastEvents.length > 0 && (
                          <section className="space-y-4 border-t border-white/10 pt-8">
                              <div className="flex items-end justify-between gap-4">
                                  <div>
                                      <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Memoria da equipe</p>
                                      <h3 className="mt-2 text-xl font-black text-white">Eventos que ja passaram e viraram historico</h3>
                                  </div>
                                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
                                      {filteredPastEvents.length} registro(s)
                                  </span>
                              </div>

                              <div className="grid gap-4 xl:grid-cols-2">
                                  {filteredPastEvents.map((event) => renderAgendaCard(event, { muted: true }))}
                              </div>
                          </section>
                      )}
                  </div>
              )}
          </div>
      );
  };

  const AgendaView = () => {
      return <AgendaWorkspaceView />;
      const todayDate = new Date().toISOString().split('T')[0];
      
      // Separa entre próximos eventos e eventos que já passaram
      const upcomingEvents = events.filter(e => e.date >= todayDate).sort((a,b) => new Date(a.date) - new Date(b.date));
      const pastEvents = events.filter(e => e.date < todayDate).sort((a,b) => new Date(b.date) - new Date(a.date));

      const getTypeColor = (type) => {
          if(type === 'Especialista') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
          if(type === 'Visita') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
          if(type === 'Reunião') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
          return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      }

      return (
          <div className="animate-in fade-in duration-500 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#151520] p-6 rounded-2xl border border-white/10 gap-4">
                  <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2"><CalendarDays className="text-blue-500"/> Agenda da Equipe</h2>
                      <p className="text-gray-400 text-sm mt-1">Acompanhe visitas, encontros com especialistas e eventos importantes.</p>
                  </div>
                  <button onClick={() => setModal({type: 'eventForm'})} className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                      <Plus size={16}/> Novo Evento
                  </button>
              </div>

              <div className="space-y-4">
                  <h3 className="text-gray-400 font-bold uppercase text-xs flex items-center gap-2 ml-2">Próximos Eventos</h3>
                  {upcomingEvents.length === 0 ? (
                      <div className="bg-[#151520] border border-dashed border-white/10 p-8 rounded-xl text-center text-gray-500 italic">Nenhum evento agendado para o futuro.</div>
                  ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {upcomingEvents.map((ev, index) => (
                              <div key={ev.id} className={`bg-[#151520] border ${index === 0 ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)] md:scale-[1.02] z-10' : 'border-white/10'} p-5 rounded-xl hover:border-white/30 transition-all group relative`}>
                                  {index === 0 && (
                                      <div className="absolute -top-3 left-4 bg-yellow-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-md flex items-center gap-1">
                                          <AlertTriangle size={10}/> Próximo
                                      </div>
                                  )}
                                  {(isAdmin || ev.author === viewAsStudent?.name) && (
                                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => setModal({type: 'eventForm', data: ev})} className="text-gray-400 hover:text-white p-1.5 bg-black/50 rounded-lg backdrop-blur-sm"><Pencil size={14}/></button>
                                          <button onClick={() => handleDeleteEvent(ev.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/50 rounded-lg backdrop-blur-sm"><Trash2 size={14}/></button>
                                      </div>
                                  )}
                                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getTypeColor(ev.type)}`}>{ev.type}</span>
                                      <span className="text-xs text-gray-300 flex items-center gap-1 font-mono"><Calendar size={12} className="text-blue-500"/> {ev.date.split('-').reverse().join('/')}</span>
                                      {ev.author && <span className="text-[10px] text-gray-500 flex items-center gap-1 ml-1 border-l border-white/10 pl-2"><UserCircle size={10}/> {ev.author}</span>}
                                  </div>
                                  <h4 className="text-white font-bold text-lg mb-2 leading-tight pr-12">{ev.title}</h4>
                                  {ev.description && <p className="text-sm text-gray-400 mb-4 line-clamp-2">{ev.description}</p>}
                                  <div className="flex flex-col gap-1.5 pt-3 border-t border-white/5 mt-auto">
                                      <div className="flex items-center gap-2 text-xs text-gray-300"><Clock size={14} className="text-yellow-500"/> {ev.time}</div>
                                      {ev.location && <div className="flex items-center gap-2 text-xs text-gray-300"><MapPin size={14} className="text-green-500"/> {ev.location}</div>}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {pastEvents.length > 0 && (
                  <div className="space-y-4 pt-8 border-t border-white/10 opacity-70">
                      <h3 className="text-gray-500 font-bold uppercase text-xs flex items-center gap-2 ml-2">Eventos Passados</h3>
                      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                           {pastEvents.map(ev => (
                              <div key={ev.id} className="bg-black/40 border border-white/5 p-4 rounded-xl relative group">
                                      {(isAdmin || ev.author === viewAsStudent?.name) && (
                                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleDeleteEvent(ev.id)} className="text-gray-500 hover:text-red-500 p-1 bg-black/80 rounded"><Trash2 size={12}/></button>
                                      </div>
                                  )}
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="text-gray-500 text-xs flex items-center gap-1"><Calendar size={10}/> {ev.date.split('-').reverse().join('/')}</span>
                                  </div>
                                  <h4 className="text-gray-400 font-bold text-sm mb-1">{ev.title}</h4>
                                      <span className="text-[10px] text-gray-600">{ev.type} {ev.location && `• ${ev.location}`} {ev.author && `• Por: ${ev.author}`}</span>
                              </div>
                           ))}
                      </div>
                  </div>
              )}
          </div>
      )
  }


// --- TELA DE LOGIN (Se não tiver usuário logado) ---
  if (!currentUser) {
      return (
          <div className="newgears-login-shell min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden">
              {/* Fundo decorativo */}
              <div className="newgears-orb newgears-orb--cyan"></div>
              <div className="newgears-orb newgears-orb--pink"></div>
              <div className="newgears-orb newgears-orb--yellow"></div>

              <div className="newgears-login-card p-8 w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                  <div className="text-center mb-8 mt-2">
 <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-[28px] border border-white/12 bg-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
    <LogoNewGears />
</div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-yellow-100">Equipe FLL em missao</span>
                      <h1 className="text-3xl font-black tracking-tight mt-4">Base da Equipe New Gears</h1>
                      <p className="text-slate-300/75 text-sm mt-3 leading-relaxed">Entre para acompanhar desafios, evoluir no XP e viver a temporada com cara de jogo, robo e torneio.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                          <label className="text-[10px] text-slate-300/60 uppercase font-black mb-1.5 block tracking-wider">Seu usuario</label>
                          <div className="relative">
                              <UserCircle className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                              <input 
                                  type="text" 
                                  value={loginUser} 
                                  onChange={(e) => setLoginUser(e.target.value)} 
                                  className="newgears-login-input w-full p-3 pl-10 text-white outline-none transition-all placeholder:text-slate-500 font-medium" 
                                  placeholder="Ex: tecnico ou ana.fll" 
                                  autoFocus 
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] text-slate-300/60 uppercase font-black mb-1.5 block tracking-wider">Senha secreta</label>
                          <div className="relative">
                              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                              <input 
                                  type="password" 
                                  value={loginPass} 
                                  onChange={(e) => setLoginPass(e.target.value)} 
                                  className="newgears-login-input w-full p-3 pl-10 text-white outline-none transition-all placeholder:text-slate-500 font-medium" 
                                  placeholder="••••••" 
                              />
                          </div>
                      </div>

                      {loginError && (
                          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                              <AlertCircle size={16} className="text-red-500 shrink-0"/>
                              <p className="text-red-400 text-xs font-bold">{loginError}</p>
                          </div>
                      )}

                      <button className="newgears-login-button w-full text-white font-black py-4 mt-2 text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                          <LogOut size={18} className="rotate-180"/> Entrar na Base
                      </button>
                  </form>
                  
                  <div className="mt-8 pt-6 border-t border-white/5 text-center">
                      <p className="text-[11px] text-slate-400/70">Plataforma da equipe para aprender, jogar junto e crescer na temporada.</p>
                  </div>
              </div>
          </div>
      )
  }

  // --- PROTEÇÃO DE CARREGAMENTO (LOADING) ---
  // Só aparece DEPOIS que logou, enquanto baixa os dados
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
          <Suspense fallback={<LazyOverlayFallback label="Carregando modo TV..." />}>
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
          </Suspense>
      );
  }

  // --- RENDER PRINCIPAL (SÓ CHEGA AQUI SE ESTIVER LOGADO) ---
  return (
    <div className={`newgears-shell min-h-screen text-white selection:bg-yellow-300 selection:text-slate-950 pb-20 relative overflow-hidden ${isLiteMode ? 'newgears-lite-mode' : ''}`}>
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
        {showConfetti && (
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <Suspense fallback={null}>
              <ConfettiBurst width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={420} gravity={0.14} />
            </Suspense>
          </div>
        )}

        <Notification />
        {renderModal()}

        {/* --- ALERTA DE LOGOUT POR INATIVIDADE --- */}
        {logoutCountdown !== null && (
          <>
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-[200]">
                <div className="h-full bg-red-500 transition-all duration-1000 ease-linear" style={{ width: `${(logoutCountdown / 60) * 100}%` }}></div>
            </div>
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border-2 border-red-400">
                <AlertTriangle className="animate-pulse" size={20} />
                <span className="font-bold text-sm">Sua sessão vai expirar em {logoutCountdown}s</span>
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
            />
          </Suspense>
        )}

{/* --- MODAL DO TÉCNICO: ENTREGAR BADGES --- */}
      {isAdmin && badgeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1a1a24] rounded-2xl border border-white/10 p-6 w-full max-w-2xl shadow-2xl relative">
            
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
              <h2 className="text-2xl font-bold text-white">Sala de Troféus</h2>
              <p className="text-gray-400">Gerenciando conquistas de <span className="text-white font-bold">{badgeStudent.name}</span></p>
            </div>

            {/* Grid de Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BADGES_LIST.map(badge => {
                const hasBadge = badgeStudent.badges?.includes(badge.id);
                return (
                  <button
                    key={badge.id}
                    onClick={() => toggleBadge(badgeStudent, badge.id)}
                    /* 👇 MUDANÇA 1: Adicionei a palavra 'group' no começo desta linha 👇 */
                    className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
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
                    {hasBadge && (
                       <div className="absolute top-2 right-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                       </div>
                    )}

                    {/* 👇 MUDANÇA 2: Balãozinho de descrição (Tooltip) 👇 */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-900/95 text-gray-200 text-xs text-center p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-gray-700 shadow-xl backdrop-blur-md">
                        {badge.desc}
                        {/* Triângulo (setinha) apontando para baixo */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                    </div>
                    {/* ☝️ FIM DO BALÃOZINHO ☝️ */}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL DE BATERIA DA EQUIPE --- */}
      {false && showBatteryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-[#151520] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                
                <button onClick={() => setShowBatteryModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <X size={24}/>
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <BatteryCharging size={32} className="text-white animate-pulse"/>
                    </div>
                    <h3 className="text-2xl font-black text-white italic">COMO ESTÁ SUA BATERIA?</h3>
                    <p className="text-gray-400 text-sm mt-2">Sua honestidade ajuda a equipe a treinar melhor. <br/>(Vale +2 XP!)</p>
                </div>

                {/* LÓGICA DE EXIBIÇÃO: TRAVAS DA BATERIA */}
                {(() => {
                    const dayOfWeek = new Date().getDay();
                    const isTrainingDay = dayOfWeek === 1 || dayOfWeek === 3; // 1 = Seg, 3 = Qua
                    const hasVotedToday = viewAsStudent && teamMoods.some(mood => mood.studentId === viewAsStudent.id);

                    if (viewAsStudent && !isTrainingDay) {
                        return (
                            <div className="text-center bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-xl mb-6">
                                <p className="font-bold text-yellow-500 text-lg">Fora de Treino 🛑</p>
                                <p className="text-xs text-gray-400 mt-2">A carga da bateria da equipe só pode ser checada nas <strong className="text-gray-300">Segundas</strong> e <strong className="text-gray-300">Quartas</strong>.</p>
                            </div>
                        );
                    }

                    if (viewAsStudent && hasVotedToday) {
                        return (
                            <div className="text-center bg-green-500/10 border border-green-500/20 p-6 rounded-xl mb-6 flex flex-col items-center">
                                <CheckCircle size={32} className="text-green-500 mb-2"/>
                                <p className="font-bold text-green-500 text-lg">Check-in Concluído!</p>
                                <p className="text-xs text-gray-400 mt-2">Seus +2 XP já foram creditados. Foco na missão de hoje!</p>
                            </div>
                        );
                    }

                    if (!viewAsStudent) {
                        return (
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3 text-center">Legenda da Bateria (Modo Técnico)</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <div className="p-1.5 bg-green-500/20 rounded-full"><BatteryFull size={18} className="text-green-500"/></div>
                                        <div>
                                            <span className="block font-bold text-green-500 text-xs">100% - Turbo Mode</span>
                                            <span className="text-[10px] text-gray-400">Tô pronto pra tudo!</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <div className="p-1.5 bg-blue-500/20 rounded-full"><BatteryMedium size={18} className="text-blue-500"/></div>
                                        <div>
                                            <span className="block font-bold text-blue-500 text-xs">75% - Focado</span>
                                            <span className="text-[10px] text-gray-400">Estou bem, vamos nessa.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <div className="p-1.5 bg-yellow-500/20 rounded-full"><BatteryLow size={18} className="text-yellow-500"/></div>
                                        <div>
                                            <span className="block font-bold text-yellow-500 text-xs">50% - Economia de Energia</span>
                                            <span className="text-[10px] text-gray-400">Cansado, mas aguento.</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <div className="p-1.5 bg-red-500/20 rounded-full"><BatteryWarning size={18} className="text-red-500"/></div>
                                        <div>
                                            <span className="block font-bold text-red-500 text-xs">25% - Bateria Arriada</span>
                                            <span className="text-[10px] text-gray-400">Preciso de ajuda ou pausa.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 gap-3">
                            {/* Opção 100% */}
                            <button onClick={() => handleMoodSubmit(100)} className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-black transition-all group text-left">
                                <div className="p-2 bg-green-500/20 rounded-full group-hover:bg-black/20"><BatteryFull size={24} className="text-green-500 group-hover:text-black"/></div>
                                <div>
                                    <span className="block font-bold text-green-500 group-hover:text-black">100% - Turbo Mode</span>
                                    <span className="text-xs text-gray-400 group-hover:text-black/70">Tô pronto pra tudo!</span>
                                </div>
                            </button>

                            {/* Opção 75% */}
                            <button onClick={() => handleMoodSubmit(75)} className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all group text-left">
                                <div className="p-2 bg-blue-500/20 rounded-full group-hover:bg-white/20"><BatteryMedium size={24} className="text-blue-500 group-hover:text-white"/></div>
                                <div>
                                    <span className="block font-bold text-blue-500 group-hover:text-white">75% - Focado</span>
                                    <span className="text-xs text-gray-400 group-hover:text-white/80">Estou bem, vamos nessa.</span>
                                </div>
                            </button>

                            {/* Opção 50% */}
                            <button onClick={() => handleMoodSubmit(50)} className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all group text-left">
                                <div className="p-2 bg-yellow-500/20 rounded-full group-hover:bg-black/20"><BatteryLow size={24} className="text-yellow-500 group-hover:text-black"/></div>
                                <div>
                                    <span className="block font-bold text-yellow-500 group-hover:text-black">50% - Economia de Energia</span>
                                    <span className="text-xs text-gray-400 group-hover:text-black/70">Cansado, mas aguento.</span>
                                </div>
                            </button>

                            {/* Opção 25% */}
                            <button onClick={() => handleMoodSubmit(25)} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group text-left">
                                <div className="p-2 bg-red-500/20 rounded-full group-hover:bg-white/20"><BatteryWarning size={24} className="text-red-500 group-hover:text-white"/></div>
                                <div>
                                    <span className="block font-bold text-red-500 group-hover:text-white">25% - Bateria Arriada</span>
                                    <span className="text-xs text-gray-400 group-hover:text-white/80">Preciso de ajuda ou pausa.</span>
                                </div>
                            </button>
                        </div>
                    );
                })()}
                
                {/* Quem já votou (Transparência) */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-3">Quem já fez check-in hoje:</p>
                    <div className="flex flex-wrap gap-2">
                        {teamMoods.map((mood, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-[10px] text-gray-300 border border-white/5">
                                <div className={`w-2 h-2 rounded-full ${mood.level > 75 ? 'bg-green-500' : mood.level > 50 ? 'bg-blue-500' : mood.level > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                {mood.studentName.split(' ')[0]}
                            </div>
                        ))}
                        {teamMoods.length === 0 && <span className="text-xs text-gray-600 italic">Ninguém ainda... seja o primeiro!</span>}
                    </div>
                </div>

            </div>
        </div>
      )}

      {showBatteryModal && (
        <Suspense fallback={<LazyOverlayFallback label="Carregando check-in da equipe..." />}>
          <TeamCheckInModal
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

 {/* HEADER DO SISTEMA (COMPLETO) */}
      <header className="newgears-topbar sticky top-0 z-40 px-4 md:px-6 py-4 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
              <div className="newgears-logo-hub w-24 md:w-28 h-auto px-3 py-2">
                  <LogoNewGears />
              </div>
              <div className="hidden xl:block">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300/55 font-black">Base da equipe</p>
                  <p className="text-sm font-black text-white mt-1">{currentWeekData?.weekName || 'Semana da temporada'}</p>
              </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
              
              {/* --- CONTADOR COMPACTO --- */}
              <Countdown 
                  targetDate="2026-12-01T08:00:00" 
                  title="TORNEIO" 
                  compact={true} 
              />

              {/* 1. BOTÃO CRONOGRAMA (VOLTOU!) */}
              {/* Só aparece se o modal de cronograma não estiver aberto */}
              <button onClick={() => setShowFullSchedule(true)} className="bg-white/5 border border-white/10 text-white p-2 rounded-full hover:bg-white/10 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2">
                  <CalendarDays size={18} /> <span className="hidden md:inline text-xs font-bold">Cronograma</span>
              </button>
              {/* 👇 COLE O BOTÃO DO RANKING AQUI 👇 */}
              {!viewAsStudent && (
                <button 
                  onClick={() => setActiveTab('ranking')} 
                  className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2 rounded-full hover:bg-yellow-500/20 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2"
                >
                  <Trophy size={18} /> <span className="hidden md:inline text-xs font-bold">Ranking XP</span>
                </button>
              )}
              {/* ☝️ FIM DO BOTÃO DO RANKING ☝️ */}
{/* --- BOTÃO DA BATERIA (NOVO) --- */}
              <button 
                onClick={() => setShowBatteryModal(true)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                    // Muda a cor dependendo da média da equipe
                    teamAverage > 75 ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    teamAverage > 50 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    teamAverage > 0  ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-white/5 border-white/10 text-gray-400'
                }`}
                title="Como está a energia da equipe?"
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
              {!isAdmin && viewAsStudent && (
                <button
                  onClick={toggleStudentHeroPanel}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                    studentPanelState.hero
                      ? 'bg-blue-500/12 border-blue-500/30 text-blue-100 shadow-[0_0_15px_rgba(96,165,250,0.16)]'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={studentPanelState.hero ? 'Ocultar painel principal do aluno' : 'Mostrar painel principal do aluno'}
                >
                  {studentPanelState.hero ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span className="font-bold text-xs">Painel FLL</span>
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
              <button
                onClick={openCommandCenterMode}
                className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-all md:px-4 md:py-2 md:rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
              >
                  <Crown size={18} /> <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Central de Comando</span>
              </button>
              <button
                onClick={openJudgeMode}
                className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2 rounded-full hover:bg-amber-500 hover:text-black transition-all md:px-4 md:py-2 md:rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              >
                  <Gavel size={18} /> <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Modo Juizes</span>
              </button>
              {/* --- BOTÃO MODO TV (TODOS PODEM ACESSAR) --- */}
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
    <div className="bg-[#151520] border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="text-3xl">🇺🇸</div>
            <div>
                <h3 className="text-white font-bold text-sm">English Challenge</h3>
                <p className="text-gray-400 text-xs">Fale 10 min em inglês.</p>
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
                Aguardando Técnico...
            </button>
        )}
    </div>
)}

              {/* 3. BOTÃO DE SAIR */}
              <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Sair">
                  <LogOut size={18} />
              </button>
          </div>
      </header>

      {/* --- ÁREA DO TÉCNICO (ADMIN) --- */}
      {isAdmin && (
        <main className={`newgears-stage max-w-[1600px] mx-auto animate-in fade-in duration-500 ${adminPanelState.compact ? 'p-4 md:p-6' : 'p-4 md:p-8'}`}>
          {!adminPanelState.compact && <UrgentEventsBanner />}

          <div className="mb-2">
            <WorkspaceCollapsible isOpen={adminPanelState.hero}>
              <WorkspaceHero
                eyebrow="Temporada FLL"
                title="Central tatica da equipe"
                subtitle={`Semana ativa: ${currentWeekData?.weekName || 'Em sincronizacao'}. Aqui ficam rodizio, estrategia, robo e apresentacao com leitura mais direta e menos poluida.`}
                metrics={adminHeroMetrics}
                actions={adminHeroActions}
                accent="from-[#18376b] via-[#2b1559] to-[#140b2f]"
              />
            </WorkspaceCollapsible>

            <div className={`newgears-footer-shell newgears-hud-shell relative z-10 border border-white/10 bg-black/18 ${adminPanelState.compact ? 'p-3 md:p-4' : 'p-4 md:p-5'} ${adminPanelState.hero ? 'mt-2' : ''}`}>
              {adminHeroFooter}
            </div>
          </div>

          {!adminPanelState.compact && (
          <WorkspaceCollapsible isOpen={adminPanelState.dashboard}>
            <div className="flex flex-col gap-6 mb-6">
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
                      <TeamStatsPanel />
                    </div>
                  )}
                  {adminPanelState.achievements && (
                    <div className="[&>div]:mb-0 h-full">
                      <TeamAchievementsPanel />
                    </div>
                  )}
                </div>
              )}
            </div>
          </WorkspaceCollapsible>
          )}

            {/* Dentro do seu <main> ou área de conteúdo central, junto com os outros 'ifs' de abas */}
{activeTab === 'ranking' && (
  <Suspense fallback={<LazyPanelFallback label="Carregando ranking da equipe..." minHeightClass="min-h-[340px]" />}>
    <RankingPanel students={students} setActiveTab={setActiveTab} />
  </Suspense>
)}
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-3">
                
                <div className="-mt-10 md:-mt-12">
                  <WorkspaceTabs eyebrow="Centro de Navegacao" tabs={adminWorkspaceTabs} activeId={adminTab} onChange={setAdminTab} />
                </div>

                {/* CONTEÚDO DA ABA SELECIONADA */}
                <div className={`newgears-scene-shell px-4 pb-4 md:px-7 md:pb-7 min-h-[500px] ${getWorkspaceSceneTopPadding(adminTab)}`}>
                  <WorkspaceScene sceneId={`admin-${adminTab}`}>
                    {adminTab === 'rotation' && (
                      <Suspense fallback={<LazyPanelFallback label="Carregando operacoes de rotacao..." minHeightClass="min-h-[420px]" />}>
                        <RotationOperationsPanel
                          students={students}
                          tasks={tasks}
                          missions={missions}
                          currentWeekData={currentWeekData}
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
                          onOpenReviewModal={openReviewModal}
                          onUpdateStudentSpecialty={updateStudentSpecialty}
                          onHandleCloseStationWeek={handleCloseStationWeek}
                          onUpdateMission={updateMission}
                          onSaveMission={handleSaveStationMission}
                          onApplyRotation={handleApplyRotation}
                          onOpenAttendance={openAttendanceModal}
                          onResetAllActivities={handleResetAllActivities}
                          onOpenSchedule={() => setShowFullSchedule(true)}
                        />
                      </Suspense>
                    )}

                    {adminTab === 'strategy' && <StrategyView />}
                    {adminTab === 'rounds' && <RoundsView />} {/* StrategyBoard agora mora dentro de RoundsView */}
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
                    {adminTab === 'kanban' && <KanbanView />}
                    {adminTab === 'logbook' && <LogbookView />}
                    {adminTab === 'agenda' && <AgendaView />}
                  </WorkspaceScene>
                </div>
            </div>
          </div>
        </main>
      )}

      {/* --- ÁREA DO ALUNO --- */}
      {!isAdmin && viewAsStudent && (
        <main className="newgears-stage p-4 md:p-8 w-full max-w-[1800px] mx-auto animate-in slide-in-from-bottom-8">
          <UrgentEventsBanner />

          <div className="mb-2">
            <WorkspaceCollapsible isOpen={studentPanelState.hero}>
              <WorkspaceHero
                eyebrow="Painel do Aluno"
                title={`Base pessoal de ${viewAsStudent.name} para jogar em equipe, evoluir e chegar pronto no torneio.`}
                subtitle={`Estacao atual: ${viewAsStudent.station || 'Equipe'}. Aqui voce acompanha sua rotina da semana, entende as rubricas, treina sua fala e enxerga o time com uma energia mais viva e menos engessada.`}
                metrics={studentHeroMetrics}
                actions={studentHeroActions}
                accent="from-[#101f4a] via-[#2a1458] to-[#1a0d32]"
              />
            </WorkspaceCollapsible>

            <div className={`newgears-footer-shell newgears-hud-shell relative z-10 border border-white/10 bg-black/18 p-4 md:p-5 ${studentPanelState.hero ? 'mt-2' : ''}`}>
              {studentHeroFooter}
            </div>
          </div>

          <WorkspaceCollapsible isOpen={studentPanelState.dashboard}>
            <div className="flex flex-col gap-6 mb-6">
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
                      <TeamStatsPanel />
                    </div>
                  )}
                  {studentPanelState.achievements && (
                    <div className="[&>div]:mb-0 w-full">
                      <TeamAchievementsPanel />
                    </div>
                  )}
                </div>
              )}
            </div>
          </WorkspaceCollapsible>

          {/* ALERTA DE TAREFAS ATRASADAS DO ALUNO */}
          {studentOverdueTasksCount > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] mb-6 flex items-center justify-between animate-pulse hover:animate-none transition-all">
                  <div className="flex items-center gap-4">
                      <div className="bg-red-500/20 p-3 rounded-full">
                          <AlertTriangle size={24} className="text-red-500" />
                      </div>
                      <div>
                          <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1">Ação Necessária</h3>
                          <p className="text-white font-bold md:text-lg leading-tight">Você possui tarefas atrasadas no quadro de tarefas!</p>
                      </div>
                  </div>
                  <button onClick={() => setStudentTab('kanban')} className="hidden md:block bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-colors whitespace-nowrap">
                      Resolver Agora
                  </button>
              </div>
          )}

    {/* ALERTA DE LÍDER DE GESTÃO */}
    {currentWeekData?.assignments?.Gestão?.some(s => s.id === viewAsStudent.id) && !["Heloise", "Sofia"].includes(viewAsStudent.name) && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl border border-purple-400/30 shadow-lg mb-6 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <Crown size={24} className="text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight">Você é o Líder de Gestão esta semana!</h3>
                    <p className="text-purple-100 text-xs">Sua missão: Cobrar tarefas e manter a equipe focada.</p>
                </div>
            </div>
        </div>
    )}

          {/* GRID PRINCIPAL DO ALUNO */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                
                <div className="-mt-10 md:-mt-12">
                  <WorkspaceTabs eyebrow="Mapa do Aluno" tabs={studentWorkspaceTabs} activeId={studentTab} onChange={setStudentTab} />
                </div>

                {/* CONTEÚDO DA ABA SELECIONADA */}
                <div className={`newgears-scene-shell px-4 pb-4 md:px-7 md:pb-7 min-h-[500px] ${getWorkspaceSceneTopPadding(studentTab)}`}>
                  <WorkspaceScene sceneId={`student-${studentTab}`}>
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

                    {studentTab === 'strategy' && <div className="text-left"><StrategyView /></div>}
                    {studentTab === 'rounds' && <div className="text-left"><RoundsView /></div>}
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
                    {studentTab === 'kanban' && <div className="text-left"><KanbanView /></div>}
                    {studentTab === 'logbook' && <div className="text-left"><LogbookView /></div>}
                    {studentTab === 'agenda' && <div className="text-left"><AgendaView /></div>}
                  </WorkspaceScene>
                </div>
            </div>
          </div>
        </main>
      )}
    </div>
    </div>
  );
}

export default App;








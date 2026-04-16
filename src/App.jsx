import { Suspense, lazy, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, setDoc, collectionGroup, orderBy, limit } from "firebase/firestore";
import { db } from './firebase'; // Importa a instÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ncia jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ inicializada
import Countdown from './components/Countdown';
import LogoNewGears from './components/LogoNewGears';
import { WorkspaceHero, WorkspaceTabs, WorkspaceScene, WorkspaceCollapsible, WorkspacePanelToolbar } from './components/WorkspaceChrome';
import StrategyView from './views/StrategyView';
import RoundsView from './views/RoundsView';
import LogbookView from './views/LogbookView';
import KanbanView from './views/KanbanView';
import AgendaView from './views/AgendaView';
import { STATION_KEYS } from './constants/workspace';
import { DEFAULT_PROJECT_SUMMARY, PROJECT_MAIN_DOC_ID, resolveProjectSummary } from './utils/projectSummary';
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
  Briefcase, // <--- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âcone que faltava para o modal de especialista
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
  Timer, // <--- Agora sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ tem um aqui!
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
  Microscope,  // <--- O Culpado de agora (InovaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o)
  Gamepad2,    // <--- Provavelmente vai pedir em seguida (Robot Game)
  Megaphone,   // <--- Provavelmente vai pedir em seguida (Marketing/Social)
  Laptop,      // <--- Provavelmente vai pedir em seguida (ProgramaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o)
  Code,
  BarChart3,   // <--- O Culpado de agora
  PieChart,    // <--- Provavelmente vai pedir em seguida (GrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico de Pizza)
  TrendingUp,  // <--- Provavelmente vai pedir em seguida (TendÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia de alta)
  Flag,
  Tag,
  MessageSquare, // <--- O Culpado de agora (ComentÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios)
  Share2,        // <--- Provavelmente usado para compartilhar estratÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©gia
  Download,      // <--- Provavelmente usado para baixar PDF
  Plus,          // <--- BotÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de "Nova EstratÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©gia" (+)
  Trash2,        // <--- BotÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de Lixeira (Apagar estratÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©gia)
  Edit3,
  GitCommit,     // <--- O Culpado de agora
  GitBranch,     // <--- Provavelmente vai pedir em seguida (VersÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes/Ramos)
  GitPullRequest,// <--- Provavelmente vai pedir em seguida (SolicitaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de MudanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a)
  GitMerge,
  Users,       // <--- O Culpado de agora (Lista da Equipe)
  UserPlus,    // <--- Provavelmente vai pedir em seguida (Adicionar Aluno)
  UserCheck,   // <--- Provavelmente vai pedir em seguida (PresenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a/Status)
  UserX,       // <--- Provavelmente vai pedir em seguida (Remover Aluno)
  ClipboardList,
  AlertCircle,   // <--- O Culpado de agora (Erro/Aviso)
  Check,         // <--- Provavelmente vai pedir em seguida (Sucesso/Visto)
  Info,          // <--- Provavelmente vai pedir em seguida (InformaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o)
  HelpCircle,    // <--- Provavelmente vai pedir em seguida (Ajuda)
  XCircle,
  CheckSquare, // <--- O Culpado de agora (Checkbox marcado)
  Square,
  Loader2,
  Scale,         // <--- O Culpado de agora (AvaliaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o)
  Crop,          // <--- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âcone de Corte
  CheckCheck,    // <--- Provavelmente vai pedir em seguida (Aprovado Duplo)
  ExternalLink,  // <--- Provavelmente vai pedir em seguida (Abrir Arquivo em outra aba)
  FileWarning,
  Book,          // <--- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âcone do DiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio
  Play,          // <--- NOVO: ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âcone de Play para o CronÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´metro
  Clock,         // <--- NOVO: ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âcone de RelÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gio (Agenda)
  MapPin,        // <--- NOVO: ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âcone de LocalizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (Agenda)
  MonitorPlay,   // <--- NOVO: ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âcone do Modo TV
  Maximize,      // <--- NOVO: Expandir grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico
  Minimize,      // <--- NOVO: Minimizar grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico
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


// --- CONFIGURAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DE NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂVEIS ---

const LEVELS = [

    { name: "Novato", min: 0, max: 499, color: "text-gray-400" },

    { name: "Aprendiz", min: 500, max: 1199, color: "text-blue-400" },

    { name: "Veterano", min: 1200, max: 2399, color: "text-purple-400" },

    { name: "Mestre FLL", min: 2400, max: 10000, color: "text-yellow-400" }

];
// --- LISTA DE TÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°CNICOS (ADMINISTRADORES) ---
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

const SCHOOL_REPORT_SUBJECTS = ['Matematica', 'Portugues', 'Ciencias', 'Historia', 'Geografia', 'Ingles', 'Artes', 'Ed. Fisica', 'Robotica', 'STEAM'];

const SCHOOL_REPORT_STAGE_CONFIG = {
  etapa1: {
    id: 'etapa1',
    label: '1a etapa',
    periodLabel: 'fechamento do fim de abril'
  },
  etapa2: {
    id: 'etapa2',
    label: '2a etapa',
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
  { value: 'ReuniÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o', label: 'Reuniao Extra' },
  { value: 'Treino', label: 'Treino' },
  { value: 'Prazo', label: 'Prazo / Entrega' },
  { value: 'CompetiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o', label: 'Competicao' },
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
  const [adminProfile, setAdminProfile] = useState({ name: 'Tecnico', avatarImage: null, specialty: '' });
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
  const [projectSummary, setProjectSummary] = useState(DEFAULT_PROJECT_SUMMARY);
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
    [STATION_KEYS.ENGINEERING]: { text: 'Definir estrategia do robo.', deadline: today },
    [STATION_KEYS.INNOVATION]: { text: 'Pesquisar especialistas.', deadline: today },
    [STATION_KEYS.MANAGEMENT]: { text: 'Atualizar o cronograma.', deadline: today }
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

// --- LISTA DE BADGES (VERSÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O FINAL) ---
  const BADGES_LIST = [
    { id: 'pitstop', name: 'Pit Stop F1', icon: <Timer size={20}/>, color: 'text-red-500', desc: 'Troca de anexo em menos de 3s.' },
    { id: 'engineer', name: 'Engenheiro Minimalista', icon: <Wrench size={20}/>, color: 'text-gray-400', desc: 'SoluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o mecÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢nica simples e genial.' },
    { id: 'ice_blood', name: 'Sangue Frio', icon: <ThermometerSnowflake size={20}/>, color: 'text-blue-400', desc: 'Manteve a calma no erro crÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­tico.' },
    { id: 'repetition', name: 'Rei da RepetiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o', icon: <RotateCcw size={20}/>, color: 'text-green-500', desc: '10 acertos seguidos na mesa.' },
    { id: 'helper', name: 'BraÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o Direito', icon: <HeartHandshake size={20}/>, color: 'text-pink-500', desc: 'Ajudou o time em qualquer situaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o.' },
    { id: 'data_keeper', name: 'GuardiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o dos Dados', icon: <BarChart size={20}/>, color: 'text-blue-500', desc: 'Trouxe estatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­sticas reais pro Projeto.' },
    { id: 'legend', name: 'Lenda do XP', icon: <Zap size={20}/>, color: 'text-yellow-400', desc: 'Destaque absoluto no Ranking de XP.' },
    { id: 'ambassador', name: 'Embaixador', icon: <Crown size={20}/>, color: 'text-purple-500', desc: 'Liderou pelo exemplo e uniu a equipe.' },
  ];

  // --- DESAFIO DE INGLÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â S: FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico ---
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
          console.error("Erro ao liberar desafio de inglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs:", error);
      }
  };

  // --- DESAFIO DE INGLÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â S: FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do Aluno ---
  const claimEnglishXP = async () => {
      if (!viewAsStudent || !viewAsStudent.englishChallengeUnlocked) return;

      try {
          const studentRef = doc(db, "students", viewAsStudent.id);
          const xpBonus = 20; // Quanto de XP ele ganha por falar inglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs

          await updateDoc(studentRef, {
              xp: (viewAsStudent.xp || 0) + xpBonus,
              englishChallengeUnlocked: false // Bloqueia o botÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de novo automaticamente!
          });

          // Atualiza a tela do aluno
          setViewAsStudent(prev => ({ 
              ...prev, 
              xp: (prev.xp || 0) + xpBonus, 
              englishChallengeUnlocked: false 
          }));
          
          alert("Great job! Mandou bem no inglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs! +20 XP ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡Ãƒâ€šÃ‚ÂºÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¨");
      } catch (error) {
          console.error("Erro ao resgatar XP de inglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs:", error);
      }
  };
 // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o atualizada para o TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico dar Badges
  const toggleBadge = async (student, badgeId) => {
      if (!isAdmin) return;
      
      const currentBadges = student.badges || [];
      let newBadges;
      let xpBonus = 0;

      // LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica de Adicionar/Remover
      if (currentBadges.includes(badgeId)) {
          newBadges = currentBadges.filter(b => b !== badgeId);
          // Opcional: Remover XP se tirar a badge? Melhor nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o, deixa o XP ganho.
      } else {
          newBadges = [...currentBadges, badgeId];
          xpBonus = 100; // BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´nus de XP ao ganhar
      }

      // 1. Atualiza no Firebase
      const studentRef = doc(db, "students", student.id);
      await updateDoc(studentRef, {
         badges: newBadges,
         xp: (student.xp || 0) + xpBonus
      });

      // 2. Atualiza o estado local para ver a mudanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a na hora (sem recarregar)
      const updatedStudent = { ...student, badges: newBadges, xp: (student.xp || 0) + xpBonus };
      
      // Atualiza o aluno selecionado no modal
      setBadgeStudent(updatedStudent);

      // Atualiza a lista geral de alunos na tela
      setStudents(prevStudents => 
        prevStudents.map(s => s.id === student.id ? updatedStudent : s)
      );
      };
  // --- LÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œGICA DA CHUVA DE CONFETES (LEVEL UP E GRANDES GANHOS DE XP) ---

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

          // 1. Descobre o nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel atual baseado no XP do aluno
          const currentLevelObj = getCurrentLevel(currentXp);
          // Encontra a posiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o numÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©rica desse nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel (0 = Novato, 1 = Aprendiz, etc)
          const currentLevelIndex = LEVELS.findIndex(l => l.name === currentLevelObj.name);
          
          // 2. Busca na memÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ria qual foi o ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltimo nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel que esse aluno assistiu
          const storageKey = `last_seen_level_${viewAsStudent.id}`;
          const lastSeenLevel = localStorage.getItem(storageKey);

          let triggerConfetti = false;
          let msg = "";

          // 3. Se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o for o primeiro carregamento da tela, verifica as vitÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rias
          if (prevXpRef.current !== null) {
              const prevXp = prevXpRef.current;
              const gainedXp = currentXp - prevXp;

              // CondiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o A: Subiu de nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel!
              if (lastSeenLevel !== null && currentLevelIndex > parseInt(lastSeenLevel)) {
                  triggerConfetti = true;
                  msg = `ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â½ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â° PARABÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°NS! VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª alcanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ou o nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel ${currentLevelObj.name.toUpperCase()}!`;
              } 
              // CondiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o B: Recebeu recompensa de Fechamento de Semana (35 ou 50 XP) ou outra bonificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o alta
              else if (gainedXp >= 35) {
                  triggerConfetti = true;
                  msg = `ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â½ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â° RECOMPENSA COLETADA! VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª ganhou +${gainedXp} XP!`;
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

          // 4. Salva o nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel atual para nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o repetir a animaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o toda hora
          localStorage.setItem(storageKey, currentLevelIndex.toString());
          
          // Atualiza o valor anterior para a prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³xima renderizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
          prevXpRef.current = currentXp;
      } else {
          // Se deslogar, limpa a memÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ria temporÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ria do XP
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

  // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para carregar a bateria de hoje do banco
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

  // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para Salvar o Humor
  const handleMoodSubmit = async (level) => {
      if (!viewAsStudent) return;

      // Trava 1: Apenas dias de treino (Segunda=1, Quarta=3)
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek !== 1 && dayOfWeek !== 3) {
          alert("Check-in bloqueado. VotaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o permitida apenas ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â s segundas e quartas.");
          return;
      }

      // Trava 2: Impedir Farm de XP (apenas um voto por dia)
      const hasVotedToday = teamMoods.some(mood => mood.studentId === viewAsStudent.id);
      if (hasVotedToday) {
          alert("VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ respondeu hoje! Foco no treino.");
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
          // (Aqui reaproveitamos sua funÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de dar XP se ela existir, ou fazemos direto)
          await updateDoc(doc(db, "students", viewAsStudent.id), {
              xp: (viewAsStudent.xp || 0) + 2
          });

          setShowBatteryModal(false);
          alert(`Obrigado por compartilhar! +5 XP ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â¡`);
      } catch (error) {
          console.error("Erro ao salvar bateria:", error);
      }
  };

  // CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lculo da MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia da Equipe (Para vocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª ver)
  const teamAverage = teamMoods.length > 0 
      ? Math.round(teamMoods.reduce((acc, curr) => acc + curr.level, 0) / teamMoods.length) 
      : 0;

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    
    // Normaliza (remove espaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§os e deixa minÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºsculo) para evitar erros de digitaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
    const userClean = loginUser.trim().toLowerCase();
    const passClean = loginPass.trim();

    // 1. LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica de login de Admin (SIMPLIFICADA)
    // TODO: Substituir por Firebase Auth. Por enquanto, uma verificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o simples.
    let adminFound = ADMIN_USERS.find(a => a.user.toLowerCase() === userClean && a.pass === passClean);

    // Verifica se tem senha personalizada no Firebase
    if (!adminFound && adminProfile?.password) {
        // Pode logar usando "admin", "tecnico" ou o prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³prio nome configurado no perfil
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
        localStorage.setItem("roboquest_user", JSON.stringify(userObj)); // Salva na memÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ria
        return;
    }

    console.log("Tentando logar aluno:", userClean);
    console.log("Alunos carregados no sistema:", students.length);

    // 2. Tenta logar como Aluno (busca no array 'students' que jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ existe no seu cÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³digo)
    // Nota: Certifique-se de que o cadastro de aluno salva 'username' e 'password'
    const studentFound = students.find(s => 
        s.username && s.username.toLowerCase().trim() === userClean && s.password === passClean
    );

    if (studentFound) {
        const userObj = { type: 'student', data: studentFound };
        setCurrentUser(userObj);
        setIsAdmin(false); // Remove flag de admin
        setViewAsStudent(studentFound); // ForÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a a visÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para este aluno
        localStorage.setItem("roboquest_user", JSON.stringify(userObj)); // Salva na memÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ria
    } else {
        // Log para ajudar a descobrir o erro (veja no F12)
        console.log("Falha no login. UsuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios disponÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­veis:", students.map(s => s.username));
        setLoginError("UsuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio ou senha incorretos.");
    }
  };

  

  const handleLogout = () => {
      setCurrentUser(null);
      setIsAdmin(false);
      setViewAsStudent(null);
      setLoginUser("");
      setLoginPass("");
      localStorage.removeItem("roboquest_user"); // Limpa a memÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ria
        localStorage.removeItem("roboquest_last_activity"); // Limpa o controle de tempo
  };
  // ----------------------------------


    useEffect(() => {
      let warningTimeoutId;
      let countdownIntervalId;
      let throttleTimer;

      // O tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico (admin) nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o deve ser deslogado por inatividade
      if (currentUser?.type === 'admin') return;

      const TIMEOUT_MINUTES = 30; // 30 minutos totais
      const WARNING_SECONDS = 60; // Aviso nos ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltimos 60 segundos
      
      const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;
      const WARNING_MS = WARNING_SECONDS * 1000;
      const IDLE_TIME_BEFORE_WARNING = TIMEOUT_MS - WARNING_MS;

      const checkInactivity = () => {
        const lastActivity = localStorage.getItem("roboquest_last_activity");
        const now = new Date().getTime();
        
        if (lastActivity) {
            const timeIdle = now - parseInt(lastActivity);
            // Se houve atividade recente (outra aba), nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o mostra o aviso e reseta
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
                alert("SessÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encerrada por inatividade (30 minutos). Por favor, faÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a login novamente para sua seguranÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a.");
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
          alert("SessÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encerrada por inatividade (30 minutos). Por favor, faÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a login novamente.");
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


  // --- LÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œGICA DE NOTIFICAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES DA AGENDA EM TEMPO REAL ---
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

      if (type === 'ReuniÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o') {
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

      if (type === 'CompetiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o') {
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

  // --- LÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œGICA DE NOTIFICAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES DO KANBAN ---
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
                          <div><h4 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div> EVENTO HOJE</h4><p className="text-white font-bold md:text-lg leading-none">{ev.title} <span className="text-gray-300 font-normal text-xs md:text-sm ml-2">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â s {ev.time}</span></p></div>
                      </div>
                      <button onClick={() => { isAdmin ? setAdminTab('agenda') : setStudentTab('agenda') }} className="hidden md:block text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-red-900/20 whitespace-nowrap">Ver na Agenda</button>
                  </div>
              ))}
              {eventsTomorrow.map(ev => (
                  <div key={ev.id} className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-yellow-500/20 rounded-full"><CalendarDays className="text-yellow-500" size={24} /></div>
                          <div><h4 className="text-yellow-500 font-bold text-xs uppercase tracking-widest mb-1">EVENTO AMANHÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢</h4><p className="text-white font-bold md:text-lg leading-none">{ev.title} <span className="text-gray-300 font-normal text-xs md:text-sm ml-2">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â s {ev.time}</span></p></div>
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
        // Procura a versÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o mais recente deste aluno na lista que veio do banco
        const freshStudent = students.find(s => s.id === currentUser.data.id);
        if (freshStudent) {
            setViewAsStudent(freshStudent);
        }
    }
  }, [students, currentUser]);






// --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DE CRONOGRAMA OFICIAL (12 ALUNOS) ---
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

      // 1. CAPITÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢S (Sempre Fixas em GestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o - Tarde)
      const capitasNames = ["Heloise", "Sofia"];

      // 2. APRENDIZES (Sexto Ano): AntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´nio, Heloisa, Helena (RodÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­zio Simplificado)

      // 3. POOL DO RODÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂZIO (7 Alunos da ManhÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£)
      // Estes rodam nas vagas: 3 Eng, 3 Inov, 1 GestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­der da ManhÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£)
      // Ciclo de 7 semanas para dar a volta completa
      const morningPool = [
          "Enzo", "Mariana", 
          "LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­via", "Arthur Silva", 
          "Benjamim", "Davi Miguel", 
          "AntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´nio Yamaguchi" 
      ];

      // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o auxiliar para criar objetos visuais (evita o "Vago")
      const getStudentObjects = (namesList) => {
          return namesList.map(nameStr => {
              // CorreÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o: ComparaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o exata para diferenciar "AntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´nio" de "AntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´nio Yamaguchi"
              const found = students.find(s => s.name && s.name.trim().toLowerCase() === nameStr.trim().toLowerCase());
              if (found) return found; 
              // Cria objeto temporÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o achar no banco
              return { id: `fake-${nameStr}-${Math.random()}`, name: nameStr, avatarType: 'robot' };
          });
      };

      for (let i = 1; i <= totalScheduleWeeks; i++) { 
          const endDate = new Date(currentDate); 
          endDate.setDate(currentDate.getDate() + 6); // Agora a semana vai de Domingo a SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡bado
          
          // --- LÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œGICA DE ROTAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O (CICLO DE 7) ---
          // A cada semana, giramos a lista dos 7 alunos uma posiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
          // Assim, todos passam por Eng -> Inov -> GestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
          const shift = (i - 1) % 7;
          const currentRotation = [...morningPool];
          
          // Realiza a rotaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do array
          for(let k = 0; k < shift; k++) {
              currentRotation.push(currentRotation.shift());
          }

          // DISTRIBUIÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O INTERCALADA (EVITA REPETIÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES SEGUIDAS)
          // Para alternar e nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o ficar 3 semanas na mesma ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rea:
          // Eng: Pega ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­ndices 0, 3, 5
          // Inov: Pega ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­ndices 2, 4, 6
          // GestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o: Pega ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­ndice 1
          const engTeam = [currentRotation[0], currentRotation[3], currentRotation[5]];
          const inovTeam = [currentRotation[2], currentRotation[4], currentRotation[6]];
          const morningLeader = [currentRotation[1]];

          // ONDE ENTRAM OS TRAINEES (6ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âº ANO)?
          // Ciclo de 6 semanas: Rotaciona as duplas e as ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡reas para misturar bem (Todos trabalham com todos)
          const tList = ["AntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´nio Echenique", "Helena", "Heloisa"];
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

          // GESTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O FINAL = CapitÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£s (Tarde) + LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­der da ManhÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£
          const gestaoFinal = [...capitasNames, ...morningLeader];

          schedule.push({ 
              id: i, 
              weekName: `Semana ${i}`, 
              startDate: formatLocalDateValue(currentDate), 
              endDate: formatLocalDateValue(endDate), 
              assignments: { 
                  [STATION_KEYS.ENGINEERING]: getStudentObjects(engTeam), 
                  [STATION_KEYS.INNOVATION]: getStudentObjects(inovTeam),
                  [STATION_KEYS.MANAGEMENT]: getStudentObjects(gestaoFinal) // CapitÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£s + Alunos
              } 
          }); 
          currentDate.setDate(currentDate.getDate() + 7); 
      } 
      return schedule;
  }, [students]); // <--- A mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡gica acontece aqui: atualiza quando "students" muda

  // --- 1. CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂLCULO DA SEMANA ATUAL (CÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œDIGO NOVO) ---
  useEffect(() => {
    // Se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o tiver cronograma, nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o faz nada
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
            // Atualiza apenas se mudou de semana para nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o causar re-renders atoa
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

    // 3. Limpa o timer para nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o dar vazamento de memÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ria
    return () => clearInterval(intervalId);
  }, [rotationSchedule]);



  const getAttendanceStats = (student) => { const total = student.totalClasses || 1; const attended = student.attendedClasses || 0; const percent = Math.round((attended / total) * 100); const absences = total - attended; return { percent, absences }; }

  

  const getCurrentLevel = (xp) => LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[LEVELS.length - 1];

  const getNextLevel = (xp) => { const current = getCurrentLevel(xp); const next = LEVELS[LEVELS.indexOf(current) + 1]; return next ? next : null; }



 // 1. SincronizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o com Firebase (Carrega os dados)
  useEffect(() => {
    if (!db) return;

    // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o auxiliar para criar ouvintes seguros
    const createListener = (colName, setter) => {
        return onSnapshot(collection(db, colName), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            console.log(`ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ ${colName} carregados com sucesso:`, data.length);
            setter(data);
        }, (error) => {
            console.error(`ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒâ€¦Ã¢â‚¬â„¢ ERRO CRÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂTICO em ${colName}:`, error);
            showNotification(`Erro de conexÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o: ${error.code}`, "error");
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

    // ... e nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o esqueÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a de adicionar no return para limpar:
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
        unsubMatrix();
        unsubOutreach();
        unsubProjectMain();
        unsubProjectFallback();
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

  // --- LÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œGICA DO CRONÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂMETRO ---
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

  // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de notificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (corrigida)
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

 

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O ESPECÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂFICA PARA FOTO DE PERFIL (COM CROP) ---
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
      const size = 200; // Tamanho padrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do avatar
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = cropImgSrc;
      img.onload = () => {
          // Preenche fundo (caso a imagem seja transparente)
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, size, size);
          
          // Desenha a imagem com as transformaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes do usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio
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

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES DO KANBAN (TAREFAS) ---
  const createKanbanTask = async ({ text, dueDate = '', tag = 'geral', priority = 'normal', author, ...extraData }) => {
      if (!text) return;

      const resolvedAuthor = author || (isAdmin ? "Tecnico" : (viewAsStudent?.name || "Equipe"));

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

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES DA GARRA / ANEXO ---
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
          author: modal.data?.author || viewAsStudent?.name || "Tecnico"
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
          try { await deleteDoc(doc(db, "attachments", id)); showNotification("Garra excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da!"); } catch (error) {}
      }
  };

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES DO COFRE DE CÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œDIGOS ---
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
      if (window.confirm("Tem certeza que deseja excluir este cÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³digo?")) {
          try { 
              await deleteDoc(doc(db, "codeSnippets", id)); 
              showNotification("CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³digo excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­do!"); 
          } catch (error) {
              console.error("Erro ao excluir cÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³digo:", error);
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
      // --- TRAVA PARA MOVER PARA FEITO (SÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ TÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°CNICO) ---
      if (newStatus === 'done' && !isAdmin) {
          alert("Acesso bloqueado!\n\nApenas o Tecnico pode mover tarefas para 'Feito' depois de aprova-las na coluna 'Em Revisao'.");
          return;
      }

      // --- TRAVA DE 3 HORAS (SÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ PARA ALUNOS) ---
      if (newStatus === 'review' && !isAdmin) {
          const task = tasks.find(t => t.id === id);
          if (task && task.createdAt) {
              const createdTime = new Date(task.createdAt).getTime();
              const now = new Date().getTime();
              const hoursDiff = (now - createdTime) / (1000 * 60 * 60);
              
              if (hoursDiff < 3) {
                  const hoursLeft = (3 - hoursDiff).toFixed(1);
                  alert(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ Acesso Bloqueado!\n\nAs tarefas precisam de pelo menos 3 horas desde a criaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para irem para "Em RevisÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o". Isso garante que vocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs planejem ANTES de executar.\n\nAguarde mais ${hoursLeft} hora(s) para avanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ar.`);
                  return; // Cancela a movimentaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
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
              showNotification("VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª assumiu a responsabilidade desta tarefa!");
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
                    showNotification("Esta tarefa jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ atingiu o limite de 3 participantes.", "error");
                    return;
                }
                
                newAuthor = `${task.author}, ${viewAsStudent.name}`;
            }
            
            await updateDoc(doc(db, "tasks", id), { author: newAuthor });
            showNotification("VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª entrou na tarefa!");
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
            showNotification("VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª saiu da tarefa!");
        } catch (error) {
            console.error("Erro ao sair da tarefa:", error);
        }
    };

    const assignTaskToStudent = async (taskId, studentName) => {
        if (!isAdmin) return;
        
        // Se o valor for vazio, desatribui (author: null). SenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o, atribui.
        const newAuthor = studentName === "" ? null : studentName;

        try {
            await updateDoc(doc(db, "tasks", taskId), { author: newAuthor });
            if (newAuthor) {
              showNotification(`Tarefa atribuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da para ${studentName}!`);
            } else {
              showNotification(`Tarefa agora ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© da equipe.`);
            }
        } catch (error) {
            console.error("Erro ao atribuir tarefa:", error);
            showNotification("Erro ao atribuir tarefa.", "error");
        }
    };

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O PARA SALVAR DIÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂRIO DE BORDO ---
  const handleLogbookSubmit = async (e) => {
      e.preventDefault();
      const text = studentLogbookDraft.trim();
      // Se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o tiver semana definida, pega a atual ou a 1
      const weekId = currentWeekData?.id || 1;
      const weekName = currentWeekData?.weekName || "Semana Inicial";

      if (!text || !viewAsStudent?.id) return; // Apenas alunos podem escrever

      try {
          // O caminho agora ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© uma subcoleÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o dentro do documento do aluno
          const logbookRef = collection(db, 'students', viewAsStudent.id, 'logbook');
          
          // Usamos setDoc com um ID especÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­fico para evitar duplicatas na mesma semana?
          // Ou addDoc para permitir vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios registros na semana?
          // Vamos usar addDoc para permitir vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios insights na mesma semana.
          
          const tags = Array.from(new Set((text.match(/#[^\s#]+/g) || []).map((tag) => tag.toLowerCase())));
          const wordCount = text.split(/\s+/).filter(Boolean).length;

          const newEntry = {
              // Ainda salvamos o nome para a visualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o consolidada do tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico
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
          showNotification("DiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio de Bordo atualizado! ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“");
      } catch (error) {
          console.error("Erro ao salvar diÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O PARA EXCLUIR REGISTRO DO DIÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂRIO ---
  const handleDeleteLogbookEntry = async (entry) => {
      if (!window.confirm("Tem certeza que deseja apagar este registro?")) return;

      try {
          // Se temos o caminho completo (refPath), usamos ele. 
          // SenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (caso antigo), tentamos montar o caminho se soubermos o ID do aluno.
          const path = entry.refPath || `students/${viewAsStudent?.id}/logbook/${entry.id}`;
          await deleteDoc(doc(db, path));
          showNotification("Registro apagado.");
      } catch (error) {
          console.error("Erro ao apagar registro:", error);
          showNotification("Erro ao apagar.", "error");
      }
  }

 // 2. A funÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de excluir:
const handleDeleteStudent = async (studentId) => {
    // ConfirmaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para o tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o excluir sem querer esbarrando no botÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
    if (window.confirm("Tem certeza que deseja excluir este aluno do banco de dados? A aÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o pode ser desfeita.")) {
        try {
            // A. Deleta o documento lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ no Firebase
            const studentRef = doc(db, "students", studentId);
            await deleteDoc(studentRef);

            // B. Atualiza a tela (remove da lista local sem precisar atualizar a pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡gina)
            setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));

            alert("Aluno excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­do com sucesso! ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â");
        } catch (error) {
            console.error("Erro ao excluir aluno no Firebase:", error);
            alert("Erro ao excluir. Verifique sua conexÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o ou regras do Firebase.");
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
        
        // --- NOVO: Apaga tambÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m o histÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico do grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico deste round ---
        // Usamos o state 'scoreHistory' que jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ carregado para nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o precisar fazer outra busca
        const historyToDelete = scoreHistory.filter(h => h.roundId === id);
        historyToDelete.forEach(async (h) => await deleteDoc(doc(db, "score_history", h.id)));

        showNotification("Registro apagado do banco!");
      } catch (error) {
        console.error("Erro fatal ao apagar:", error);
        alert("Erro no sistema: Olhe o Console (F12)");
      }
    }
  };
  
  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES DE EXCLUSÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O (MATRIZ, ESPECIALISTAS, ROBÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â) ---
  const handleDeleteMatrix = async (id) => {
      if (window.confirm("Tem certeza que deseja excluir esta ideia da matriz?")) {
          try {
              await deleteDoc(doc(db, "decisionMatrix", id));
              showNotification("Ideia excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da com sucesso!");
          } catch (error) {
              console.error("Erro ao excluir ideia:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleDeleteExpert = async (e, id) => {
      e.stopPropagation(); // Evita abrir o modal de visualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o ao clicar na lixeira
      if (window.confirm("Tem certeza que deseja excluir este especialista?")) {
          try {
              await deleteDoc(doc(db, "experts", id));
              showNotification("Especialista excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­do!");
          } catch (error) {
              console.error("Erro ao excluir especialista:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleDeleteRobotVersion = async (e, id) => {
      e.stopPropagation(); // Evita abrir o modal de visualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
      if (window.confirm("Tem certeza que deseja excluir esta versÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do robÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´?")) {
          try {
              await deleteDoc(doc(db, "robotVersions", id));
              showNotification("VersÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do robÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´ excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da!");
          } catch (error) {
              console.error("Erro ao excluir versÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleDeleteMission = async (id) => {
      if (window.confirm("Tem certeza que deseja excluir esta missÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o? Ela serÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ removida permanentemente do banco de dados.")) {
          try {
              await deleteDoc(doc(db, "missions", id));
              showNotification("MissÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da com sucesso!");
              // Se estava editando essa mesma missÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o, limpa o formulÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio
              if (modal.data?.id === id) {
                  setModal({ type: 'missionForm', data: null });
                  setSelectedFile(null);
              }
          } catch (error) {
              console.error("Erro ao excluir missÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O CORRIGIDA COM LOGS ---
  const handleRegisterSubmit = async (e) => { 
      e.preventDefault(); 
      const fd = new FormData(e.target); 
      
      // Verifica se estamos editando ou criando
      const isEditing = modal.data?.id;

      // A imagem agora jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ vem processada e redimensionada pelo Crop e estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ em modal.data.avatarImage
      const avatarImage = modal.data?.avatarImage || null;

      // Cria o objeto de dados do aluno
      const studentData = { 
          name: fd.get('name'), 
          turma: fd.get('turma'), 
          specialty: (fd.get('specialty') || '').toString().trim(),
          username: fd.get('username'), 
          password: fd.get('password'), 
          avatarImage: avatarImage, // Novo campo para a foto
          // MantÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m os outros campos se estiver editando
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

  // --- NOVO: SALVAR PROJETO DE INOVAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O ---
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
          closeModal();
          showNotification("Projeto de Inovacao atualizado!");
      } catch (error) {
          console.error("Erro ao salvar projeto:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES DE OUTREACH (IMPACTO) ---
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
              showNotification("Registro excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­do com sucesso!");
          } catch (error) {
              console.error("Erro ao excluir impacto:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  }

  const handleAttendanceSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      
      // Pega todos os IDs marcados no checkbox (agora sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o strings do Firebase)
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
          showNotification("FrequÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia registrada no Firebase!");
      } catch (error) {
          console.error("Erro na chamada:", error);
          showNotification("Erro ao salvar frequÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia.", "error");
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
              // Se jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ tem ID, atualiza (Editar)
              await updateDoc(doc(db, "experts", modal.data.id), expertData);
          } else {
              // Se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o tem ID, cria novo (Salvar)
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
          showNotification("VersÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do robÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´ salva!");
      } catch (error) {
          console.error("Erro ao salvar robÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }




  const handleRoundSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const selectedMissions = Array.from(fd.getAll('missions'));
      const estimatedTime = Number.parseInt(fd.get('time'), 10) || 0;
      
      // Calcula pontos somando as missÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes selecionadas
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
          to: getStudentName(parseInt(fd.get('to'))), // Pega o nome do destinatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio
          msg: fd.get('msg'),
          date: new Date().toLocaleDateString().slice(0,5)
      };

      try {
          // 1. Salva o elogio
          await addDoc(collection(db, "compliments"), complimentData);

          // 2. DÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ XP para quem enviou (GamificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o!)
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
          // ApÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³s salvar, nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o fecha o modal: apenas limpa para que vocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª possa adicionar/ver outras
          setModal({ type: 'missionForm', data: null });
          setSelectedFile(null);
          showNotification("MissÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o salva!");
      } catch (error) {
          console.error("Erro ao salvar missÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleGradesSubmit = async (e) => {
      e.preventDefault();
      if (currentUser?.type !== 'admin') {
          showNotification("Apenas tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnicos podem lanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ar notas.", "error");
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
          console.error("Erro ao lanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ar notas:", error);
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

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES DA AGENDA ---
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
          author: modal.data?.author || viewAsStudent?.name || "TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico"
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
              showNotification("Evento excluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­do.");
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
          // Cria uma lista de atualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes para enviar tudo de uma vez
          const updates = stationStudents.map(student => {
              const studentRef = doc(db, "students", student.id);
              
              // LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica de XP
              let xpGain = 0;
              if (student.submission?.status === 'approved') {
                  xpGain = isCompleteTeam ? FULL_TEAM_XP : PARTIAL_TEAM_XP;
              }

              // Prepara a atualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o: DÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ XP, remove a estaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o e limpa a entrega
              return updateDoc(studentRef, {
                  xp: (student.xp || 0) + xpGain,
                  station: null,
                  submission: null
              });
          });

          // Executa todas as atualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes no banco
          await Promise.all(updates);

          if(isCompleteTeam) showNotification(`Semana ${station} fechada! Sucesso Total!`, "success");
          else showNotification(`Semana ${station} fechada com penalidade.`, "error");

      } catch (error) {
          console.error("Erro ao fechar semana:", error);
          showNotification("Erro ao salvar fechamento.", "error");
      }
  }

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O PARA APLICAR O RODÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂZIO AUTOMATICAMENTE ---
  const handleApplyRotation = async () => {
      if (!currentWeekData) return;
      if (!window.confirm(`Sincronizar a equipe com a ${currentWeekData.weekName}? Todos os alunos serÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o movidos para as suas estaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes.`)) return;
      
      try {
          // Cria uma lista de atualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes para enviar tudo de uma vez
          const updates = students.map(student => {
              let targetStation = null;
              
              // Verifica em qual estaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o o aluno estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ escalado no cronograma
              if (currentWeekData.assignments[STATION_KEYS.ENGINEERING].some(s => s.name === student.name)) targetStation = STATION_KEYS.ENGINEERING;
              else if (currentWeekData.assignments[STATION_KEYS.INNOVATION].some(s => s.name === student.name)) targetStation = STATION_KEYS.INNOVATION;
              else if (currentWeekData.assignments[STATION_KEYS.MANAGEMENT].some(s => s.name === student.name)) targetStation = STATION_KEYS.MANAGEMENT;

              // Atualiza o aluno no Firebase
              return updateDoc(doc(db, "students", student.id), { station: targetStation, submission: null });
          });

          await Promise.all(updates);
          showNotification("RodÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­zio automÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tico aplicado com sucesso!", "success");
      } catch (error) {
          console.error("Erro ao aplicar rodÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­zio:", error);
          showNotification("Erro ao aplicar rodÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­zio.", "error");
      }
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
          showNotification("Perfil do tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico atualizado com sucesso!");
      } catch (error) {
          console.error("Erro ao salvar perfil do tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico:", error);
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
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Selo fixo do aluno ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ estacao muda por semana</p>
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


  // --- MODAL DE XP E APROVAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O (CONECTADO) ---
  const openXPModal = (student, context = "manual") => { 
      if (currentUser?.type !== 'admin') {
          showNotification("Apenas tÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnicos podem gerenciar XP.", "error");
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
                      
                      // Prepara a atualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do XP
                      const updateData = { xp: (student.xp || 0) + val };

                      // Se for contexto de aprovaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o, muda o status da entrega tambÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m
                      if (context === 'approval') {
                          // MantÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m os dados da entrega, mas muda status para 'approved'
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

  const handleDeleteClick = (id) => { setModal({ type: 'confirm', data: { title: "Excluir?", msg: "IrreversÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel.", onConfirm: () => { deleteStudent(id); closeModal(); showNotification("Removido."); } } }) }

  // --- RECUSAR ATIVIDADE (CONECTADO) ---
  const handleRejectClick = (student) => { 
      setModal({ 
          type: 'confirm', 
          data: { 
              title: "Recusar Entrega?", 
              msg: "O aluno receberÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ um aviso para refazer.", 
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

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O CORRIGIDA: MOVER ALUNO (Salva no Firebase) ---
  const moveStudent = async (id, st) => {
      try {
          // ReferÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia ao documento do aluno no banco
          const studentRef = doc(db, "students", id);
          
          // Atualiza o campo 'station' no Firebase
          // TambÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m limpamos a 'submission' anterior para ele comeÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ar zerado na nova estaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
          await updateDoc(studentRef, { 
              station: st,
              submission: null 
          });

          // Feedback visual
          if (st) showNotification(`Aluno movido para ${st}`);
          else showNotification("Aluno voltou para a Equipe");

      } catch (error) {
          console.error("Erro ao mover aluno:", error);
          showNotification("Erro ao salvar mudanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a.", "error");
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

  // --- APROVAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O RÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂPIDA DE ATIVIDADES (EMAIL/EXTERNO) ---
  const toggleActivityStatus = async (student, newStatus) => {
      try {
          const studentRef = doc(db, "students", student.id);
          if (!newStatus) {
              await updateDoc(studentRef, { submission: null });
              showNotification("Status de entrega removido.");
          } else {
              const newSubmission = { 
                  status: newStatus,
                  text: "Avaliado manualmente pelo TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico (E-mail/Externo)",
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

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O PARA RESETAR TODAS AS ATIVIDADES ---
  async function handleResetAllActivities() {
      if (!window.confirm("Tem certeza que deseja limpar as entregas de atividades de TODOS os alunos? Isso prepararÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ o sistema para a prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³xima semana de treinos.")) return;
      
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

// --- CARREGAR AS METAS DO BANCO (MemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ria Longa) ---
  useEffect(() => {
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
  }, []);

  // --- ATUALIZAR NA TELA ENQUANTO DIGITAM (MemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ria Curta) ---
  const updateMission = (station, field, value) => {
    setMissions(prev => ({
      ...prev,
      [station]: { ...prev[station], [field]: value }
    }));
  };

  // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O PARA SALVAR A AUTO-AVALIAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DA RUBRICA ---
  const handleRubricUpdate = async (rubricType, category, value) => {
      const isInnovation = rubricType === 'innovation';
      const currentRubric = isInnovation ? innovationRubric : robotDesignRubric;
      const setRubricState = isInnovation ? setInnovationRubric : setRobotDesignRubric;
      const docId = isInnovation ? 'rubric_innovation' : 'rubric_robot_design';
      const defaults = isInnovation ? DEFAULT_INNOVATION_RUBRIC : DEFAULT_ROBOT_DESIGN_RUBRIC;
 
      const newRubric = normalizeRubricValues({ ...currentRubric, [category]: value }, defaults);
      setRubricState(newRubric); // Atualiza na tela imediatamente
      try {
          // Salva no banco de dados sem precisar de botÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o "Salvar"
          await setDoc(doc(db, "settings", docId), newRubric);
      } catch (error) {
          console.error(`Erro ao salvar rubrica de ${rubricType}:`, error);
          showNotification("Erro ao salvar auto-avaliaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o.", "error");
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

// --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O AUXILIAR PARA TRANSFORMAR O ARQUIVO EM TEXTO ---
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
          showNotification("Aviso de atividade enviado para validaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o pelo TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico!");
      
      } catch (error) {
          console.error("Erro ao enviar:", error);
          showNotification("Erro ao sinalizar o TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico.", "error");
      } finally {
          setIsSubmitting(false);
      }
  };
// ATENÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O: COLOQUE ISSO NO SEU CÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œDIGO DO TÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°CNICO
// --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DO BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O 'BAIXAR ARQUIVO' NO PAINEL DO TÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°CNICO ---
  const handleDownloadFile = (sub) => { 
      if (sub && sub.fileData) {
          // O navegador recria o arquivo a partir do texto e forÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a o download
          const link = document.createElement("a");
          link.href = sub.fileData;
          link.download = sub.fileName || "atividade_baixada.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          showNotification("NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o hÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ arquivo anexado ou o link estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ quebrado.", "error");
      }
  };
  // --- UI COMPONENTS ---

  // --- COMPONENTE DE ESTATÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂSTICAS DA EQUIPE (VISÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DOS JUÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂZES) ---
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
          { label: 'VersÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes do RobÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´', value: totalRobotVersions, icon: <GitCommit size={16}/>, color: 'text-blue-500' },
          { label: 'Recorde de Pontos', value: maxScore, icon: <Trophy size={16}/>, color: 'text-green-500' },
          { label: 'Tarefas Entregues', value: totalTasksDone, icon: <CheckCheck size={16}/>, color: 'text-pink-500' },
          { label: 'Badges Coletadas', value: totalBadges, icon: <Medal size={16}/>, color: 'text-cyan-500' },
          { label: 'XP da Equipe', value: totalXP, icon: <Zap size={16}/>, color: 'text-yellow-500' },
          { label: 'Aprovados (Semana)', value: approvedStudentsThisWeek, icon: <CheckCircle size={16}/>, color: 'text-green-400' }
      ];

      return (
          <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 mb-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><BarChart3 size={150} /></div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10"><BarChart3 className="text-blue-500"/> Raio-X da Temporada (Dados para JuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­zes)</h3>
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
          { id: 'team_xp', name: 'PotÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡xima', icon: <Zap size={16}/>, color: 'text-yellow-400', bg: 'bg-yellow-500', desc: 'Atingir 6.000 XP somados por toda a equipe.', current: totalXP, target: 6000 },
          { id: 'team_impact', name: 'Voz da MudanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a', icon: <Megaphone size={16}/>, color: 'text-orange-500', bg: 'bg-orange-500', desc: 'Impactar mais de 350 pessoas com o projeto.', current: totalImpact, target: 350 },
          { id: 'team_tasks', name: 'MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡quina de Produtividade', icon: <CheckCheck size={16}/>, color: 'text-green-500', bg: 'bg-green-500', desc: 'Concluir 300 tarefas no Kanban da equipe.', current: totalTasksDone, target: 300 },
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

    // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o interna inteligente para resolver o nome
    // Aceita: ID, Objeto {name: "Ana"} ou String "Ana"
    const resolveName = (item) => {
        if (!item) return "Vago";
        
        // 1. Se for um objeto com nome (nosso fix anterior)
        if (typeof item === 'object' && item.name) return item.name;
        
        // 2. Se for um ID, tenta achar na lista de alunos
        const found = students.find(s => s.id === item);
        if (found) return found.name;

        // 3. Se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o achou ID, assume que o prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³prio item ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© o nome (Texto)
        return item; 
    };

    return ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in backdrop-blur-sm"> 
            <div className="bg-[#151520] border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col relative shadow-2xl overflow-hidden"> 
                
                {/* CabeÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§alho */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0f]">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <CalendarDays className="text-blue-500"/> Cronograma Completo (36 Semanas)
                    </h3>
                    <button onClick={() => setShowFullSchedule(false)} className="text-gray-400 hover:text-white p-2 bg-white/5 rounded-lg">
                        <X size={24}/>
                    </button>
                </div> 

                {/* ConteÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºdo com Scroll */}
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

                                {/* Grid das EstaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes */}
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

                                    {/* 2. InovaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o */}
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

                                    {/* 3. GestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (CORRIGIDO) */}
                                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                                        <h4 className="text-purple-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><BookOpen size={14}/> {STATION_KEYS.MANAGEMENT}</h4>
                                        <div className="space-y-2">
                                            {(week.assignments[STATION_KEYS.MANAGEMENT] || []).map((item, i) => {
                                                const studentName = resolveName(item);
                                                // Verifica se ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© o aluno rotativo na gestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (que assume como lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­der)
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
                                                                        LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­der
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



          {modal.type === 'imageView' && <img src={modal.data} className="w-full h-auto rounded-lg" alt="EvidÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia" />}

          {/* --- MODAL DE RECORTE (CROP) --- */}
          {isCropping && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
                <div className="bg-zinc-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Crop size={20}/> Ajustar Foto</h3>
                    
                    {/* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ârea de VisualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o e Arrastar */}
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
                        <p className="text-gray-400 font-mono text-sm bg-white/5 px-3 py-1 rounded-full mt-2 border border-white/10">{modal.data.turma} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ {modal.data.station || "Membro da Equipe"}</p>
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
                        <span className="text-gray-500 text-xs font-bold uppercase mb-1">NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­vel Atual</span>
                        <span className={`text-xl font-black ${getCurrentLevel(modal.data.xp).color}`}>{getCurrentLevel(modal.data.xp).name}</span>
                        <span className="text-xs text-gray-400">{modal.data.xp} XP Totais</span>
                    </div>
                    <div className="bg-[#151520] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${getAttendanceStats(modal.data).percent > 75 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-gray-500 text-xs font-bold uppercase mb-1">FrequÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia</span>
                        <span className={`text-xl font-black ${getAttendanceStats(modal.data).percent > 75 ? 'text-green-500' : 'text-red-500'}`}>{getAttendanceStats(modal.data).percent}%</span>
                        <span className="text-xs text-gray-400">{getAttendanceStats(modal.data).absences} Faltas</span>
                    </div>
                </div>

                {/* Badges Collection */}
                <div className="mb-8">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Medal className="text-yellow-500"/> ColeÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de Badges
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
                    {/* BotÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de Editar (sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ aparece para o prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³prio aluno) */}
                    {viewAsStudent?.id === modal.data.id && (
                        <button 
                            onClick={() => {
                                closeModal(); // Fecha o modal de perfil
                                openNewStudentModal(modal.data); // Abre o modal de ediÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
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
    
    {/* DADOS BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂSICOS */}
    <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label>
            <input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Ana Silva" />
        </div>
        <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Turma</label>
            <input name="turma" defaultValue={modal.data?.turma} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: 8ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âº A" />
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
                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">UsuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio</label>
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
        {modal.data ? 'Salvar AlteraÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes' : 'Cadastrar Aluno'}
    </button>
  </form>
)}

          {modal.type === 'editAdminProfile' && (
            <form onSubmit={handleAdminProfileSubmit}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Shield className="text-red-500"/> Editar Perfil do TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                  <div>
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome de ExibiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</label>
                      <input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="Ex: TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico Guilherme" />
                  </div>
                  <div>
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Especialidade / assinatura</label>
                      <input name="specialty" defaultValue={modal.data?.specialty || ''} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="Ex: Estrategia, ritmo e leitura da equipe" />
                  </div>
              </div>

              <div className="mb-4">
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nova Senha de Acesso (Opcional)</label>
                  <input name="password" type="password" className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="Deixe em branco para nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o alterar" />
                  <p className="text-[10px] text-gray-500 mt-1">VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª poderÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ logar usando o usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio <strong className="text-gray-400">admin</strong> ou o seu <strong className="text-gray-400">Nome de ExibiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</strong>.</p>
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
              
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all">Salvar AlteraÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes</button>
            </form>
          )}
          {modal.type === 'expertForm' && (<form onSubmit={handleExpertSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Briefcase className="text-purple-500"/> {modal.data ? 'Editar' : 'Novo'} Especialista</h3><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label><input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Cargo</label><input name="role" defaultValue={modal.data?.role} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label><input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">AnotaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes</label><textarea name="notes" defaultValue={modal.data?.notes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-20" /></div><div className="mb-4 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">EvidÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia (Foto)</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ salva</div>}</div><div className="mb-6 flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10"><div><span className="text-sm font-bold text-white">Impactou?</span></div><select name="impact" defaultValue={modal.data?.impact} className="bg-black/50 border border-white/20 text-white p-2 rounded text-sm"><option value="Baixo">Baixo</option><option value="MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dio">MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dio</option><option value="Alto">Alto</option></select><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="applied" defaultChecked={modal.data?.applied} className="w-5 h-5 accent-green-500" /><span className="text-xs text-white">Aplicado</span></label></div><button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Salvar Registro</button></form>)}

          {modal.type === 'robotForm' && (<form onSubmit={handleRobotSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><GitCommit className="text-blue-500"/> {modal.data ? 'Editar' : 'Novo'} VersÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</h3><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">VersÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</label><input name="version" defaultValue={modal.data?.version} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: V2.0" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label><input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Apelido</label><input name="name" defaultValue={modal.data?.name} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">O que mudou?</label><textarea name="changes" defaultValue={modal.data?.changes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" /></div><div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">EvidÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia (Foto)</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ salva</div>}</div><button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Salvar VersÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</button></form>)}

        

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
      
      {/* --- BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DE DOWNLOAD (VERSÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O BASE64) --- */}
      <button 
        onClick={(e) => {
           e.stopPropagation();
           const fileData = modal.data.submission.fileData;
           const fileName = modal.data.submission.fileName || "arquivo_download";

           if (fileData) {
             // Truque para baixar arquivo Base64
             const link = document.createElement("a");
             link.href = fileData;
             link.download = fileName; // O segredo estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ aqui: forÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a o download com o nome certo
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
           } else {
             alert("ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â Erro: O conteÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºdo do arquivo nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o foi encontrado.");
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
          {modal.type === 'expertView' && (<div><h3 className="text-xl font-bold text-white mb-1">{modal.data.name}</h3><p className="text-sm text-purple-400 mb-4">{modal.data.role} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ {modal.data.date}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-4"><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">"{modal.data.notes}"</p></div><div className="flex gap-4 mb-6"><div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><span className="text-[10px] text-gray-400 uppercase font-bold">Impacto</span><span className={`text-xs font-bold ${modal.data.impact==='Alto'?'text-green-500':modal.data.impact==='MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dio'?'text-yellow-500':'text-gray-500'}`}>{modal.data.impact}</span></div>{modal.data.applied && <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"><CheckCircle size={12} className="text-green-500"/><span className="text-xs font-bold text-green-500">SugestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o Aplicada</span></div>}</div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">EvidÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia Anexada</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10" alt="EvidÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªncia" /></div>)}</div>)}

          {modal.type === 'robotView' && (<div><div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-white">{modal.data.name}</h3><span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-mono font-bold">{modal.data.version}</span></div><p className="text-xs text-gray-500 mb-6">{modal.data.date}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">MudanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§as e Testes</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.changes}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto do ProtÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³tipo</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10" alt="RobÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´" /></div>)}</div>)}

          {modal.type === 'attachmentForm' && (
              <form onSubmit={handleAttachmentSubmit}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Wrench className="text-blue-500"/> {modal.data ? 'Editar' : 'Nova'} Garra / Anexo</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Anexo</label>
                          <input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Garra 1" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">SaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da Associada</label>
                          <select name="roundId" defaultValue={modal.data?.roundId} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                              <option value="">Selecione...</option>
                              {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="mb-4">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data da ModificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</label>
                      <input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="mb-4">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">MudanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§as / Funcionalidade</label>
                      <textarea name="changes" defaultValue={modal.data?.changes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" placeholder="Para quais missÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes serve e o que foi alterado?" />
                  </div>
                  <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                      <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da Garra</label>
                      <input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />
                      {selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ salva</div>}
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Salvar Garra</button>
              </form>
          )}

          {modal.type === 'attachmentView' && (<div><div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-white">{modal.data.name}</h3>{(() => { const roundName = rounds.find(r => r.id === modal.data.roundId)?.name || 'SaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da Desconhecida'; return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-mono font-bold">{roundName}</span> })()}</div><p className="text-xs text-gray-500 mb-6">{modal.data.date?.split('-').reverse().join('/')} {modal.data.author && `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Por ${modal.data.author}`}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">MudanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§as / Funcionalidade</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.changes}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da Garra</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-80 transition-opacity" alt="Garra" onClick={() => openImageModal(modal.data.image)} title="Clique para ampliar" /></div>)}</div>)}

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

          {modal.type === 'codeView' && (<div><h3 className="text-xl font-bold text-white mb-2">{modal.data.title}</h3><p className="text-xs text-gray-500 mb-6 flex items-center gap-2"><Calendar size={12}/> {modal.data.date?.split('-').reverse().join('/')} {modal.data.author && <><UserCircle size={12} className="ml-2"/> Por {modal.data.author}</>}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block flex items-center gap-1"><Lightbulb size={12}/> LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica de Funcionamento</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.description}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block flex items-center gap-1"><ImageIcon size={12}/> Print do CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³digo</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-80 transition-opacity" alt="CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³digo" onClick={() => openImageModal(modal.data.image)} title="Clique para ampliar" /></div>)}</div>)}

          {modal.type === 'newRound' && (<form onSubmit={handleRoundSubmit}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-blue-500"/> {modal.data ? 'Editar SaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da' : 'Planejar SaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da'}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome da SaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da</label><input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: SaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da 1" /></div>
                  <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Tempo Estimado (s)</label><input name="time" type="number" defaultValue={modal.data?.estimatedTime} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="30" /></div>
              </div>

              {/* SELEÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DE BASE */}
              <div className="mb-4">
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Base de SaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da</label>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-2 bg-black/50 p-3 rounded-lg border border-white/20 flex-1 cursor-pointer hover:border-blue-500 transition-colors"><input type="radio" name="startBase" value="Esquerda" defaultChecked={modal.data?.startBase ? modal.data.startBase === 'Esquerda' : true} className="accent-blue-500"/><span className="text-sm text-white">Esquerda (Vermelho)</span></label>
                      <label className="flex items-center gap-2 bg-black/50 p-3 rounded-lg border border-white/20 flex-1 cursor-pointer hover:border-red-500 transition-colors"><input type="radio" name="startBase" value="Direita" defaultChecked={modal.data?.startBase === 'Direita'} className="accent-red-500"/><span className="text-sm text-white">Direita (Azul)</span></label>
                  </div>
              </div>

              <div className="mb-6 max-h-40 overflow-y-auto custom-scrollbar border border-white/10 rounded-lg p-2"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block sticky top-0 bg-[#151520] pb-2">MissÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes (Selecione)</label>{missionsList.map(m => (<label key={m.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"><input type="checkbox" name="missions" value={m.id} defaultChecked={modal.data?.missions?.includes(m.id)} className="accent-blue-500 w-4 h-4"/><div className="flex items-center gap-2 flex-1">{m.image && <img src={m.image} className="w-6 h-6 rounded object-cover" alt="M" />}<span className="text-sm text-gray-300">{m.code} - {m.name}</span></div><span className="text-xs font-bold text-blue-500">+{m.points}pts</span></label>))}</div><button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">{modal.data ? 'Salvar alteracoes' : 'Salvar SaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­da'}</button></form>)}

    

          {modal.type === 'attendance' && (<form onSubmit={handleAttendanceSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-green-500"/> Chamada do Dia</h3><div className="mb-6 max-h-60 overflow-y-auto custom-scrollbar">{students.map(s => { const stats = getAttendanceStats(s); return ( <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg border-b border-white/5 cursor-pointer"><input type="checkbox" name="present" value={s.id} defaultChecked className="accent-green-500 w-5 h-5"/><div className="flex-1"><span className="text-white font-bold block">{s.name}</span><span className="text-xs text-gray-500">{s.turma} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ PresenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a: <span className={stats.percent < 75 ? 'text-red-500' : 'text-green-500'}>{stats.percent}%</span> ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Faltas: {stats.absences}</span></div></label>) })}</div><button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg">Confirmar PresenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a</button></form>)}

          {modal.type === 'grades' && (() => {
              const stageId = modal.data.stageId || 'etapa1';
              const stageMeta = SCHOOL_REPORT_STAGE_CONFIG[stageId] || SCHOOL_REPORT_STAGE_CONFIG.etapa1;
              const stageRecord = getSchoolStageRecord(modal.data.student, stageId);
              const stageHasGrades = Boolean(stageRecord?.grades && Object.keys(stageRecord.grades).length > 0);

              return (
                  <form onSubmit={handleGradesSubmit}>
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white"><GraduationCap className="text-yellow-500"/> Boletim SESI ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ {stageMeta.label}</h3>
                      <p className="text-xs text-gray-400 mb-4">Insira as notas do aluno(a) <strong className="text-white">{modal.data.student.name}</strong> para a <strong className="text-yellow-300">{stageMeta.label}</strong>.</p>

                      <div className={`mb-6 rounded-xl border p-3 text-xs ${stageHasGrades ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100'}`}>
                          <p className="font-bold uppercase tracking-[0.16em]">{stageMeta.periodLabel}</p>
                          <p className="mt-2 text-[11px] leading-relaxed text-white/80">
                              {stageHasGrades
                                  ? 'Esta etapa jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ foi lanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ada. Se vocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª corrigir alguma nota, o sistema recalcula sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ a diferenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a de XP.'
                                  : 'As notas desta etapa ficam separadas da outra para evitar lanÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§amento duplicado.'}
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
                          <p className="font-bold text-white mb-2">BÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´nus de XP por MatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©ria:</p>
                          <div className="grid grid-cols-2 gap-2">
                              <p>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Nota 10 = <span className="text-green-500 font-bold">+10 XP</span></p>
                              <p>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Nota 9.0 a 9.9 = <span className="text-cyan-500 font-bold">+7 XP</span></p>
                              <p>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Nota 8.0 a 8.9 = <span className="text-purple-500 font-bold">+5 XP</span></p>
                              <p>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Nota 7.9 ou menos = <span className="text-red-400 font-bold">-2 XP</span></p>
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

          {/* NOVO MODAL: EDITOR DE MISSÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES */}
          {modal.type === 'missionForm' && (
             <div>
                 <form onSubmit={handleMissionSubmit} className="mb-8 pb-8 border-b border-white/10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Settings className="text-blue-500"/> {modal.data ? 'Editar' : 'Nova'} MissÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³digo</label><input name="code" defaultValue={modal.data?.code} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: M01" /></div>
                        <div className="col-span-2"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label><input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Coral Nursery" /></div>
                    </div>
                    <div className="mb-4">
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Pontos (MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡x)</label>
                        <input name="points" type="number" defaultValue={modal.data?.points} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da MissÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</label>
                        <input id="missionFileInput" type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />
                        {selectedFile ? (
                            <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1">
                                <CheckCircle size={10}/> Selecionado: {selectedFile.name}
                                <button type="button" onClick={() => { setSelectedFile(null); document.getElementById('missionFileInput').value = ''; }} className="text-red-500 hover:text-red-400 ml-2">Remover</button>
                            </span>
                        ) : modal.data?.image && (
                            <div className="mt-2 text-xs text-blue-500 flex items-center gap-1">
                                <CheckCircle size={10}/> Imagem jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ salva
                                <button type="button" onClick={() => setModal(prev => ({ ...prev, data: { ...prev.data, image: null } }))} className="text-red-500 hover:text-red-400 ml-2 font-bold">Remover</button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">Salvar MissÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</button>
                        {modal.data && <button type="button" onClick={() => { setModal({type: 'missionForm', data: null}); setSelectedFile(null); }} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Cancelar</button>}
                    </div>
                 </form>

                 {/* LISTA GERENCIADORA DE MISSÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ES */}
                 <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><ListTodo size={16}/> MissÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes Cadastradas</h4>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                       {missionsList.length === 0 ? (
                           <p className="text-xs text-gray-500 italic">Nenhuma missÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o cadastrada. Adicione no formulÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio acima.</p>
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



          {/* NOVO MODAL: MATRIZ DE DECISÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O */}

          {modal.type === 'matrixForm' && (

             <form onSubmit={handleMatrixSubmit}>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><BarChart3 className="text-purple-500"/> Nova Ideia</h3>

                <div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome da Ideia / SoluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</label><input name="name" required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Ex: Filtro de CarvÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o" /></div>

                <p className="text-xs text-gray-400 font-bold mb-2 uppercase">PontuaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (1 = Ruim, 5 = Excelente)</p>

                <div className="grid grid-cols-2 gap-4 mb-6">

                    <div><label className="text-[10px] text-gray-500 block mb-1">Impacto (Peso x3)</label><input name="impact" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">Custo (Peso x2)</label><input name="cost" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">Facilidade (Peso x1)</label><input name="feasibility" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">InovaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (Peso x2)</label><input name="innovation" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Adicionar ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â  Matriz</button>

             </form>

          )}

          {/* NOVO MODAL: EDITOR DO PROJETO */}
          {modal.type === 'projectForm' && (
             <form onSubmit={handleProjectSubmit}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <Lightbulb className="text-yellow-500"/> Editar Projeto de InovaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
                </h3>

                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Projeto / SoluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</label>
                    <input name="title" defaultValue={projectSummary?.title} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-yellow-500 outline-none font-bold text-lg" placeholder="Ex: Filtro Bio-SintÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©tico" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-red-400">O Problema</label>
                        <textarea name="problem" defaultValue={projectSummary?.problem} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-32 focus:border-red-500 outline-none resize-none" placeholder="Qual problema vocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs resolveram?" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-green-400">A SoluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</label>
                        <textarea name="solution" defaultValue={projectSummary?.solution} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-32 focus:border-green-500 outline-none resize-none" placeholder="Como funciona a invenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o?" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-blue-400">Impacto (Para os JuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­zes)</label>
                    <textarea name="impact" defaultValue={projectSummary?.impact} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-20 focus:border-blue-500 outline-none" placeholder="Quem isso ajuda? Qual o benefÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­cio real?" />
                </div>

                <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto do ProtÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³tipo / Desenho</label>
                    <input id="projectFileInput" type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-yellow-500/10 file:text-yellow-500 hover:file:bg-yellow-500/20 cursor-pointer" />
                    {selectedFile ? (
                        <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1">
                            <CheckCircle size={10}/> Selecionado: {selectedFile.name}
                            <button type="button" onClick={() => { setSelectedFile(null); document.getElementById('projectFileInput').value = ''; }} className="text-red-500 hover:text-red-400 ml-2">Remover</button>
                        </span>
                    ) : projectSummary?.image && (
                        <div className="mt-2 text-xs text-blue-500 flex items-center gap-1">
                            <CheckCircle size={10}/> Imagem atual jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ salva
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
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Evento / AÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</label>
                    <input name="name" required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-orange-500 outline-none" placeholder="Ex: ApresentaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para o 6ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âº Ano" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblico-Alvo</label>
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
                    <textarea name="feedback" className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-orange-500 outline-none h-24 resize-none" placeholder="O que acharam? Deram alguma sugestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o?"></textarea>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl mb-6 text-xs text-orange-400 flex items-start gap-2">
                    <Info size={16} className="shrink-0 mt-0.5"/>
                    <p>O Firebase nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o armazena fotos desta etapa para economizar espaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o. Registre as fotos por conta prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³pria no Drive da equipe e mostre aos juÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­zes!</p>
                </div>

                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-900/20 transition-all">Salvar Registro</button>
             </form>
          )}

          {/* NOVO MODAL: EDITOR DE AGENDA/EVENTO */}
          {modal.type === 'eventForm' && (
             <form onSubmit={handleEventSubmit}>
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
                            <option value="ReuniÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o">Reuniao Extra</option>
                            <option value="Outro">Outro</option>
                            <option value="Treino">Treino</option>
                            <option value="Prazo">Prazo / Entrega</option>
                            <option value="CompetiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o">Competicao</option>
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
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">DescriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (Opcional)</label>
                    <textarea name="description" defaultValue={modal.data?.description} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24 resize-none" placeholder="Detalhes do encontro, materiais necessÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rios, etc..."></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20">Salvar na Agenda</button>
             </form>
          )}

        </div>

      </div>

    )

  }



  // --- COMPONENTE DE ESTRATÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°GIA ---

  // --- GRÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂFICO DE EVOLUÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O (SVG PURO) ---
  const scoreEvolutionChartContextRef = useRef({});
  scoreEvolutionChartContextRef.current = {
      db,
      rounds,
      scoreHistory,
      showNotification,
  };

  const ScoreEvolutionChart = useMemo(() => {
      return function ScoreEvolutionChartInner({ isTvMode = false, tvModeVariant = 'default' }) {
      const {
          db,
          rounds,
          scoreHistory,
          showNotification,
      } = scoreEvolutionChartContextRef.current;
      // Estado local para filtrar o grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico
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
      let color = chartPalette.primary;

      if (isGeneral) {
          // Pega apenas histÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ricos de pontuaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o total
          rawData = scoreHistory.filter(h => !h.roundId);
      } else {
          // Pega histÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico de TEMPO de um round especÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­fico
          rawData = scoreHistory.filter(h => h.roundId === chartFilter);
          color = chartPalette.secondary;
      }

      if (isTvFullRoundsView) {
          rawData = scoreHistory.filter(h => !h.roundId && (h.practiceType === 'full_round' || h.time != null));
          color = chartPalette.secondary;
      }

      // --- FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O PARA LIMPAR O GRÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂFICO ATUAL ---
      const handleClearChart = async () => {
        const confirmMsg = isGeneral 
            ? "ZERAR o grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico geral de Pontos/Tempo? Isso apaga todo o histÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico da equipe." 
            : "Limpar o histÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico de tempos deste round?";
            
        if (!window.confirm(confirmMsg)) return;
        
        // Apaga apenas os documentos que estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o sendo mostrados no grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico agora
        try {
            const deletePromises = rawData.map(d => deleteDoc(doc(db, "score_history", d.id)));
            await Promise.all(deletePromises);
            showNotification("HistÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico do grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico limpo!", "success");
        } catch (error) {
            console.error("Erro ao limpar grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico:", error);
            showNotification("Erro ao limpar.", "error");
        }
      };

      const data = [...rawData].sort((a,b) => new Date(a.date) - new Date(b.date));

      if (data.length < 2 && (isGeneral || isTvFullRoundsView)) return (
        <div className={`border rounded-2xl p-6 text-center text-sm flex flex-col items-center justify-center h-48 ${isTvMode ? 'bg-black/20 border-white/10 text-slate-300' : 'bg-[#151520] border-white/10 text-gray-500 mb-8'}`}>
            <TrendingUp size={32} className="mb-2 opacity-50"/>
            <p>{isTvFullRoundsView ? 'Registre pelo menos 2 rounds completos para acompanhar a meta de 2:30.' : 'Registre pelo menos 2 treinos para ver o grafico de evolucao.'}</p>
        </div>
      );

      const width = 800;
      const height = isTvFullRoundsView ? 188 : isTvMode ? 146 : 200;
      const padding = isTvFullRoundsView ? 16 : isTvMode ? 14 : 20;
      
      // Se for tempo, queremos ver cair (mas grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico svg padrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o sobe valores, entÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o tratamos visualmente)
      const valKey = isTvFullRoundsView ? 'time' : chartFilter === 'score_total' ? 'score' : 'time';
      
      // ESCALAS (MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ximos)
      const maxScore = Math.max(...data.map(d => d.score || 0), 100);
      const maxTime = Math.max(...data.map(d => d.time || 0), isGeneral ? 150 : 60); // 150s para geral, 60s para round

      // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para converter dados em coordenadas X,Y
      const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);
      
      // Y dinÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢mico (Pontos ou Tempo)
      const getY = (val, type = 'score') => {
          const max = type === 'time' ? maxTime : maxScore;
          return height - padding - ((val || 0) / max) * (height - 2 * padding);
      };

      // Cria o caminho da linha (path d)
      const pathDataMain = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[valKey], isTvFullRoundsView ? 'time' : isGeneral ? 'score' : 'time')}`).join(' ');
      
      // Linha secundÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ria (Tempo) apenas se for Geral
      const pathDataTime = isGeneral && !isTvFullRoundsView ? data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.time || 0, 'time')}`).join(' ') : "";

      // Cria o caminho para o preenchimento (area fill)
      const fillPathData = `${pathDataMain} L ${width - padding} ${height} L ${padding} ${height} Z`;

      // CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lculos de MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia
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

      // Coordenadas da MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia para o Gradiente
      const currentAvg = isTvFullRoundsView ? parseFloat(avgTime) : isGeneral ? parseFloat(avgScore) : parseFloat(avgTime);
      const avgY = getY(currentAvg, isTvFullRoundsView ? 'time' : isGeneral ? 'score' : 'time');
      const avgPercent = Math.max(0, Math.min(100, (avgY / height) * 100));
      const tvTargetY = getY(150, 'time');

      const renderChartContent = () => (
          <>
              <div className={`${isTvMode ? 'mb-0 hidden' : 'mb-6 flex items-center justify-between'}`}>
                  <h3 className={`text-white font-bold flex items-center gap-2 ${isFullscreen ? 'text-2xl' : ''}`}>
                      <TrendingUp style={{ color }}/> {isGeneral ? 'EvoluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (Pontos vs Tempo)' : 'Melhoria de Tempo (Segundos)'}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                  {/* BotÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de Limpar HistÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico */}
                  {!isTvMode && data.length > 0 && (
                      <button onClick={handleClearChart} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors" title="Zerar este grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico">
                          <Trash2 size={16}/>
                      </button>
                  )}

                  {/* BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O TELA CHEIA */}
                  {!isTvMode && (
                      <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title={isFullscreen ? "Minimizar" : "Tela Cheia"}>
                          {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
                      </button>
                  )}

                  {/* SELETOR DE GRÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂFICO */}
                  {!isTvMode && (
                  <select 
                    className="bg-black/40 border border-white/20 text-xs text-white rounded-lg p-2 outline-none focus:border-blue-500"
                    value={chartFilter}
                    onChange={(e) => setChartFilter(e.target.value)}
                  >
                      <option value="score_total">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€¦Ã‚Â  PontuaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o Geral</option>
                      {rounds.map(r => (
                          <option key={r.id} value={r.id}>ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚ÂÃƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â Tempo: {r.name}</option>
                      ))}
                  </select>
                  )}
                  </div>
              </div>

              {data.length === 0 ? (
                  <div className={`flex items-center justify-center text-gray-500 text-xs italic border border-dashed border-white/10 rounded-xl ${isFullscreen ? 'flex-1 min-h-[400px]' : isTvMode ? 'h-28' : 'h-32'}`}>
                      Sem dados registrados para este grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico ainda.
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

                      {/* Linha da MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia */}
                      {isTvFullRoundsView ? (
                        <>
                            <line x1={padding} y1={tvTargetY} x2={width-padding} y2={tvTargetY} stroke={chartPalette.avg} strokeDasharray="5 5" strokeWidth="1" opacity="0.75"/>
                            <text x={padding + 5} y={tvTargetY - 5} fill={chartPalette.avg} fontSize="10" fontWeight="bold" opacity="0.92">META 2:30</text>
                        </>
                      ) : (
                        <>
                            <line x1={padding} y1={avgY} x2={width-padding} y2={avgY} stroke={chartPalette.avg} strokeDasharray="5 5" strokeWidth="1" opacity="0.6"/>
                            <text x={padding + 5} y={avgY - 5} fill={chartPalette.avg} fontSize="10" fontWeight="bold" opacity="0.8">MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°DIA: {currentAvg}</text>
                        </>
                      )}

                      {/* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ârea Preenchida (Apenas Principal) */}
                      <path d={fillPathData} fill={isGeneral && !isTvFullRoundsView ? "url(#trendFillGradient)" : "none"} />

                      {/* SEGUNDA LINHA: TEMPO (AZUL) - SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ no Geral */}
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
                                    
                                    {/* Textos fixos (Sempre visÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­veis, alternando altura para nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encavalar) */}
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

              {/* HISTÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œRICO COMPLETO ABAIXO DO GRÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂFICO (SÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ FORA DO MODO TV E NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O EM TELA CHEIA) */}
              {!isTvMode && !isFullscreen && data.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="text-gray-400 font-bold uppercase text-xs flex items-center gap-2"><ListTodo size={14}/> HistÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico Detalhado</h4>
                          <div className="flex gap-4">
                              <div className="text-right bg-white/5 px-3 py-1 rounded-lg">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold block">MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia Pontos</span>
                                  <span className="text-green-500 font-bold">{avgScore} pts</span>
                              </div>
                              <div className="text-right bg-white/5 px-3 py-1 rounded-lg">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold block">MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia Tempo</span>
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
                                          <span className="text-gray-200 text-xs font-bold">{new Date(d.date).toLocaleDateString('pt-BR')} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â s {new Date(d.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
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
  }, []);

  // FunÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o para salvar pontuaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o no histÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico
  const handleSavePracticeScore = async (totalPoints, totalTime) => {
      if (!window.confirm(`Registrar treino oficial?\nPontos: ${totalPoints}\nTempo: ${totalTime}s`)) return;
      
      try {
          await addDoc(collection(db, "score_history"), {
              score: totalPoints,
              time: totalTime, // Salva o tempo junto!
              date: new Date().toISOString(),
              author: isAdmin ? 'TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico' : viewAsStudent?.name || 'Equipe'
          });
          showNotification("PontuaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o registrada no grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico! ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€¹Ã¢â‚¬Â ");
      } catch (error) {
          console.error("Erro ao salvar histÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico:", error);
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

  // --- NOVA FUNÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O: SALVAR EXECUÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DE UM ROUND ESPECÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂFICO ---
  const handleSaveRoundRun = async (e, round) => {
    e.preventDefault();
    const timeVal = parseInt(e.target.time.value);
    if(!timeVal || isNaN(timeVal)) return;

    // --- CÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂLCULO DE TENDÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â NCIA VS MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°DIA DOS ÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â¡LTIMOS 3 TREINOS ---
    const previousRuns = scoreHistory
        .filter(h => h.roundId === round.id && h.time)
        .sort((a,b) => new Date(b.date) - new Date(a.date)) // Ordena do mais recente
        .slice(0, 3); // Pega os 3 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltimos

    let trendMsg = "";
    if (previousRuns.length > 0) {
        const avg = previousRuns.reduce((acc, curr) => acc + curr.time, 0) / previousRuns.length;
        const diff = timeVal - avg;

        // Tempo menor = Melhor (Verde)
        if (diff < 0) {
            trendMsg = ` ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚Â¢ ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â ${(Math.abs(diff)).toFixed(1)}s mais rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡pido que a mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia!`;
        } else if (diff > 0) {
            trendMsg = ` ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â´ ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â ${(Math.abs(diff)).toFixed(1)}s mais lento que a mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia.`;
        }
    }

    try {
        // 1. Salva no histÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rico para o grÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡fico
        await addDoc(collection(db, "score_history"), {
            roundId: round.id,
            roundName: round.name,
            time: timeVal, // O tempo que levou
            date: new Date().toISOString(),
            author: viewAsStudent?.name || "TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico"
        });

        // 2. Atualiza o tempo estimado do round (para ficar real)
        await updateDoc(doc(db, "rounds", round.id), {
            estimatedTime: timeVal
        });

        showNotification(`Treino de "${round.name}" registrado: ${timeVal}s ${trendMsg}`);
        
        // Limpa o valor do formulÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio local (estado controlado)
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


  const strategyViewProps = {
      strategySubTab,
      setStrategySubTab,
      projectSummary,
      projectImpactNarrative,
      decisionMatrix,
      experts,
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

  const roundsViewProps = {
      rounds,
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
      handleSaveRoundRun,
      ScoreEvolutionChart,
      RobotRoundsPanel,
      LazyPanelFallback
  };

  const kanbanViewProps = {
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

  // --- PROTEÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DE CARREGAMENTO (LOADING) ---
  // SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ aparece DEPOIS que logou, enquanto baixa os dados
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

  // --- RENDER PRINCIPAL (SÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ CHEGA AQUI SE ESTIVER LOGADO) ---
  return (
    <div className={`newgears-shell min-h-screen text-white selection:bg-yellow-300 selection:text-slate-950 pb-20 relative overflow-hidden ${isLiteMode ? 'newgears-lite-mode' : ''}`}>
      {/* Estilo da AnimaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de Fundo */}
      <div className="newgears-floating-layer">
        <div className="newgears-orb newgears-orb--cyan"></div>
        <div className="newgears-orb newgears-orb--yellow"></div>
        <div className="newgears-orb newgears-orb--pink"></div>
        <div className="newgears-orb newgears-orb--lime"></div>
      </div>

      {/* Fundo com o Logo */}

      {/* ConteÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºdo fica por cima */}
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
                <span className="font-bold text-sm">Sua sessÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o vai expirar em {logoutCountdown}s</span>
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

{/* --- MODAL DO TÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°CNICO: ENTREGAR BADGES --- */}
      {isAdmin && badgeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1a1a24] rounded-2xl border border-white/10 p-6 w-full max-w-2xl shadow-2xl relative">
            
            {/* BotÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o Fechar */}
            <button 
              onClick={() => setBadgeStudent(null)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            {/* CabeÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§alho */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                <Trophy size={32} className="text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Sala de TrofÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©us</h2>
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
                    /* ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ MUDANÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡A 1: Adicionei a palavra 'group' no comeÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o desta linha ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ */
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

                    {/* ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ MUDANÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡A 2: BalÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£ozinho de descriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o (Tooltip) ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-900/95 text-gray-200 text-xs text-center p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-gray-700 shadow-xl backdrop-blur-md">
                        {badge.desc}
                        {/* TriÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ngulo (setinha) apontando para baixo */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                    </div>
                    {/* ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã…â€œÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â FIM DO BALÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢OZINHO ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã…â€œÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â */}
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

              {/* 1. BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O CRONOGRAMA (VOLTOU!) */}
              {/* SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ aparece se o modal de cronograma nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o estiver aberto */}
              <button onClick={() => setShowFullSchedule(true)} className="bg-white/5 border border-white/10 text-white p-2 rounded-full hover:bg-white/10 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2">
                  <CalendarDays size={18} /> <span className="hidden md:inline text-xs font-bold">Cronograma</span>
              </button>
              {/* ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ COLE O BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DO RANKING AQUI ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ */}
              {!viewAsStudent && (
                <button 
                  onClick={() => setActiveTab('ranking')} 
                  className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2 rounded-full hover:bg-yellow-500/20 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2"
                >
                  <Trophy size={18} /> <span className="hidden md:inline text-xs font-bold">Ranking XP</span>
                </button>
              )}
              {/* ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã…â€œÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â FIM DO BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DO RANKING ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã…â€œÃƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â */}
{/* --- BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DA BATERIA (NOVO) --- */}
              <button 
                onClick={() => setShowBatteryModal(true)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                    // Muda a cor dependendo da mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia da equipe
                    teamAverage > 75 ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    teamAverage > 50 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    teamAverage > 0  ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-white/5 border-white/10 text-gray-400'
                }`}
                title="Como estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ a energia da equipe?"
              >
                  {/* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âcone muda conforme a carga */}
                  {teamAverage > 90 ? <BatteryFull size={18}/> : 
                   teamAverage > 50 ? <BatteryMedium size={18}/> : 
                   <BatteryWarning size={18}/>}
                  
                  {/* Mostra a porcentagem mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©dia para o TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico */}
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
              {/* --- BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O MODO TV (TODOS PODEM ACESSAR) --- */}
              <button 
                onClick={openTvMode} 
                className="bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 p-2 rounded-full hover:bg-fuchsia-500 hover:text-white transition-all md:px-4 md:py-2 md:rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
              >
                  <MonitorPlay size={18} /> <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Modo TV</span>
              </button>

              {/* 2. BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂGICO DAS CAPITÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢S (Sofia e Heloise) */}
              {viewAsStudent && (viewAsStudent.name === 'Sofia' || viewAsStudent.name === 'Heloise') && (
                  <button 
                    onClick={() => setIsAdmin(!isAdmin)} 
                    className={`px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase transition-all flex items-center gap-2 ${isAdmin ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-white/10 text-white border border-white/20'}`}
                  >
                      {isAdmin ? 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“Ãƒâ€šÃ‚Â¤ Voltar pro XP' : 'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ Modo CapitÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£'}
                  </button>
                  
              )}
{/* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂREA DO DESAFIO DE INGLÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â S (VisÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do Aluno) */}
{viewAsStudent && (
    <div className="bg-[#151520] border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="text-3xl">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡Ãƒâ€šÃ‚ÂºÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡Ãƒâ€šÃ‚Â¸</div>
            <div>
                <h3 className="text-white font-bold text-sm">English Challenge</h3>
                <p className="text-gray-400 text-xs">Fale 10 min em inglÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âªs.</p>
            </div>
        </div>

        {/* ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ O PULO DO GATO ESTÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â AQUI: viewAsStudent?.englishChallengeUnlocked ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ */}
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
                Aguardando TÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©cnico...
            </button>
        )}
    </div>
)}

              {/* 3. BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O DE SAIR */}
              <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Sair">
                  <LogOut size={18} />
              </button>
          </div>
      </header>

      {/* --- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂREA DO TÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°CNICO (ADMIN) --- */}
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

            {/* Dentro do seu <main> ou ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rea de conteÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºdo central, junto com os outros 'ifs' de abas */}
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

                {/* CONTEÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â¡DO DA ABA SELECIONADA */}
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
                    
                    {/* --- VISUALIZAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O KANBAN --- */}
                    {adminTab === 'kanban' && <KanbanView {...kanbanViewProps} />}
                    {adminTab === 'logbook' && <LogbookView {...logbookViewProps} />}
                    {adminTab === 'agenda' && <AgendaView {...agendaViewProps} />}
                  </WorkspaceScene>
                </div>
            </div>
          </div>
        </main>
      )}

      {/* --- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂREA DO ALUNO --- */}
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
                          <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1">AÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o NecessÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ria</h3>
                          <p className="text-white font-bold md:text-lg leading-tight">VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª possui tarefas atrasadas no quadro de tarefas!</p>
                      </div>
                  </div>
                  <button onClick={() => setStudentTab('kanban')} className="hidden md:block bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-colors whitespace-nowrap">
                      Resolver Agora
                  </button>
              </div>
          )}

    {/* ALERTA DE LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂDER DE GESTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O */}
    {currentWeekData?.assignments?.[STATION_KEYS.MANAGEMENT]?.some(s => s.id === viewAsStudent.id) && !["Heloise", "Sofia"].includes(viewAsStudent.name) && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl border border-purple-400/30 shadow-lg mb-6 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <Crown size={24} className="text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight">VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© o LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­der de GestÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o esta semana!</h3>
                    <p className="text-purple-100 text-xs">Sua missÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o: Cobrar tarefas e manter a equipe focada.</p>
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

                {/* CONTEÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â¡DO DA ABA SELECIONADA */}
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








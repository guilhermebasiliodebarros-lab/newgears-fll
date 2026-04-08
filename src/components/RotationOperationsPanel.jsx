import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle,
  CheckSquare,
  ClipboardList,
  Crown,
  Eye,
  Gavel,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Microscope,
  Pencil,
  Rocket,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  UserCircle,
  X,
  XCircle,
} from 'lucide-react';

const CAPTAIN_NAMES = ['Heloise', 'Sofia'];

const STATION_CONFIGS = [
  {
    key: 'Engenharia',
    label: 'Engenharia',
    Icon: Rocket,
    tone: 'border-blue-500/20 bg-blue-500/5',
    badgeTone: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
    highlightTone: 'border-blue-500/20 bg-blue-500/10',
    actionTone: 'border-blue-500/20 bg-blue-500/10 text-blue-100 hover:bg-blue-500 hover:text-white',
    dot: 'bg-blue-400',
  },
  {
    key: 'Inovação',
    label: 'Inovacao',
    Icon: Microscope,
    tone: 'border-pink-500/20 bg-pink-500/5',
    badgeTone: 'border-pink-500/20 bg-pink-500/10 text-pink-200',
    highlightTone: 'border-pink-500/20 bg-pink-500/10',
    actionTone: 'border-pink-500/20 bg-pink-500/10 text-pink-100 hover:bg-pink-500 hover:text-white',
    dot: 'bg-pink-400',
  },
  {
    key: 'Gestão',
    label: 'Gestao',
    Icon: BookOpen,
    tone: 'border-purple-500/20 bg-purple-500/5',
    badgeTone: 'border-purple-500/20 bg-purple-500/10 text-purple-200',
    highlightTone: 'border-purple-500/20 bg-purple-500/10',
    actionTone: 'border-purple-500/20 bg-purple-500/10 text-purple-100 hover:bg-purple-500 hover:text-white',
    dot: 'bg-purple-400',
  },
];

const normalizeValue = (value) =>
  `${value || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const formatDate = (value) => {
  if (!value) return 'Sem data';
  const [year, month, day] = `${value}`.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const resolveAssignmentName = (entry) => {
  if (!entry) return 'Vago';
  if (typeof entry === 'object' && entry.name) return entry.name;
  return `${entry}`;
};

const getSubmissionMeta = (student) => {
  if (student.submission?.status === 'approved') {
    return {
      badgeClass: 'border-green-500/30 bg-green-500/15 text-green-200',
      cardClass: 'border-green-500/30 bg-green-500/8 shadow-[0_0_0_1px_rgba(34,197,94,0.05)]',
      label: 'Aprovado',
      icon: <CheckCircle size={12} className="text-green-400" />,
    };
  }

  if (student.submission?.status === 'rejected') {
    return {
      badgeClass: 'border-red-500/30 bg-red-500/15 text-red-200',
      cardClass: 'border-red-500/30 bg-red-500/8 shadow-[0_0_0_1px_rgba(239,68,68,0.05)]',
      label: 'Recusado',
      icon: <AlertTriangle size={12} className="text-red-400" />,
    };
  }

  if (student.submission?.status === 'pending') {
    return {
      badgeClass: 'border-yellow-500/30 bg-yellow-500/15 text-yellow-100',
      cardClass: 'border-yellow-500/20 bg-yellow-500/5 shadow-[0_0_0_1px_rgba(234,179,8,0.04)]',
      label: 'Avaliar',
      icon: <AlertCircle size={12} className="text-yellow-400" />,
    };
  }

  return {
    badgeClass: 'border-white/10 bg-white/5 text-gray-300',
    cardClass: 'border-white/10 bg-black/25',
    label: 'Sem entrega',
    icon: <ClipboardList size={12} className="text-gray-400" />,
  };
};

const SummaryMetricCard = ({ label, value, helper, tone = 'border-white/10 bg-black/25' }) => (
  <div className={`rounded-[24px] border p-4 backdrop-blur-sm ${tone}`}>
    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{label}</p>
    <p className="text-3xl font-black text-white mt-3 leading-none">{value}</p>
    {helper && <p className="text-xs text-gray-300/85 mt-2 leading-relaxed">{helper}</p>}
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="rounded-[24px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.16))] p-5 text-center">
    <p className="text-sm font-black text-white">{title}</p>
    <p className="text-xs text-gray-300 mt-2 leading-relaxed">{description}</p>
  </div>
);

const ActionIconButton = ({ title, onClick, children, tone = 'text-gray-400 hover:text-white hover:bg-white/10' }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`rounded-2xl border border-transparent p-2.5 transition-all ${tone}`}
  >
    {children}
  </button>
);

const StudentAvatar = ({ student }) => (
  student.avatarImage ? (
    <img src={student.avatarImage} alt={student.name} className="h-11 w-11 rounded-2xl object-cover border border-white/10" />
  ) : (
    <div className="h-11 w-11 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center">
      <UserCircle size={22} className="text-gray-500" />
    </div>
  )
);

const StationMoveButtons = ({ onMoveStudent, studentId }) => (
  <div className="grid grid-cols-3 gap-1.5">
    {STATION_CONFIGS.map((station) => (
      <button
        key={station.key}
        type="button"
        onClick={() => onMoveStudent(studentId, station.key)}
        className={`rounded-2xl border px-2 py-2.5 text-[9px] font-black uppercase tracking-[0.16em] transition-all hover:-translate-y-0.5 ${station.actionTone}`}
      >
        {station.label.slice(0, 3)}
      </button>
    ))}
  </div>
);

const TeamBenchCard = ({
  student,
  expectedStation,
  level,
  canManage,
  onMoveStudent,
  onOpenXPModal,
  onOpenGradesModal,
  onOpenProfileModal,
  onOpenNewStudentModal,
  onSetBadgeStudent,
  onToggleEnglishChallenge,
  onDeleteStudent,
  onToggleActivityStatus,
}) => {
  const submissionMeta = getSubmissionMeta(student);
  const expectedConfig = STATION_CONFIGS.find((item) => item.key === expectedStation);

  return (
    <div className={`rounded-[26px] border p-4 transition-all ${submissionMeta.cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <StudentAvatar student={student} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Banco
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${submissionMeta.badgeClass}`}>
                {submissionMeta.icon}
                {submissionMeta.label}
              </span>
            </div>
            <p className="mt-3 truncate text-base font-black text-white">{student.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase ${level.color}`}>
                {level.name}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-gray-300">
                {student.turma || 'Turma nao informada'}
              </span>
              <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[10px] font-bold text-yellow-100">
                {student.xp || 0} XP
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1">
          <ActionIconButton title="Ver perfil" onClick={() => onOpenProfileModal(student)}>
            <UserCircle size={15} />
          </ActionIconButton>
          <ActionIconButton title="Editar aluno" onClick={() => onOpenNewStudentModal(student)}>
            <Pencil size={15} />
          </ActionIconButton>
          <ActionIconButton title="Entregar conquista" onClick={() => onSetBadgeStudent(student)} tone="text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10 hover:border-yellow-500/20">
            <Trophy size={15} />
          </ActionIconButton>
          <ActionIconButton
            title={student.englishChallengeUnlocked ? 'Desativar ingles' : 'Ativar ingles'}
            onClick={() => onToggleEnglishChallenge(student)}
            tone={student.englishChallengeUnlocked ? 'text-green-400 hover:bg-green-500/10 hover:border-green-500/20' : 'text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 hover:border-blue-500/20'}
          >
            <span className="font-mono text-[10px] font-black border border-current rounded px-1">EN</span>
          </ActionIconButton>
          <ActionIconButton title="Excluir aluno" onClick={() => onDeleteStudent(student.id)} tone="text-gray-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20">
            <Trash2 size={15} />
          </ActionIconButton>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Radar do banco</p>
          <p className="mt-3 text-sm font-bold text-white">
            {expectedConfig ? `Escala prevista em ${expectedConfig.label}.` : 'Ainda sem estacao prevista na escala oficial.'}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-300">
            Use o banco como area de embarque rapido para mover o aluno quando a rodada pedir reforco.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {expectedConfig ? (
              <>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${expectedConfig.badgeTone}`}>
                  {expectedConfig.label}
                </span>
                <button
                  type="button"
                  onClick={() => onMoveStudent(student.id, expectedConfig.key)}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:-translate-y-0.5 ${expectedConfig.actionTone}`}
                >
                  Enviar agora
                </button>
              </>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-gray-300">Sem escala marcada</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenXPModal(student)}
            disabled={!canManage}
            className={`rounded-[20px] border border-yellow-500/20 bg-yellow-500/10 px-3 py-3 text-xs font-black uppercase tracking-[0.14em] text-yellow-100 transition-all ${canManage ? 'hover:-translate-y-0.5 hover:bg-yellow-500 hover:text-black' : 'opacity-50 cursor-not-allowed'}`}
          >
            {student.xp || 0} XP
          </button>
          <button
            type="button"
            onClick={() => onOpenGradesModal(student)}
            disabled={!canManage}
            className={`rounded-[20px] border border-white/10 bg-white/5 px-3 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-all ${canManage ? 'hover:-translate-y-0.5 hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
          >
            Notas
          </button>
          <div className="col-span-2 rounded-[20px] border border-white/10 bg-black/25 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold mb-2">Mover manualmente</p>
            <StationMoveButtons onMoveStudent={onMoveStudent} studentId={student.id} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-black/25 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Status rapido</p>
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/30 p-1">
          <button type="button" onClick={() => onToggleActivityStatus(student, 'approved')} className={`rounded-xl p-2 transition-all ${student.submission?.status === 'approved' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-green-300 hover:bg-green-500/10'}`} title="Aprovar atividade">
            <CheckCircle size={13} />
          </button>
          <button type="button" onClick={() => onToggleActivityStatus(student, 'rejected')} className={`rounded-xl p-2 transition-all ${student.submission?.status === 'rejected' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-red-300 hover:bg-red-500/10'}`} title="Recusar atividade">
            <XCircle size={13} />
          </button>
          {student.submission && (
            <button type="button" onClick={() => onToggleActivityStatus(student, null)} className="rounded-xl p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white" title="Limpar status">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StationStudentCard = ({
  student,
  stationKey,
  level,
  tasks,
  canManage,
  onMoveStudent,
  onOpenXPModal,
  onOpenGradesModal,
  onSetBadgeStudent,
  onToggleEnglishChallenge,
  onToggleActivityStatus,
  onOpenReviewModal,
}) => {
  const submissionMeta = getSubmissionMeta(student);
  const isLeader = stationKey === 'Gestão' && !CAPTAIN_NAMES.includes(student.name);

  return (
    <div className={`rounded-[26px] border p-4 transition-all ${isLeader && student.submission?.status !== 'approved' && student.submission?.status !== 'rejected' ? 'border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_0_1px_rgba(234,179,8,0.05)]' : submissionMeta.cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-black ${isLeader ? 'text-yellow-300' : 'text-white'}`}>{student.name}</p>
            {isLeader && (
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-200">
                <Crown size={11} />
                Lider da semana
              </span>
            )}
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${submissionMeta.badgeClass}`}>
              {submissionMeta.icon}
              {submissionMeta.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-gray-300">{student.turma || 'Turma nao informada'}</span>
            <span className={`rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase ${level.color}`}>{level.name}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-yellow-200">{student.xp || 0} XP</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMoveStudent(student.id, null)}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          title="Voltar para a equipe"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-black/25 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Deck de tarefas</p>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-gray-300">{tasks.length} tarefa(s)</span>
        </div>
        {tasks.length > 0 ? (
          <div className="space-y-2 mt-3">
            {tasks.slice(0, 2).map((task) => (
              <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  {task.status === 'doing' ? <Loader2 size={11} className="text-blue-400 animate-spin" /> : task.status === 'review' ? <Eye size={11} className="text-purple-300" /> : <ClipboardList size={11} className="text-orange-300" />}
                  {task.status === 'doing' ? 'Fazendo' : task.status === 'review' ? 'Revisao' : 'A fazer'}
                </div>
                <p className="text-xs text-white mt-2 leading-relaxed line-clamp-2">{task.text}</p>
              </div>
            ))}
            {tasks.length > 2 && (
              <p className="text-[11px] text-gray-500">+{tasks.length - 2} tarefa(s) adicionais em aberto.</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500 mt-3">Sem tarefas abertas no Kanban para este aluno agora.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          type="button"
          onClick={() => onOpenXPModal(student)}
          disabled={!canManage}
          className={`rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-3 text-xs font-black uppercase tracking-[0.14em] text-yellow-100 transition-all ${canManage ? 'hover:-translate-y-0.5 hover:bg-yellow-500 hover:text-black' : 'opacity-50 cursor-not-allowed'}`}
        >
          Ajustar XP
        </button>
        <button
          type="button"
          onClick={() => onOpenGradesModal(student)}
          disabled={!canManage}
          className={`rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-all ${canManage ? 'hover:-translate-y-0.5 hover:bg-white/10' : 'opacity-50 cursor-not-allowed'}`}
        >
          Lancar notas
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onSetBadgeStudent(student)} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2.5 text-[11px] font-black text-yellow-100 hover:bg-yellow-500 hover:text-black transition-all">
          Conquista
        </button>
        <button
          type="button"
          onClick={() => onToggleEnglishChallenge(student)}
          className={`rounded-2xl border px-3 py-2.5 text-[11px] font-black transition-all ${student.englishChallengeUnlocked ? 'border-green-500/20 bg-green-500/10 text-green-100 hover:bg-green-500 hover:text-black' : 'border-blue-500/20 bg-blue-500/10 text-blue-100 hover:bg-blue-500 hover:text-white'}`}
        >
          {student.englishChallengeUnlocked ? 'Ingles ativo' : 'Ativar ingles'}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-black/25 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Status da entrega</p>
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/30 p-1">
          <button type="button" onClick={() => onToggleActivityStatus(student, 'approved')} className={`rounded-xl p-2 transition-all ${student.submission?.status === 'approved' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-green-300 hover:bg-green-500/10'}`} title="Aprovar atividade">
            <CheckCircle size={13} />
          </button>
          <button type="button" onClick={() => onToggleActivityStatus(student, 'rejected')} className={`rounded-xl p-2 transition-all ${student.submission?.status === 'rejected' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-red-300 hover:bg-red-500/10'}`} title="Recusar atividade">
            <XCircle size={13} />
          </button>
          {student.submission && (
            <button type="button" onClick={() => onToggleActivityStatus(student, null)} className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Limpar status">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {student.submission?.status === 'pending' && (
        <button
          type="button"
          onClick={() => onOpenReviewModal(student)}
          className="mt-3 w-full rounded-2xl border border-yellow-500/20 bg-yellow-500 text-black px-3 py-2.5 text-xs font-black uppercase tracking-[0.14em] hover:bg-yellow-400 transition-all"
        >
          Revisar entrega
        </button>
      )}
    </div>
  );
};

const RotationOperationsPanel = ({
  students,
  tasks,
  missions,
  currentWeekData,
  getCurrentLevel,
  canManage,
  onMoveStudent,
  onOpenXPModal,
  onOpenGradesModal,
  onOpenProfileModal,
  onOpenNewStudentModal,
  onSetBadgeStudent,
  onToggleEnglishChallenge,
  onDeleteStudent,
  onToggleActivityStatus,
  onOpenReviewModal,
  onHandleCloseStationWeek,
  onUpdateMission,
  onSaveMission,
  onApplyRotation,
  onOpenAttendance,
  onResetAllActivities,
  onOpenSchedule,
}) => {
  const [benchSearch, setBenchSearch] = useState('');
  const [benchFilter, setBenchFilter] = useState('all');

  const tasksByAuthor = useMemo(() => {
    const map = new Map();
    tasks
      .filter((task) => task.status !== 'done')
      .forEach((task) => {
        const key = normalizeValue(task.author);
        if (!key) return;
        const current = map.get(key) || [];
        current.push(task);
        map.set(key, current);
      });
    return map;
  }, [tasks]);

  const expectedStationByStudent = useMemo(() => {
    const map = new Map();
    STATION_CONFIGS.forEach((station) => {
      (currentWeekData?.assignments?.[station.key] || []).forEach((entry) => {
        map.set(normalizeValue(resolveAssignmentName(entry)), station.key);
      });
    });
    return map;
  }, [currentWeekData]);

  const unassignedStudents = students
    .filter((student) => student.station === null)
    .sort((left, right) => left.name.localeCompare(right.name));

  const filteredBenchStudents = unassignedStudents.filter((student) => {
    const searchValue = `${student.name} ${student.turma || ''}`;
    const matchesSearch = normalizeValue(searchValue).includes(normalizeValue(benchSearch));
    if (!matchesSearch) return false;

    const expectedStation = expectedStationByStudent.get(normalizeValue(student.name));
    if (benchFilter === 'planned') return Boolean(expectedStation);
    if (benchFilter === 'pending') return student.submission?.status === 'pending';
    if (benchFilter === 'without-status') return !student.submission;
    return true;
  });

  const benchFilterOptions = [
    { id: 'all', label: 'Todos', count: unassignedStudents.length },
    {
      id: 'planned',
      label: 'Com escala oficial',
      count: unassignedStudents.filter((student) => Boolean(expectedStationByStudent.get(normalizeValue(student.name)))).length,
    },
    {
      id: 'pending',
      label: 'A avaliar',
      count: unassignedStudents.filter((student) => student.submission?.status === 'pending').length,
    },
    {
      id: 'without-status',
      label: 'Sem entrega',
      count: unassignedStudents.filter((student) => !student.submission).length,
    },
  ];

  const studentsOutOfScale = students.filter((student) => {
    const expectedStation = expectedStationByStudent.get(normalizeValue(student.name)) || null;
    return (student.station || null) !== expectedStation;
  });

  const totalPendingReviews = students.filter((student) => student.submission?.status === 'pending').length;
  const missionsReadyCount = STATION_CONFIGS.filter((station) => Boolean(missions?.[station.key]?.text?.trim()) && Boolean(missions?.[station.key]?.deadline)).length;
  const syncedStudentsCount = students.length - studentsOutOfScale.length;

  const stationCards = STATION_CONFIGS.map((station) => {
    const stationStudents = students
      .filter((student) => student.station === station.key)
      .sort((left, right) => {
        const leftLeader = station.key === 'Gestão' && !CAPTAIN_NAMES.includes(left.name);
        const rightLeader = station.key === 'Gestão' && !CAPTAIN_NAMES.includes(right.name);
        if (leftLeader !== rightLeader) return leftLeader ? -1 : 1;
        return left.name.localeCompare(right.name);
      });

    const plannedCount = currentWeekData?.assignments?.[station.key]?.length || 0;
    const approvedCount = stationStudents.filter((student) => student.submission?.status === 'approved').length;
    const pendingCount = stationStudents.filter((student) => student.submission?.status === 'pending').length;
    const activeTasks = stationStudents.reduce((total, student) => total + (tasksByAuthor.get(normalizeValue(student.name)) || []).length, 0);
    const mission = missions?.[station.key] || {};
    const missionReady = Boolean(mission.text?.trim()) && Boolean(mission.deadline);
    const outOfScaleCount = stationStudents.filter((student) => expectedStationByStudent.get(normalizeValue(student.name)) !== station.key).length;

    return {
      ...station,
      students: stationStudents,
      plannedCount,
      approvedCount,
      pendingCount,
      activeTasks,
      mission,
      missionReady,
      outOfScaleCount,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="newgears-major-panel relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(13,17,28,0.98),rgba(11,12,20,0.98))] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_center,rgba(250,204,21,0.08),transparent_42%)] pointer-events-none"></div>
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              <LayoutDashboard size={12} /> Pit crew do rodizio
            </span>
            <h3 className="text-3xl font-black text-white mt-4 leading-tight">
              Escala da semana com cara de equipe
            </h3>
            <p className="text-sm text-gray-300 mt-4 leading-relaxed max-w-3xl">
              O rodizio agora funciona como pit crew da equipe: da para ver quem ja entrou em cena, quem esta na fila para reforcar e quais estacoes ainda precisam de um ultimo boost antes do treino render.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={onApplyRotation} className="inline-flex items-center gap-2 rounded-[18px] border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-blue-100 hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white transition-all">
                <Sparkles size={14} /> Subir escala da semana
              </button>
              <button onClick={onOpenSchedule} className="inline-flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white hover:-translate-y-0.5 hover:bg-white/10 transition-all">
                <CalendarDays size={14} /> Ver mapa completo
              </button>
              <button onClick={onOpenAttendance} className="inline-flex items-center gap-2 rounded-[18px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-emerald-100 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-black transition-all">
                <CheckSquare size={14} /> Check-in do dia
              </button>
              <button onClick={onResetAllActivities} className="inline-flex items-center gap-2 rounded-[18px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-100 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={14} /> Limpar entregas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryMetricCard
              label="Semana ativa"
              value={currentWeekData?.weekName || 'Sincronizando'}
              helper={currentWeekData ? `${formatDate(currentWeekData.startDate)} ate ${formatDate(currentWeekData.endDate)}` : 'Aguardando cronograma'}
            />
            <SummaryMetricCard
              label="Escala sincronizada"
              value={`${syncedStudentsCount}/${students.length || 0}`}
              helper={studentsOutOfScale.length > 0 ? `${studentsOutOfScale.length} fora da posicao esperada` : 'Equipe alinhada com a escala oficial'}
              tone={studentsOutOfScale.length > 0 ? 'border-yellow-500/20 bg-yellow-500/10' : 'border-green-500/20 bg-green-500/10'}
            />
            <SummaryMetricCard
              label="Metas prontas"
              value={`${missionsReadyCount}/${STATION_CONFIGS.length}`}
              helper={missionsReadyCount === STATION_CONFIGS.length ? 'Todas as areas com meta e prazo' : 'Ainda faltam metas em algumas areas'}
            />
            <SummaryMetricCard
              label="Pendencias"
              value={totalPendingReviews}
              helper={totalPendingReviews > 0 ? 'Entregas pedindo avaliacao' : 'Sem revisoes urgentes agora'}
              tone={totalPendingReviews > 0 ? 'border-red-500/20 bg-red-500/10' : 'border-white/10 bg-black/25'}
            />
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-[320px,minmax(0,1fr)] 2xl:grid-cols-[340px,minmax(0,1fr)] gap-5">
        <section className="rounded-[30px] border border-white/10 bg-[#151520] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold">Fila de entrada</p>
              <h3 className="text-xl font-black text-white mt-2">Area de boost rapido</h3>
            </div>
            <button onClick={() => onOpenNewStudentModal()} className="rounded-[18px] border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-green-100 hover:-translate-y-0.5 hover:bg-green-500 hover:text-black transition-all">
              Novo aluno
            </button>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-bold text-white">Quem esta aqui ainda nao foi encaixado em uma estacao ativa.</p>
            <p className="text-xs leading-relaxed text-gray-300 mt-2">
              Essa area funciona como fila de entrada para reforco, troca rapida e ajustes de ultima hora sem baguncar a escala do time.
            </p>
          </div>

          <div className="grid gap-3 mt-5">
            <label className="rounded-[22px] border border-white/10 bg-black/25 px-4 py-3 flex items-center gap-3">
              <Search size={16} className="text-gray-500" />
              <input
                value={benchSearch}
                onChange={(event) => setBenchSearch(event.target.value)}
                placeholder="Buscar por nome ou turma"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {benchFilterOptions.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setBenchFilter(filter.id)}
                  className={`rounded-[18px] border px-3 py-2.5 text-left transition-all ${benchFilter === filter.id ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200' : 'border-white/10 bg-white/5 text-gray-300 hover:-translate-y-0.5 hover:bg-white/10'}`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-[0.18em]">{filter.label}</span>
                  <span className="mt-1 block text-[10px] opacity-75">{filter.count} aluno(s)</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mt-6 max-h-[1040px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredBenchStudents.length > 0 ? filteredBenchStudents.map((student) => (
              <TeamBenchCard
                key={student.id}
                student={student}
                expectedStation={expectedStationByStudent.get(normalizeValue(student.name))}
                level={getCurrentLevel(student.xp || 0)}
                canManage={canManage}
                onMoveStudent={onMoveStudent}
                onOpenXPModal={onOpenXPModal}
                onOpenGradesModal={onOpenGradesModal}
                onOpenProfileModal={onOpenProfileModal}
                onOpenNewStudentModal={onOpenNewStudentModal}
                onSetBadgeStudent={onSetBadgeStudent}
                onToggleEnglishChallenge={onToggleEnglishChallenge}
                onDeleteStudent={onDeleteStudent}
                onToggleActivityStatus={onToggleActivityStatus}
              />
            )) : (
              <EmptyState
                title="Equipe bem distribuida"
                description="Nao ha alunos no banco com esse filtro. Quando todos estiverem alocados, esta area fica limpa e mais tranquila de acompanhar."
              />
            )}
          </div>
        </section>

        <section className="grid xl:grid-cols-3 gap-5">
          {stationCards.map((station) => (
            <div key={station.key} className={`rounded-[30px] border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] ${station.tone}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-[18px] border flex items-center justify-center ${station.badgeTone}`}>
                      <station.Icon size={20} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-white">{station.label}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                        <span className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-gray-200">{station.students.length} ativo(s)</span>
                        <span className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-gray-300">{station.plannedCount || 0} previsto(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => onHandleCloseStationWeek(station.key)} className="rounded-[18px] border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-100 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white transition-all">
                  <span className="inline-flex items-center gap-1">
                    <Gavel size={12} />
                    Fechar semana
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <SummaryMetricCard label="Aprovados" value={`${station.approvedCount}/${station.students.length || 0}`} helper="Entregas aprovadas." tone="border-white/10 bg-black/25" />
                <SummaryMetricCard label="Pendentes" value={station.pendingCount} helper="Precisam de revisao." tone={station.pendingCount > 0 ? 'border-yellow-500/20 bg-yellow-500/10' : 'border-white/10 bg-black/25'} />
                <SummaryMetricCard label="Kanban" value={station.activeTasks} helper="Tarefas em andamento." tone="border-white/10 bg-black/25" />
                <SummaryMetricCard label="Escala" value={station.outOfScaleCount} helper="Fora da posicao prevista." tone={station.outOfScaleCount > 0 ? 'border-red-500/20 bg-red-500/10' : 'border-white/10 bg-black/25'} />
              </div>

              <div className="mt-5 rounded-[26px] border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">Missao da estacao</p>
                    <p className="text-sm font-bold text-white mt-2">
                      {station.missionReady ? 'Missao pronta para guiar a estacao' : 'Complete texto e prazo da estacao'}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${station.missionReady ? 'border-green-500/20 bg-green-500/10 text-green-200' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100'}`}>
                    {station.missionReady ? 'Liberada' : 'Pendente'}
                  </span>
                </div>

                <textarea
                  value={station.mission.text || ''}
                  onChange={(event) => onUpdateMission(station.key, 'text', event.target.value)}
                  placeholder={`Descreva a missao principal desta semana em ${station.label.toLowerCase()}.`}
                  className="mt-4 min-h-[108px] w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white/20 resize-y"
                />

                <div className="mt-3 grid grid-cols-[1fr,auto] gap-3">
                  <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 flex items-center gap-3">
                    <Calendar size={15} className="text-cyan-300" />
                    <input
                      type="date"
                      value={station.mission.deadline || ''}
                      onChange={(event) => onUpdateMission(station.key, 'deadline', event.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                    />
                  </label>
                  <button onClick={() => onSaveMission(station.key)} className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-green-100 hover:-translate-y-0.5 hover:bg-green-500 hover:text-black transition-all">
                    Salvar missao
                  </button>
                </div>
              </div>

              <div className="space-y-4 mt-5 max-h-[820px] overflow-y-auto pr-1 custom-scrollbar">
                {station.students.length > 0 ? station.students.map((student) => (
                  <StationStudentCard
                    key={student.id}
                    student={student}
                    stationKey={station.key}
                    level={getCurrentLevel(student.xp || 0)}
                    tasks={tasksByAuthor.get(normalizeValue(student.name)) || []}
                    canManage={canManage}
                    onMoveStudent={onMoveStudent}
                    onOpenXPModal={onOpenXPModal}
                    onOpenGradesModal={onOpenGradesModal}
                    onSetBadgeStudent={onSetBadgeStudent}
                    onToggleEnglishChallenge={onToggleEnglishChallenge}
                    onToggleActivityStatus={onToggleActivityStatus}
                    onOpenReviewModal={onOpenReviewModal}
                  />
                )) : (
                  <EmptyState
                    title={`Nenhum aluno em ${station.label}`}
                    description="Use a escala oficial ou mova manualmente alguem do banco da equipe para esta estacao."
                  />
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default RotationOperationsPanel;


